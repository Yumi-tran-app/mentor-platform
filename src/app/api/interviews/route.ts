import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, getOrCreateCurrentUser } from "@/lib/auth";
import {
  transitionMentorApplication,
  transitionMenteeApplication,
} from "@/lib/domain";
import { withErrorHandling } from "@/lib/api-helpers";

const ScheduleSchema = z.object({
  purpose: z.enum(["screening", "pause_review"]),
  applicantUserId: z.string().uuid().optional(),
  applicantRole: z.enum(["mentor", "mentee"]).optional(),
  mentorApplicationId: z.string().uuid().optional(),
  menteeApplicationId: z.string().uuid().optional(),
  relatedMatchId: z.string().uuid().optional(),
  interviewerId: z.string().uuid(),
  slotAt: z.string().datetime().optional(),
});

/**
 * POST /api/interviews
 * ĐPV tạo lịch phỏng vấn (sàng lọc hoặc xác nhận khi tạm dừng).
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireUser();
  const body = await req.json();
  const parsed = ScheduleSchema.parse(body);

  let applicantUserId = parsed.applicantUserId;
  let role = parsed.applicantRole;

  if (!applicantUserId && parsed.mentorApplicationId) {
    const app = await prisma.mentorApplication.findUnique({
      where: { id: parsed.mentorApplicationId },
      include: { user: true },
    });
    if (app) {
      applicantUserId = app.userId;
      role = "mentor";
    }
  } else if (!applicantUserId && parsed.menteeApplicationId) {
    const app = await prisma.menteeApplication.findUnique({
      where: { id: parsed.menteeApplicationId },
      include: { user: true },
    });
    if (app) {
      applicantUserId = app.userId;
      role = "mentee";
    }
  }

  if (!applicantUserId || !role) {
    return NextResponse.json(
      { error: "Cannot determine applicant" },
      { status: 400 }
    );
  }

  const interview = await prisma.interview.create({
    data: {
      purpose: parsed.purpose,
      applicantUserId,
      applicantRole: role,
      mentorApplicationId: parsed.mentorApplicationId,
      menteeApplicationId: parsed.menteeApplicationId,
      relatedMatchId: parsed.relatedMatchId,
      interviewerId: parsed.interviewerId,
      slotAt: parsed.slotAt ? new Date(parsed.slotAt) : null,
      status: "scheduled",
    },
  });

  if (parsed.purpose === "screening") {
    if (parsed.mentorApplicationId) {
      await transitionMentorApplication(
        parsed.mentorApplicationId,
        "interview_scheduled",
        user.id
      );
    } else if (parsed.menteeApplicationId) {
      await transitionMenteeApplication(
        parsed.menteeApplicationId,
        "interview_scheduled",
        user.id
      );
    }
  }

  return NextResponse.json({ interview }, { status: 201 });
});

/**
 * GET /api/interviews
 * Danh sách phỏng vấn. ?status=scheduled|awaiting_review...
 */
export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  const interviews = await prisma.interview.findMany({
    where: status ? { status: status as any } : {},
    orderBy: { slotAt: "asc" },
    include: {
      applicant: { select: { fullName: true, email: true } },
      interviewer: { select: { fullName: true } },
      valueRatings: { include: { coreValue: true } },
    },
  });

  return NextResponse.json({ interviews });
});
