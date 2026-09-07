"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const ORG_NAME = "Mentoring for Vietnamese Student";

export default function Home() {
  return (
    <div className="bg-[#F5F2EC] text-stone-800 antialiased overflow-x-hidden">
      {/* NAVIGATION */}
      <nav className="fixed w-full top-0 z-50 glass-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center text-white font-bold text-lg">
                MVS
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
              Cộng đồng học hỏi & phát triển miễn phí
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-stone-800">
              Kết Nối Tri Thức <br />
              <span className="text-teal-700">Kiến Tạo Tương Lai.</span>
            </h1>
            <p className="text-lg md:text-xl text-stone-600 leading-relaxed max-w-xl">
              Nền tảng kết nối những chuyên gia giàu kinh nghiệm với những người trẻ khao khát phát triển. Đừng đi một mình, hãy tìm người dẫn đường cho sự nghiệp của bạn ngay hôm nay.
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
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
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
              { n: "2", t: "Kết nối phù hợp", d: "Thuật toán và bộ lọc thông minh giúp bạn tìm thấy \"mảnh ghép\" hoàn hảo nhất dựa trên lĩnh vực và mong muốn." },
              { n: "3", t: "Tương tác & Phát triển", d: "Đặt lịch hẹn 1-on-1 qua video call hoặc tin nhắn, trao đổi kinh nghiệm và bắt đầu hành trình khai phá tiềm năng." },
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
      <section className="py-20 bg-stone-900 text-white rounded-[3rem] mx-4 sm:mx-8 my-8 shadow-2xl overflow-hidden">
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
                    <h4 className="text-xl font-semibold mb-2">Rèn Luyện Kỹ Năng Coaching</h4>
                    <p className="text-stone-300">Quá trình mentoring là cách thực tế nhất để rèn luyện kỹ năng lắng nghe, thấu cảm và quản lý con người.</p>
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
                <p>Chúng tôi cũng từng là những người trẻ loay hoay trong những ngày đầu bước ra &quot;biển lớn&quot;. Chúng tôi từng cầm trên tay một chiếc CV không biết nên điều chỉnh thế nào, từng hoang mang tột độ khi quyết định chuyển ngành, và từng vấp ngã chỉ vì thiếu một lời khuyên đúng lúc.</p>
                <p>Sau nhiều năm đi làm, chúng tôi nhận ra một sự thật: Dù bạn có học giỏi đến đâu ở trường lớp, những bài học thực chiến từ những người đã &quot;đổ máu&quot; trên thương trường vẫn là vô giá. Ngày đó, chúng tôi từng ước: <strong>Giá như có một người anh, người chị đi trước chỉ cho mình biết nên rẽ hướng nào.</strong></p>
                <p>Từ những trăn trở đó, <span className="font-semibold">{ORG_NAME}</span> ra đời với một khát vọng giản dị nhưng mãnh liệt: <span className="font-bold text-teal-700">Không một ai phải đi một mình trên con đường sự nghiệp.</span></p>
                <p>Chúng tôi xây dựng cầu nối này vì niềm tin rằng: Tri thức khi được sẻ chia là tri thức nhân lên gấp bội. Thế hệ trước nâng đỡ thế hệ sau, đó là cách một cộng đồng lớn mạnh.</p>
                <p className="font-medium italic text-stone-800">Dù bạn đang tìm kiếm ánh sáng dẫn đường, hay muốn trở thành ngọn hải đăng cho thế hệ sau... Chào mừng bạn về nhà.</p>
                <div className="pt-6 mt-8 border-t border-stone-100 flex items-center gap-4">
                  <div className="w-14 h-14 bg-stone-200 rounded-full overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Founder" className="w-full h-full object-cover" />
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

      {/* 7. LĨNH VỰC MENTORING */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">Khám phá các lĩnh vực</h2>
              <p className="text-stone-600">Tìm chuyên gia trong mảng bạn quan tâm</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { t: "Công nghệ & IT", c: "text-teal-700", d: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
              { t: "Marketing & Sales", c: "text-amber-700", d: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055zM20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" },
              { t: "Kinh Doanh", c: "text-teal-700", d: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
              { t: "Thiết kế & Sáng tạo", c: "text-amber-700", d: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" },
            ].map((x) => (
              <a key={x.t} href="#stats" className="group p-6 bg-[#F5F2EC] rounded-2xl hover:bg-teal-700 transition-colors duration-300 flex flex-col items-center text-center cursor-pointer">
                <div className={`w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 ${x.c} group-hover:scale-110 transition-transform shadow-sm`}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={x.d} /></svg>
                </div>
                <h3 className="font-semibold text-stone-800 group-hover:text-white transition-colors">{x.t}</h3>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA & FOOTER */}
      <footer className="bg-stone-900 pt-20 pb-10 border-t border-stone-800">
        <div className="max-w-4xl mx-auto px-4 text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Sẵn sàng cho bước tiến tiếp theo?</h2>
          <p className="text-stone-300 text-lg mb-8 max-w-2xl mx-auto">Tham gia cộng đồng hàng ngàn người đang cùng nhau phát triển mỗi ngày. Dù bạn là Mentor hay Mentee, luôn có vị trí dành cho bạn.</p>
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
            <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
            <a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a>
            <a href="#" className="hover:text-white transition-colors">Liên hệ hỗ trợ</a>
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
