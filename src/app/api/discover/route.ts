import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

/**
 * GET /api/discover
 * Danh sách mentor đã được duyệt (approved/in_pool) để mentee khám phá.
 * ?industry=<text> lọc theo ngành.
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const industry = url.searchParams.get("industry");

  const mentors = await prisma.mentorApplication.findMany({
    where: {
      status: { in: ["approved", "in_pool"] },
      programStatus: "active",
      ...(industry ? { industry: { contains: industry, mode: "insensitive" } } : {}),
    },
    orderBy: { submittedAt: "desc" },
    include: { user: { select: { fullName: true } } },
  });

  return NextResponse.json({ mentors });
});
