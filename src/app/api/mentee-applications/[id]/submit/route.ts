import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { transitionMenteeApplication } from "@/lib/domain";
import { sendEmail, simpleHtml, lateRegistrationEmailHtml } from "@/lib/email";
import { withErrorHandling } from "@/lib/api-helpers";

// PATCH /api/mentee-applications/:id/submit
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const user = await requireUser();

    const app = await prisma.menteeApplication.findUnique({
      where: { id },
    });
    if (!app || app.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await transitionMenteeApplication(id, "submitted", user.id);

    // Lưu thời điểm đồng thuận (bước 5 consent) khi submit
    await prisma.menteeApplication.update({
      where: { id },
      data: { consentedAt: new Date() },
    });

    // Kiểm tra đăng ký muộn: sau khi đã hết hạn ghép cặp & kết nối
    const season = await prisma.season.findUnique({ where: { id: app.seasonId } });
    const regDeadline = season?.registrationDeadline ?? null;
    const isLate = regDeadline ? new Date() > regDeadline : false;

    if (isLate) {
      sendEmail({
        to: user.email,
        subject: "Cảm ơn bạn đã đăng ký tham gia chương trình",
        html: lateRegistrationEmailHtml({
          role: "Mentee",
          fullName: user.fullName,
          seasonLabel: season?.cohort || season?.name || "hiện tại",
        }),
      }).catch(() => {});
    } else {
      sendEmail({
        to: user.email,
        subject: "Đã nhận đơn đăng ký Mentee của bạn",
        html: simpleHtml("Cảm ơn bạn đã đăng ký làm Mentee!", [
          "Chúng tôi đã nhận được đơn đăng ký của bạn.",
          "Đội ngũ điều phối sẽ xem xét và liên hệ bạn trong thời gian sớm nhất.",
          "Bạn có thể theo dõi trạng thái đơn trong dashboard.",
        ]),
      }).catch(() => {});
    }

    return NextResponse.json({ application: updated });
  })(req, { params: await params });
}
