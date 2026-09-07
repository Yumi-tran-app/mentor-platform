import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { getActiveSeasonId } from "@/lib/domain";
import { resolveApplicantAudience } from "@/lib/certification";
import {
  MENTOR_TEST_TITLE,
  MENTOR_PASS_SCORE,
  MENTOR_TEST_QUESTIONS,
} from "@/lib/training-test-content";
import {
  MENTEE_TEST_TITLE,
  MENTEE_PASS_SCORE,
  MENTEE_TEST_QUESTIONS,
} from "@/lib/training-test-mentee";
import { withErrorHandling } from "@/lib/api-helpers";

type Audience = "mentor" | "mentee";

const TEST_CONFIG: Record<
  Audience,
  { title: string; passScore: number; questions: typeof MENTOR_TEST_QUESTIONS }
> = {
  mentor: {
    title: MENTOR_TEST_TITLE,
    passScore: MENTOR_PASS_SCORE,
    questions: MENTOR_TEST_QUESTIONS,
  },
  mentee: {
    title: MENTEE_TEST_TITLE,
    passScore: MENTEE_PASS_SCORE,
    questions: MENTEE_TEST_QUESTIONS as any,
  },
};

/**
 * Lấy (hoặc tạo nếu chưa có) bộ test cho audience + season hiện tại.
 */
async function ensureTest(seasonId: string, audience: Audience) {
  const existing = await prisma.trainingTest.findFirst({
    where: { seasonId, audience },
    include: { questions: { orderBy: { sortOrder: "asc" } } },
  });
  if (existing) return existing;

  const cfg = TEST_CONFIG[audience];
  const test = await prisma.trainingTest.create({
    data: {
      seasonId,
      audience,
      title: cfg.title,
      passScore: cfg.passScore,
      status: "published",
      questions: {
        create: cfg.questions.map((q, i) => ({
          type: q.type,
          prompt: q.prompt,
          options: q.options
            ? q.options.map((o) => ({ label: o.label, isCorrect: o.isCorrect }))
            : undefined,
          sortOrder: i,
        })),
      },
    },
    include: { questions: { orderBy: { sortOrder: "asc" } } },
  });
  return test;
}

/**
 * GET /api/training/test
 * Trả về bộ test theo audience của user (KHÔNG kèm đáp án đúng) + lần làm gần nhất.
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

  const test = await ensureTest(seasonId, audience);

  const sanitizedQuestions = test.questions.map((q) => ({
    id: q.id,
    type: q.type,
    prompt: q.prompt,
    options: q.options
      ? (q.options as any[]).map((o) => ({ label: o.label }))
      : undefined,
  }));

  const lastAttempt = await prisma.trainingTestAttempt.findFirst({
    where: { testId: test.id, userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    audience,
    test: { id: test.id, title: test.title, passScore: test.passScore },
    questions: sanitizedQuestions,
    lastAttempt: lastAttempt
      ? { score: lastAttempt.score, status: lastAttempt.status }
      : null,
  });
});

/**
 * POST /api/training/test
 * Nộp bài: body { answers: [{questionId, value}] }
 * MCQ chấm tự động; essay lưu text.
 * Khi pass -> tự đánh dấu module "Kiểm tra & chứng nhận" hoàn thành.
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

  const test = await ensureTest(seasonId, audience);
  const body = await req.json();
  const answers: { questionId: string; value: any }[] = body.answers ?? [];

  const mcqQuestions = test.questions.filter((q) => q.type === "multiple_choice");
  let correctCount = 0;
  const answerRecords: {
    questionId: string;
    text: string | null;
    isCorrect: boolean | null;
  }[] = [];

  for (const q of test.questions) {
    const a = answers.find((x) => x.questionId === q.id);
    if (!a) continue;
    if (q.type === "multiple_choice") {
      const options = q.options as any[];
      const chosen = Number(a.value);
      const correct = options[chosen]?.isCorrect === true;
      if (correct) correctCount++;
      answerRecords.push({
        questionId: q.id,
        text: String(a.value),
        isCorrect: correct,
      });
    } else {
      answerRecords.push({
        questionId: q.id,
        text: typeof a.value === "string" ? a.value : null,
        isCorrect: null,
      });
    }
  }

  const mcqTotal = mcqQuestions.length;
  const mcqScore = mcqTotal > 0 ? Math.round((correctCount / mcqTotal) * 100) : 0;
  const passed = mcqScore >= test.passScore;

  const attempt = await prisma.trainingTestAttempt.create({
    data: {
      testId: test.id,
      userId: user.id,
      score: mcqScore,
      status: passed ? "passed" : "failed",
      submittedAt: new Date(),
      answers: { create: answerRecords },
    },
  });

  // Khi pass test -> tự đánh dấu module "Kiểm tra & chứng nhận" hoàn thành
  if (passed) {
    const certModule = await prisma.trainingModule.findFirst({
      where: {
        seasonId,
        audience: { in: ["all", audience] },
        required: true,
        type: "online_module",
      },
      orderBy: { sortOrder: "desc" },
    });
    if (certModule) {
      await prisma.trainingProgress.upsert({
        where: {
          moduleId_userId: { moduleId: certModule.id, userId: user.id },
        },
        create: { moduleId: certModule.id, userId: user.id },
        update: {},
      });
    }
  }

  return NextResponse.json({
    attempt: { id: attempt.id, score: mcqScore, status: attempt.status },
    correctCount,
    mcqTotal,
    passed,
  });
});
