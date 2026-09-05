import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

/**
 * GET /api/coordinator/queue
 * Danh sách cặp đang chờ ĐPV duyệt (status = pending_coordinator_review
 * hoặc recommended đã có match_review).
 */
export const GET = withErrorHandling(async (req: Request) => {
  await requireStaff();

  const matches = await prisma.match.findMany({
    where: {
      status: { in: ["recommended", "pending_coordinator_review"] },
    },
    orderBy: { proposedAt: "desc" },
    include: {
      mentorApplication: { include: { user: true } },
      menteeApplication: { include: { user: true } },
      reviews: true,
    },
  });

  return NextResponse.json({ matches });
});
