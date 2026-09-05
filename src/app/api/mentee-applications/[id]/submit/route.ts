import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { transitionMenteeApplication } from "@/lib/domain";
import { sendEmail, simpleHtml } from "@/lib/email";
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

    sendEmail({
      to: user.email,
      subject: "Đã nhận đơn đăng ký Mentee của bạn",
      html: simpleHtml("Cảm ơn bạn đã đăng ký làm Mentee!", [
        "Chúng tôi đã nhận được đơn đăng ký của bạn.",
        "Đội ngũ điều phối sẽ xem xét và liên hệ bạn trong thời gian sớm nhất.",
        "Bạn có thể theo dõi trạng thái đơn trong dashboard.",
      ]),
    }).catch(() => {});

    return NextResponse.json({ application: updated });
  })(req, { params: await params });
}
