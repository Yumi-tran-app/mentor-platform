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
  if (user.role !== "admin" && user.role !== "dpv") {
    throw new Error("FORBIDDEN");
  }
  return user;
}
