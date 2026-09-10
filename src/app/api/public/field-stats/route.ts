import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandling } from "@/lib/api-helpers";
import { INDUSTRIES } from "@/lib/industries";

/**
 * GET /api/public/field-stats
 * API công khai (không cần auth) phục vụ landing page:
 * Trả về per lĩnh vực số mentor sẵn sàng kết nối + số mentee đang chờ.
 * Dùng cho ô "Khám phá các lĩnh vực".
 */
export const GET = withErrorHandling(async () => {
  // Mentor sẵn sàng = đã approved/in_pool, còn slot, program active
  const mentors = await prisma.mentorApplication.findMany({
    where: {
      status: { in: ["approved", "in_pool"] },
      programStatus: "active",
    },
    select: { industry: true, capacityMax: true, capacityUsed: true },
  });

  // Mentee đang chờ = approved/in_pool và còn chờ ghép
  const mentees = await prisma.menteeApplication.findMany({
    where: {
      status: { in: ["approved", "in_pool"] },
      availabilityStatus: { in: ["waiting", "seeking_rematch"] },
    },
    select: { profileJson: true },
  });

  // Đếm mentor theo industry (đã chuẩn hoá về key)
  const mentorByField: Record<string, number> = {};
  for (const m of mentors) {
    const key = m.industry ?? "other";
    const slot = Math.max(0, (m.capacityMax || 0) - (m.capacityUsed || 0));
    // Chỉ tính mentor thực sự còn slot trống
    if (slot <= 0) continue;
    mentorByField[key] = (mentorByField[key] || 0) + 1;
  }

  // Đếm mentee theo lĩnh vực quan tâm (profileJson.industry)
  const menteeByField: Record<string, number> = {};
  for (const m of mentees) {
    const key = (m.profileJson as any)?.industry ?? "other";
    if (!key) continue;
    menteeByField[key] = (menteeByField[key] || 0) + 1;
  }
  const totalMenteeWaiting = mentees.length;

  const fields = INDUSTRIES.map((f) => ({
    key: f.key,
    label: f.label,
    mentorsReady: mentorByField[f.key] ?? 0,
    menteesWaiting: menteeByField[f.key] ?? 0,
  }));

  return NextResponse.json({
    fields,
    totals: {
      mentorsReady: Object.values(mentorByField).reduce((a, b) => a + b, 0),
      menteesWaiting: totalMenteeWaiting,
    },
  });
});
