import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

/**
 * GET /api/discover
 * Danh sách người sẵn sàng ghép cặp.
 * ?type=mentor -> danh sách mentor (cho mentee xem)
 * ?type=mentee -> danh sách mentee (cho mentor xem)
 * Nếu không có type, tự đoán theo role/application của user.
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  let type = url.searchParams.get("type");

  if (!type) {
    // Tự đoán: nếu user có mentor application (role mentor) -> xem mentee, ngược lại xem mentor
    const mentorApp = await prisma.mentorApplication.findFirst({ where: { userId: user.id } });
    type = mentorApp || user.role === "mentor" ? "mentee" : "mentor";
  }

  if (type === "mentee") {
    const mentees = await prisma.menteeApplication.findMany({
      where: {
        status: { in: ["approved", "in_pool"] },
        availabilityStatus: { in: ["waiting", "seeking_rematch"] },
      },
      orderBy: { submittedAt: "desc" },
      include: {
        user: { select: { fullName: true } },
        needs: true,
      },
    });
    return NextResponse.json({ type, mentees });
  }

  const mentors = await prisma.mentorApplication.findMany({
    where: {
      status: { in: ["approved", "in_pool"] },
      programStatus: "active",
    },
    orderBy: { submittedAt: "desc" },
    include: { user: { select: { fullName: true } } },
  });
  return NextResponse.json({ type, mentors });
});
