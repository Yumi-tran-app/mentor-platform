import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { transitionMatch, writeAudit } from "@/lib/domain";
import { withErrorHandling } from "@/lib/api-helpers";

/**
 * POST /api/matches/[id]/confirm-agreement
 * Mentor/Mentee xác nhận Thoả thuận đồng hành.
 * Khi cả 2 đều xác nhận -> match chuyển sang active.
 *
 * (Phiên bản đơn giản hoá: dùng shared counter trong JSON,
 *  vì schema hiện chỉ có agreement_confirmed_at dạng timestamp.
 *  Ghi lại ai đã xác nhận vào audit.)
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

    await writeAudit({
      actorUserId: user.id,
      action: "match.confirm_agreement",
      entityType: "Match",
      entityId: id,
      after: { role: isMentor ? "mentor" : "mentee" },
    });

    // Nếu match đang ở first_connection_done hoặc mutual_accepted,
    // chuyển sang active khi có xác nhận thoả thuận.
    if (match.status === "first_connection_done") {
      await transitionMatch(id, "active", { actorUserId: user.id });
    }

    const updated = await prisma.match.update({
      where: { id },
      data: { agreementConfirmedAt: new Date() },
    });

    return NextResponse.json({ match: updated });
  })(req, { params: await params });
}
