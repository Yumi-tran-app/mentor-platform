import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff, safeRoleForApplicant } from "@/lib/auth";
import {
  transitionMentorApplication,
  transitionMenteeApplication,
  writeAudit,
  notifyUser,
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

  // Lấy userId của đơn để cập nhật vai trò người dùng + thông báo
  let applicantUserId: string | null = null;
  if (kind === "mentor") {
    const app = await prisma.mentorApplication.findUnique({
      where: { id: applicationId },
      select: { userId: true },
    });
    applicantUserId = app?.userId ?? null;
  } else {
    const app = await prisma.menteeApplication.findUnique({
      where: { id: applicationId },
      select: { userId: true },
    });
    applicantUserId = app?.userId ?? null;
  }

  if (decision === "approve") {
    if (kind === "mentor") {
      await transitionMentorApplication(applicationId, "approved", user.id);
      await transitionMentorApplication(applicationId, "in_pool", user.id);
    } else {
      await transitionMenteeApplication(applicationId, "approved", user.id);
      await transitionMenteeApplication(applicationId, "in_pool", user.id);
    }

    // Cập nhật vai trò người dùng theo loại đơn được duyệt
    // AN TOÀN: không ghi đè quyền admin/dpv xuống mentor/mentee.
    if (applicantUserId) {
      const targetRole = kind === "mentor" ? "mentor" : "mentee";
      const applicant = await prisma.user.findUnique({
        where: { id: applicantUserId },
        select: { role: true },
      });
      const nextRole = safeRoleForApplicant(applicant?.role ?? "mentee", kind);
      if (nextRole && applicant?.role !== nextRole) {
        await prisma.user.update({
          where: { id: applicantUserId },
          data: { role: nextRole as any },
        });
      }
      await notifyUser({
        userId: applicantUserId,
        type: "application.approved",
        payload: { kind, role: targetRole },
      });
    }
  } else if (decision === "reject") {
    if (kind === "mentor") {
      await transitionMentorApplication(applicationId, "rejected", user.id);
    } else {
      await transitionMenteeApplication(applicationId, "rejected", user.id);
    }
    if (applicantUserId) {
      await notifyUser({
        userId: applicantUserId,
        type: "application.rejected",
        payload: { kind },
      });
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
