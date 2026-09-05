import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { transitionMentorApplication } from "@/lib/domain";
import { sendEmail, simpleHtml } from "@/lib/email";
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

    // Gửi email xác nhận đã nộp đơn (không chặn luồng nếu lỗi)
    sendEmail({
      to: user.email,
      subject: "Đã nhận đơn đăng ký Mentor của bạn",
      html: simpleHtml("Cảm ơn bạn đã đăng ký làm Mentor!", [
        "Chúng tôi đã nhận được đơn đăng ký của bạn.",
        "Đội ngũ điều phối sẽ xem xét và liên hệ bạn trong thời gian sớm nhất.",
        "Bạn có thể theo dõi trạng thái đơn trong dashboard.",
      ]),
    }).catch(() => {});

    return NextResponse.json({ application: updated });
  })(req, { params: await params });
}
