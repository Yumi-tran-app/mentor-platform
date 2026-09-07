import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { getActiveSeasonId } from "@/lib/domain";
import {
  getTrainingStatus,
  resolveApplicantAudience,
  issueCertificate,
} from "@/lib/certification";
import { withErrorHandling } from "@/lib/api-helpers";

/**
 * GET /api/certification
 * Trạng thái ĐÀO TẠO (mentor/mentee) + danh sách chứng nhận đào tạo của user.
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const seasonId = await getActiveSeasonId();
  if (!seasonId) {
    return NextResponse.json({ error: "No active season" }, { status: 400 });
  }

  const audience = await resolveApplicantAudience(user.id);
  const status = audience
    ? await getTrainingStatus(user.id, seasonId, audience)
    : { eligible: false, modules: [], modulesCompleted: 0, modulesTotal: 0, testPassed: false };

  const certificates = await prisma.certificate.findMany({
    where: { userId: user.id, type: "training" },
    orderBy: { issuedAt: "desc" },
    select: {
      id: true,
      certificateNo: true,
      role: true,
      issuedAt: true,
      orgName: true,
    },
  });

  return NextResponse.json({ audience, ...status, certificates, eligible: status.eligible });
});

/**
 * POST /api/certification
 * Cấp giấy chứng nhận ĐÀO TẠO khi user (mentor/mentee) đủ điều kiện (đủ module + test).
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

  const status = await getTrainingStatus(user.id, seasonId, audience);
  if (!status.eligible) {
    return NextResponse.json(
      { error: "Chưa đủ điều kiện cấp chứng nhận", status },
      { status: 400 }
    );
  }

  const cert = await issueCertificate(user.id, seasonId, user.fullName, audience, "training");
  return NextResponse.json({ certificate: cert });
});
