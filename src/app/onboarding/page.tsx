"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function OnboardingPage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: "#FFF3E6" }}>
      <h1 className="text-3xl font-bold" style={{ color: "#093774" }}>
        Chào {user?.firstName ?? "bạn"} 👋
      </h1>
      <p className="mt-3 text-lg max-w-md" style={{ color: "#2C335D" }}>
        Bạn muốn tham gia chương trình với vai trò nào?
      </p>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        <Link
          href="/onboarding/mentor"
          className="rounded-2xl p-8 text-left shadow-sm border hover:shadow-md transition"
          style={{ background: "#fff", borderColor: "#F5F2EC" }}
        >
          <div className="text-3xl mb-3">🧑‍🏫</div>
          <h2 className="text-xl font-bold" style={{ color: "#093774" }}>
            Tôi là Mentor
          </h2>
          <p className="mt-2 text-sm" style={{ color: "#2C335D" }}>
            Chia sẻ kinh nghiệm, đồng hành cùng mentee trong suốt mùa.
          </p>
        </Link>

        <Link
          href="/onboarding/mentee"
          className="rounded-2xl p-8 text-left shadow-sm border hover:shadow-md transition"
          style={{ background: "#fff", borderColor: "#F5F2EC" }}
        >
          <div className="text-3xl mb-3">🌱</div>
          <h2 className="text-xl font-bold" style={{ color: "#15B5B0" }}>
            Tôi là Mentee
          </h2>
          <p className="mt-2 text-sm" style={{ color: "#2C335D" }}>
            Học hỏi từ mentor có kinh nghiệm, phát triển bản thân và sự nghiệp.
          </p>
        </Link>
      </div>
    </div>
  );
}
