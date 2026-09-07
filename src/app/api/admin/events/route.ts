import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { getActiveSeasonId } from "@/lib/domain";
import { withErrorHandling } from "@/lib/api-helpers";

const EventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  audience: z.enum(["all", "mentor", "mentee"]).default("all"),
  type: z.enum(["online_module", "event"]).default("event"),
  startAt: z.string().datetime().optional().nullable(),
  endAt: z.string().datetime().optional().nullable(),
  location: z.string().optional().nullable(),
  zoomLink: z.string().optional().nullable(),
  price: z.number().int().min(0).default(0),
  capacity: z.number().int().min(0).default(0),
});

function genCheckInCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

/**
 * GET /api/admin/events?status=&q= — danh sách event/workshop (admin), kèm thống kê.
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await requireStaff();
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const seasonId = await getActiveSeasonId();
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q")?.toLowerCase();

  const where: any = { seasonId: seasonId ?? undefined, type: "event" };
  if (status && status !== "all") where.status = status;
  if (q) where.title = { contains: q, mode: "insensitive" };

  const events = await prisma.trainingModule.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { registrations: true } },
    },
  });

  // Thống kê dashboard
  const [total, openCount, draftCount, completedCount, totalRegistrations] =
    await Promise.all([
      prisma.trainingModule.count({ where: { seasonId: seasonId ?? undefined, type: "event" } }),
      prisma.trainingModule.count({ where: { seasonId: seasonId ?? undefined, type: "event", status: "open" } }),
      prisma.trainingModule.count({ where: { seasonId: seasonId ?? undefined, type: "event", status: "draft" } }),
      prisma.trainingModule.count({ where: { seasonId: seasonId ?? undefined, type: "event", status: "completed" } }),
      prisma.trainingRegistration.count({
        where: { module: { seasonId: seasonId ?? undefined, type: "event" } },
      }),
    ]);

  return NextResponse.json({
    events,
    stats: { total, open: openCount, draft: draftCount, completed: completedCount, totalRegistrations },
  });
});

/**
 * POST /api/admin/events — tạo mới event/workshop.
 * body: { ..., action: "draft" | "publish" }
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireStaff();
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const seasonId = await getActiveSeasonId();
  if (!seasonId) return NextResponse.json({ error: "No active season" }, { status: 400 });

  const body = await req.json();
  const parsed = EventSchema.parse(body);
  const publish = body.action === "publish";

  const event = await prisma.trainingModule.create({
    data: {
      seasonId,
      title: parsed.title,
      description: parsed.description,
      audience: parsed.audience,
      type: "event",
      status: publish ? "open" : "draft",
      startAt: parsed.startAt ? new Date(parsed.startAt) : null,
      endAt: parsed.endAt ? new Date(parsed.endAt) : null,
      location: parsed.location,
      zoomLink: parsed.zoomLink,
      price: parsed.price,
      capacity: parsed.capacity,
      required: false,
      // tự sinh mã check-in/QR khi publish
      checkInCode: publish ? genCheckInCode() : null,
    },
  });

  return NextResponse.json({ event }, { status: 201 });
});
