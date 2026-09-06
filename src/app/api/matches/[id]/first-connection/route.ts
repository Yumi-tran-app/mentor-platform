import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { transitionMatch, notifyUser } from "@/lib/domain";
import { withErrorHandling } from "@/lib/api-helpers";

/**
 * POST /api/matches/[id]/first-connection
 * Đánh dấu hai bên đã kết nối buổi gặp đầu tiên.
 * mutual_accepted -> first_connection_done
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const user = await getOrCreateCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    if (match.status === "mutual_accepted") {
      await transitionMatch(id, "first_connection_done", { actorUserId: user.id });
      // Báo cho bên còn lại
      const otherUserId = isMentor
        ? match.menteeApplication.userId
        : match.mentorApplication.userId;
      await notifyUser({
        userId: otherUserId,
        type: "match.first_connection_done",
        payload: { matchId: id },
      });
    }

    const updated = await prisma.match.findUnique({ where: { id } });
    return NextResponse.json({ match: updated });
  })(req, { params: await params });
}
