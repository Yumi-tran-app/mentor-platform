import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

const PauseSchema = z.object({
  matchId: z.string().uuid(),
  reasonText: z.string().optional(),
});

/**
 * POST /api/matches/pause
 * Mentor hoặc mentee bấm "Tạm dừng" -> tạo pause_request + match chuyển paused ngay.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireUser();
  const body = await req.json();
  const { matchId, reasonText } = PauseSchema.parse(body);

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || match.status !== "active") {
    return NextResponse.json(
      { error: "Match not active" },
      { status: 400 }
    );
  }

  // Xác định vai trò người yêu cầu
  let role: "mentor" | "mentee";
  if (match.mentorApplicationId) {
    const mentorApp = await prisma.mentorApplication.findUnique({
      where: { id: match.mentorApplicationId },
    });
    if (mentorApp?.userId === user.id) role = "mentor";
    else role = "mentee";
  } else {
    role = "mentee";
  }

  const result = await prisma.$transaction(async (tx) => {
    const pause = await tx.pauseRequest.create({
      data: {
        matchId,
        requestedByUserId: user.id,
        requestedByRole: role,
        reasonText,
        status: "pending_review",
      },
    });
    await tx.match.update({
      where: { id: matchId },
      data: { status: "paused" },
    });
    return pause;
  });

  return NextResponse.json({ pauseRequest: result }, { status: 201 });
});

/**
 * GET /api/matches/pause?status=pending_review
 * ĐPV dùng để liệt kê các yêu cầu tạm dừng đang chờ xử lý.
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? "pending_review";

  const pauses = await prisma.pauseRequest.findMany({
    where: { status: status as any },
    include: { match: true },
    orderBy: { requestedAt: "asc" },
  });

  return NextResponse.json({ pauses });
});
