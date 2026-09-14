"use client";

import { useState } from "react";
import { AppShell, Card } from "@/components/ui";
import { useCurrentUser, isStaff } from "@/lib/use-current-user";

type Role = "mentee" | "mentor" | "dpv";

const SECTIONS: Record<Role, { title: string; intro: string; steps: { h: string; body: string }[] }> = {
  mentee: {
    title: "Hướng dẫn sử dụng cho Mentee",
    intro:
      "Bạn là người được đồng hành. Tài liệu này giúp bạn tận dụng trọn vẹn hành trình 9 tháng cùng mentor.",
    steps: [
      { h: "1. Hoàn thiện hồ sơ", body: "Vào Hồ sơ để cập nhật ảnh đại diện, thông tin cá nhân và mục tiêu nghề nghiệp. Hồ sơ đầy đủ giúp mentor hiểu bạn nhanh hơn." },
      { h: "2. Đăng ký tuyển sinh", body: "Khi có mùa tuyển sinh mở, bạn đăng ký trên trang chủ. Cung cấp thông tin trung thực về ngành học và trăn trở nghề nghiệp." },
      { h: "3. Không gian đồng hành", body: "Sau khi được ghép cặp, mục Không gian đồng hành (Workspace) là nơi bạn làm việc cùng mentor: xem lộ trình, ghi nhật ký, gửi phản tư." },
      { h: "4. Phản tư hằng tháng", body: "Mỗi tháng hãy mở Lộ trình mentoring và gửi phản tư về tâm trạng (đang kết nối tốt / cần hỗ trợ...). Nếu thấy chưa ổn, chọn 'Cần hỗ trợ' để điều phối viên kịp thời can thiệp." },
      { h: "5. Ghi nhật ký hành trình", body: "Ghi lại bài học, cảm xúc sau mỗi buổi gặp để nhìn lại sự trưởng thành của bản thân qua từng tháng." },
      { h: "6. Lịch gặp & tin nhắn", body: "Dùng Lịch gặp để đặt buổi trò chuyện, và Tin nhắn để trao đổi nhanh với mentor." },
      { h: "7. Cộng đồng & đào tạo", body: "Tham gia Cộng đồng để kết nối, và Đào tạo & Workshop để học thêm kỹ năng bổ trợ." },
      { h: "8. Nhận chứng nhận", body: "Khi đủ điều kiện hoàn thành chương trình, bạn sẽ được cấp chứng nhận. Kiểm tra ở mục Chứng nhận trên Hồ sơ." },
    ],
  },
  mentor: {
    title: "Hướng dẫn sử dụng cho Mentor",
    intro:
      "Bạn là người dẫn dắt. Tài liệu này giúp bạn đồng hành hiệu quả với mentee trong suốt chương trình.",
    steps: [
      { h: "1. Hoàn thiện hồ sơ", body: "Cập nhật hồ sơ (kinh nghiệm, chuyên ngành, lĩnh vực hỗ trợ) để điều phối viên ghép cặp phù hợp nhất với bạn." },
      { h: "2. Đăng ký tuyển sinh", body: "Khi mùa tuyển sinh mở, đăng ký làm mentor. Ghi rõ kinh nghiệm và mong muốn đồng hành của bạn." },
      { h: "3. Chấp nhận ghép cặp", body: "Khi được đề xuất ghép cặp, hãy xem hồ sơ mentee và xác nhận để bắt đầu mối quan hệ đồng hành." },
      { h: "4. Không gian đồng hành", body: "Mục Không gian đồng hành (Workspace) là nơi bạn quản lý công việc cùng mentee: lộ trình, nhật ký, phản tư." },
      { h: "5. Phản tư hằng tháng", body: "Mỗi tháng gửi phản tư về chất lượng mối quan hệ. Nếu gặp khó khăn, chọn 'Cần hỗ trợ' để điều phối viên đồng hành cùng bạn." },
      { h: "6. Ghi nhật ký đồng hành", body: "Ghi lại tiến độ và quan sát của bạn để đo lường sự phát triển của mentee." },
      { h: "7. Lịch gặp & tin nhắn", body: "Dùng Lịch gặp để lên lịch buổi trò chuyện định kỳ, và Tin nhắn để trao đổi." },
      { h: "8. Kết nối cộng đồng mentor", body: "Tham gia Cộng đồng và các buổi Workshop để kết nối mạng lưới chuyên gia cùng ngành." },
    ],
  },
  dpv: {
    title: "Hướng dẫn sử dụng cho Điều phối viên",
    intro:
      "Bạn là người điều phối toàn bộ hành trình mentoring. Tài liệu này giúp bạn vận hành hệ thống trơn tru.",
    steps: [
      { h: "1. Quản lý điều phối", body: "Mục Quản lý điều phối là bảng tổng quan: danh sách ghép cặp, các yêu cầu tạm dừng, yêu cầu hỗ trợ đang chờ xử lý." },
      { h: "2. Ghép cặp (Matching)", body: "Dùng mục Ghép cặp để xem hàng đợi mentee và đề xuất mentor phù hợp dựa trên nhu cầu và chuyên ngành." },
      { h: "3. Duyệt đơn đăng ký", body: "Xem và duyệt các đơn đăng ký mentor/mentee trong từng mùa tuyển sinh." },
      { h: "4. Đăng & chỉnh hoạt động cộng đồng", body: "Mục Hoạt động cộng đồng để đăng tin chính thức (tuyển sinh, sự kiện, workshop). Bạn có thể chỉnh sửa hoặc gỡ bài đã đăng." },
      { h: "5. Thống kê phản tư", body: "Mục Thống kê phản tư cho thấy sức khoẻ các cặp theo từng tháng: bao nhiêu cặp đang kết nối tốt, bao nhiêu cần hỗ trợ. Ưu tiên xử lý cặp 'Cần hỗ trợ'." },
      { h: "6. Xử lý yêu cầu hỗ trợ & tạm dừng", body: "Khi mentee/mentor phản tư 'Cần hỗ trợ' hoặc yêu cầu tạm dừng, hệ thống gửi thông báo. Hãy liên hệ và tạo buổi trao đổi kịp thời." },
      { h: "7. Quản lý phỏng vấn & buổi định hướng", body: "Tạo buổi trao đổi/định hướng cho các cặp gặp khó khăn, gửi lời mời qua email từ hệ thống." },
      { h: "8. Kiểm duyệt cộng đồng", body: "Duyệt bài viết, bình luận và xử lý báo cáo vi phạm để giữ không gian cộng đồng lành mạnh." },
    ],
  },
};

export default function GuidePage() {
  const user = useCurrentUser();
  const role: Role = isStaff(user?.role) ? "dpv" : "mentee";
  const [tab, setTab] = useState<Role>(role);
  const section = SECTIONS[tab];

  return (
    <AppShell title="Hướng dẫn sử dụng">
      <h1 className="text-2xl font-bold mb-2" style={{ color: "#0F766E" }}>
        Hướng dẫn sử dụng
      </h1>
      <p className="text-sm mb-6" style={{ color: "#94A3B8" }}>
        Chọn vai trò để xem hướng dẫn phù hợp.
      </p>

      {/* Tabs chọn vai trò */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["mentee", "mentor", "dpv"] as Role[]).map((r) => (
          <button
            key={r}
            onClick={() => setTab(r)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition"
            style={{
              background: tab === r ? "#0F766E" : "#fff",
              color: tab === r ? "#fff" : "#57534E",
              border: `1px solid ${tab === r ? "#0F766E" : "#E5E0D5"}`,
            }}
          >
            {r === "mentee" ? "Mentee" : r === "mentor" ? "Mentor" : "Điều phối viên"}
          </button>
        ))}
      </div>

      <Card>
        <h2 className="text-xl font-bold mb-2" style={{ color: "#292524" }}>
          {section.title}
        </h2>
        <p className="text-sm mb-6" style={{ color: "#57534E" }}>
          {section.intro}
        </p>
        <div className="space-y-5">
          {section.steps.map((s) => (
            <div key={s.h}>
              <h3 className="font-semibold mb-1" style={{ color: "#0F766E" }}>
                {s.h}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#292524" }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
