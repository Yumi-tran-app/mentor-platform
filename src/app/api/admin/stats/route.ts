import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff, isStaffRole } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

/**
 * GET /api/admin/stats
 * Dashboard số liệu hệ thống cho admin.
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await requireStaff();
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    totalUsers,
    totalMentors,
    totalMentees,
    pendingMentorApps,
    pendingMenteeApps,
    activeMatches,
    totalMatches,
    totalNotifications,
    totalModules,
    totalCertificates,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.mentorApplication.count(),
    prisma.menteeApplication.count(),
    prisma.mentorApplication.count({ where: { status: "submitted" } }),
    prisma.menteeApplication.count({ where: { status: "submitted" } }),
    prisma.match.count({ where: { status: { in: ["active", "first_connection_done", "mutual_accepted"] } } }),
    prisma.match.count(),
    prisma.notification.count(),
    prisma.trainingModule.count(),
    prisma.certificate.count(),
  ]);

  const season = await prisma.season.findFirst({
    where: { status: { in: ["open_registration", "active"] } },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, status: true },
  });

  return NextResponse.json({
    totalUsers,
    totalMentors,
    totalMentees,
    pendingMentorApps,
    pendingMenteeApps,
    activeMatches,
    totalMatches,
    totalNotifications,
    totalModules,
    totalCertificates,
    season,
  });
});
