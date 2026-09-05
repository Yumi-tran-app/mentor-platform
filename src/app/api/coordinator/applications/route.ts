import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

/**
 * GET /api/coordinator/applications
 * ĐPV xem danh sách đơn đăng ký mentor/mentee (mặc định: đã submit, chờ phỏng vấn).
 * ?kind=mentor|mentee&status=submitted
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") ?? "mentor";
  const status = url.searchParams.get("status");

  if (kind === "mentee") {
    const list = await prisma.menteeApplication.findMany({
      where: status ? { status: status as any } : { status: "submitted" },
      orderBy: { submittedAt: "asc" },
      include: { user: true, needs: true },
    });
    return NextResponse.json({ applications: list });
  }

  const list = await prisma.mentorApplication.findMany({
    where: status ? { status: status as any } : { status: "submitted" },
    orderBy: { submittedAt: "asc" },
    include: { user: true },
  });
  return NextResponse.json({ applications: list });
});
