"use client";

import { useEffect, useState } from "react";

export type CurrentUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phone: string | null;
};

/**
 * Hook lấy thông tin user hiện tại (bao gồm role) để phân quyền UI.
 * Trả về null khi đang tải, user khi đã có.
 */
export function useCurrentUser(): CurrentUser | null {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user) setUser(d.user);
      })
      .catch(() => {});
  }, []);

  return user;
}

export function isStaff(role?: string | null): boolean {
  return role === "admin" || role === "dpv";
}

/**
 * Lưu ý: `role` chỉ mang ý nghĩa QUYỀN HỆ THỐNG (admin/dpv).
 * Vai trò đăng ký mentor/mentee phải suy từ Application/dashboard.
 */
