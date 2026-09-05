import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { transitionMatch } from "@/lib/domain";
import { withErrorHandling } from "@/lib/api-helpers";

const RespondSchema = z.object({
  accept: z.boolean(),
});

/**
 * POST /api/matches/[id]/respond
 * Chấp nhận / từ chối yêu cầu kết nối.
 * proposed_to_parties → (mentor accept) → mentor_accepted → (mentee accept) → mutual_accepted
 * Từ chối → ended
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const user = await getOrCreateCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { accept } = RespondSchema.parse(body);

    const match = await prisma.match.findUnique({
      where: { id },
      include: { mentorApplication: true, menteeApplication: true },
    });
    if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isMentor = match.mentorApplication.userId === user.id;
    const isMentee = match.menteeApplication.userId === user.id;
    if (!isMentor && !isMentee) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!accept) {
      await transitionMatch(id, "ended", {
        actorUserId: user.id,
        endReason: isMentor ? "mentor_withdrew" : "mentee_withdrew",
      });
      return NextResponse.json({ match: { status: "ended" } });
    }

    // Chấp nhận
    if (match.status === "proposed_to_parties") {
      if (isMentor) {
        await transitionMatch(id, "mentor_accepted", { actorUserId: user.id });
      } else {
        await transitionMatch(id, "mutual_accepted", { actorUserId: user.id });
      }
    } else if (match.status === "mentor_accepted") {
      if (isMentee) {
        await transitionMatch(id, "mutual_accepted", { actorUserId: user.id });
      }
    }

    const updated = await prisma.match.findUnique({ where: { id } });
    return NextResponse.json({ match: updated });
  })(req, { params: await params });
}
