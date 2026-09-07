import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { getActiveSeasonId } from "@/lib/domain";
import { issueCertificate } from "@/lib/certification";
import { withErrorHandling } from "@/lib/api-helpers";

const ReportSchema = z.object({
  matchId: z.string().uuid(),
  sessionCount: z.number().int().min(0),
  journeyHighlights: z.string().optional(),
  valueReceived: z.string().optional(),
  messageToPartner: z.string().optional(),
  messageToOrg: z.string().optional(),
  satisfaction: z.number().int().min(1).max(5).default(5),
  wantRejoin: z.boolean().default(false),
  suggestions: z.string().optional(),
});

/**
 * GET /api/reports/final?matchId=...
 * Trạng thái báo cáo cuối khóa của match + vai trò user.
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const matchId = url.searchParams.get("matchId");
  if (!matchId) return NextResponse.json({ error: "matchId required" }, { status: 400 });

  const report = await prisma.endOfProgramReport.findFirst({
    where: { matchId, authorUserId: user.id },
  });

  return NextResponse.json({ report: report ?? null });
});

/**
 * POST /api/reports/final
 * Nộp báo cáo cuối khóa (mentor hoặc mentee).
 * Khi CẢ mentor + mentee đều nộp và match đã ended -> tự cấp chứng nhận mentoring cho cả 2.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = ReportSchema.parse(body);

  const match = await prisma.match.findUnique({
    where: { id: parsed.matchId },
    include: { mentorApplication: true, menteeApplication: true },
  });
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  // Xác định vai trò người nộp
  const isMentor = match.mentorApplication.userId === user.id;
  const isMentee = match.menteeApplication.userId === user.id;
  if (!isMentor && !isMentee) {
    return NextResponse.json({ error: "Bạn không thuộc match này" }, { status: 403 });
  }
  const authorRole = isMentor ? "mentor" : "mentee";

  const report = await prisma.endOfProgramReport.upsert({
    where: { matchId_authorUserId: { matchId: parsed.matchId, authorUserId: user.id } },
    create: {
      matchId: parsed.matchId,
      authorUserId: user.id,
      authorRole,
      sessionCount: parsed.sessionCount,
      journeyHighlights: parsed.journeyHighlights,
      valueReceived: parsed.valueReceived,
      messageToPartner: parsed.messageToPartner,
      messageToOrg: parsed.messageToOrg,
      satisfaction: parsed.satisfaction,
      wantRejoin: parsed.wantRejoin,
      suggestions: parsed.suggestions,
      submittedAt: new Date(),
    },
    update: {
      sessionCount: parsed.sessionCount,
      journeyHighlights: parsed.journeyHighlights,
      valueReceived: parsed.valueReceived,
      messageToPartner: parsed.messageToPartner,
      messageToOrg: parsed.messageToOrg,
      satisfaction: parsed.satisfaction,
      wantRejoin: parsed.wantRejoin,
      suggestions: parsed.suggestions,
      submittedAt: new Date(),
    },
  });

  // Kiểm tra điều kiện cấp chứng nhận: match ended + cả 2 đã nộp report
  let certificatesIssued: any[] = [];
  if (match.status === "ended") {
    const reports = await prisma.endOfProgramReport.findMany({
      where: { matchId: parsed.matchId },
    });
    const bothSubmitted = reports.length >= 2;
    if (bothSubmitted) {
      const seasonId = match.seasonId;
      const certMentor = await issueCertificate(
        match.mentorApplication.userId,
        seasonId,
        (await prisma.user.findUnique({ where: { id: match.mentorApplication.userId } }))?.fullName ?? "Mentor",
        "mentor",
        "mentoring"
      );
      const certMentee = await issueCertificate(
        match.menteeApplication.userId,
        seasonId,
        (await prisma.user.findUnique({ where: { id: match.menteeApplication.userId } }))?.fullName ?? "Mentee",
        "mentee",
        "mentoring"
      );
      certificatesIssued = [certMentor, certMentee];
    }
  }

  return NextResponse.json({ report, certificatesIssued });
});
