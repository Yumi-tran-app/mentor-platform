import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";
import { getMatchCoordinator, isMatchCoordinator } from "@/lib/domain";

const SendSchema = z.object({
  matchId: z.string().uuid(),
  content: z.string().min(1),
  kind: z.enum(["match", "coordinator"]).default("match"),
});

/**
 * Kiểm tra quyền đọc 1 thread tin nhắn (kind = match hay coordinator).
 * - kind "match": mentor + mentee của cặp + admin/đpv
 * - kind "coordinator": mentor + mentee + ĐPV phụ trách cặp + admin
 */
async function canAccessThread(
  match: any,
  userId: string,
  role: string,
  kind: "match" | "coordinator"
): Promise<boolean> {
  const isParticipant =
    match.mentorApplication.userId === userId ||
    match.menteeApplication.userId === userId;

  if (kind === "match") {
    return isParticipant || role === "admin" || role === "dpv";
  }

  // kind === "coordinator"
  if (isParticipant || role === "admin") return true;
  if (role === "dpv") return isMatchCoordinator(match.id, userId);
  return false;
}

/**
 * GET /api/messages?matchId=<uuid>&kind=match|coordinator
 * Danh sách tin nhắn của 1 cặp (mới nhất cuối), lọc theo loại thread.
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const matchId = url.searchParams.get("matchId");
  const kind = (url.searchParams.get("kind") ?? "match") as "match" | "coordinator";
  if (!matchId) return NextResponse.json({ error: "matchId required" }, { status: 400 });

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { mentorApplication: true, menteeApplication: true },
  });
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ok = await canAccessThread(match, user.id, user.role, kind);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const messages = await prisma.message.findMany({
    where: { matchId, kind },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { fullName: true, role: true, avatarUrl: true } } },
  });

  return NextResponse.json({ messages });
});

/**
 * POST /api/messages
 * Gửi tin nhắn trong 1 cặp (kind = match | coordinator).
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { matchId, content, kind } = SendSchema.parse(body);

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { mentorApplication: true, menteeApplication: true },
  });
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ok = await canAccessThread(match, user.id, user.role, kind);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const message = await prisma.message.create({
    data: { matchId, senderUserId: user.id, content, kind },
  });

  return NextResponse.json({ message }, { status: 201 });
});
