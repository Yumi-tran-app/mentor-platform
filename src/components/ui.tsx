"use client";

import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser, isStaff } from "@/lib/use-current-user";

type NavItem = { href: string; icon: IconName; label: string };
type NavGroup = { title: string; items: NavItem[]; staffOnly?: boolean; adminOnly?: boolean };

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Khám phá & Tổng quan",
    items: [
      { href: "/dashboard", icon: "home", label: "Trang chủ" },
      { href: "/discover", icon: "compass", label: "Khám phá" },
    ],
  },
  {
    title: "Không gian làm việc",
    items: [
      { href: "/workspace", icon: "folder", label: "Không gian đồng hành" },
      { href: "/journey", icon: "map", label: "Lộ trình mentoring" },
      { href: "/calendar", icon: "calendar", label: "Lịch gặp" },
      { href: "/messages", icon: "chat", label: "Tin nhắn" },
    ],
  },
  {
    title: "Tài nguyên & Học tập",
    items: [{ href: "/training", icon: "book", label: "Đào tạo & Workshop" }],
  },
  {
    title: "Cá nhân",
    items: [{ href: "/profile", icon: "user", label: "Hồ sơ" }],
  },
  {
    title: "Điều phối viên",
    staffOnly: true,
    items: [
      { href: "/coordinator", icon: "target", label: "Quản lý điều phối" },
      { href: "/coordinator/matchmaking", icon: "link", label: "Ghép cặp (Matching)" },
    ],
  },
  {
    title: "Quản trị",
    adminOnly: true,
    items: [
      { href: "/admin", icon: "settings", label: "Quản trị hệ thống" },
      { href: "/admin/events", icon: "calendar", label: "Workshop/Training" },
    ],
  },
];

export function AppShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const pathname = usePathname();
  const user = useCurrentUser();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.unreadCount) setUnread(d.unreadCount);
      })
      .catch(() => {});
  }, [user]);

  const visibleGroups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter(() => {
      if (g.adminOnly) return user?.role === "admin";
      if (g.staffOnly) return isStaff(user?.role);
      return true;
    }),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen flex" style={{ background: "#F5F2EC" }}>
      {/* SIDEBAR */}
      <aside
        className="w-64 shrink-0 min-h-screen flex flex-col"
        style={{ background: "#134E4A", color: "#fff" }}
      >
        <div className="px-5 py-6 border-b" style={{ borderColor: "rgba(255,255,255,.1)" }}>
          <Link href="/dashboard" className="block hover:opacity-80">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold text-sm">
                MVS
              </div>
              <span className="font-bold text-sm leading-tight text-white">
                Mentoring for
                <br />
                Vietnamese Student
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {visibleGroups.map((group, gi) => (
            <div key={group.title} className={gi > 0 ? "mt-6" : ""}>
              <p
                className="px-3 mb-2 text-[10px] font-semibold tracking-wider uppercase"
                style={{ color: "rgba(255,255,255,.4)" }}
              >
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition"
                      style={{
                        background: active ? "rgba(255,255,255,.14)" : "transparent",
                        color: active ? "#fff" : "rgba(255,255,255,.82)",
                      }}
                    >
                      <LineIcon name={item.icon} size={18} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              {gi < visibleGroups.length - 1 && (
                <div className="mx-3 mt-4 h-px" style={{ background: "rgba(255,255,255,.08)" }} />
              )}
            </div>
          ))}
        </nav>

        <div
          className="px-5 py-4 border-t flex items-center gap-3"
          style={{ borderColor: "rgba(255,255,255,.1)" }}
        >
          <UserButton afterSignOutUrl="/" />
          <div className="flex-1 min-w-0">
            {user && (
              <p className="text-xs truncate" style={{ color: "rgba(255,255,255,.7)" }}>
                {user.fullName}
              </p>
            )}
            <Link
              href="/notifications"
              className="text-sm flex items-center gap-2 hover:opacity-80"
              title="Thông báo"
            >
              <LineIcon name="bell" size={15} />
              <span>Thông báo</span>
              {unread > 0 && (
                <span
                  className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold text-white"
                  style={{ background: "#D97706" }}
                >
                  {unread}
                </span>
              )}
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
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm font-semibold px-3 py-1.5 rounded-full transition hover:opacity-80"
              style={{ background: "#F5F2EC", color: "#0F766E" }}
            >
              ← Trang chủ
            </Link>
            <h2 className="text-lg font-bold" style={{ color: "#0F766E" }}>
              {title ?? ""}
            </h2>
          </div>
        </header>
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}

// ---------- Bộ icon line đồng nhất (stroke paths) ----------
type IconName =
  | "home"
  | "compass"
  | "folder"
  | "map"
  | "calendar"
  | "chat"
  | "book"
  | "user"
  | "target"
  | "link"
  | "settings"
  | "bell";

const ICON_PATHS: Record<IconName, string> = {
  home: "M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10",
  compass:
    "M12 21a9 9 0 100-18 9 9 0 000 18zm3.5-12.5l-2 5-5 2 2-5 5-2z",
  folder:
    "M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z",
  map: "M9 20l-6-3V4l6 3 6-3 6 3v13l-6-3-6 3zM9 7v13M15 4v13",
  calendar:
    "M8 3v3M16 3v3M4 9h16M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z",
  chat: "M21 12a8 8 0 01-8 8H4l2-3a8 8 0 1115-5z",
  book: "M4 19V5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zm0 0a2 2 0 012-2h13",
  user: "M16 20v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  target:
    "M12 21a9 9 0 100-18 9 9 0 000 18zm0-4a5 5 0 100-10 5 5 0 000 10zm0-4a1 1 0 100-2 1 1 0 000 2z",
  link: "M10 14a5 5 0 007.07 0l2.83-2.83A5 5 0 0012 4.1L9.17 6.93M14 10a5 5 0 00-7.07 0L4.1 12.83A5 5 0 0012 19.9l2.83-2.83",
  settings:
    "M12 15a3 3 0 100-6 3 3 0 000 6zm7.5-3a7.5 7.5 0 01-.1 1.2l2 1.6-2 3.4-2.4-1a7.5 7.5 0 01-2 1.1l-.4 2.6h-4l-.4-2.6a7.5 7.5 0 01-2-1.1l-2.4 1-2-3.4 2-1.6A7.5 7.5 0 014.5 12a7.5 7.5 0 01.1-1.2l-2-1.6 2-3.4 2.4 1a7.5 7.5 0 012-1.1l.4-2.6h4l.4 2.6a7.5 7.5 0 012 1.1l2.4-1 2 3.4-2 1.6c.07.4.1.8.1 1.2z",
  bell: "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0",
};

export function LineIcon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
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
      ? "#0F766E"
      : variant === "secondary"
        ? "#15B5B0"
        : "#B45309";
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
