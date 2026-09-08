import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { resolveCategoryFromTags } from "@/lib/journey-tags";
import { withErrorHandling } from "@/lib/api-helpers";

const EntrySchema = z.object({
  matchId: z.string().uuid(),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
});

/**
 * GET /api/journey-entries?matchId=<uuid>
 * Danh sách nhật ký hành trình của 1 cặp.
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const matchId = url.searchParams.get("matchId");
  if (!matchId) {
    return NextResponse.json({ error: "matchId required" }, { status: 400 });
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { mentorApplication: true, menteeApplication: true },
  });
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isParticipant =
    match.mentorApplication.userId === user.id ||
    match.menteeApplication.userId === user.id;
  const isStaff = user.role === "admin" || user.role === "dpv";
  if (!isParticipant && !isStaff) {
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
 * POST /api/journey-entries
 * Thêm nhật ký hành trình: nội dung tự do + 1 hoặc nhiều tag (3 giai đoạn).
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { matchId, content, tags } = EntrySchema.parse(body);

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

  // Lọc tag trùng, cho phép tag tuỳ chỉnh
  const cleanTags = [...new Set(tags.map((t) => t.trim()).filter(Boolean))];

  const category = resolveCategoryFromTags(cleanTags);

  const entry = await prisma.journeyEntry.create({
    data: {
      matchId,
      authorUserId: user.id,
      content,
      category: category as any,
      tags: cleanTags,
    },
  });

  return NextResponse.json({ entry }, { status: 201 });
});
