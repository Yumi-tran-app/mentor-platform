import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

/**
 * GET /api/community/announcements
 * Danh sách hoạt động cộng đồng (bài chính thức do ĐPV/BTC đăng).
 * - Không kèm scope: trả về các bài isOfficial=true, approved, chưa xoá (mới nhất trước).
 * - ?scope=all (staff): trả về tất cả bài isOfficial=true (mọi status, chưa xoá) để quản lý.
 * - ?id=<uuid> (public): trả về chi tiết 1 bài chính thức đã duyệt.
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  const url = new URL(req.url);
  const scope = url.searchParams.get("scope");
  const id = url.searchParams.get("id");

  // Chi tiết 1 bài (public, chỉ bài đã duyệt)
  if (id) {
    const post = await prisma.communityPost.findFirst({
      where: {
        id,
        isOfficial: true,
        deletedAt: null,
        ...(user && (user.role === "admin" || user.role === "dpv")
          ? {}
          : { status: "approved" }),
      },
      include: {
        author: { select: { fullName: true, avatarUrl: true, role: true } },
      },
    });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ post });
  }

  const isStaff = user && (user.role === "admin" || user.role === "dpv");

  const posts = await prisma.communityPost.findMany({
    where: {
      isOfficial: true,
      deletedAt: null,
      ...(isStaff && scope === "all" ? {} : { status: "approved" }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { fullName: true, avatarUrl: true, role: true } },
    },
  });

  return NextResponse.json({ posts });
});
