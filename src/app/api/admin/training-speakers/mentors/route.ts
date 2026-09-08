import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

/**
 * GET /api/admin/training-speakers/mentors
 * Danh sách mentor (để chọn làm diễn giả).
 */
export const GET = withErrorHandling(async (req: Request) => {
  await requireAdmin();

  const mentors = await prisma.mentorApplication.findMany({
    where: { status: { in: ["approved", "in_pool"] } },
    include: { user: { select: { id: true, fullName: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const list = mentors.map((m) => ({
    userId: m.user.id,
    fullName: m.user.fullName,
    email: m.user.email,
    industry: m.industry,
  }));

  return NextResponse.json({ mentors: list });
});
