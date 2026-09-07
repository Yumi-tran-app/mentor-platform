import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { getActiveSeasonId } from "@/lib/domain";
import {
  getMentoringJourney,
  resolveApplicantAudience,
  issueCertificate,
} from "@/lib/certification";
import { withErrorHandling } from "@/lib/api-helpers";

/**
 * GET /api/journey
 * Lộ trình MENTORING của user hiện tại (mentor hoặc mentee).
 * Flow: Đăng ký → Tham gia đào tạo → Tham gia mentoring → Hoàn thành mentoring → Cấp chứng nhận.
 */
export const GET = withErrorHandling(async (req: Request) => {
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

  // Kèm danh sách chứng nhận mentoring để hiển thị bảng
  const certs = await prisma.certificate.findMany({
    where: { userId: user.id, type: "mentoring" },
    orderBy: { issuedAt: "desc" },
    select: {
      id: true,
      certificateNo: true,
      role: true,
      issuedAt: true,
      orgName: true,
    },
  });

  return NextResponse.json({ ...journey, certificates: certs });
});

/**
 * POST /api/journey
 * Cấp giấy chứng nhận MENTORING khi user đã "Hoàn thành mentoring" (match ended).
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
  if (!journey.completedMatch) {
    return NextResponse.json(
      { error: "Chưa hoàn thành mentoring, chưa thể cấp chứng nhận", journey },
      { status: 400 }
    );
  }

  const cert = await issueCertificate(user.id, seasonId, user.fullName, audience, "mentoring");
  return NextResponse.json({ certificate: cert });
});
