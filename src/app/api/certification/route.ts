import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { getActiveSeasonId } from "@/lib/domain";
import {
  getMentorCertificationStatus,
  issueCertificate,
} from "@/lib/certification";
import { withErrorHandling } from "@/lib/api-helpers";

/**
 * GET /api/certification
 * Trạng thái lộ trình mentoring (mentor) của user hiện tại:
 * từng module đào tạo, bài test, chứng nhận.
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const seasonId = await getActiveSeasonId();
  if (!seasonId) {
    return NextResponse.json({ error: "No active season" }, { status: 400 });
  }

  const status = await getMentorCertificationStatus(user.id, seasonId);
  const certificates = await prisma.certificate.findMany({
    where: { userId: user.id },
    orderBy: { issuedAt: "desc" },
    select: {
      id: true,
      certificateNo: true,
      role: true,
      issuedAt: true,
      orgName: true,
    },
  });

  return NextResponse.json({ ...status, certificates });
});

/**
 * POST /api/certification
 * Cấp giấy chứng nhận khi mentor đã đủ điều kiện (pass đủ module + test).
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const seasonId = await getActiveSeasonId();
  if (!seasonId) {
    return NextResponse.json({ error: "No active season" }, { status: 400 });
  }

  const status = await getMentorCertificationStatus(user.id, seasonId);
  if (!status.eligible) {
    return NextResponse.json(
      { error: "Chưa đủ điều kiện cấp chứng nhận", status },
      { status: 400 }
    );
  }

  const cert = await issueCertificate(user.id, seasonId, user.fullName, "mentor");
  return NextResponse.json({ certificate: cert });
});
