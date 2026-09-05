import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, getOrCreateCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

const ReflectionSchema = z.object({
  matchId: z.string().uuid(),
  monthNumber: z.number().int().min(1).max(9),
  mood: z.enum(["good", "neutral", "uneasy", "support_needed"]),
  note: z.string().optional(),
});

/**
 * POST /api/reflections
 * Mentor/mentee gửi phản tư hằng tháng.
 * Nếu mood=support_needed -> tự tạo notification cho ĐPV phụ trách.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireUser();
  const body = await req.json();
  const { matchId, monthNumber, mood, note } = ReflectionSchema.parse(body);

  const reflection = await prisma.monthlyReflection.create({
    data: {
      matchId,
      respondentUserId: user.id,
      monthNumber,
      mood,
      note,
    },
  });

  // Trigger: nếu support_needed -> tìm ĐPV phụ trách match và báo
  if (mood === "support_needed") {
    const assignment = await prisma.coordinatorAssignment.findFirst({
      where: { matchReview: { matchId } },
      orderBy: { assignedAt: "desc" },
    });
    if (assignment) {
      await prisma.notification.create({
        data: {
          userId: assignment.coordinatorId,
          type: "support_needed",
          payload: { matchId, monthNumber },
        },
      });
    }
  }

  // Trigger: uneasy 2 tháng liên tiếp
  if (mood === "uneasy") {
    const prev = await prisma.monthlyReflection.findFirst({
      where: { matchId, monthNumber: monthNumber - 1, mood: "uneasy" },
      orderBy: { createdAt: "desc" },
    });
    if (prev) {
      const assignment = await prisma.coordinatorAssignment.findFirst({
        where: { matchReview: { matchId } },
        orderBy: { assignedAt: "desc" },
      });
      if (assignment) {
        await prisma.notification.create({
          data: {
            userId: assignment.coordinatorId,
            type: "reflection_uneasy_streak",
            payload: { matchId, monthNumber },
          },
        });
      }
    }
  }

  return NextResponse.json({ reflection }, { status: 201 });
});

export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const matchId = url.searchParams.get("matchId") ?? undefined;

  const reflections = await prisma.monthlyReflection.findMany({
    where: matchId ? { matchId } : { respondentUserId: user.id },
    orderBy: { monthNumber: "asc" },
  });

  return NextResponse.json({ reflections });
});
