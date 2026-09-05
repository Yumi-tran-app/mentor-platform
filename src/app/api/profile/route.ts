import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

const UpdateSchema = z.object({
  fullName: z.string().min(1).optional(),
  phone: z.string().optional(),
});

/**
 * GET /api/profile
 * Thông tin người dùng hiện tại + vai trò.
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { clerkUserId: _c, ...safe } = user;
  return NextResponse.json({ user: safe });
});

/**
 * PATCH /api/profile
 * Cập nhật thông tin (fullName, phone).
 */
export const PATCH = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = UpdateSchema.parse(body);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(parsed.fullName ? { fullName: parsed.fullName } : {}),
      ...(parsed.phone !== undefined ? { phone: parsed.phone } : {}),
    },
  });

  const { clerkUserId: _c, ...safe } = updated;
  return NextResponse.json({ user: safe });
});
