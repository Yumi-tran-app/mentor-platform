import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

const CATEGORIES = ["met", "explored", "realized", "changed", "tried", "next"] as const;

const CreateSchema = z.object({
  matchId: z.string().uuid(),
  category: z.enum(CATEGORIES),
  content: z.string().min(1),
});

/**
 * GET /api/journey?matchId=<uuid>
 * Nhật ký hành trình của 1 cặp (gộp theo category).
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const matchId = url.searchParams.get("matchId");
  if (!matchId) return NextResponse.json({ error: "matchId required" }, { status: 400 });

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { mentorApplication: true, menteeApplication: true },
  });
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isParticipant =
    match.mentorApplication.userId === user.id ||
    match.menteeApplication.userId === user.id;
  if (!isParticipant && user.role !== "admin" && user.role !== "dpv") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const entries = await prisma.journeyEntry.findMany({
    where: { matchId },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { fullName: true } } },
  });

  return NextResponse.json({ entries });
});

/**
 * POST /api/journey
 * Thêm 1 mục vào nhật ký hành trình.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { matchId, category, content } = CreateSchema.parse(body);

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { mentorApplication: true, menteeApplication: true },
  });
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isParticipant =
    match.mentorApplication.userId === user.id ||
    match.menteeApplication.userId === user.id;
  if (!isParticipant && user.role !== "admin" && user.role !== "dpv") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const entry = await prisma.journeyEntry.create({
    data: { matchId, category, content, authorUserId: user.id },
  });

  return NextResponse.json({ entry }, { status: 201 });
});
