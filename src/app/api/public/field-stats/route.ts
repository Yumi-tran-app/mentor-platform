import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandling } from "@/lib/api-helpers";
import { INDUSTRY_GROUP_NAMES, industryGroupOf } from "@/lib/industries";

/**
 * GET /api/public/field-stats
 * API công khai (không cần auth) phục vụ landing page:
 * Trả về số mentor sẵn sàng + mentee đang chờ, gộp theo ngành mẹ (Tâm lý / Nhân sự / Khác).
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

  // Gộp theo ngành mẹ
  const mentorByGroup: Record<string, number> = {};
  for (const m of mentors) {
    const slot = Math.max(0, (m.capacityMax || 0) - (m.capacityUsed || 0));
    if (slot <= 0) continue;
    const group = industryGroupOf(m.industry);
    mentorByGroup[group] = (mentorByGroup[group] || 0) + 1;
  }

  const menteeByGroup: Record<string, number> = {};
  for (const m of mentees) {
    const key = (m.profileJson as any)?.industry;
    const group = industryGroupOf(key);
    menteeByGroup[group] = (menteeByGroup[group] || 0) + 1;
  }
  const totalMenteeWaiting = mentees.length;

  const groups = INDUSTRY_GROUP_NAMES.map((g) => ({
    key: g,
    label: g,
    mentorsReady: mentorByGroup[g] ?? 0,
    menteesWaiting: menteeByGroup[g] ?? 0,
  }));

  return NextResponse.json({
    groups,
    totals: {
      mentorsReady: Object.values(mentorByGroup).reduce((a, b) => a + b, 0),
      menteesWaiting: totalMenteeWaiting,
    },
  });
});
