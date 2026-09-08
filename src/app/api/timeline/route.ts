import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

/**
 * GET /api/timeline?matchId=<uuid>
 * Dòng thời gian hợp nhất của 1 cặp đồng hành:
 * - Ghi chú buổi gặp (MentoringLog)
 * - Nhật ký hành trình (JourneyEntry)
 * - Phản tư tháng (MonthlyReflection)
 * - Milestone (thoả thuận, buổi gặp đầu, báo cáo cuối...)
 * Sắp xếp mới nhất -> cũ nhất.
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

  const [logs, entries, reflections] = await Promise.all([
    prisma.mentoringLog.findMany({
      where: {
        matchId,
        ...(isStaff
          ? {}
          : { OR: [{ visibility: "shared" }, { authorUserId: user.id }] }),
      },
      include: { author: { select: { fullName: true, role: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.journeyEntry.findMany({
      where: { matchId },
      include: { author: { select: { fullName: true, role: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.monthlyReflection.findMany({
      where: { matchId },
      include: { respondent: { select: { fullName: true, role: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Map 3 nguồn -> items thống nhất
  const items: TimelineItem[] = [];

  for (const l of logs) {
    items.push({
      id: `log-${l.id}`,
      kind: "log",
      visibility: l.visibility,
      content: l.content,
      authorFullName: l.author.fullName,
      createdAt: l.createdAt,
      mood: null,
      tags: null,
      monthNumber: null,
    });
  }

  for (const e of entries) {
    items.push({
      id: `journey-${e.id}`,
      kind: "journey",
      visibility: "shared",
      content: e.content,
      authorFullName: e.author.fullName,
      createdAt: e.createdAt,
      mood: null,
      tags: e.tags,
      monthNumber: null,
    });
  }

  for (const r of reflections) {
    items.push({
      id: `reflection-${r.id}`,
      kind: "reflection",
      visibility: "shared",
      content: r.note ?? "",
      authorFullName: r.respondent.fullName,
      createdAt: r.createdAt,
      mood: r.mood,
      tags: null,
      monthNumber: r.monthNumber,
    });
  }

  // Milestones: thoả thuận + buổi gặp đầu + kết thúc
  const milestones: { id: string; label: string; at: Date | null }[] = [];
  if (match.agreementConfirmedAt) {
    milestones.push({
      id: "milestone-agreement",
      label: "Hai bên đã xác nhận thoả thuận đồng hành",
      at: match.agreementConfirmedAt,
    });
  }
  if (match.firstConnectionAt) {
    milestones.push({
      id: "milestone-first-connection",
      label: "Đã hoàn thành buổi gặp đầu tiên",
      at: match.firstConnectionAt,
    });
  }
  if (match.endedAt) {
    milestones.push({
      id: "milestone-ended",
      label: "Hành trình đồng hành kết thúc",
      at: match.endedAt,
    });
  }

  for (const ms of milestones) {
    if (!ms.at) continue;
    items.push({
      id: ms.id,
      kind: "milestone",
      visibility: "shared",
      content: ms.label,
      authorFullName: "Hệ thống",
      createdAt: ms.at,
      mood: null,
      tags: null,
      monthNumber: null,
    });
  }

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ items });
});

type TimelineItem = {
  id: string;
  kind: "log" | "journey" | "reflection" | "milestone";
  visibility: string;
  content: string;
  authorFullName: string;
  createdAt: Date;
  mood: string | null;
  tags: any;
  monthNumber: number | null;
};

/**
 * POST /api/timeline
 * Tạo ghi chú mới vào timeline (log chung/riêng tư), có thể gắn tag phản tư/nhật ký.
 */
const PostSchema = z.object({
  matchId: z.string().uuid(),
  content: z.string().min(1),
  visibility: z.enum(["shared", "private", "coordinator_signal"]).default("shared"),
  tags: z.array(z.string()).default([]), // tag tuỳ chọn: "reflection" | "journey"
});

export const POST = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { matchId, content, visibility, tags } = PostSchema.parse(body);

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

  // Luôn ghi vào MentoringLog làm nguồn chính của timeline.
  const log = await prisma.mentoringLog.create({
    data: { matchId, authorUserId: user.id, visibility, content },
  });

  // Nếu có gắn tag "journey", đồng thời ghi 1 JourneyEntry (để đếm "nhật ký hành trình" bắt buộc).
  if (tags.includes("journey")) {
    await prisma.journeyEntry.create({
      data: {
        matchId,
        authorUserId: user.id,
        content,
        category: "met",
        tags: ["done"],
      },
    });
  }

  return NextResponse.json({ log }, { status: 201 });
});
