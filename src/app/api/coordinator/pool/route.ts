import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { getActiveSeasonId, getAvailableMentors } from "@/lib/domain";
import { withErrorHandling } from "@/lib/api-helpers";

/**
 * GET /api/coordinator/pool
 * ĐPV xem "nguồn ghép cặp":
 * - mentees: mentee đã được duyệt (approved/in_pool) và đang chờ ghép
 * - mentors: mentor khả dụng (còn sức chứa)
 */
export const GET = withErrorHandling(async () => {
  await requireStaff();

  const sid = await getActiveSeasonId();

  const mentees = await prisma.menteeApplication.findMany({
    where: {
      status: { in: ["approved", "in_pool"] },
      availabilityStatus: { in: ["waiting", "seeking_rematch"] },
      ...(sid ? { seasonId: sid } : {}),
    },
    orderBy: { submittedAt: "asc" },
    include: {
      user: { select: { fullName: true, email: true } },
      needs: true,
      matches: {
        where: { status: { not: "ended" } },
        select: { id: true },
      },
    },
  });

  const mentors = sid
    ? await getAvailableMentors(sid)
    : await prisma.mentorApplication.findMany({
        where: { status: { in: ["approved", "in_pool"] }, programStatus: "active" },
        include: { user: { select: { fullName: true, email: true } } },
      });

  // mentors từ getAvailableMentors chưa có user -> bổ sung
  const mentorIds = mentors.map((m) => m.id);
  const mentorUsers = await prisma.mentorApplication.findMany({
    where: { id: { in: mentorIds } },
    include: { user: { select: { fullName: true, email: true } } },
  });

  return NextResponse.json({
    mentees: mentees.map((m) => ({
      ...m,
      hasActiveMatch: m.matches.length > 0,
      matches: undefined,
    })),
    mentors: mentorUsers,
  });
});
