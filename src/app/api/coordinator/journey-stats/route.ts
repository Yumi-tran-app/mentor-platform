import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

/**
 * GET /api/coordinator/journey-stats
 * Thống kê nhật ký hành trình cho ĐPV:
 * - Danh sách cặp mà ĐPV phụ trách (qua CoordinatorAssignment)
 * - Số nhật ký của mentor + mentee trong từng cặp (đếm cả private — ĐPV được thấy)
 * - Có lọc theo mùa (optional ?seasonId=)
 */
export const GET = withErrorHandling(async (req: Request) => {
  const staff = await requireStaff();

  const url = new URL(req.url);
  const seasonId = url.searchParams.get("seasonId") ?? undefined;

  // Tìm các assignment của ĐPV hiện tại
  const assignments = await prisma.coordinatorAssignment.findMany({
    where: {
      coordinatorId: staff.id,
      ...(seasonId ? { matchReview: { match: { seasonId } } } : {}),
    },
    include: {
      matchReview: {
        include: {
          match: {
            include: {
              mentorApplication: { include: { user: true } },
              menteeApplication: { include: { user: true } },
            },
          },
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  });

  // Lấy danh sách matchId duy nhất
  const matchIds = [...new Set(assignments.map((a) => a.matchReview.matchId))];

  // Đếm entry per match, chia theo vai trò (mentor/mentee)
  const entries = matchIds.length
    ? await prisma.journeyEntry.findMany({
        where: { matchId: { in: matchIds } },
        select: { matchId: true, authorUserId: true },
      })
    : [];

  // Map matchId -> { mentorId, menteeId }
  const matchInfo = new Map<
    string,
    { mentorUserId: string; menteeUserId: string }
  >();
  for (const a of assignments) {
    const m = a.matchReview.match;
    matchInfo.set(m.id, {
      mentorUserId: m.mentorApplication.userId,
      menteeUserId: m.menteeApplication.userId,
    });
  }

  // Gộp thống kê
  const rows = [];
  for (const matchId of matchIds) {
    const info = matchInfo.get(matchId);
    if (!info) continue;
    const matchEntries = entries.filter((e) => e.matchId === matchId);
    const mentorCount = matchEntries.filter(
      (e) => e.authorUserId === info.mentorUserId
    ).length;
    const menteeCount = matchEntries.filter(
      (e) => e.authorUserId === info.menteeUserId
    ).length;

    // Lấy thông tin hiển thị
    const a = assignments.find((x) => x.matchReview.matchId === matchId);
    const match = a?.matchReview.match;

    rows.push({
      matchId,
      status: match?.status ?? null,
      mentorName: match?.mentorApplication.user.fullName ?? "—",
      menteeName: match?.menteeApplication.user.fullName ?? "—",
      mentorEntries: mentorCount,
      menteeEntries: menteeCount,
      total: matchEntries.length,
    });
  }

  rows.sort((a, b) => b.total - a.total);

  return NextResponse.json({ rows });
});
