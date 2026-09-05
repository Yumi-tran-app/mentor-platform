import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-4xl md:text-5xl font-bold" style={{ color: "#093774" }}>
        Mentor Platform
      </h1>
      <p className="mt-4 text-lg max-w-xl" style={{ color: "#2c335d" }}>
        Nền tảng mentoring cộng đồng — hỗ trợ vòng đời đồng hành giữa Mentor và
        Mentee trong từng mùa tuyển chọn.
      </p>

      <div className="mt-8 flex gap-4">
        <SignedOut>
          <SignInButton mode="modal">
            <button
              className="px-6 py-3 rounded-full font-semibold text-white"
              style={{ background: "#093774" }}
            >
              Đăng nhập
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button
              className="px-6 py-3 rounded-full font-semibold text-white"
              style={{ background: "#ff6859" }}
            >
              Đăng ký
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-full font-semibold text-white"
            style={{ background: "#15b5b0" }}
          >
            Vào Dashboard
          </Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </main>
  );
}
