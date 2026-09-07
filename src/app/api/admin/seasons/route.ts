import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

const SeasonSchema = z.object({
  name: z.string().min(1),
  cohort: z.string().optional(),
  startDate: z.string().min(1), // yyyy-mm-dd
  endDate: z.string().min(1),
  registrationDays: z.number().int().min(1).default(45),
  trainingDays: z.number().int().min(1).default(15),
  mentoringMonths: z.number().int().min(1).default(9),
  wrapupMonths: z.number().int().min(1).default(1),
  sessionTarget: z.number().int().min(1).default(6),
  milestones: z
    .array(
      z.object({
        key: z.string(),
        title: z.string(),
        deadline: z.string().optional().nullable(),
      })
    )
    .optional(),
});

/**
 * GET /api/admin/seasons — danh sách mùa (quản trị).
 */
export const GET = withErrorHandling(async (req: Request) => {
  await requireStaff();
  const seasons = await prisma.season.findMany({
    orderBy: { startDate: "desc" },
    include: { milestones: { orderBy: { sortOrder: "asc" } } },
  });
  return NextResponse.json({ seasons });
});

/**
 * POST /api/admin/seasons — tạo mùa mới + deadline + auto sinh milestones chuẩn.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireStaff();
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const parsed = SeasonSchema.parse(body);

  const start = new Date(parsed.startDate + "T00:00:00");
  // Lộ trình chuẩn 12 tháng: đăng ký 45d + đào tạo 15d + mentoring 9 tháng + tổng kết 1 tháng
  const regDeadline = new Date(start);
  regDeadline.setDate(regDeadline.getDate() + parsed.registrationDays);
  const trainingDeadline = new Date(start);
  trainingDeadline.setDate(trainingDeadline.getDate() + parsed.registrationDays + parsed.trainingDays);
  const mentoringDeadline = new Date(start);
  mentoringDeadline.setMonth(mentoringDeadline.getMonth() + (parsed.mentoringMonths + Math.ceil((parsed.registrationDays + parsed.trainingDays) / 30)));
  const end = new Date(parsed.endDate + "T00:00:00");

  const defaultMilestones = [
    { key: "registration", title: "Đăng ký & Xét duyệt", deadline: regDeadline },
    { key: "training", title: "Đào tạo", deadline: trainingDeadline },
    { key: "mentoring", title: "Mentoring (9 tháng)", deadline: mentoringDeadline },
    { key: "wrapup", title: "Báo cáo & Tổng kết", deadline: end },
  ];
  const milestonesInput = (parsed.milestones && parsed.milestones.length > 0
    ? parsed.milestones
    : defaultMilestones
  ).map((m, i) => ({
    key: m.key,
    title: m.title,
    sortOrder: i,
    deadline: m.deadline ? new Date(m.deadline + "T00:00:00") : null,
  }));

  const season = await prisma.season.create({
    data: {
      name: parsed.name,
      cohort: parsed.cohort,
      startDate: start,
      endDate: end,
      registrationDeadline: regDeadline,
      status: "draft",
      milestones: { create: milestonesInput },
      criteria: {
        create: {
          key: "mentoring_session_target",
          value: String(parsed.sessionTarget),
          valueType: "number",
        },
      },
    },
    include: { milestones: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json({ season }, { status: 201 });
});
