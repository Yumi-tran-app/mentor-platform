import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import {
  transitionMentorApplication,
  transitionMenteeApplication,
  writeAudit,
} from "@/lib/domain";
import { withErrorHandling } from "@/lib/api-helpers";

const ReviewSchema = z.object({
  kind: z.enum(["mentor", "mentee"]),
  applicationId: z.string().uuid(),
  decision: z.enum(["approve", "reject", "schedule_interview"]),
});

/**
 * POST /api/coordinator/review-application
 * Staff quyết định trên 1 đơn đăng ký:
 * - approve: duyệt thẳng (submitted -> approved -> in_pool)
 * - reject: từ chối
 * - schedule_interview: chuyển sang chờ phỏng vấn (để staff tạo lịch ở bước sau)
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireStaff();
  const body = await req.json();
  const { kind, applicationId, decision } = ReviewSchema.parse(body);

  if (decision === "approve") {
    if (kind === "mentor") {
      await transitionMentorApplication(applicationId, "approved", user.id);
      await transitionMentorApplication(applicationId, "in_pool", user.id);
    } else {
      await transitionMenteeApplication(applicationId, "approved", user.id);
      await transitionMenteeApplication(applicationId, "in_pool", user.id);
    }
  } else if (decision === "reject") {
    if (kind === "mentor") {
      await transitionMentorApplication(applicationId, "rejected", user.id);
    } else {
      await transitionMenteeApplication(applicationId, "rejected", user.id);
    }
  } else {
    // schedule_interview: submitted -> interview_scheduled
    // (cần application đang ở submitted; nếu đã scheduled thì không đổi)
    if (kind === "mentor") {
      await transitionMentorApplication(
        applicationId,
        "interview_scheduled",
        user.id
      );
    } else {
      await transitionMenteeApplication(
        applicationId,
        "interview_scheduled",
        user.id
      );
    }
  }

  await writeAudit({
    actorUserId: user.id,
    action: "coordinator.review_application",
    entityType: kind === "mentor" ? "MentorApplication" : "MenteeApplication",
    entityId: applicationId,
    after: { decision },
  });

  return NextResponse.json({ ok: true, decision });
});
