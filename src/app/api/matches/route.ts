import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

/**
 * GET /api/matches
 * Danh sách match của người dùng hiện tại (với vai trò mentor hoặc mentee).
 * ?id=<uuid> -> chi tiết 1 match.
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  // Lấy application của user để lọc
  const mentorApps = await prisma.mentorApplication.findMany({
    where: { userId: user.id },
    select: { id: true },
  });
  const menteeApps = await prisma.menteeApplication.findMany({
    where: { userId: user.id },
    select: { id: true },
  });
  const mentorIds = mentorApps.map((a) => a.id);
  const menteeIds = menteeApps.map((a) => a.id);

  const where = id
    ? {
        id,
        OR: [
          { mentorApplicationId: { in: mentorIds } },
          { menteeApplicationId: { in: menteeIds } },
        ],
      }
    : {
        OR: [
          { mentorApplicationId: { in: mentorIds } },
          { menteeApplicationId: { in: menteeIds } },
        ],
      };

  const matches = await prisma.match.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      mentorApplication: { include: { user: true } },
      menteeApplication: { include: { user: true, needs: true } },
      reviews: { include: { assignments: true } },
    },
  });

  return NextResponse.json({ matches });
});
