import { prisma } from "./prisma";

/**
 * Kiểm tra 1 user đã hoàn thành đào tạo bắt buộc chưa (theo audience của họ).
 * - mentor: hoàn thành TẤT CẢ module bắt buộc + pass bài test.
 * - mentee: hoàn thành TẤT CẢ module bắt buộc (không có test).
 */
export async function getTrainingStatus(
  userId: string,
  seasonId: string,
  audience: "mentor" | "mentee"
): Promise<{
  eligible: boolean;
  modules: { id: string; title: string; required: boolean; done: boolean }[];
  modulesCompleted: number;
  modulesTotal: number;
  testPassed: boolean;
}> {
  const modules = await prisma.trainingModule.findMany({
    where: {
      seasonId,
      audience: { in: ["all", audience] },
      required: true,
      type: "online_module",
    },
    orderBy: { sortOrder: "asc" },
  });

  const progress = await prisma.trainingProgress.findMany({
    where: { userId, module: { seasonId } },
    select: { moduleId: true },
  });
  const doneIds = new Set(progress.map((p) => p.moduleId));

  const modulesMapped = modules.map((m) => ({
    id: m.id,
    title: m.title,
    required: m.required,
    done: doneIds.has(m.id),
  }));
  const modulesCompleted = modulesMapped.filter((m) => m.done).length;
  const modulesTotal = modules.length;
  const allModulesDone = modulesTotal === 0 || modulesCompleted === modulesTotal;

  // Test chỉ áp dụng cho mentor
  let testPassed = true;
  if (audience === "mentor") {
    const test = await prisma.trainingTest.findFirst({
      where: { seasonId, audience: "mentor", status: "published" },
      include: {
        attempts: {
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
    testPassed =
      !!test && test.attempts.length > 0 && test.attempts[0].status === "passed";
  }

  return {
    eligible: allModulesDone && testPassed,
    modules: modulesMapped,
    modulesCompleted,
    modulesTotal,
    testPassed,
  };
}

/**
 * (giữ tương thích) Kiểm tra mentor đủ điều kiện nhận mentee: đủ đào tạo + test.
 */
export async function getMentorCertificationStatus(
  userId: string,
  seasonId: string
): Promise<{
  eligible: boolean;
  modules: { id: string; title: string; required: boolean; done: boolean }[];
  modulesCompleted: number;
  modulesTotal: number;
  testPassed: boolean;
  certified: boolean;
  certificateId: string | null;
}> {
  const status = await getTrainingStatus(userId, seasonId, "mentor");
  const trainingCert = await prisma.certificate.findFirst({
    where: { userId, seasonId, type: "training" },
  });
  return {
    ...status,
    certified: !!trainingCert,
    certificateId: trainingCert?.id ?? null,
  };
}

/**
 * Cấp (hoặc trả về) giấy chứng nhận cho user.
 * type: "training" | "mentoring".
 */
export async function issueCertificate(
  userId: string,
  seasonId: string,
  recipientName: string,
  role: "mentor" | "mentee" = "mentor",
  type: "training" | "mentoring" = "training"
) {
  const existing = await prisma.certificate.findFirst({
    where: { userId, seasonId, type },
  });
  if (existing) return existing;

  const count = await prisma.certificate.count();
  const prefix = type === "mentoring" ? "MCN" : "TCN";
  const certificateNo = `${prefix}-${new Date().getFullYear()}-${String(
    count + 1
  ).padStart(4, "0")}`;

  return prisma.certificate.create({
    data: {
      userId,
      seasonId,
      type,
      recipientName,
      role,
      certificateNo,
    },
  });
}

/**
 * Xác định vai trò đăng ký của user (mentor/mentee) theo Application.
 */
export async function resolveApplicantAudience(
  userId: string
): Promise<"mentor" | "mentee" | null> {
  const mentorApp = await prisma.mentorApplication.findFirst({
    where: { userId },
    select: { id: true },
  });
  if (mentorApp) return "mentor";
  const menteeApp = await prisma.menteeApplication.findFirst({
    where: { userId },
    select: { id: true },
  });
  if (menteeApp) return "mentee";
  return null;
}

/**
 * Lộ trình MENTORING (quá trình đồng hành) — cho cả mentor & mentee.
 * Flow: Đăng ký → Tham gia đào tạo → Tham gia mentoring → Hoàn thành mentoring → Cấp chứng nhận.
 */
export async function getMentoringJourney(
  userId: string,
  seasonId: string,
  audience: "mentor" | "mentee"
): Promise<{
  audience: "mentor" | "mentee";
  steps: {
    key: string;
    label: string;
    done: boolean;
    active: boolean;
  }[];
  trainingStatus: Awaited<ReturnType<typeof getTrainingStatus>>;
  hasMatch: boolean;
  activeMatch: boolean;
  completedMatch: boolean;
  bothReportsSubmitted: boolean;
  mentoringCert: { id: string; certificateNo: string } | null;
}> {
  const trainingStatus = await getTrainingStatus(userId, seasonId, audience);

  // Trạng thái match
  const appField = audience === "mentor" ? "mentorApplicationId" : "menteeApplicationId";
  const appWhere =
    audience === "mentor"
      ? { mentorApplication: { userId } }
      : { menteeApplication: { userId } };
  const matches = await prisma.match.findMany({
    where: { seasonId, ...appWhere },
    select: { id: true, status: true },
  });
  const hasMatch = matches.length > 0;
  const activeMatch = matches.some((m) =>
    ["recommended", "pending_coordinator_review", "proposed_to_parties", "mentor_accepted", "mutual_accepted", "first_connection_done", "active", "paused"].includes(m.status)
  );
  const completedMatch = matches.some(
    (m) => m.status === "ended"
  );

  const mentoringCert = await prisma.certificate.findFirst({
    where: { userId, seasonId, type: "mentoring" },
    select: { id: true, certificateNo: true },
  });

  // Match đã ended + cả 2 nộp report => đủ điều kiện cấp chứng nhận
  let bothReportsSubmitted = false;
  if (completedMatch) {
    const endedMatchIds = matches.filter((m) => m.status === "ended").map((m) => m.id);
    for (const mid of endedMatchIds) {
      const reportCount = await prisma.endOfProgramReport.count({ where: { matchId: mid } });
      if (reportCount >= 2) {
        bothReportsSubmitted = true;
        break;
      }
    }
  }

  const steps = [
    { key: "registered", label: "Đăng ký", done: true, active: false },
    { key: "training", label: "Tham gia đào tạo", done: trainingStatus.eligible, active: false },
    { key: "mentoring", label: "Tham gia mentoring", done: activeMatch || completedMatch, active: false },
    { key: "completed", label: "Hoàn thành mentoring", done: completedMatch, active: false },
    { key: "certified", label: "Cấp giấy chứng nhận", done: !!mentoringCert, active: false },
  ];

  const firstUndoneIdx = steps.findIndex((s) => !s.done);
  if (firstUndoneIdx >= 0) steps[firstUndoneIdx].active = true;

  return {
    audience,
    steps,
    trainingStatus,
    hasMatch,
    activeMatch,
    completedMatch,
    bothReportsSubmitted,
    mentoringCert,
  };
}

/**
 * Lộ trình mentoring V2 — tách Mùa (Cohort) vs từng Mentee + timeline.
 * Dùng cho trang /journey tái cấu trúc IA.
 */
export async function getJourneyV2(
  userId: string,
  seasonId: string,
  audience: "mentor" | "mentee"
) {
  // 1. Danh sách tất cả mùa (để dropdown lọc lịch sử)
  const seasons = await prisma.season.findMany({
    orderBy: { startDate: "desc" },
    select: {
      id: true,
      name: true,
      cohort: true,
      status: true,
      startDate: true,
      endDate: true,
      registrationDeadline: true,
    },
  });

  // 2. Mùa đang xem
  const season = await prisma.season.findUnique({
    where: { id: seasonId },
    select: {
      id: true,
      name: true,
      cohort: true,
      status: true,
      startDate: true,
      endDate: true,
      registrationDeadline: true,
    },
  });
  if (!season) return null;

  // 3. Các match của user trong mùa này (dùng cho milestone + per-mentee)
  const matches = await prisma.match.findMany({
    where: {
      seasonId,
      ...(audience === "mentor"
        ? { mentorApplication: { userId } }
        : { menteeApplication: { userId } }),
    },
    include: {
      mentorApplication: { include: { user: { select: { fullName: true } } } },
      menteeApplication: { include: { user: { select: { fullName: true, id: true } } } },
    },
  });

  // Chứng nhận mentoring + training (theo mùa này)
  const mentoringCert = await prisma.certificate.findFirst({
    where: { userId, seasonId, type: "mentoring" },
    select: { id: true, certificateNo: true, issuedAt: true },
  });
  const trainingStatus = await getTrainingStatus(userId, seasonId, audience);

  // 4. Milestone mùa (enrich trạng thái theo dữ liệu cá nhân)
  const milestonesRaw = await prisma.seasonMilestone.findMany({
    where: { seasonId },
    orderBy: { sortOrder: "asc" },
  });

  const myApplications = audience === "mentor"
    ? await prisma.mentorApplication.findMany({ where: { userId, seasonId }, select: { submittedAt: true } })
    : await prisma.menteeApplication.findMany({ where: { userId, seasonId }, select: { submittedAt: true } });
  const registeredAt = myApplications.find((a) => a.submittedAt)?.submittedAt ?? null;

  const milestones = milestonesRaw.map((ms) => {
    let doneAt: Date | null = ms.completedAt;
    let done = !!ms.completedAt;
    if (!done) {
      if (ms.key === "registration" && registeredAt) { done = true; doneAt = registeredAt; }
      else if (ms.key === "training" && trainingStatus.eligible) { done = true; doneAt = null; }
      else if (ms.key === "matching" && matches.length > 0) {
        const anyProposed = matches.some((m) =>
          ["proposed_to_parties", "mentor_accepted", "mutual_accepted", "first_connection_done", "active", "paused", "ended"].includes(m.status)
        );
        if (anyProposed) { done = true; doneAt = matches[0]?.createdAt ?? null; }
      }
      else if (ms.key === "wrapup" && mentoringCert) { done = true; doneAt = mentoringCert.issuedAt ?? null; }
    }
    return { ...ms, done, doneAt };
  });

  // 5. Per-mentee
  const mentees = await Promise.all(
    matches.map(async (m) => {
      const menteeUserId = m.menteeApplication.userId;
      // Số buổi = đếm nhật ký hành trình của mentee (mỗi buổi 1 entry)
      const sessionCount = await prisma.journeyEntry.count({
        where: { matchId: m.id, authorUserId: menteeUserId },
      });
      const scheduleCount = await prisma.meetingEvent.count({ where: { matchId: m.id } });
      const report = await prisma.endOfProgramReport.findFirst({
        where: { matchId: m.id, authorRole: "mentee" },
        select: { submittedAt: true },
      });

      const partnerName =
        audience === "mentor"
          ? m.menteeApplication.user.fullName
          : m.mentorApplication.user.fullName;

      return {
        matchId: m.id,
        partnerName,
        status: m.status,
        kickoffAt: m.firstConnectionAt,
        agreementAt: m.agreementConfirmedAt,
        sessionCount,
        scheduleCount,
        reportSubmittedAt: report?.submittedAt ?? null,
        completedAt: m.endedAt,
        targetSessions: 6,
      };
    })
  );

  return {
    audience,
    seasons,
    season,
    milestones,
    mentees,
    mentoringCert,
    trainingStatus,
  };
}
