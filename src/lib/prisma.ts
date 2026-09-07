import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        // Giữ pool connection sống giữa các query trong cùng 1 invocation,
        // tránh mở TCP/TLS handshake mới mỗi lần (nguyên nhân chính gây "đang tải").
        // pooler Neon cho phép tối đa 10 connection trên free tier.
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
