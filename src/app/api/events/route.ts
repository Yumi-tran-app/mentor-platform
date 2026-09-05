import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

const CreateEventSchema = z.object({
  matchId: z.string().uuid(),
  title: z.string().min(1),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
  location: z.string().optional(),
});

/**
 * GET /api/events
 * Liệt kê lịch gặp của các cặp mà user tham gia (sắp theo thời gian).
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mentorApps = await prisma.mentorApplication.findMany({ where: { userId: user.id }, select: { id: true } });
  const menteeApps = await prisma.menteeApplication.findMany({ where: { userId: user.id }, select: { id: true } });
  const mentorIds = mentorApps.map((a) => a.id);
  const menteeIds = menteeApps.map((a) => a.id);

  const events = await prisma.meetingEvent.findMany({
    where: {
      match: {
        OR: [
          { mentorApplicationId: { in: mentorIds } },
          { menteeApplicationId: { in: menteeIds } },
        ],
      },
    },
    orderBy: { startsAt: "asc" },
    include: { match: { include: { mentorApplication: { include: { user: true } }, menteeApplication: { include: { user: true } } } } },
  });

  return NextResponse.json({ events });
});

/**
 * POST /api/events
 * Tạo lịch gặp mới cho 1 cặp.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { matchId, title, startsAt, endsAt, location } = CreateEventSchema.parse(body);

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

  const event = await prisma.meetingEvent.create({
    data: {
      matchId,
      title,
      startsAt: new Date(startsAt),
      endsAt: endsAt ? new Date(endsAt) : null,
      location,
      createdByUserId: user.id,
    },
  });

  return NextResponse.json({ event }, { status: 201 });
});
