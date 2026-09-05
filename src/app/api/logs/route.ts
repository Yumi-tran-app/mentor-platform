import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

const CreateLogSchema = z.object({
  matchId: z.string().uuid(),
  visibility: z.enum(["shared", "private", "coordinator_signal"]).default("shared"),
  content: z.string().min(1),
  date: z.string().optional(), // ngày của buổi gặp (dd/mm/yyyy)
});

/**
 * GET /api/logs?matchId=<uuid>
 * Danh sách ghi chú của 1 cặp (chỉ hiện shared + của chính mình).
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const matchId = url.searchParams.get("matchId");
  if (!matchId) {
    return NextResponse.json({ error: "matchId required" }, { status: 400 });
  }

  // Xác minh user thuộc match này
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { mentorApplication: true, menteeApplication: true },
  });
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isMentor = match.mentorApplication.userId === user.id;
  const isMentee = match.menteeApplication.userId === user.id;
  const isStaff = user.role === "admin" || user.role === "dpv";
  if (!isMentor && !isMentee && !isStaff) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const logs = await prisma.mentoringLog.findMany({
    where: {
      matchId,
      // mentor/mentee chỉ thấy shared + của chính mình; staff thấy tất cả
      ...(isStaff
        ? {}
        : {
            OR: [{ visibility: "shared" }, { authorUserId: user.id }],
          }),
    },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { fullName: true, role: true } } },
  });

  return NextResponse.json({ logs });
});

/**
 * POST /api/logs
 * Thêm ghi chú (chung hoặc riêng tư) cho 1 buổi gặp.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { matchId, visibility, content } = CreateLogSchema.parse(body);

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { mentorApplication: true, menteeApplication: true },
  });
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isParticipant =
    match.mentorApplication.userId === user.id ||
    match.menteeApplication.userId === user.id;
  if (!isParticipant && user.role !== "admin" && user.role !== "dpv") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const log = await prisma.mentoringLog.create({
    data: {
      matchId,
      authorUserId: user.id,
      visibility,
      content,
    },
  });

  return NextResponse.json({ log }, { status: 201 });
});
