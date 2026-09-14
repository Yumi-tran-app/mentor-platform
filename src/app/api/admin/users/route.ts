import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  dpv: "Điều phối viên",
  mentor: "Mentor",
  mentee: "Mentee",
};

const UpdateRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["admin", "dpv", "mentor", "mentee"]),
});

/**
 * GET /api/admin/users — danh sách người dùng (chỉ admin).
 */
export const GET = withErrorHandling(async () => {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    users: users.map((u) => ({
      ...u,
      roleLabel: ROLE_LABEL[u.role] ?? u.role,
    })),
  });
});

/**
 * PATCH /api/admin/users — chỉnh vai trò (quyền hệ thống) của người dùng.
 * Chỉ admin được đổi. Không cho admin tự hạ quyền chính mình (tránh mất quyền cuối cùng).
 */
export const PATCH = withErrorHandling(async (req: Request) => {
  const admin = await requireAdmin();
  const body = await req.json();
  const { userId, role } = UpdateRoleSchema.parse(body);

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) {
    return NextResponse.json({ error: "Người dùng không tồn tại" }, { status: 404 });
  }

  // Không cho admin tự hạ quyền chính mình (đảm bảo luôn còn ít nhất 1 admin).
  if (target.id === admin.id && role !== "admin") {
    return NextResponse.json(
      { error: "Không thể tự hạ quyền admin của chính mình." },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  return NextResponse.json({
    user: { ...updated, roleLabel: ROLE_LABEL[updated.role] ?? updated.role },
  });
});
