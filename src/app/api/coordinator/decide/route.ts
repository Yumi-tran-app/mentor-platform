import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { transitionMatch, writeAudit, getSlaDays } from "@/lib/domain";
import { withErrorHandling } from "@/lib/api-helpers";

const DecideSchema = z.object({
  matchReviewId: z.string().uuid(),
  decision: z.enum(["approved", "needs_more_info"]),
  notes: z.string().optional(),
});

/**
 * POST /api/coordinator/decide
 * ĐPV ra quyết định duyệt cặp. Khi approved -> match chuyển proposed_to_parties.
 * Ghi KPI completed_on_time nếu xử lý đúng hạn.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireUser();
  const body = await req.json();
  const { matchReviewId, decision, notes } = DecideSchema.parse(body);

  const review = await prisma.matchReview.findUnique({
    where: { id: matchReviewId },
    include: { match: true, assignments: true },
  });
  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const now = new Date();
  const isOnTime = review.assignments.some(
    (a) => a.status === "pending" && a.dueAt >= now
  );

  const updated = await prisma.matchReview.update({
    where: { id: matchReviewId },
    data: {
      decision,
      decidedAt: now,
      decisionNotes: notes,
    },
  });

  // Đóng các assignment pending
  for (const a of review.assignments) {
    if (a.status === "pending") {
      await prisma.coordinatorAssignment.update({
        where: { id: a.id },
        data: {
          status: isOnTime ? "completed_on_time" : "overdue_reassigned",
          completedAt: now,
        },
      });
      await prisma.coordinatorKpiEvent.create({
        data: {
          coordinatorId: a.coordinatorId,
          assignmentId: a.id,
          eventType: isOnTime ? "completed_on_time" : "sla_breach",
          occurredAt: now,
        },
      });
    }
  }

  if (decision === "approved") {
    await transitionMatch(review.matchId, "proposed_to_parties", {
      actorUserId: user.id,
    });
  }

  await writeAudit({
    actorUserId: user.id,
    action: "coordinator.decide",
    entityType: "MatchReview",
    entityId: matchReviewId,
    after: { decision },
  });

  return NextResponse.json({ review: updated });
});
