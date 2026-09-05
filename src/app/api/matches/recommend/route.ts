import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import {
  getActiveSeasonId,
  computeFitScore,
  getAvailableMentors,
} from "@/lib/domain";
import { withErrorHandling } from "@/lib/api-helpers";

const RecommendSchema = z.object({
  seasonId: z.string().uuid().optional(),
  menteeApplicationId: z.string().uuid(),
});

/**
 * POST /api/matches/recommend
 * Đề xuất ghép cặp: với 1 mentee đã approved, tìm mentor khả dụng
 * và tạo Match ở trạng thái `recommended` + `match_reviews` chờ ĐPV duyệt.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireStaff();
  const body = await req.json();
  const { seasonId, menteeApplicationId } = RecommendSchema.parse(body);

  const sid = seasonId ?? (await getActiveSeasonId());
  if (!sid) {
    return NextResponse.json({ error: "No active season" }, { status: 400 });
  }

  const mentee = await prisma.menteeApplication.findUnique({
    where: { id: menteeApplicationId },
    include: { needs: true },
  });
  if (!mentee || mentee.seasonId !== sid || mentee.status !== "approved") {
    return NextResponse.json(
      { error: "Mentee not approved for this season" },
      { status: 400 }
    );
  }

  const mentors = await getAvailableMentors(sid);
  if (mentors.length === 0) {
    return NextResponse.json(
      { error: "No available mentor in pool" },
      { status: 400 }
    );
  }

  const needs = mentee.needs.map((n) => n.needCategory);

  // Chọn mentor có fit score cao nhất (đơn giản — sẽ nâng cấp sau)
  let best = mentors[0];
  let bestScore = -1;
  for (const m of mentors) {
    const s = computeFitScore(m.industry, needs);
    if (s > bestScore) {
      bestScore = s;
      best = m;
    }
  }

  const match = await prisma.$transaction(async (tx) => {
    const created = await tx.match.create({
      data: {
        seasonId: sid,
        mentorApplicationId: best.id,
        menteeApplicationId: mentee.id,
        fitScore: bestScore,
        status: "recommended",
        proposedAt: new Date(),
      },
    });

    // Tạo match_review chờ ĐPV duyệt
    await tx.matchReview.create({
      data: {
        matchId: created.id,
        decision: "pending",
      },
    });

    // Tăng capacity_used của mentor (giữ chỗ khi đề xuất)
    await tx.mentorApplication.update({
      where: { id: best.id },
      data: { capacityUsed: { increment: 1 } },
    });

    return created;
  });

  return NextResponse.json({ match }, { status: 201 });
});
