import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { transitionMentorApplication, getMentoringCutoffDate } from "@/lib/domain";
import { sendEmail, simpleHtml, lateRegistrationEmailHtml } from "@/lib/email";
import { withErrorHandling } from "@/lib/api-helpers";

// PATCH /api/mentor-applications/:id/submit
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const user = await requireUser();

    const app = await prisma.mentorApplication.findUnique({
      where: { id },
    });
    if (!app || app.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await transitionMentorApplication(id, "submitted", user.id);

    // Kiểm tra đăng ký muộn: sau khi đã hoàn tất đào tạo (start + 60 ngày) = đã vào kỳ ghép cặp & kết nối
    const [cutoff, season] = await Promise.all([
      getMentoringCutoffDate(app.seasonId),
      prisma.season.findUnique({ where: { id: app.seasonId } }),
    ]);
    const isLate = cutoff ? new Date() > cutoff : false;

    if (isLate) {
      sendEmail({
        to: user.email,
        subject: "Cảm ơn bạn đã đăng ký tham gia chương trình",
        html: lateRegistrationEmailHtml({
          role: "Mentor",
          fullName: user.fullName,
          seasonLabel: season?.cohort || season?.name || "hiện tại",
        }),
      }).catch(() => {});
    } else {
      sendEmail({
        to: user.email,
        subject: "Đã nhận đơn đăng ký Mentor của bạn",
        html: simpleHtml("Cảm ơn bạn đã đăng ký làm Mentor!", [
          "Chúng tôi đã nhận được đơn đăng ký của bạn.",
          "Đội ngũ điều phối sẽ xem xét và liên hệ bạn trong thời gian sớm nhất.",
          "Bạn có thể theo dõi trạng thái đơn trong dashboard.",
        ]),
      }).catch(() => {});
    }

    return NextResponse.json({ application: updated });
  })(req, { params: await params });
}
