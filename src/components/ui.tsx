"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "🏠", label: "Trang chủ" },
  { href: "/discover", icon: "🔍", label: "Khám phá mentor" },
  { href: "/workspace", icon: "🌱", label: "Không gian đồng hành" },
  { href: "/messages", icon: "💬", label: "Tin nhắn" },
  { href: "/calendar", icon: "📅", label: "Lịch gặp" },
  { href: "/training", icon: "🎓", label: "Đào tạo" },
  { href: "/profile", icon: "👤", label: "Hồ sơ" },
  { href: "/coordinator", icon: "🎯", label: "Điều phối (ĐPV)" },
];

export function AppShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex" style={{ background: "#FFF3E6" }}>
      {/* SIDEBAR */}
      <aside
        className="w-64 shrink-0 min-h-screen flex flex-col"
        style={{ background: "#093774", color: "#fff" }}
      >
        <div className="px-5 py-6 border-b" style={{ borderColor: "rgba(255,255,255,.1)" }}>
          <Link href="/dashboard" className="text-lg font-bold block">
            Mentor Platform
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition"
                style={{
                  background: active ? "rgba(255,255,255,.15)" : "transparent",
                  color: "#fff",
                }}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div
          className="px-5 py-4 border-t flex items-center gap-3"
          style={{ borderColor: "rgba(255,255,255,.1)" }}
        >
          <UserButton afterSignOutUrl="/" />
          <div className="flex-1 min-w-0">
            <Link
              href="/notifications"
              className="text-sm block hover:opacity-80"
              title="Thông báo"
            >
              🔔 Thông báo
            </Link>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ background: "#fff", borderColor: "#F5F2EC" }}
        >
          <h2 className="text-lg font-bold" style={{ color: "#093774" }}>
            {title ?? ""}
          </h2>
        </header>
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl p-6 shadow-sm border ${className}`}
      style={{ background: "#fff", borderColor: "#F5F2EC" }}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}) {
  const bg =
    variant === "primary"
      ? "#093774"
      : variant === "secondary"
        ? "#15B5B0"
        : "#FF6859";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="px-5 py-2.5 rounded-full font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background: bg }}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  color = "#15B5B0",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white"
      style={{ background: color }}
    >
      {children}
    </span>
  );
}
