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
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#2C335D">
      <h2 style="color:#093774">${title}</h2>
      ${items}
      <p style="margin-top:16px;color:#94A3B8;font-size:12px">Mentor Platform</p>
    </div>
  `;
}
