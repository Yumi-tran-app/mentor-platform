"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div style={{ background: "#FFF3E6", color: "#2C335D" }}>
      {/* HERO */}
      <section className="px-6 py-16 md:py-24 max-w-5xl mx-auto text-center">
        <div className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: "#FCE8E6", color: "#FF6859" }}>
          Nền tảng mentoring cộng đồng
        </div>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight" style={{ color: "#093774" }}>
          Đồng hành có chủ đích,
          <br />
          trưởng thành có dẫn lối.
        </h1>
        <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto" style={{ color: "#2C335D" }}>
          Kết nối những người đi trước giàu kinh nghiệm với thế hệ đang phát triển,
          qua một lộ trình đồng hành có tổ chức, có đo lường, kéo dài 9 tháng.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="px-7 py-3.5 rounded-full font-semibold text-white shadow-lg" style={{ background: "#FF6859" }}>
                Đăng ký tham gia
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="px-7 py-3.5 rounded-full font-semibold" style={{ background: "#fff", color: "#093774", border: "1px solid #E5E0D5" }}>
                Đăng nhập
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="px-7 py-3.5 rounded-full font-semibold text-white shadow-lg" style={{ background: "#15B5B0" }}>
              Vào không gian của tôi
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </section>

      {/* GIÁ TRỊ CỐT LÕI */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "#093774" }}>
          Vì sao chọn chúng tôi?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "🎯",
              title: "Ghép cặp có chủ đích",
              desc: "Không bốc thăm ngẫu nhiên. Chúng tôi đối chiếu ngành nghề, kinh nghiệm và nhu cầu để ghép đúng người đúng việc.",
            },
            {
              icon: "🧭",
              title: "Lộ trình 9 tháng rõ ràng",
              desc: "Từ kết nối đầu tiên, thoả thuận đồng hành, đến phản tư hằng tháng — mỗi giai đoạn đều có cấu trúc và điểm chạm.",
            },
            {
              icon: "🛡️",
              title: "Có người điều phối đồng hành",
              desc: "Một ĐPV (điều phối viên) theo sát từng cặp, gỡ khó kịp thời khi có tạm dừng hay vấn đề phát sinh.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl p-8 shadow-sm border" style={{ background: "#fff", borderColor: "#F5F2EC" }}>
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: "#093774" }}>{f.title}</h3>
              <p className="text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DÀNH CHO AI */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "#093774" }}>
          Dành cho cả hai phía
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl p-8 shadow-sm border" style={{ background: "#093774", borderColor: "#093774", color: "#fff" }}>
            <h3 className="text-2xl font-bold mb-4">Cho Mentor</h3>
            <ul className="space-y-3 text-sm leading-relaxed" style={{ color: "#E6F3F0" }}>
              <li>• Trao truyền kinh nghiệm một cách có cấu trúc, không dàn trải</li>
              <li>• Đồng hành tối đa 3 mentee — chủ động được thời lượng</li>
              <li>• Được định danh là người dẫn lối trong cộng đồng</li>
              <li>• Ghi nhận đóng góp minh bạch qua từng mùa</li>
            </ul>
          </div>
          <div className="rounded-2xl p-8 shadow-sm border" style={{ background: "#15B5B0", borderColor: "#15B5B0", color: "#fff" }}>
            <h3 className="text-2xl font-bold mb-4">Cho Mentee</h3>
            <ul className="space-y-3 text-sm leading-relaxed" style={{ color: "#E6F9F7" }}>
              <li>• Được mentor có kinh nghiệm thực chiến dẫn dắt</li>
              <li>• Lộ trình 9 tháng bám sát mục tiêu cá nhân & sự nghiệp</li>
              <li>• Không gian phản tư hằng tháng để nhìn lại chính mình</li>
              <li>• Được hỗ trợ kịp thời khi gặp khó khăn</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3 GIÁ TRỊ CỐT LÕI */}
      <section className="px-6 py-16 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4" style={{ color: "#093774" }}>
          Ba giá trị chúng tôi theo đuổi
        </h2>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {[
            ["🤝", "Tôn trọng", "Mỗi quan hệ đồng hành đều bắt đầu từ sự tôn trọng lẫn nhau"],
            ["⏳", "Cam kết", "Cam kết là nền tảng để lộ trình 9 tháng đi đến đích"],
            ["🌱", "Cởi mở", "Chia sẻ thật, lắng nghe thật để cùng trưởng thành"],
          ].map(([icon, title, desc]) => (
            <div key={title} className="rounded-2xl p-8 shadow-sm border max-w-xs" style={{ background: "#fff", borderColor: "#F5F2EC" }}>
              <div className="text-4xl mb-3">{icon}</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: "#093774" }}>{title}</h3>
              <p className="text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA CUỐI */}
      <section className="px-6 py-20 text-center" style={{ background: "#093774" }}>
        <h2 className="text-3xl font-bold text-white mb-4">Sẵn sàng bắt đầu hành trình?</h2>
        <p className="text-lg mb-8" style={{ color: "#E6F3F0" }}>
          Tham gia mùa mentoring tiếp theo — dù bạn muốn dẫn lối hay được dẫn lối.
        </p>
        <SignedOut>
          <SignUpButton mode="modal">
            <button className="px-8 py-4 rounded-full font-semibold text-white shadow-lg" style={{ background: "#FF6859" }}>
              Đăng ký ngay
            </button>
          </SignUpButton>
        </SignedOut>
      </section>

      <footer className="py-8 text-center text-sm" style={{ color: "#94A3B8" }}>
        © {new Date().getFullYear()} Mentor Platform — Đồng hành có chủ đích.
      </footer>
    </div>
  );
}
