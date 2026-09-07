import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import type { User } from "@prisma/client";

/**
 * Lấy (hoặc tạo) bản ghi User trong DB tương ứng với tài khoản Clerk hiện tại.
 * Dùng chung cho mọi API route cần xác định người dùng.
 */
export async function getOrCreateCurrentUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (existing) return existing;

  const clerkUser = await currentUser();
  const email =
    clerkUser?.emailAddresses?.[0]?.emailAddress ?? `${userId}@placeholder.local`;
  const fullName =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
    clerkUser?.username ||
    email;

  return prisma.user.create({
    data: {
      clerkUserId: userId,
      email,
      fullName,
      authProvider: "clerk",
    },
  });
}

export async function requireUser(): Promise<User> {
  const user = await getOrCreateCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

/**
 * Yêu cầu người dùng hiện tại phải có vai trò admin hoặc dpv.
 * Ném lỗi FORBIDDEN nếu không đủ quyền.
 */
export async function requireStaff(): Promise<User> {
  const user = await requireUser();
  if (!isStaffRole(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

/**
 * Vai trò hệ thống (quyền) tách biệt khỏi vai trò đăng ký (mentor/mentee).
 * role chỉ mang ý nghĩa quyền: admin / dpv / (mentee = mặc định, chưa có quyền đặc biệt).
 * Vai trò đăng ký mentor/mentee LUÔN suy từ Application.
 */
export function isStaffRole(role: string): boolean {
  return role === "admin" || role === "dpv";
}

/**
 * Nâng/quản lý role một cách AN TOÀN: không bao giờ hạ quyền admin/dpv
 * xuống mentor/mentee. mentor/mentee là vai trò đăng ký, KHÔNG phải quyền hệ thống,
 * nên nếu user đang là staff thì ta KHÔNG ghi đè role của họ.
 */
export function safeRoleForApplicant(
  currentRole: string,
  applicantType: "mentor" | "mentee"
): string | null {
  // Nếu đang là staff (admin/dpv) -> giữ nguyên, không đổi.
  if (isStaffRole(currentRole)) return null;
  // Chỉ set mentor khi user hiện đang là mentee (mặc định).
  return applicantType;
}
