import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Chính sách bảo mật & Điều khoản - Tre Việt Mentoring",
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

        <Section title="1. Giới thiệu & chủ thể vận hành">
          <p>
            <b>Tre Việt Mentoring</b> (&quot;chương trình&quot;, &quot;chúng tôi&quot;) là một dự án mentoring cộng đồng
            nhằm kết nối người giàu kinh nghiệm (Mentor) với người trẻ cần định hướng (Mentee).
          </p>
          <p>
            Chương trình (bao gồm nền tảng website, diễn đàn cộng đồng và mọi hoạt động liên quan) được
            vận hành bởi <b>Công ty TNHH Cloud &amp; Coral</b> - mã số thuế <b>0318906357</b>, địa chỉ 191 Hai Bà Trưng,
            Phường Xuân Hoà, TP. Hồ Chí Minh. Cloud &amp; Coral là chủ thể pháp lý chịu trách nhiệm về việc thu thập,
            xử lý và bảo vệ dữ liệu cá nhân trên nền tảng này.
          </p>
          <p>
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
            <b>Công ty TNHH Cloud &amp; Coral</b> (vận hành Tre Việt Mentoring)
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

        <h2 className="text-2xl font-bold mt-10 mb-4" style={{ color: "#0F766E" }}>
          Quy chế cộng đồng & Trách nhiệm nội dung
        </h2>
        <Section title="D. Nguyên tắc đăng tải nội dung">
          <p>
            Diễn đàn cộng đồng là không gian chia sẻ tri thức lành mạnh. Khi đăng bài hoặc bình luận, bạn cam kết:
          </p>
          <ul>
            <li>Không đăng tải nội dung vi phạm pháp luật Việt Nam (tuyên truyền chống phá Nhà nước, kích động bạo lực, phân biệt chủng tộc/vùng miền, mua bán hàng cấm...).</li>
            <li>Không phát tán thông tin sai sự thật, lừa đảo, spam hoặc quảng cáo trái phép.</li>
            <li>Không chia sẻ thông tin cá nhân của người khác khi chưa được đồng ý.</li>
            <li>Không quấy rối, xúc phạm, công kích cá nhân hoặc tổ chức.</li>
            <li>Tôn trọng quyền sở hữu trí tuệ và ghi rõ nguồn khi chia sẻ nội dung không phải của mình.</li>
          </ul>
        </Section>
        <Section title="E. Kiểm duyệt & xử lý vi phạm">
          <p>
            Bài viết sẽ được đội ngũ điều phối của chương trình xem xét (kiểm duyệt) trước khi hiển thị công khai.
            Chúng tôi có quyền, tùy theo mức độ, thực hiện một trong các biện pháp sau đối với nội dung hoặc tài khoản vi phạm:
          </p>
          <ul>
            <li>Từ chối hiển thị bài viết.</li>
            <li>Xóa bài viết hoặc bình luận vi phạm.</li>
            <li>Khóa chức năng bình luận của bài viết.</li>
            <li>Cảnh báo, tạm khóa hoặc gỡ bỏ tài khoản người dùng.</li>
            <li>Báo cáo lên cơ quan có thẩm quyền khi nội dung có dấu hiệu vi phạm pháp luật.</li>
          </ul>
        </Section>
        <Section title="F. Cơ chế báo cáo">
          <p>
            Người dùng có trách nhiệm báo cáo nội dung nghi ngờ vi phạm thông qua nút <b>&quot;Báo cáo vi phạm&quot;</b> trên
            từng bài viết/bình luận, hoặc gửi email trực tiếp đến <a href="mailto:team.cloudncoral@gmail.com" style={{ color: "#0F766E" }}>team.cloudncoral@gmail.com</a>.
            Chúng tôi sẽ tiếp nhận, xem xét và xử lý trong thời gian sớm nhất.
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
