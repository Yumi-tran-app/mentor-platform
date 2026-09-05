import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

/**
 * GET /api/coordinator/applications
 * Staff (admin/ĐPV) xem danh sách đơn đăng ký kèm đầy đủ chi tiết.
 * ?kind=mentor|mentee&status=submitted|approved|...
 */
export const GET = withErrorHandling(async (req: Request) => {
  await requireStaff();

  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") ?? "mentor";
  const status = url.searchParams.get("status") ?? "submitted";

  if (kind === "mentee") {
    const list = await prisma.menteeApplication.findMany({
      where: { status: status as any },
      orderBy: { submittedAt: "asc" },
      include: { user: true, needs: true },
    });
    return NextResponse.json({ applications: list });
  }

  const list = await prisma.mentorApplication.findMany({
    where: { status: status as any },
    orderBy: { submittedAt: "asc" },
    include: { user: true },
  });
  return NextResponse.json({ applications: list });
});
