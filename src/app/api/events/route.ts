import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { getActiveSeasonId } from "@/lib/domain";
import { resolveApplicantAudience } from "@/lib/certification";
import { withErrorHandling } from "@/lib/api-helpers";

/**
 * GET /api/events — danh sách workshop/training (event) cho mentor/mentee.
 * Chỉ hiển thị event audience phù hợp (all hoặc audience của user).
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const seasonId = await getActiveSeasonId();
  if (!seasonId) return NextResponse.json({ error: "No active season" }, { status: 400 });

  const audience = await resolveApplicantAudience(user.id) ?? "all";
  const events = await prisma.trainingModule.findMany({
    where: {
      seasonId,
      type: "event",
      OR: [
        { status: "open" },
        { status: "completed" },
      ],
      audience: { in: ["all", audience] },
    },
    orderBy: [{ status: "asc" }, { startAt: "asc" }],
    include: {
      _count: { select: { registrations: true } },
      registrations: { where: { userId: user.id }, select: { id: true, checkedInAt: true } },
    },
  });

  const mapped = events.map((e) => ({
    ...e,
    registered: e.registrations.length > 0,
    checkedIn: e.registrations[0]?.checkedInAt ?? null,
    slotsLeft: e.capacity > 0 ? Math.max(0, e.capacity - e._count.registrations) : null,
    registrationsCount: e._count.registrations,
  }));

  return NextResponse.json({ events: mapped });
});

/**
 * POST /api/events — đăng ký tham dự event.
 * body: { eventId }
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const eventId = body.eventId;
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

  const event = await prisma.trainingModule.findUnique({ where: { id: eventId } });
  if (!event || event.type !== "event" || event.status !== "open") {
    return NextResponse.json({ error: "Event không khả dụng" }, { status: 400 });
  }

  // Kiểm tra giới hạn số lượng
  if (event.capacity > 0) {
    const count = await prisma.trainingRegistration.count({ where: { moduleId: eventId } });
    if (count >= event.capacity) {
      return NextResponse.json({ error: "Event đã đủ chỗ" }, { status: 400 });
    }
  }

  const reg = await prisma.trainingRegistration.upsert({
    where: { moduleId_userId: { moduleId: eventId, userId: user.id } },
    create: { moduleId: eventId, userId: user.id },
    update: {},
  });

  return NextResponse.json({ registration: reg }, { status: 201 });
});
