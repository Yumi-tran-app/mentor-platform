import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function AppShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="min-h-screen" style={{ background: "#FFF3E6" }}>
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ background: "#093774", color: "#fff" }}
      >
        <Link href="/dashboard" className="text-lg font-bold">
          Mentor Platform
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-80">{title ?? ""}</span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
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
