import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { transitionMatch, notifyUser } from "@/lib/domain";
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
      // Gửi thông báo cho bên còn lại
      const otherUserId = isMentor
        ? match.menteeApplication.userId
        : match.mentorApplication.userId;
      await notifyUser({
        userId: otherUserId,
        type: "match.declined",
        payload: { matchId: id },
      });
      return NextResponse.json({ match: { status: "ended" } });
    }

    // Chấp nhận — đúng thứ tự state machine:
    // proposed_to_parties -> (mentor) -> mentor_accepted -> (mentee) -> mutual_accepted
    if (match.status === "proposed_to_parties") {
      if (isMentor) {
        await transitionMatch(id, "mentor_accepted", { actorUserId: user.id });
        // Báo cho mentee biết mentor đã đồng ý
        await notifyUser({
          userId: match.menteeApplication.userId,
          type: "match.mentor_accepted",
          payload: { matchId: id },
        });
      } else {
        // Mentee không thể accept trước khi mentor accept
        return NextResponse.json(
          { error: "Mentor cần đồng ý trước" },
          { status: 400 }
        );
      }
    } else if (match.status === "mentor_accepted") {
      if (isMentee) {
        await transitionMatch(id, "mutual_accepted", { actorUserId: user.id });
        // Báo cho mentor kết quả đã đồng thuận hai bên
        await notifyUser({
          userId: match.mentorApplication.userId,
          type: "match.mutual_accepted",
          payload: { matchId: id },
        });
      }
    }

    const updated = await prisma.match.findUnique({ where: { id } });
    return NextResponse.json({ match: updated });
  })(req, { params: await params });
}
