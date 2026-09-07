import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

function genCheckInCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

const PatchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  audience: z.enum(["all", "mentor", "mentee"]).optional(),
  startAt: z.string().datetime().optional().nullable(),
  endAt: z.string().datetime().optional().nullable(),
  location: z.string().optional().nullable(),
  zoomLink: z.string().optional().nullable(),
  price: z.number().int().min(0).optional(),
  capacity: z.number().int().min(0).optional(),
});

/**
 * GET /api/admin/events/[id] — chi tiết event: học viên đăng ký + tiến độ check-in.
 */
export const GET = withErrorHandling(async (req: Request, ctx: any) => {
  const user = await requireStaff();
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;

  const event = await prisma.trainingModule.findUnique({
    where: { id },
    include: {
      registrations: {
        include: { user: { select: { fullName: true, email: true } } },
        orderBy: { registeredAt: "asc" },
      },
    },
  });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const filled = event.capacity > 0 ? `${event.registrations.length}/${event.capacity}` : `${event.registrations.length} (không giới hạn)`;
  const checkedIn = event.registrations.filter((r) => r.checkedInAt).length;

  return NextResponse.json({ event, filled, checkedIn, checkedTotal: event.registrations.length });
});

/**
 * PATCH /api/admin/events/[id] — cập nhật thông tin hoặc chuyển trạng thái.
 * body: { ..., action?: "save" | "publish" | "close" }
 */
export const PATCH = withErrorHandling(async (req: Request, ctx: any) => {
  const user = await requireStaff();
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const body = await req.json();
  const parsed = PatchSchema.parse(body);

  const existing = await prisma.trainingModule.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: any = {
    ...(parsed.title !== undefined ? { title: parsed.title } : {}),
    ...(parsed.description !== undefined ? { description: parsed.description } : {}),
    ...(parsed.audience !== undefined ? { audience: parsed.audience } : {}),
    ...(parsed.startAt !== undefined ? { startAt: parsed.startAt ? new Date(parsed.startAt) : null } : {}),
    ...(parsed.endAt !== undefined ? { endAt: parsed.endAt ? new Date(parsed.endAt) : null } : {}),
    ...(parsed.location !== undefined ? { location: parsed.location } : {}),
    ...(parsed.zoomLink !== undefined ? { zoomLink: parsed.zoomLink } : {}),
    ...(parsed.price !== undefined ? { price: parsed.price } : {}),
    ...(parsed.capacity !== undefined ? { capacity: parsed.capacity } : {}),
  };

  if (body.action === "publish") {
    data.status = "open";
    if (!existing.checkInCode) data.checkInCode = genCheckInCode();
  } else if (body.action === "close") {
    data.status = "completed";
  }

  const event = await prisma.trainingModule.update({ where: { id }, data });
  return NextResponse.json({ event });
});

/**
 * DELETE /api/admin/events/[id] — xóa event.
 */
export const DELETE = withErrorHandling(async (req: Request, ctx: any) => {
  const user = await requireStaff();
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  await prisma.trainingModule.delete({ where: { id } });
  return NextResponse.json({ ok: true });
});
