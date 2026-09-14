"use client";

import { useEffect, useState } from "react";
import { AppShell, Card, Badge } from "@/components/ui";

type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  roleLabel: string;
  avatarUrl: string | null;
  createdAt: string;
};

const ROLE_COLOR: Record<string, string> = {
  admin: "#B45309",
  dpv: "#0F766E",
  mentor: "#15B5B0",
  mentee: "#94A3B8",
};

const ROLE_OPTIONS = [
  { value: "mentee", label: "Mentee" },
  { value: "mentor", label: "Mentor" },
  { value: "dpv", label: "Điều phối viên (DPV)" },
  { value: "admin", label: "Admin" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/users");
      if (r.ok) {
        const d = await r.json();
        setUsers(d.users ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function changeRole(userId: string, role: string) {
    setSavingId(userId);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const d = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, role: d.user.role, roleLabel: d.user.roleLabel } : u
          )
        );
        setMsg("✅ Đã cập nhật vai trò.");
      } else {
        setMsg(`⚠️ ${d.error ?? "Có lỗi khi cập nhật."}`);
      }
    } finally {
      setSavingId(null);
    }
  }

  return (
    <AppShell title="Quản lý người dùng & vai trò">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0F766E" }}>
            Người dùng &amp; vai trò
          </h1>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
            Chỉ định vai trò hệ thống: Admin, Điều phối viên (DPV), Mentor, Mentee.
          </p>
        </div>
        <Badge color="#0F766E">{users.length} người dùng</Badge>
      </div>

      {msg && (
        <div
          className="rounded-xl p-3 mb-4 text-sm"
          style={{
            background: msg.startsWith("✅") ? "#F0FDFA" : "#FEF3C7",
            border: `1px solid ${msg.startsWith("✅") ? "#99F6E4" : "#FDE68A"}`,
            color: msg.startsWith("✅") ? "#134E4A" : "#92400E",
          }}
        >
          {msg}
        </div>
      )}

      <Card className="overflow-hidden">
        {loading ? (
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Đang tải…
          </p>
        ) : users.length === 0 ? (
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Chưa có người dùng.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: "760px" }}>
              <thead>
                <tr style={{ background: "#F5F2EC" }}>
                  <th className="px-3 py-2 text-left font-semibold" style={{ color: "#57534E" }}>
                    Người dùng
                  </th>
                  <th className="px-3 py-2 text-left font-semibold" style={{ color: "#57534E" }}>
                    Email
                  </th>
                  <th className="px-3 py-2 text-left font-semibold" style={{ color: "#57534E" }}>
                    Vai trò
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t" style={{ borderColor: "#F5F2EC" }}>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                          style={{ background: ROLE_COLOR[u.role] ?? "#94A3B8" }}
                        >
                          {(u.fullName ?? "U").charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium" style={{ color: "#292524" }}>
                          {u.fullName ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3" style={{ color: "#57534E" }}>
                      {u.email}
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={u.role}
                        disabled={savingId === u.id}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        className="px-3 py-1.5 rounded-lg border text-sm"
                        style={{ borderColor: "#E5E0D5", color: "#292524", background: "#fff" }}
                      >
                        {ROLE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
