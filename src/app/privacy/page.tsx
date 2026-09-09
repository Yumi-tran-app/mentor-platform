import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Chính sách bảo mật & Điều khoản — Tre Việt Mentoring",
  description:
    "Chính sách bảo vệ dữ liệu cá nhân và điều khoản sử dụng của Tre Việt Mentoring.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-6 py-12" style={{ background: "#F5F2EC" }}>
      <div className="max-w-3xl mx-auto" style={{ color: "#292524" }}>
        <Link href="/" className="text-sm font-semibold" style={{ color: "#0F766E" }}>
          ← Quay lại trang chủ
        </Link>

        <h1 className="text-3xl font-bold mt-4 mb-2" style={{ color: "#0F766E" }}>
          Chính sách bảo vệ dữ liệu cá nhân
        </h1>
        <p className="text-sm mb-8" style={{ color: "#94A3B8" }}>
          Cập nhật lần cuối: Tháng 9/2026 · Tre Việt Mentoring
        </p>

        <Section title="1. Giới thiệu">
          <p>
            Tre Việt Mentoring (&quot;chương trình&quot;, &quot;chúng tôi&quot;) là một dự án mentoRing cộng đồng
            nhằm kết nối người giàu kinh nghiệm (Mentor) với người trẻ cần định hướng (Mentee).
            Chúng tôi cam kết bảo vệ dữ liệu cá nhân của bạn theo quy định của Nghị định 13/2023/NĐ-CP
            về bảo vệ dữ liệu cá nhân và các quy định pháp luật có liên quan tại Việt Nam.
          </p>
        </Section>

        <Section title="2. Dữ liệu cá nhân chúng tôi thu thập">
          <p>Khi bạn đăng ký và sử dụng nền tảng, chúng tôi có thể thu thập các loại dữ liệu sau:</p>
          <ul>
            <li>Thông tin định danh: họ tên, email, số điện thoại, nơi học tập/làm việc.</li>
            <li>Thông tin hồ sơ: ngành học/nghề nghiệp, kinh nghiệm, mục tiêu nghề nghiệp (đối với Mentor/Mentee).</li>
            <li>Dữ liệu sử dụng: ghi chú hành trình, phản tư, tin nhắn trong phạm vi cặp đồng hành.</li>
            <li>Thông tin kỹ thuật: dữ liệu truy cập nhằm đảm bảo an toàn và vận hành hệ thống.</li>
          </ul>
        </Section>

        <Section title="3. Mục đích xử lý dữ liệu">
          <p>Chúng tôi chỉ xử lý dữ liệu cá nhân cho các mục đích:</p>
          <ul>
            <li>Xét duyệt đơn đăng ký và ghép cặp Mentor – Mentee.</li>
            <li>Vận hành chức năng đồng hành, nhắn tin, nhật ký và phản tư.</li>
            <li>Đào tạo, tổ chức buổi định hướng/phỏng vấn và cấp chứng nhận.</li>
            <li>Gửi thông báo liên quan đến chương trình mà bạn đã đăng ký.</li>
            <li>Đảm bảo an toàn, phòng chống gian lận và tuân thủ pháp luật.</li>
          </ul>
        </Section>

        <Section title="4. Căn cứ pháp lý & sự đồng ý">
          <p>
            Việc xử lý dữ liệu của bạn dựa trên <b>sự đồng ý tự nguyện</b> mà bạn thể hiện khi đăng ký
            tham gia và tích chọn đồng ý với chính sách này. Bạn có quyền rút lại sự đồng ý bất cứ lúc nào
            bằng cách liên hệ với chúng tôi.
          </p>
        </Section>

        <Section title="5. Chia sẻ & tiết lộ dữ liệu">
          <p>
            Chúng tôi <b>không bán</b> dữ liệu cá nhân của bạn. Dữ liệu chỉ được chia sẻ trong các trường hợp:
          </p>
          <ul>
            <li>Với đối tác cung cấp hạ tầng (lưu trữ, email, xác thực) theo hợp đồng bảo mật tương ứng.</li>
            <li>Khi bạn đồng ý (ví dụ: chia sẻ thông tin với Mentor/Mentee trong cặp được ghép).</li>
            <li>Khi có yêu cầu của cơ quan nhà nước có thẩm quyền theo quy định pháp luật.</li>
          </ul>
        </Section>

        <Section title="6. Bảo mật & lưu trữ dữ liệu">
          <p>
            Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức phù hợp để bảo vệ dữ liệu, bao gồm mã hóa
            khi truyền tải, kiểm soát truy cập theo vai trò, và hạn chế tối đa việc tiếp cận dữ liệu nhạy cảm.
            Dữ liệu được lưu trữ trong thời gian cần thiết cho mục đích đã nêu và theo quy định pháp luật.
          </p>
        </Section>

        <Section title="7. Quyền của bạn">
          <p>Bạn có các quyền sau đối với dữ liệu cá nhân của mình:</p>
          <ul>
            <li>Quyền truy cập, chỉnh sửa và cập nhật dữ liệu.</li>
            <li>Quyền yêu cầu xóa dữ liệu cá nhân.</li>
            <li>Quyền rút lại sự đồng ý.</li>
            <li>Quyền khiếu nại khi phát hiện vi phạm.</li>
          </ul>
          <p>
            Để thực hiện các quyền trên, vui lòng liên hệ qua email hỗ trợ của chương trình.
          </p>
        </Section>

        <Section title="8. Thông tin liên hệ">
          <p>
            Nếu bạn có câu hỏi về chính sách này hoặc cách chúng tôi xử lý dữ liệu, vui lòng liên hệ:
            <br />
            Email: <a href="mailto:team.cloudncoral@gmail.com" style={{ color: "#0F766E" }}>team.cloudncoral@gmail.com</a>
          </p>
        </Section>

        <hr className="my-10" style={{ borderColor: "#E5E0D5" }} />

        <h2 className="text-2xl font-bold mb-4" style={{ color: "#0F766E" }}>
          Điều khoản sử dụng
        </h2>
        <Section title="A. Phạm vi sử dụng">
          <p>
            Tre Việt Mentoring là chương trình cộng đồng phi thương mại. Việc tham gia dựa trên tinh thần
            tự nguyện, tử tế và tôn trọng lẫn nhau. Chúng tôi có quyền từ chối hoặc gỡ bỏ tài khoản nếu
            phát hiện hành vi gian lận, quấy rối hoặc vi phạm quy chuẩn cộng đồng.
          </p>
        </Section>
        <Section title="B. Trách nhiệm người dùng">
          <p>
            Bạn cam kết cung cấp thông tin chính xác, không đăng tải nội dung vi phạm pháp luật, và tôn trọng
            quyền riêng tư của đối phương trong cặp đồng hành.
          </p>
        </Section>
        <Section title="C. Giới hạn trách nhiệm">
          <p>
            Chương trình là cầu nối hỗ trợ định hướng, không thay thế tư vấn chuyên môn (pháp lý, tài chính,
            y tế...). Mọi quyết định cá nhân là trách nhiệm của người tham gia.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold mb-2" style={{ color: "#134E4A" }}>
        {title}
      </h2>
      <div className="space-y-2 text-[15px] leading-relaxed">{children}</div>
    </div>
  );
}
