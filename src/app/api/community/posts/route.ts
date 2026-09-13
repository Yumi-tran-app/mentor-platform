import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser, requireStaff } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

const CreateSchema = z.object({
  content: z.string().min(1),
  title: z.string().optional(),
  excerpt: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  isOfficial: z.boolean().optional().default(false),
});

/**
 * GET /api/community/posts
 * - Mặc định (không scope): bài đã duyệt (approved, chưa xoá), mới nhất trước.
 * - ?scope=pending&mine=1 : bài của tôi (mọi trạng thái) - để người dùng xem trạng thái.
 * - ?scope=pending (staff): bài chờ duyệt.
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const scope = url.searchParams.get("scope");
  const mine = url.searchParams.get("mine");

  // Staff xem hàng đợi duyệt
  if (scope === "pending" && (user.role === "admin" || user.role === "dpv")) {
    const posts = await prisma.communityPost.findMany({
      where: { status: "pending", deletedAt: null },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { fullName: true, avatarUrl: true, role: true } },
        _count: { select: { comments: true } },
      },
    });
    return NextResponse.json({ posts });
  }

  // Bài của tôi (xem trạng thái riêng)
  if (mine === "1") {
    const posts = await prisma.communityPost.findMany({
      where: { authorUserId: user.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { fullName: true, avatarUrl: true, role: true } },
        _count: { select: { comments: true } },
      },
    });
    return NextResponse.json({ posts });
  }

  // Mặc định: bài đã duyệt
  const posts = await prisma.communityPost.findMany({
    where: { status: "approved", deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { fullName: true, avatarUrl: true, role: true } },
      _count: { select: { comments: { where: { deletedAt: null } } } },
    },
  });
  return NextResponse.json({ posts });
});

/**
 * POST /api/community/posts
 * Tạo bài mới - mặc định pending, chờ staff duyệt.
 * Nếu isOfficial=true (chỉ staff) → tự động approved, commentsLocked=true.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { content, title, excerpt, imageUrl, tags, isOfficial } = CreateSchema.parse(body);

  const cleanTags = [...new Set(tags.map((t) => t.trim()).filter(Boolean))];

  const isStaff = user.role === "admin" || user.role === "dpv";
  const official = isOfficial && isStaff;
  if (isOfficial && !isStaff) {
    return NextResponse.json({ error: "Chỉ điều phối viên mới đăng hoạt động chính thức" }, { status: 403 });
  }

  const post = await prisma.communityPost.create({
    data: {
      authorUserId: user.id,
      content,
      title: title?.trim() || null,
      excerpt: excerpt?.trim() || null,
      imageUrl: imageUrl || null,
      tags: cleanTags,
      isOfficial: official,
      status: official ? "approved" : "pending",
      commentsLocked: official ? true : false,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
});

/**
 * PATCH /api/community/posts
 * (staff) Kiểm duyệt/đóng bình luận/xoá bài.
 * body: { id, action: approve|reject|lock|unlock|delete }
 */
const ModerationSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["approve", "reject", "lock", "unlock", "delete"]),
});

export const PATCH = withErrorHandling(async (req: Request) => {
  const staff = await requireStaff();
  const body = await req.json();
  const { id, action } = ModerationSchema.parse(body);

  const post = await prisma.communityPost.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  switch (action) {
    case "approve":
      await prisma.communityPost.update({
        where: { id },
        data: {
          status: "approved",
          reviewedByUserId: staff.id,
          reviewedAt: new Date(),
        },
      });
      break;
    case "reject":
      await prisma.communityPost.update({
        where: { id },
        data: {
          status: "rejected",
          reviewedByUserId: staff.id,
          reviewedAt: new Date(),
        },
      });
      break;
    case "lock":
      await prisma.communityPost.update({
        where: { id },
        data: { commentsLocked: true },
      });
      break;
    case "unlock":
      await prisma.communityPost.update({
        where: { id },
        data: { commentsLocked: false },
      });
      break;
    case "delete":
      await prisma.communityPost.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      break;
  }

  return NextResponse.json({ ok: true });
});
