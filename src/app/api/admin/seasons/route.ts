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
  const end = new Date(parsed.endDate + "T00:00:00");
  // Mốc "Đăng ký & xét duyệt" = startDate + registrationDays
  const regDeadline = new Date(start);
  regDeadline.setDate(regDeadline.getDate() + parsed.registrationDays);

  const defaultMilestones = [
    { key: "registration", title: "Đăng ký & Xét duyệt", deadline: regDeadline },
    { key: "training", title: "Đào tạo Mentor", deadline: null },
    { key: "matching", title: "Nhận ghép cặp & Kết nối", deadline: null },
    { key: "wrapup", title: "Tổng kết & Nhận chứng nhận", deadline: end },
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
