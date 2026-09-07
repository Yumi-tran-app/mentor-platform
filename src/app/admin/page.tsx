"use client";

import { useEffect, useState } from "react";
import { AppShell, Card, Button, Badge } from "@/components/ui";

type Stats = {
  totalUsers: number;
  totalMentors: number;
  totalMentees: number;
  pendingMentorApps: number;
  pendingMenteeApps: number;
  activeMatches: number;
  totalMatches: number;
  totalNotifications: number;
  totalModules: number;
  totalCertificates: number;
  season: { name: string; status: string } | null;
};

type Module = {
  id: string;
  title: string;
  audience: string;
  required: boolean;
  sortOrder: number;
};

const AUDIENCE_LABEL: Record<string, string> = {
  all: "Tất cả",
  mentor: "Mentor",
  mentee: "Mentee",
};

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState<"all" | "mentor" | "mentee">("all");
  const [required, setRequired] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [s, m] = await Promise.all([
        fetch("/api/admin/stats").then((r) => r.json()),
        fetch("/api/admin/training-modules").then((r) => r.json()),
      ]);
      setStats(s);
      setModules(m.modules ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addModule() {
    if (!title.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/training-modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, audience, required, sortOrder }),
      });
      if (res.ok) {
        setTitle("");
        setMsg("✅ Đã thêm module.");
      } else {
        const d = await res.json();
        setMsg(d.error ?? "Có lỗi khi thêm.");
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function deleteModule(id: string) {
    setBusy(true);
    await fetch(`/api/admin/training-modules?id=${id}`, { method: "DELETE" });
    await load();
    setBusy(false);
  }

  if (loading || !stats) {
    return (
      <AppShell title="Admin">
        <p style={{ color: "#2C335D" }}>Đang tải...</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Quản trị hệ thống">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "#093774" }}>
        🛠️ Bảng quản trị (Admin)
      </h1>
      <p className="text-sm mb-6" style={{ color: "#94A3B8" }}>
        Mùa hiện tại: {stats.season ? `${stats.season.name} (${stats.season.status})` : "—"}
      </p>

      {/* Dashboard số liệu */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatBox label="Người dùng" value={stats.totalUsers} color="#093774" />
        <StatBox label="Mentor" value={stats.totalMentors} color="#15B5B0" />
        <StatBox label="Mentee" value={stats.totalMentees} color="#1BA7A6" />
        <StatBox label="Đơn mentor chờ" value={stats.pendingMentorApps} color="#F2A93B" />
        <StatBox label="Đơn mentee chờ" value={stats.pendingMenteeApps} color="#F2A93B" />
        <StatBox label="Cặp đang hoạt động" value={stats.activeMatches} color="#15803D" />
        <StatBox label="Tổng cặp" value={stats.totalMatches} color="#0D2B45" />
        <StatBox label="Chứng nhận" value={stats.totalCertificates} color="#FF7A59" />
      </div>

      {/* Quản lý chương trình đào tạo */}
      <Card>
        <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
          📚 Quản lý chương trình đào tạo
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tên module"
            className="px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: "#E5E0D5", color: "#2C335D" }}
          />
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as any)}
            className="px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: "#E5E0D5", color: "#2C335D" }}
          >
            <option value="all">Tất cả</option>
            <option value="mentor">Mentor</option>
            <option value="mentee">Mentee</option>
          </select>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            placeholder="Thứ tự"
            className="px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: "#E5E0D5", color: "#2C335D" }}
          />
          <label className="flex items-center gap-2 text-sm" style={{ color: "#2C335D" }}>
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
            />
            Bắt buộc
          </label>
        </div>

        <Button onClick={addModule} disabled={busy || !title.trim()}>
          + Thêm module
        </Button>

        {msg && (
          <p className="text-sm mt-3" style={{ color: msg.startsWith("✅") ? "#15803D" : "#B42318" }}>
            {msg}
          </p>
        )}

        <div className="mt-5 space-y-2">
          {modules.length === 0 ? (
            <p className="text-sm" style={{ color: "#94A3B8" }}>Chưa có module.</p>
          ) : (
            modules.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-lg border"
                style={{ borderColor: "#F5F2EC" }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium" style={{ color: "#2C335D" }}>
                    {m.title}
                  </span>
                  <Badge color={m.audience === "mentor" ? "#093774" : m.audience === "mentee" ? "#15B5B0" : "#94A3B8"}>
                    {AUDIENCE_LABEL[m.audience]}
                  </Badge>
                  {m.required && <Badge color="#FF6859">Bắt buộc</Badge>}
                </div>
                <button
                  onClick={() => deleteModule(m.id)}
                  className="text-sm font-medium"
                  style={{ color: "#FF6859" }}
                >
                  Xoá
                </button>
              </div>
            ))
          )}
        </div>
      </Card>
    </AppShell>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl p-4 text-white shadow-sm" style={{ background: color }}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs mt-1 opacity-90">{label}</p>
    </div>
  );
}
