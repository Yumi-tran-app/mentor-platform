import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

const CommentSchema = z.object({
  content: z.string().min(1),
});

/**
 * GET /api/community/posts/[id]/comments
 * Danh sách bình luận của 1 bài (chưa xoá), mới nhất trước.
 */
export const GET = withErrorHandling(async (req: Request, ctx: any) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = ctx.params;
  const comments = await prisma.communityComment.findMany({
    where: { postId: id, deletedAt: null },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { fullName: true, avatarUrl: true, role: true } } },
  });
  return NextResponse.json({ comments });
});

/**
 * POST /api/community/posts/[id]/comments
 * Thêm bình luận (chỉ khi bài chưa khoá + đã duyệt).
 */
export const POST = withErrorHandling(async (req: Request, ctx: any) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = ctx.params;
  const body = await req.json();
  const { content } = CommentSchema.parse(body);

  const post = await prisma.communityPost.findUnique({ where: { id } });
  if (!post || post.deletedAt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.status !== "approved") {
    return NextResponse.json({ error: "Bài chưa được duyệt" }, { status: 400 });
  }
  if (post.commentsLocked) {
    return NextResponse.json({ error: "Bình luận đã bị đóng" }, { status: 400 });
  }

  const comment = await prisma.communityComment.create({
    data: { postId: id, authorUserId: user.id, content },
  });

  return NextResponse.json({ comment }, { status: 201 });
});
