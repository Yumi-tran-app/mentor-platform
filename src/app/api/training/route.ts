import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { getActiveSeasonId } from "@/lib/domain";
import { withErrorHandling } from "@/lib/api-helpers";

/**
 * GET /api/training
 * Danh sách module đào tạo của mùa hiện tại + tiến độ của user.
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const seasonId = await getActiveSeasonId();
  if (!seasonId) {
    return NextResponse.json({ modules: [], completed: [], progress: 0 });
  }

  const modules = await prisma.trainingModule.findMany({
    where: { seasonId },
    orderBy: { sortOrder: "asc" },
  });

  const progress = await prisma.trainingProgress.findMany({
    where: { userId: user.id, module: { seasonId } },
    select: { moduleId: true },
  });

  const completedIds = progress.map((p) => p.moduleId);
  const pct = modules.length
    ? Math.round((completedIds.length / modules.length) * 100)
    : 0;

  return NextResponse.json({ modules, completedIds, progress: pct });
});

/**
 * POST /api/training
 * Đánh dấu hoàn thành 1 module. Body: { moduleId }
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const moduleId = body.moduleId;
  if (!moduleId) {
    return NextResponse.json({ error: "moduleId required" }, { status: 400 });
  }

  await prisma.trainingProgress.upsert({
    where: { moduleId_userId: { moduleId, userId: user.id } },
    create: { moduleId, userId: user.id },
    update: {},
  });

  return NextResponse.json({ ok: true });
});
