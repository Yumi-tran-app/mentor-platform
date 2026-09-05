import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

const SendSchema = z.object({
  matchId: z.string().uuid(),
  content: z.string().min(1),
});

/**
 * GET /api/messages?matchId=<uuid>
 * Danh sách tin nhắn của 1 cặp (mới nhất cuối).
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

  const messages = await prisma.message.findMany({
    where: { matchId },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { fullName: true, role: true } } },
  });

  return NextResponse.json({ messages });
});

/**
 * POST /api/messages
 * Gửi tin nhắn trong 1 cặp.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { matchId, content } = SendSchema.parse(body);

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

  const message = await prisma.message.create({
    data: { matchId, senderUserId: user.id, content },
  });

  return NextResponse.json({ message }, { status: 201 });
});
