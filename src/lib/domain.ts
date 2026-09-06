import { prisma } from "./prisma";
import type {
  Match,
  MentorApplicationStatus,
  MenteeApplicationStatus,
} from "@prisma/client";

/**
 * Tầng domain service — mọi transition trạng thái đều đi qua đây,
 * KHÔNG update trực tiếp từ nhiều nơi, để đảm bảo side-effect luôn chạy đủ:
 * - requeue mentee khi match kết thúc
 * - giải phóng capacity của mentor
 * - ghi audit log
 */

// ---------- Audit helper ----------

export async function writeAudit(opts: {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId: opts.actorUserId ?? null,
      action: opts.action,
      entityType: opts.entityType,
      entityId: opts.entityId,
      before: opts.before === undefined ? undefined : (opts.before as any),
      after: opts.after === undefined ? undefined : (opts.after as any),
    },
  });
}

// ---------- Season open check ----------

export async function getActiveSeasonId(): Promise<string | null> {
  const season = await prisma.season.findFirst({
    where: { status: { in: ["open_registration", "active"] } },
    orderBy: { createdAt: "desc" },
  });
  return season?.id ?? null;
}

// ---------- Application state transitions ----------

const MENTOR_VALID_TRANSITIONS: Record<
  MentorApplicationStatus,
  MentorApplicationStatus[]
> = {
  draft: ["submitted"],
  submitted: ["interview_scheduled", "approved", "rejected"],
  interview_scheduled: ["interview_awaiting_review"],
  interview_awaiting_review: ["approved", "rejected"],
  approved: ["in_pool"],
  in_pool: [],
  rejected: [],
};

const MENTEE_VALID_TRANSITIONS: Record<
  MenteeApplicationStatus,
  MenteeApplicationStatus[]
> = {
  draft: ["submitted"],
  submitted: ["interview_scheduled", "approved", "rejected"],
  interview_scheduled: ["interview_awaiting_review"],
  interview_awaiting_review: ["approved", "rejected"],
  approved: ["in_pool"],
  in_pool: [],
  rejected: [],
};

export async function transitionMentorApplication(
  id: string,
  to: MentorApplicationStatus,
  actorUserId?: string
) {
  const app = await prisma.mentorApplication.findUnique({ where: { id } });
  if (!app) throw new Error("Mentor application not found");
  if (!MENTOR_VALID_TRANSITIONS[app.status].includes(to)) {
    throw new Error(
      `Invalid transition: ${app.status} -> ${to} (mentor application)`
    );
  }
  const updated = await prisma.mentorApplication.update({
    where: { id },
    data: {
      status: to,
      ...(to === "submitted" ? { submittedAt: new Date() } : {}),
    },
  });
  await writeAudit({
    actorUserId,
    action: "mentor_application.transition",
    entityType: "MentorApplication",
    entityId: id,
    before: { status: app.status },
    after: { status: to },
  });
  return updated;
}

export async function transitionMenteeApplication(
  id: string,
  to: MenteeApplicationStatus,
  actorUserId?: string
) {
  const app = await prisma.menteeApplication.findUnique({ where: { id } });
  if (!app) throw new Error("Mentee application not found");
  if (!MENTEE_VALID_TRANSITIONS[app.status].includes(to)) {
    throw new Error(
      `Invalid transition: ${app.status} -> ${to} (mentee application)`
    );
  }
  const updated = await prisma.menteeApplication.update({
    where: { id },
    data: {
      status: to,
      ...(to === "submitted" ? { submittedAt: new Date() } : {}),
    },
  });
  await writeAudit({
    actorUserId,
    action: "mentee_application.transition",
    entityType: "MenteeApplication",
    entityId: id,
    before: { status: app.status },
    after: { status: to },
  });
  return updated;
}

// ---------- Match state transitions (kèm side-effect) ----------

const MATCH_VALID_TRANSITIONS: Record<Match["status"], Match["status"][]> = {
  recommended: ["pending_coordinator_review"],
  pending_coordinator_review: ["proposed_to_parties"],
  proposed_to_parties: ["mentor_accepted"],
  mentor_accepted: ["mutual_accepted"],
  mutual_accepted: ["first_connection_done"],
  first_connection_done: ["active"],
  active: ["paused", "ended"],
  paused: ["active", "ended"],
  ended: [],
};

const END_REASONS_REQUIRE_REQUEUE = [
  "mentor_removed",
  "pause_unresolved",
  "mentor_withdrew",
  "mentee_withdrew",
] as const;

export async function transitionMatch(
  id: string,
  to: Match["status"],
  opts: {
    actorUserId?: string;
    endReason?: Match["endReason"];
    endNotes?: string;
    endedByCoordinatorId?: string;
  } = {}
) {
  const match = await prisma.match.findUnique({
    where: { id },
    include: { mentorApplication: true, menteeApplication: true },
  });
  if (!match) throw new Error("Match not found");
  if (!MATCH_VALID_TRANSITIONS[match.status].includes(to)) {
    throw new Error(`Invalid transition: ${match.status} -> ${to} (match)`);
  }

  // Xử lý side-effect khi kết thúc
  if (to === "ended") {
    await endMatchSideEffects(match.id, {
      mentorApplicationId: match.mentorApplicationId,
      menteeApplicationId: match.menteeApplicationId,
      seasonId: match.seasonId,
      endReason: opts.endReason ?? "other",
    });
  }

  const updated = await prisma.match.update({
    where: { id },
    data: {
      status: to,
      ...(to === "first_connection_done"
        ? { firstConnectionAt: new Date() }
        : {}),
      ...(to === "active" ? { agreementConfirmedAt: new Date() } : {}),
      ...(to === "ended"
        ? {
            endedAt: new Date(),
            endReason: opts.endReason,
            endNotes: opts.endNotes,
            endedByCoordinatorId: opts.endedByCoordinatorId,
          }
        : {}),
    },
  });

  await writeAudit({
    actorUserId: opts.actorUserId,
    action: "match.transition",
    entityType: "Match",
    entityId: id,
    before: { status: match.status },
    after: { status: to },
  });

  return updated;
}

async function endMatchSideEffects(
  matchId: string,
  info: {
    mentorApplicationId: string;
    menteeApplicationId: string;
    seasonId: string;
    endReason: Match["endReason"];
  }
) {
  // 1. Giải phóng capacity của mentor
  await prisma.mentorApplication.update({
    where: { id: info.mentorApplicationId },
    data: { capacityUsed: { decrement: 1 } },
  });

  // 2. Requeue mentee nếu lý do không phải hoàn thành 9 tháng
  if (END_REASONS_REQUIRE_REQUEUE.includes(info.endReason as any)) {
    const mentee = await prisma.menteeApplication.findUnique({
      where: { id: info.menteeApplicationId },
    });
    if (mentee && mentee.availabilityStatus !== "completed") {
      await prisma.menteeApplication.update({
        where: { id: info.menteeApplicationId },
        data: { availabilityStatus: "seeking_rematch" },
      });
    }
  }

  await writeAudit({
    action: "match.end_side_effects",
    entityType: "Match",
    entityId: matchId,
    after: { endReason: info.endReason },
  });
}

// ---------- Ghép cặp helper ----------

export async function getAvailableMentors(seasonId: string) {
  return prisma.mentorApplication.findMany({
    where: {
      seasonId,
      status: { in: ["approved", "in_pool"] },
      programStatus: "active",
      capacityUsed: { lt: prisma.mentorApplication.fields.capacityMax },
    },
    include: {
      user: { select: { fullName: true } },
    },
  });
}

export function computeFitScore(
  mentor: {
    industry: string | null;
    professionalJson: any;
    identityJson: any;
    readinessJson: any;
  },
  mentee: {
    needs: string[];
    profileJson: any;
  }
): number {
  // Engine chấm điểm nhiều chiều, thang 0..100.
  // Trọng số ưu tiên: khớp ngành > kinh nghiệm > cùng thành phố > kinh nghiệm mentoring.
  const needs = mentee.needs ?? [];
  const prof = mentor.professionalJson ?? {};
  const identity = mentor.identityJson ?? {};
  const readiness = mentor.readinessJson ?? {};
  const mProf = mentee.profileJson ?? {};

  let score = 0;

  // 1) Khớp ngành (tối đa 55 điểm)
  const mentorIndustry = (mentor.industry ?? prof.industry ?? "").toLowerCase();
  const INDUSTRY_TO_NEEDS: Record<string, string[]> = {
    learning: ["learning"],
    career: ["career", "personal_dev"],
    personal_dev: ["personal_dev", "learning"],
    life_transition: ["life_transition", "career"],
  };
  if (mentorIndustry && needs.length > 0) {
    // Nhu cầu nào "hợp" với ngành mentor (map thô) — nếu mentor ghi rõ ngành
    // khớp với need category thì tính điểm; về bản chất đây là heuristic.
    const needSet = new Set(needs.map((n) => n.toLowerCase()));
    const relevant = needs.filter((n) => {
      const aliases = INDUSTRY_TO_NEEDS[n] ?? [];
      return aliases.includes(n) || mentorIndustry.includes(n);
    });
    if (relevant.length > 0) {
      score += 55;
    } else if (needSet.has("career") && mentorIndustry) {
      // Mentor có ngành rõ ràng + mentee cần phát triển sự nghiệp
      score += 40;
    }
  }

  // 2) Kinh nghiệm (tối đa 25 điểm)
  const yearsExp = Number(prof.yearsExperience) || 0;
  const yearsMgmt = Number(prof.yearsManagement) || 0;
  score += Math.min(20, yearsExp * 1.5); // mỗi năm ~1.5đ, chặn 20
  score += Math.min(5, yearsMgmt); // quản lý tối đa 5đ

  // 3) Cùng thành phố (tối đa 10 điểm)
  const mentorCity = (identity.city ?? "").trim().toLowerCase();
  const menteeCity = (mProf.city ?? "").trim().toLowerCase();
  if (mentorCity && menteeCity && mentorCity === menteeCity) {
    score += 10;
  }

  // 4) Kinh nghiệm mentoring (tối đa 10 điểm)
  if (readiness.hasMentoredBefore === true) score += 6;
  if (readiness.hasMentoredStartup === true) score += 4;

  // Chuẩn hóa 0..100 rồi giữ 2 chữ số thập phân
  const clamped = Math.max(0, Math.min(100, score));
  return Math.round(clamped * 100) / 100;
}

// ---------- Notification helper ----------

export async function notifyUser(opts: {
  userId: string;
  type: string;
  payload?: unknown;
}) {
  await prisma.notification.create({
    data: {
      userId: opts.userId,
      type: opts.type,
      payload: opts.payload === undefined ? undefined : (opts.payload as any),
    },
  });
}

// ---------- Utility ----------

export function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay(); // 0 = CN, 6 = T7
    if (day !== 0 && day !== 6) added++;
  }
  return d;
}

export async function getSlaDays(seasonId: string): Promise<number> {
  const c = await prisma.seasonCriteria.findUnique({
    where: {
      seasonId_key: {
        seasonId,
        key: "match_review_sla_business_days",
      },
    },
  });
  return c ? parseInt(c.value, 10) : 7;
}

export type { Match };
