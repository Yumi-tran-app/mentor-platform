"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const ORG_NAME = "Tre Việt Mentoring";

export default function Home() {
  return (
    <div className="bg-[#F5F2EC] text-stone-800 antialiased overflow-x-hidden">
      {/* NAVIGATION */}
      <nav className="fixed w-full top-0 z-50 glass-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center text-white font-bold text-lg">
                TVM
              </div>
              <span className="font-bold text-lg tracking-tight text-teal-700 leading-tight">
                {ORG_NAME}
              </span>
            </Link>
            <div className="hidden md:flex space-x-8 items-center font-medium text-stone-600">
              <a href="#about" className="hover:text-teal-700 transition-colors">Về chúng tôi</a>
              <a href="#stats" className="hover:text-teal-700 transition-colors">Lợi ích</a>
              <a href="#how-it-works" className="hover:text-teal-700 transition-colors">Cách hoạt động</a>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-5 py-2.5 bg-teal-700 text-white rounded-full hover:bg-teal-800 transition-all shadow-md">
                    Đăng nhập
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 bg-teal-700 text-white rounded-full hover:bg-teal-800 transition-all shadow-md"
                >
                  Vào không gian của tôi
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* 1. HERO */}
      <section className="pt-32 pb-20 lg:pt-44 lg:pb-32 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 relative z-10">
            <div className="inline-block px-4 py-2 bg-teal-100 text-teal-700 font-semibold rounded-full text-sm">
              Cộng đồng Mentoring chuyên sâu Tâm lý &amp; Nhân sự
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-stone-800">
              Kết Nối Tri Thức <br />
              <span className="text-teal-700">Kiến Tạo Tương Lai.</span>
            </h1>
            <p className="text-lg md:text-xl text-stone-600 leading-relaxed max-w-xl">
              Nền tảng kết nối chuyên biệt giữa người có kinh nghiệm với những người trẻ khao khát phát triển trong lĩnh vực phát triển con người (Nhân sự và Tâm lý học). Đừng đi một mình, hãy tìm người dẫn đường cho sự nghiệp của bạn ngay hôm nay.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="px-8 py-4 bg-teal-700 text-white font-semibold rounded-full hover:bg-teal-800 hover:shadow-lg transition-all transform hover:-translate-y-1 text-center">
                    Tìm Mentor Của Bạn
                  </button>
                </SignUpButton>
                <SignUpButton mode="modal">
                  <button className="px-8 py-4 bg-transparent border-2 border-teal-700 text-teal-700 font-semibold rounded-full hover:bg-teal-50 transition-all text-center">
                    Trở Thành Mentor
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/discover"
                  className="px-8 py-4 bg-teal-700 text-white font-semibold rounded-full hover:bg-teal-800 hover:shadow-lg transition-all transform hover:-translate-y-1 text-center"
                >
                  Khám phá Mentor
                </Link>
                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-transparent border-2 border-teal-700 text-teal-700 font-semibold rounded-full hover:bg-teal-50 transition-all text-center"
                >
                  Bảng điều khiển
                </Link>
              </SignedIn>
            </div>
          </div>

          <div className="relative z-10 hidden lg:block">
            <div className="absolute inset-0 bg-teal-700/10 rounded-full blur-3xl transform translate-x-10 translate-y-10"></div>
            <img
              src="/images/hero-team.jpg"
              alt="Mentoring session"
              className="rounded-3xl shadow-2xl object-cover h-[500px] w-full relative z-10 border-4 border-white"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl z-20 flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-full text-amber-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <div>
                <p className="text-sm text-stone-600 font-medium">Khám phá tiềm năng</p>
                <p className="font-bold text-stone-800">1-on-1 Mentoring</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SỨC MẠNH CỦA MENTORING */}
      <section id="stats" className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-6">Sức Mạnh Của Việc Có Một Mentor</h2>
            <p className="text-lg text-stone-600">Những con số biết nói từ các tổ chức hàng đầu thế giới chứng minh tại sao Mentoring không chỉ là một lời khuyên, mà là chiến lược phát triển bắt buộc.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { pct: "98%", color: "text-teal-700", t: "Doanh nghiệp hàng đầu", d: "Các công ty trong danh sách Fortune 500 đều có chương trình Mentoring nội bộ, khẳng định đây là chìa khóa giữ chân nhân tài.", s: "Nguồn: Mentorloop Data, 2026" },
              { pct: "5x Lần", color: "text-amber-700", t: "Cơ hội thăng tiến", d: "Mentees có khả năng được thăng chức cao gấp 5 lần so với những nhân sự không có người dẫn dắt (Mentor).", s: "Nguồn: Nghiên cứu của Gartner" },
              { pct: "97%", color: "text-teal-700", t: "Khẳng định giá trị", d: "Những người đang có Mentor khẳng định mối quan hệ này là \"vô giá\" đối với định hướng và sự tự tin trong nghề nghiệp.", s: "Nguồn: Thống kê từ Forbes" },
              { pct: "54%", color: "text-amber-700", t: "Khoảng trống lớn", d: "Dù 76% người đi làm tin rằng Mentor rất quan trọng, nhưng 54% lại chưa tìm được người dẫn đường. Chúng tôi ở đây để xóa bỏ điều đó.", s: "Nguồn: Harvard Business Review" },
            ].map((x) => (
              <div key={x.t} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-stone-100">
                <div className={`text-4xl font-black mb-4 ${x.color}`}>{x.pct}</div>
                <h3 className="text-xl font-bold text-stone-800 mb-3">{x.t}</h3>
                <p className="text-stone-600 text-sm mb-4">{x.d}</p>
                <p className="text-xs text-stone-400 italic">{x.s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CÁCH THỨC HOẠT ĐỘNG */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">Bắt đầu dễ dàng trong 3 bước</h2>
            <div className="w-24 h-1 bg-teal-700 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-teal-200 z-0"></div>
            {[
              { n: "1", t: "Tạo hồ sơ cá nhân", d: "Kể cho chúng tôi nghe về mục tiêu sự nghiệp của bạn (nếu là Mentee) hoặc thế mạnh, kinh nghiệm của bạn (nếu là Mentor)." },
              { n: "2", t: "Kết nối phù hợp", d: "Đội ngũ chuyên môn sẽ xem xét và giới thiệu người đồng hành phù hợp nhất với định hướng của bạn." },
              { n: "3", t: "Tương tác & Phát triển", d: "Kết nối, gặp gỡ trực tiếp và bắt đầu hành trình đồng hành phát triển." },
            ].map((s) => (
              <div key={s.n} className="relative z-10 text-center group">
                <div className="w-24 h-24 mx-auto bg-white border-4 border-teal-100 rounded-full flex items-center justify-center text-3xl font-bold text-teal-700 group-hover:bg-teal-700 group-hover:text-white transition-all duration-300 shadow-lg mb-6">
                  {s.n}
                </div>
                <h3 className="text-xl font-bold text-stone-800 mb-3">{s.t}</h3>
                <p className="text-stone-600">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 & 5. LỢI ÍCH MENTEE & MENTOR */}
      <section className="py-20 text-white rounded-[3rem] mx-4 sm:mx-8 my-8 shadow-2xl overflow-hidden" style={{ background: "#134E4A" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Mentee */}
            <div className="space-y-8">
              <div className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-teal-300 font-medium tracking-wide text-sm border border-white/20">
                DÀNH CHO MENTEE
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Vượt qua sự mông lung,<br />Tăng tốc sự nghiệp.</h2>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="mt-1 bg-teal-500/20 p-2 rounded-lg text-teal-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Định Hướng Thực Tế</h4>
                    <p className="text-stone-300">Nhận lời khuyên từ những người đã thực sự đi qua con đường bạn đang đi, tránh những sai lầm không đáng có.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 bg-teal-500/20 p-2 rounded-lg text-teal-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Mở Rộng Mạng Lưới (Networking)</h4>
                    <p className="text-stone-300">Tạo bước đệm kết nối với các chuyên gia trong ngành, mở ra những cơ hội việc làm tiềm năng trong tương lai.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Mentor */}
            <div className="space-y-8">
              <div className="w-full h-px bg-white/20 block lg:hidden my-8"></div>
              <div className="inline-block px-4 py-1.5 bg-amber-500/20 rounded-full text-amber-400 font-medium tracking-wide text-sm border border-amber-500/30">
                DÀNH CHO MENTOR
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Để lại di sản,<br />Nâng tầm lãnh đạo.</h2>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="mt-1 bg-amber-500/20 p-2 rounded-lg text-amber-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Lan Tỏa Giá Trị & Cho Đi</h4>
                    <p className="text-stone-300">Trực tiếp đóng góp vào sự phát triển của cộng đồng, trao truyền lại những kinh nghiệm xương máu của bạn.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 bg-amber-500/20 p-2 rounded-lg text-amber-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Phát triển kỹ năng Supervision</h4>
                    <p className="text-stone-300">Quá trình đồng hành là cơ hội thực chiến để rèn luyện kỹ năng tham vấn chuyên môn và khai vấn đội ngũ.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CÂU CHUYỆN KHỞI NGUYÊN */}
      <section id="about" className="py-24 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white p-8 md:p-14 rounded-3xl shadow-xl border border-stone-100 relative">
            <div className="absolute -top-10 -left-6 text-9xl text-teal-100 font-serif leading-none opacity-80 z-0">&quot;</div>
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-8 text-center border-b border-stone-200 pb-6">
                Tại sao chúng tôi tạo ra nền tảng này?
              </h2>
              <div className="prose prose-lg text-stone-600 max-w-none space-y-6">
                <p>Chào bạn,</p>
                <p>Làm việc với &quot;con người&quot;, dù trong vai trò tham vấn tâm lý hay quản trị nhân sự, luôn là một hành trình đầy thử thách. Trường lớp cung cấp cho chúng ta hệ thống lý thuyết vững chắc, nhưng thực tế công việc lại đòi hỏi sự tinh tế trong cách xử lý các mối quan hệ, sự thấu cảm trước những tổn thương, và bản lĩnh khi đứng trước những quyết định nhạy cảm.</p>
                <p>Trong quá trình làm nghề, chúng tôi nhận ra rằng những thực tế phức tạp nhất ít khi có sẵn lời giải trong sách vở. Sự trưởng thành của một người thực hành nghề thường được mài giũa qua những trải nghiệm thực tiễn và đặc biệt là qua quá trình được chia sẻ chuyên môn từ những chuyên gia đi trước.</p>
                <p>Từ góc nhìn đó, nền tảng này được thiết kế không phải như một nơi dạy học, mà là một không gian an toàn để kết nối các thế hệ làm trong lĩnh vực phát triển con người. Chúng tôi hướng tới việc xây dựng một cộng đồng nơi những kinh nghiệm thực chiến được trao truyền minh bạch, giúp mỗi cá nhân vững vàng hơn trên con đường hành nghề.</p>
                <p>Tri thức chuyên môn kết hợp cùng sự thấu cảm thực tế sẽ tạo nên những giá trị bền vững cho cả tổ chức và xã hội.</p>
                <p className="font-medium italic text-stone-800">Chào mừng bạn đến với cộng đồng Tre Việt Mentoring, mạng lưới của những người cam kết đồng hành cùng sự phát triển của con người.</p>
                <div className="pt-6 mt-8 border-t border-stone-100 flex items-center gap-4">
                  <div className="w-14 h-14 bg-stone-200 rounded-full overflow-hidden">
                    <img src="/images/founder.jpg" alt="Founder" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-800">Đội ngũ Sáng lập</p>
                    <p className="text-sm text-stone-600">{ORG_NAME}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-40 -mt-20 w-96 h-96 bg-amber-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-20 w-96 h-96 bg-teal-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      </section>

      {/* 7. FINAL CTA & FOOTER */}
      <footer className="pt-20 pb-10 border-t border-stone-800" style={{ background: "#134E4A" }}>
        <div className="max-w-4xl mx-auto px-4 text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Sẵn sàng cho bước tiến tiếp theo?</h2>
          <p className="text-stone-300 text-lg mb-8 max-w-2xl mx-auto">Tham gia cộng đồng những chuyên gia và người trẻ theo đuổi con đường tâm lý học &amp; quản trị nhân sự. Dù bạn là Mentor hay Mentee, luôn có vị trí dành cho bạn.</p>
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="px-8 py-4 bg-teal-700 text-white font-bold rounded-full hover:bg-teal-800 transition-all transform hover:-translate-y-1 text-lg">
                Tạo Tài Khoản Miễn Phí
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="px-8 py-4 bg-teal-700 text-white font-bold rounded-full hover:bg-teal-800 transition-all transform hover:-translate-y-1 text-lg inline-block">
              Vào không gian của tôi
            </Link>
          </SignedIn>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-stone-800 text-center md:flex md:justify-between md:text-left text-stone-400 text-sm">
          <p>&copy; 2026 {ORG_NAME}. All rights reserved.</p>
          <div className="space-x-6 mt-4 md:mt-0 flex justify-center">
            <a href="/privacy" className="hover:text-white transition-colors">Chính sách bảo mật</a>
            <a href="/privacy#terms" className="hover:text-white transition-colors">Điều khoản sử dụng</a>
            <a href="mailto:team.cloudncoral@gmail.com" className="hover:text-white transition-colors">Email: team.cloudncoral@gmail.com</a>
            <a href="tel:0866883047" className="hover:text-white transition-colors">Hotline: 0866 883 047</a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
