import { redirect } from "next/navigation";
import { getOrCreateCurrentUser } from "@/lib/auth";

/**
 * Layout guard cho /admin/* — CHỈ admin mới truy cập được (kể cả dpv bị chặn).
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getOrCreateCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
