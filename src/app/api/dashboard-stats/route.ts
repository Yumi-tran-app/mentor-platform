import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { resolveApplicantAudience } from "@/lib/certification";
import { withErrorHandling } from "@/lib/api-helpers";

/**
 * GET /api/dashboard-stats
 * Số liệu Tổng quan riêng theo vai trò đăng ký (mentor / mentee).
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const audience = await resolveApplicantAudience(user.id);

  if (audience === "mentor") {
    const [seasonsCount, menteesCount, trainingCount, eventsDeliveredCount, certCount] =
      await Promise.all([
        prisma.mentorApplication.count({ where: { userId: user.id } }),
        prisma.match.count({ where: { mentorApplication: { userId: user.id } } }),
        prisma.trainingProgress.count({ where: { userId: user.id } }),
        prisma.trainingSpeaker.count({ where: { userId: user.id } }),
        prisma.certificate.count({ where: { userId: user.id } }),
      ]);

    return NextResponse.json({
      role: "mentor",
      stats: {
        seasons: seasonsCount,
        mentees: menteesCount,
        trainingCourses: trainingCount,
        eventsDelivered: eventsDeliveredCount,
        certificates: certCount,
      },
    });
  }

  if (audience === "mentee") {
    const [joinedAt, journeyCount, trainingCount, certCount] =
      await Promise.all([
        prisma.menteeApplication.findFirst({
          where: { userId: user.id },
          orderBy: { submittedAt: "asc" },
          select: { submittedAt: true, createdAt: true },
        }),
        prisma.journeyEntry.count({ where: { authorUserId: user.id } }),
        prisma.trainingProgress.count({ where: { userId: user.id } }),
        prisma.certificate.count({ where: { userId: user.id } }),
      ]);

    return NextResponse.json({
      role: "mentee",
      stats: {
        joinedAt: joinedAt?.submittedAt ?? joinedAt?.createdAt ?? null,
        journeys: journeyCount,
        trainingCourses: trainingCount,
        certificates: certCount,
      },
    });
  }

  // Chưa đăng ký mentor/mentee
  return NextResponse.json({ role: null, stats: {} });
});
