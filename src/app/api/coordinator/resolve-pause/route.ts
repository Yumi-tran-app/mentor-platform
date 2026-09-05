import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { transitionMatch, writeAudit } from "@/lib/domain";
import { withErrorHandling } from "@/lib/api-helpers";

const ResolveSchema = z.object({
  pauseRequestId: z.string().uuid(),
  resolution: z.enum(["continue", "ended"]),
  endReason: z
    .enum([
      "pause_unresolved",
      "mentee_withdrew",
      "mentor_withdrew",
      "other",
    ])
    .optional(),
  notes: z.string().optional(),
});

/**
 * POST /api/coordinator/resolve-pause
 * ĐPV quyết định sau buổi phỏng vấn xác nhận:
 * - continue -> match trở lại active
 * - ended -> match kết thúc (end_reason tuỳ tình huống)
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireUser();
  const body = await req.json();
  const { pauseRequestId, resolution, endReason, notes } =
    ResolveSchema.parse(body);

  const pause = await prisma.pauseRequest.findUnique({
    where: { id: pauseRequestId },
  });
  if (!pause || pause.status !== "pending_review") {
    return NextResponse.json(
      { error: "Pause request not pending" },
      { status: 400 }
    );
  }

  if (resolution === "continue") {
    await prisma.pauseRequest.update({
      where: { id: pauseRequestId },
      data: {
        status: "resolved_continue",
        resolvedByCoordinatorId: user.id,
        resolvedAt: new Date(),
      },
    });
    await transitionMatch(pause.matchId, "active", { actorUserId: user.id });
  } else {
    await prisma.pauseRequest.update({
      where: { id: pauseRequestId },
      data: {
        status: "resolved_ended",
        resolvedByCoordinatorId: user.id,
        resolvedAt: new Date(),
      },
    });
    await transitionMatch(pause.matchId, "ended", {
      actorUserId: user.id,
      endReason: endReason ?? "pause_unresolved",
      endNotes: notes,
      endedByCoordinatorId: user.id,
    });
  }

  await writeAudit({
    actorUserId: user.id,
    action: "coordinator.resolve_pause",
    entityType: "PauseRequest",
    entityId: pauseRequestId,
    after: { resolution },
  });

  return NextResponse.json({ ok: true, resolution });
});
