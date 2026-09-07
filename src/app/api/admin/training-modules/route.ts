import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { getActiveSeasonId } from "@/lib/domain";
import { withErrorHandling } from "@/lib/api-helpers";

const ModuleSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  audience: z.enum(["all", "mentor", "mentee"]).default("all"),
  required: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

/**
 * GET /api/admin/training-modules — danh sách module đào tạo (admin).
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await requireStaff();
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const seasonId = await getActiveSeasonId();
  const modules = await prisma.trainingModule.findMany({
    where: seasonId ? { seasonId } : {},
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ modules });
});

/**
 * POST /api/admin/training-modules — thêm module đào tạo.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireStaff();
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const seasonId = await getActiveSeasonId();
  if (!seasonId) {
    return NextResponse.json({ error: "No active season" }, { status: 400 });
  }
  const body = await req.json();
  const parsed = ModuleSchema.parse(body);

  const module = await prisma.trainingModule.create({
    data: { ...parsed, seasonId },
  });
  return NextResponse.json({ module }, { status: 201 });
});

/**
 * DELETE /api/admin/training-modules?id=... — xóa module.
 */
export const DELETE = withErrorHandling(async (req: Request) => {
  const user = await requireStaff();
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.trainingModule.delete({ where: { id } });
  return NextResponse.json({ ok: true });
});
