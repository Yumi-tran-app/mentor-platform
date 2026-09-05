import { redirect } from "next/navigation";
import { getOrCreateCurrentUser } from "@/lib/auth";

/**
 * Layout guard cho toàn bộ /coordinator/*
 * Chỉ admin/ĐPV mới truy cập được. Non-staff bị redirect về /dashboard.
 */
export default async function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getOrCreateCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role !== "admin" && user.role !== "dpv") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
