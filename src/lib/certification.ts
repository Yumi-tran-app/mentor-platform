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
    select: { status: true },
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

  const steps = [
    { key: "registered", label: "Đăng ký", done: true, active: false },
    { key: "training", label: "Tham gia đào tạo", done: trainingStatus.eligible, active: false },
    { key: "mentoring", label: "Tham gia mentoring", done: activeMatch || completedMatch, active: false },
    { key: "completed", label: "Hoàn thành mentoring", done: completedMatch, active: false },
    { key: "certified", label: "Cấp giấy chứng nhận", done: !!mentoringCert, active: false },
  ];

  // Đánh dấu bước đang active (bước đầu tiên chưa done)
  const firstUndoneIdx = steps.findIndex((s) => !s.done);
  if (firstUndoneIdx >= 0) steps[firstUndoneIdx].active = true;

  return {
    audience,
    steps,
    trainingStatus,
    hasMatch,
    activeMatch,
    completedMatch,
    mentoringCert,
  };
}
