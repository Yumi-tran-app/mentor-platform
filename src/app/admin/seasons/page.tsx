"use client";

import { useEffect, useState } from "react";
import { AppShell, Card, Button, Badge, LineIcon } from "@/components/ui";

type Season = {
  id: string;
  name: string;
  cohort: string | null;
  status: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string | null;
  milestones: { id: string; key: string; title: string; deadline: string | null; sortOrder: number }[];
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Nháp",
  open_registration: "Đang mở đăng ký",
  active: "Đang diễn ra",
  closed: "Đã kết thúc",
};

export default function AdminSeasonsPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    cohort: "",
    startDate: "",
    endDate: "",
    registrationDays: 45,
    sessionTarget: 6,
  });

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/seasons").then((r) => r.json());
    setSeasons(res.seasons ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    setMsg(null);
    const res = await fetch("/api/admin/seasons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        registrationDays: Number(form.registrationDays) || 45,
        sessionTarget: Number(form.sessionTarget) || 6,
      }),
    });
    const d = await res.json();
    if (res.ok) {
      setMsg("✅ Đã tạo mùa mới.");
      setShowForm(false);
      setForm({ name: "", cohort: "", startDate: "", endDate: "", registrationDays: 45, sessionTarget: 6 });
    } else {
      setMsg(d.error ?? "Có lỗi khi tạo mùa.");
    }
    await load();
  }

  const fmt = (s: string | null) => (s ? new Date(s).toLocaleDateString("vi-VN") : "—");
  const inputCls = "w-full px-3 py-2 rounded-lg border text-sm";
  const inputStyle = { borderColor: "#E5E0D5", color: "#292524" };

  return (
    <AppShell title="Quản lý Mùa (Cohort)">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "#0F766E" }}>
          <LineIcon name="calendar" size={22} /> Quản lý Mùa / Cohort
        </h1>
        <Button onClick={() => setShowForm(true)}>+ Tạo mùa mới</Button>
      </div>

      {msg && (
        <div className="mb-4 rounded-lg px-4 py-3 text-sm" style={{ background: msg.startsWith("✅") ? "#E6F4EA" : "#FCE8E6", color: "#292524" }}>
          {msg}
        </div>
      )}

      {showForm && (
        <Card className="mb-6">
          <h2 className="font-bold mb-4" style={{ color: "#0F766E" }}>Tạo mùa mới</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#292524" }}>Tên mùa *</label>
              <input className={inputCls} style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Mùa 2" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#292524" }}>Cohort</label>
              <input className={inputCls} style={inputStyle} value={form.cohort} onChange={(e) => setForm({ ...form, cohort: e.target.value })} placeholder="VD: Cohort 5" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#292524" }}>Ngày bắt đầu *</label>
              <input type="date" className={inputCls} style={inputStyle} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#292524" }}>Ngày kết thúc *</label>
              <input type="date" className={inputCls} style={inputStyle} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#292524" }}>Hạn đăng ký & xét duyệt (ngày)</label>
              <input type="number" className={inputCls} style={inputStyle} value={form.registrationDays} onChange={(e) => setForm({ ...form, registrationDays: Number(e.target.value) })} />
              <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>Tự tính = ngày bắt đầu + số ngày này (mặc định 45).</p>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#292524" }}>Số buổi mentoring chuẩn</label>
              <input type="number" className={inputCls} style={inputStyle} value={form.sessionTarget} onChange={(e) => setForm({ ...form, sessionTarget: Number(e.target.value) })} />
              <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>Số buổi mentoring tối thiểu mỗi cặp (mặc định 6).</p>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={create}>Tạo mùa</Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Hủy</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <p style={{ color: "#292524" }}>Đang tải...</p>
      ) : seasons.length === 0 ? (
        <Card><p className="text-sm" style={{ color: "#94A3B8" }}>Chưa có mùa nào.</p></Card>
      ) : (
        <div className="space-y-3">
          {seasons.map((s) => (
            <Card key={s.id}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold" style={{ color: "#0F766E" }}>
                    {s.cohort || s.name} <span className="text-sm font-normal" style={{ color: "#94A3B8" }}>· {s.name}</span>
                  </h3>
                  <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
                    {fmt(s.startDate)} → {fmt(s.endDate)} · Hạn đăng ký: {fmt(s.registrationDeadline)}
                  </p>
                </div>
                <Badge color={s.status === "closed" ? "#94A3B8" : "#0F766E"}>{STATUS_LABEL[s.status] ?? s.status}</Badge>
              </div>
              {/* Milestones */}
              <div className="mt-3 pt-3 border-t" style={{ borderColor: "#F5F2EC" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "#292524" }}>Các mốc:</p>
                <div className="space-y-1">
                  {s.milestones.map((m) => (
                    <div key={m.id} className="flex items-center gap-2 text-sm">
                      <LineIcon name="checkCircle" size={14} />
                      <span style={{ color: "#292524" }}>{m.title}</span>
                      {m.deadline && <span className="text-xs" style={{ color: "#94A3B8" }}>· hạn {fmt(m.deadline)}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
