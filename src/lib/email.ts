import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "Mentor Platform <onboarding@resend.dev>";

export type EmailPayload = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

/**
 * Gửi email qua Resend. Nếu chưa cấu hình RESEND_API_KEY thì
 * chỉ log ra console (không gửi thật) — để dev không bị lỗi.
 */
export async function sendEmail({ to, subject, text, html }: EmailPayload) {
  if (!resend) {
    console.log(`[EMAIL] (no key) → ${to} | ${subject}`);
    return { skipped: true };
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      ...(html ? { html } : { text: text ?? "" }),
    });
    return result;
  } catch (err: any) {
    console.error("[EMAIL] send failed:", err?.message ?? err);
    return { error: err?.message ?? "email send failed" };
  }
}

/**
 * Tạo nội dung HTML cơ bản cho email thông báo.
 */
export function simpleHtml(title: string, lines: string[]) {
  const items = lines.map((l) => `<p style="margin:0 0 8px">${l}</p>`).join("");
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#292524">
      <h2 style="color:#0F766E">${title}</h2>
      ${items}
      <p style="margin-top:16px;color:#94A3B8;font-size:12px">Mentoring for Vietnamese Student</p>
    </div>
  `;
}

/**
 * Email dành cho người đăng ký muộn (sau khi đã sang kỳ ghép cặp & kết nối).
 */
export function lateRegistrationEmailHtml(params: {
  role: "Mentor" | "Mentee";
  fullName: string;
  seasonLabel: string;
}) {
  const { role, fullName, seasonLabel } = params;
  const name = fullName || "bạn";
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:28px;color:#292524;line-height:1.6">
      <h2 style="color:#0F766E;margin:0 0 16px">Cảm ơn bạn đã đăng ký tham gia chương trình</h2>
      <p>Xin chào ${name},</p>
      <p>
        Chúng tôi xin chân thành cảm ơn bạn đã quan tâm và đăng ký trở thành <strong>${role}</strong> trong chương trình
        Mentoring for Vietnamese Student.
      </p>
      <p>
        Rất tiếc, hiện tại công tác <strong>ghép cặp và kết nối</strong> của mùa <strong>${seasonLabel}</strong> đã hoàn tất.
        Vì vậy, đơn đăng ký của bạn sẽ được ghi nhận và ưu tiên xét duyệt cho mùa mentoring kế tiếp.
      </p>
      <p>
        Trong thời gian chờ đợi, bạn đừng bỏ lỡ cơ hội tham gia các hoạt động <strong>đào tạo (training)</strong> và
        <strong> workshop</strong> do chương trình tổ chức — để trang bị trước kiến thức, mở rộng mạng lưới và sẵn sàng cho
        hành trình đồng hành sắp tới.
      </p>
      <p style="margin-top:20px">
        Một lần nữa, cảm ơn sự nhiệt huyết của bạn. Chúng tôi rất mong được gặp bạn trong mùa mentoring tiếp theo!
      </p>
      <p style="margin-top:24px;color:#94A3B8;font-size:12px">— Ban tổ chức Mentoring for Vietnamese Student</p>
    </div>
  `;
}
