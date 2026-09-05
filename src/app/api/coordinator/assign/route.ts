import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import {
  transitionMatch,
  addBusinessDays,
  getSlaDays,
} from "@/lib/domain";
import { withErrorHandling } from "@/lib/api-helpers";

const AssignSchema = z.object({
  matchReviewId: z.string().uuid(),
  coordinatorId: z.string().uuid(),
});

/**
 * POST /api/coordinator/assign
 * Phân công 1 cặp (đã có match_review) cho ĐPV duyệt,
 * tính due_at theo SLA (số ngày làm việc từ season_criteria).
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireStaff();
  const body = await req.json();
  const { matchReviewId, coordinatorId } = AssignSchema.parse(body);

  const review = await prisma.matchReview.findUnique({
    where: { id: matchReviewId },
    include: { match: true },
  });
  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const slaDays = await getSlaDays(review.match.seasonId);
  const dueAt = addBusinessDays(new Date(), slaDays);

  const assignment = await prisma.coordinatorAssignment.create({
    data: {
      matchReviewId,
      coordinatorId,
      status: "pending",
      assignedAt: new Date(),
      dueAt,
    },
  });

  // Chuyển match sang chờ ĐPV duyệt
  await transitionMatch(review.matchId, "pending_coordinator_review", {
    actorUserId: user.id,
  });

  return NextResponse.json({ assignment, dueAt }, { status: 201 });
});
