import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { getActiveSeasonId } from "@/lib/domain";
import { withErrorHandling } from "@/lib/api-helpers";

/**
 * Xác định audience của user (mentor/mentee) dựa trên đơn đã nộp hoặc role.
 */
async function resolveAudience(userId: string, role: string): Promise<"mentor" | "mentee"> {
  if (role === "mentor") return "mentor";
  if (role === "mentee") return "mentee";

  const mentorApp = await prisma.mentorApplication.findFirst({ where: { userId } });
  if (mentorApp) return "mentor";

  const menteeApp = await prisma.menteeApplication.findFirst({ where: { userId } });
  if (menteeApp) return "mentee";

  return "mentee"; // mặc định
}

/**
 * GET /api/training
 * Danh sách module đào tạo theo audience của user + tiến độ.
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const seasonId = await getActiveSeasonId();
  if (!seasonId) {
    return NextResponse.json({ modules: [], completedIds: [], progress: 0, audience: null });
  }

  const audience = await resolveAudience(user.id, user.role);

  const modules = await prisma.trainingModule.findMany({
    where: { seasonId, audience: { in: ["all", audience] } },
    orderBy: { sortOrder: "asc" },
  });

  const progress = await prisma.trainingProgress.findMany({
    where: { userId: user.id, module: { seasonId } },
    select: { moduleId: true },
  });

  const completedIds = progress.map((p) => p.moduleId);
  const pct = modules.length ? Math.round((completedIds.length / modules.length) * 100) : 0;

  return NextResponse.json({ modules, completedIds, progress: pct, audience });
});

/**
 * POST /api/training
 * Đánh dấu hoàn thành 1 module.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const moduleId = body.moduleId;
  if (!moduleId) return NextResponse.json({ error: "moduleId required" }, { status: 400 });

  await prisma.trainingProgress.upsert({
    where: { moduleId_userId: { moduleId, userId: user.id } },
    create: { moduleId, userId: user.id },
    update: {},
  });

  return NextResponse.json({ ok: true });
});
