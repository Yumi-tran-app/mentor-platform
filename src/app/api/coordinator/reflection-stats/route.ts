import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

/**
 * GET /api/coordinator/reflection-stats
 * Thống kê phản tư hằng tháng cho ĐPV:
 * - Theo phạm vi quyền: ĐPV thấy các cặp mình phụ trách; admin thấy toàn bộ.
 * - Có lọc theo mùa (optional ?seasonId=).
 * - Trả về: tổng quan (số phản tư theo mood), phân bố theo tháng, bảng chi tiết theo cặp.
 */

const MOODS = ["good", "neutral", "uneasy", "support_needed"] as const;

export const GET = withErrorHandling(async (req: Request) => {
  const staff = await requireStaff();
  const isAdmin = staff.role === "admin";

  const url = new URL(req.url);
  const seasonId = url.searchParams.get("seasonId") ?? undefined;

  // Xác định phạm vi matchId
  let matchIds: string[] = [];
  if (isAdmin) {
    const matches = await prisma.match.findMany({
      where: seasonId ? { seasonId } : {},
      select: { id: true },
    });
    matchIds = matches.map((m) => m.id);
  } else {
    const assignments = await prisma.coordinatorAssignment.findMany({
      where: {
        coordinatorId: staff.id,
        ...(seasonId ? { matchReview: { match: { seasonId } } } : {}),
      },
      select: { matchReview: { select: { matchId: true } } },
    });
    matchIds = [...new Set(assignments.map((a) => a.matchReview.matchId))];
  }

  if (matchIds.length === 0) {
    return NextResponse.json({
      summary: { good: 0, neutral: 0, uneasy: 0, support_needed: 0, total: 0 },
      byMonth: [],
      rows: [],
    });
  }

  // Lấy toàn bộ phản tư trong phạm vi
  const reflections = await prisma.monthlyReflection.findMany({
    where: { matchId: { in: matchIds } },
    orderBy: { createdAt: "desc" },
  });

  // Lấy thông tin match để hiển thị tên mentor/mentee
  const matches = await prisma.match.findMany({
    where: { id: { in: matchIds } },
    select: {
      id: true,
      status: true,
      mentorApplication: { select: { user: { select: { fullName: true } } } },
      menteeApplication: { select: { user: { select: { fullName: true } } } },
    },
  });
  const matchMap = new Map(matches.map((m) => [m.id, m]));

  // --- Tổng quan theo mood ---
  const summary: Record<string, number> = { good: 0, neutral: 0, uneasy: 0, support_needed: 0, total: reflections.length };
  for (const r of reflections) {
    summary[r.mood] = (summary[r.mood] ?? 0) + 1;
  }

  // --- Phân bố theo tháng (1-9) ---
  const byMonth: Record<string, number>[] = [];
  for (let m = 1; m <= 9; m++) {
    const inMonth = reflections.filter((r) => r.monthNumber === m);
    if (inMonth.length === 0) continue;
    const row: Record<string, number> = { month: m, total: inMonth.length };
    for (const mood of MOODS) row[mood] = 0;
    for (const r of inMonth) row[r.mood] = (row[r.mood] ?? 0) + 1;
    byMonth.push(row);
  }

  // --- Bảng chi tiết theo cặp ---
  const rows = matchIds.map((matchId) => {
    const match = matchMap.get(matchId);
    const matchReflections = reflections.filter((r) => r.matchId === matchId)
      .sort((a, b) => (a.monthNumber - b.monthNumber) || (a.createdAt.getTime() - b.createdAt.getTime()));
    const last = matchReflections[matchReflections.length - 1] ?? null;
    return {
      matchId,
      mentorName: match?.mentorApplication.user.fullName ?? "-",
      menteeName: match?.menteeApplication.user.fullName ?? "-",
      status: match?.status ?? null,
      totalReflections: matchReflections.length,
      latestMood: last?.mood ?? null,
      latestMonth: last?.monthNumber ?? null,
      // đếm mood support_needed của cặp
      supportNeededCount: matchReflections.filter((r) => r.mood === "support_needed").length,
    };
  });

  // Sắp xếp: cặp có "cần hỗ trợ" nhiều nhất lên trên, rồi theo số phản tư
  rows.sort((a, b) => b.supportNeededCount - a.supportNeededCount || b.totalReflections - a.totalReflections);

  return NextResponse.json({ summary, byMonth, rows, isAdmin });
});
