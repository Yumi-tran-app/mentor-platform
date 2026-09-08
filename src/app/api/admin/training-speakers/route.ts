import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

const SpeakerSchema = z.object({
  moduleId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.string().optional(),
});

/**
 * GET /api/admin/training-speakers?moduleId=<uuid>
 * Danh sách diễn giả của một khoá đào tạo/workshop.
 */
export const GET = withErrorHandling(async (req: Request) => {
  await requireAdmin();
  const url = new URL(req.url);
  const moduleId = url.searchParams.get("moduleId");
  if (!moduleId) {
    return NextResponse.json({ error: "moduleId required" }, { status: 400 });
  }

  const speakers = await prisma.trainingSpeaker.findMany({
    where: { moduleId },
    include: { user: { select: { id: true, fullName: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ speakers });
});

/**
 * POST /api/admin/training-speakers
 * Gán một mentor làm diễn giả cho một khoá đào tạo.
 */
export const POST = withErrorHandling(async (req: Request) => {
  await requireAdmin();
  const body = await req.json();
  const { moduleId, userId, role } = SpeakerSchema.parse(body);

  const module = await prisma.trainingModule.findUnique({ where: { id: moduleId } });
  if (!module) return NextResponse.json({ error: "Module không tồn tại" }, { status: 404 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Người dùng không tồn tại" }, { status: 404 });

  const existing = await prisma.trainingSpeaker.findUnique({
    where: { moduleId_userId: { moduleId, userId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Đã là diễn giả của khoá này" }, { status: 400 });
  }

  const speaker = await prisma.trainingSpeaker.create({
    data: { moduleId, userId, role },
  });

  return NextResponse.json({ speaker }, { status: 201 });
});

/**
 * DELETE /api/admin/training-speakers?moduleId=<uuid>&userId=<uuid>
 * Gỡ diễn giả khỏi khoá đào tạo.
 */
export const DELETE = withErrorHandling(async (req: Request) => {
  await requireAdmin();
  const url = new URL(req.url);
  const moduleId = url.searchParams.get("moduleId");
  const userId = url.searchParams.get("userId");
  if (!moduleId || !userId) {
    return NextResponse.json({ error: "moduleId & userId required" }, { status: 400 });
  }

  await prisma.trainingSpeaker.deleteMany({ where: { moduleId, userId } });
  return NextResponse.json({ ok: true });
});
