import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  transitionMentorApplication,
  transitionMenteeApplication,
  writeAudit,
} from "@/lib/domain";
import { withErrorHandling } from "@/lib/api-helpers";

const DecideSchema = z.object({
  passed: z.boolean(),
  notes: z.string().optional(),
  ratings: z
    .array(
      z.object({
        coreValueId: z.string().uuid(),
        rating: z.enum(["met", "needs_improvement"]),
      })
    )
    .optional(),
});

/**
 * POST /api/interviews/:id/decide
 * Quyết định phỏng vấn. Nếu không đạt -> application bị rejected (nộp mùa sau).
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const user = await requireUser();
    const body = await req.json();
    const { passed, notes, ratings } = DecideSchema.parse(body);

    const interview = await prisma.interview.findUnique({
      where: { id },
    });
    if (!interview) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const newStatus = passed ? "passed" : "rejected";

    await prisma.$transaction(async (tx) => {
      await tx.interview.update({
        where: { id },
        data: {
          status: newStatus,
          notes,
          decidedAt: new Date(),
        },
      });

      if (ratings?.length) {
        for (const r of ratings) {
          await tx.interviewValueRating.create({
            data: {
              interviewId: id,
              coreValueId: r.coreValueId,
              rating: r.rating,
            },
          });
        }
      }
    });

    if (interview.purpose === "screening") {
      if (interview.mentorApplicationId) {
        await transitionMentorApplication(
          interview.mentorApplicationId,
          passed ? "approved" : "rejected",
          user.id
        );
      } else if (interview.menteeApplicationId) {
        await transitionMenteeApplication(
          interview.menteeApplicationId,
          passed ? "approved" : "rejected",
          user.id
        );
      }
    }

    await writeAudit({
      actorUserId: user.id,
      action: "interview.decide",
      entityType: "Interview",
      entityId: id,
      after: { newStatus },
    });

    return NextResponse.json({ status: newStatus });
  })(req, { params: await params });
}
