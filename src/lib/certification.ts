import { prisma } from "./prisma";

/**
 * Kiểm tra mentor đã đủ điều kiện nhận mentee chưa:
 * 1. Đã hoàn thành TẤT CẢ module đào tạo bắt buộc (audience mentor/all).
 * 2. Đã pass bài kiểm tra (TrainingTestAttempt có status = passed).
 * Trả về chi tiết để UI lộ trình mentoring hiển thị từng bước.
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
  // 1. Module bắt buộc
  const modules = await prisma.trainingModule.findMany({
    where: { seasonId, audience: { in: ["all", "mentor"] }, required: true },
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
  const allModulesDone =
    modulesTotal === 0 || modulesCompleted === modulesTotal;

  // 2. Test
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
  const testPassed =
    !!test && test.attempts.length > 0 && test.attempts[0].status === "passed";

  // 3. Chứng nhận
  const certificate = await prisma.certificate.findFirst({
    where: { userId, seasonId },
  });

  return {
    eligible: allModulesDone && testPassed,
    modules: modulesMapped,
    modulesCompleted,
    modulesTotal,
    testPassed,
    certified: !!certificate,
    certificateId: certificate?.id ?? null,
  };
}

/**
 * Cấp (hoặc trả về) giấy chứng nhận cho user khi đủ điều kiện.
 * certificateNo tạo duy nhất dạng CN-<seasonHash>-<seq>.
 */
export async function issueCertificate(
  userId: string,
  seasonId: string,
  recipientName: string,
  role: "mentor" | "mentee" = "mentor"
) {
  const existing = await prisma.certificate.findFirst({
    where: { userId, seasonId },
  });
  if (existing) return existing;

  const count = await prisma.certificate.count();
  const certificateNo = `CN-${new Date().getFullYear()}-${String(
    count + 1
  ).padStart(4, "0")}`;

  return prisma.certificate.create({
    data: {
      userId,
      seasonId,
      recipientName,
      role,
      certificateNo,
    },
  });
}
