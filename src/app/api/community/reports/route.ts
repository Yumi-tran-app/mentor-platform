import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser, requireStaff } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

const ReportSchema = z.object({
  postId: z.string().uuid().optional(),
  commentId: z.string().uuid().optional(),
  reason: z.string().min(1),
}).refine((d) => d.postId || d.commentId, {
  message: "Cần postId hoặc commentId",
});

/**
 * POST /api/community/reports
 * Người dùng báo cáo nội dung vi phạm (bài viết hoặc bình luận).
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { postId, commentId, reason } = ReportSchema.parse(body);

  const report = await prisma.communityReport.create({
    data: {
      postId: postId ?? null,
      commentId: commentId ?? null,
      reportedByUserId: user.id,
      reason,
      status: "open",
    },
  });

  return NextResponse.json({ report }, { status: 201 });
});

/**
 * GET /api/community/reports?status=open
 * (staff) Danh sách báo cáo để xử lý.
 */
export const GET = withErrorHandling(async (req: Request) => {
  await requireStaff();

  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? "open";

  const reports = await prisma.communityReport.findMany({
    where: { status },
    orderBy: { createdAt: "asc" },
    include: {
      reportedBy: { select: { fullName: true } },
      post: { select: { id: true, content: true, authorUserId: true } },
      comment: { select: { id: true, content: true, postId: true, authorUserId: true } },
    },
  });

  return NextResponse.json({ reports });
});

/**
 * PATCH /api/community/reports
 * (staff) Cập nhật trạng thái báo cáo (resolved).
 */
const ResolveSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["open", "resolved"]),
});

export const PATCH = withErrorHandling(async (req: Request) => {
  await requireStaff();
  const body = await req.json();
  const { id, status } = ResolveSchema.parse(body);

  await prisma.communityReport.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ ok: true });
});
