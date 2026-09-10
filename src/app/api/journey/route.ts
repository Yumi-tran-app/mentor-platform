import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { getActiveSeasonId } from "@/lib/domain";
import {
  getJourneyV2,
  resolveApplicantAudience,
  issueCertificate,
  getMentoringJourney,
} from "@/lib/certification";
import { withErrorHandling } from "@/lib/api-helpers";

/**
 * GET /api/journey?seasonId=...
 * Lộ trình mentoring V2 — tách Mùa vs từng Mentee + timeline + lọc lịch sử.
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const audience = await resolveApplicantAudience(user.id);
  if (!audience) {
    return NextResponse.json({ error: "Bạn chưa đăng ký mentor/mentee" }, { status: 400 });
  }

  const url = new URL(req.url);
  let seasonId = url.searchParams.get("seasonId");
  if (!seasonId) {
    seasonId = await getActiveSeasonId();
  }
  if (!seasonId) {
    return NextResponse.json({ error: "No season" }, { status: 400 });
  }

  const journey = await getJourneyV2(user.id, seasonId, audience);
  if (!journey) {
    return NextResponse.json({ error: "Season not found" }, { status: 404 });
  }

  return NextResponse.json(journey);
});

/**
 * POST /api/journey
 * Cấp giấy chứng nhận MENTORING khi user đã "Hoàn thành mentoring" (match ended) + cả 2 nộp báo cáo.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const seasonId = await getActiveSeasonId();
  if (!seasonId) {
    return NextResponse.json({ error: "No active season" }, { status: 400 });
  }

  const audience = await resolveApplicantAudience(user.id);
  if (!audience) {
    return NextResponse.json({ error: "Bạn chưa đăng ký mentor/mentee" }, { status: 400 });
  }

  const journey = await getMentoringJourney(user.id, seasonId, audience);
  if (!(journey.completedMatch && journey.bothReportsSubmitted)) {
    return NextResponse.json(
      {
        error:
          "Chưa đủ điều kiện: cần hoàn thành mentoring VÀ cả mentor + mentee đều nộp báo cáo cuối khóa.",
      },
      { status: 400 }
    );
  }

  if (!journey.journeyRequirementMet) {
    return NextResponse.json(
      {
        error:
          "Chưa đủ điều kiện: bạn cần hoàn thành đủ số buổi đồng hành (ghi nhật ký hành trình) để được cấp chứng nhận.",
      },
      { status: 400 }
    );
  }

  const cert = await issueCertificate(user.id, seasonId, user.fullName, audience, "mentoring");
  return NextResponse.json({ certificate: cert });
});
