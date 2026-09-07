import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";
import { getMentorCertificationStatus } from "@/lib/certification";

/**
 * GET /api/discover
 * Danh sách người sẵn sàng ghép cặp (tự do khám phá).
 * ?type=mentor -> danh sách mentor (cho mentee xem), kèm số slot trống.
 * ?type=mentee -> danh sách mentee (cho mentor xem).
 * Nếu không có type, tự đoán theo role/application của user.
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  let type = url.searchParams.get("type");

  if (!type) {
    const mentorApp = await prisma.mentorApplication.findFirst({ where: { userId: user.id } });
    type = mentorApp || user.role === "mentor" ? "mentee" : "mentor";
  }

  if (type === "mentee") {
    const mentees = await prisma.menteeApplication.findMany({
      where: {
        status: { in: ["approved", "in_pool"] },
        availabilityStatus: { in: ["waiting", "seeking_rematch"] },
      },
      orderBy: { submittedAt: "desc" },
      include: {
        user: { select: { fullName: true } },
        needs: true,
      },
    });
    return NextResponse.json({ type, mentees });
  }

  // === Danh sách mentor ===
  const mentors = await prisma.mentorApplication.findMany({
    where: {
      status: { in: ["approved", "in_pool"] },
      programStatus: "active",
    },
    orderBy: { submittedAt: "desc" },
    include: { user: { select: { fullName: true } } },
  });

  // Tính slot trống + pending requests + trạng thái đã pass đào tạo/test
  const seasonId = await prisma.season
    .findFirst({ where: { status: { in: ["open_registration", "active"] } }, select: { id: true } })
    .then((s) => s?.id ?? null);

  const enriched = await Promise.all(
    mentors.map(async (m) => {
      // Số mentee đang kết nối (match active, không ended)
      const activeCount = await prisma.match.count({
        where: { mentorApplicationId: m.id, status: { not: "ended" } },
      });
      // Số request đang chờ mentor duyệt (match proposed_to_parties mà mentor chưa respond)
      const pendingCount = await prisma.match.count({
        where: {
          mentorApplicationId: m.id,
          status: "proposed_to_parties",
          mentorRespondedAt: null,
        },
      });

      const capacityMax = m.capacityMax || 0;
      const connected = Math.max(m.capacityUsed ?? 0, activeCount);
      const slotsLeft = Math.max(0, capacityMax - connected);

      // Mentor chỉ được nhận mentee khi đã pass đào tạo online (module bắt buộc + test)
      let certified = false;
      if (seasonId) {
        try {
          const st = await getMentorCertificationStatus(m.userId, seasonId);
          certified = st.eligible;
        } catch {
          certified = false;
        }
      }

      return {
        ...m,
        capacityMax,
        connected, // đã kết nối (đang đồng hành)
        pendingCount, // đang chờ duyệt
        slotsLeft, // còn trống
        certified, // đã hoàn thành đào tạo + test
      };
    })
  );

  return NextResponse.json({ type, mentors: enriched });
});
