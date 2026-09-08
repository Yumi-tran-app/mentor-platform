"use client";

import { useEffect, useState } from "react";
import { AppShell, Card, Badge, Button } from "@/components/ui";

type Application = {
  id: string;
  status: string;
  industry?: string;
  capacityMax?: number;
  user: { id: string; fullName: string; email: string };
};

type Interview = {
  id: string;
  status: string;
  purpose: string;
  applicantRole: string;
  applicant: { fullName: string };
  interviewer: { fullName: string };
  slotAt: string | null;
};

type GroupInterview = {
  id: string;
  title: string;
  audience: string;
  status: string;
  startAt: string | null;
  zoomLink: string | null;
  attendees: { userId: string; fullName: string; email: string; confirmation: string }[];
  counts: { accepted: number; declined: number; pending: number; total: number };
};

export default function InterviewsPage() {
  const [mentorApps, setMentorApps] = useState<Application[]>([]);
  const [menteeApps, setMenteeApps] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [groupInterviews, setGroupInterviews] = useState<GroupInterview[]>([]);
  const [tab, setTab] = useState<"form" | "list" | "legacy">("form");
  const [loading, setLoading] = useState(true);

  // form tạo buổi
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState<"all" | "mentor" | "mentee">("all");
  const [startAt, setStartAt] = useState("");
  const [zoomLink, setZoomLink] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [m, me, iv, gi] = await Promise.all([
        fetch("/api/coordinator/applications?kind=mentor").then((r) => r.json()),
        fetch("/api/coordinator/applications?kind=mentee").then((r) => r.json()),
        fetch("/api/interviews").then((r) => r.json()),
        fetch("/api/admin/interviews").then((r) => r.json()),
      ]);
      setMentorApps(m.applications ?? []);
      setMenteeApps(me.applications ?? []);
      setInterviews(iv.interviews ?? []);
      setGroupInterviews(gi.interviews ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function toggle(userId: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(userId)) n.delete(userId);
      else n.add(userId);
      return n;
    });
  }

  function toggleAll(apps: Application[]) {
    setSelected((s) => {
      const n = new Set(s);
      const allSelected = apps.every((a) => n.has(a.user.id));
      apps.forEach((a) => {
        if (allSelected) n.delete(a.user.id);
        else n.add(a.user.id);
      });
      return n;
    });
  }

  async function create() {
    if (!title.trim() || !startAt) {
      setMsg("Vui lòng nhập tên buổi và thời gian.");
      return;
    }
    setCreating(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          audience,
          startAt: new Date(startAt).toISOString(),
          zoomLink: zoomLink || undefined,
          attendeeIds: [...selected],
        }),
      });
      const d = await res.json();
      if (res.ok) {
        setMsg(`✅ Đã tạo buổi + gửi email cho ${d.mailed} người.`);
        setTitle("");
        setDescription("");
        setZoomLink("");
        setSelected(new Set());
        await load();
      } else {
        setMsg(d.error ?? "Có lỗi khi tạo buổi.");
      }
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <AppShell title="Phỏng vấn">
        <p style={{ color: "#292524" }}>Đang tải...</p>
      </AppShell>
    );
  }

  const applicants = [
    ...mentorApps.map((a) => ({ ...a, role: "Mentor" })),
    ...menteeApps.map((a) => ({ ...a, role: "Mentee" })),
  ].filter((a) => a.user?.id);

  return (
    <AppShell title="Phỏng vấn">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#0F766E" }}>
        Quản lý phỏng vấn & định hướng
      </h1>

      <div className="flex gap-2 mb-6">
        {(
          [
            ["form", "Tạo buổi mới"],
            ["list", "Các buổi đã tạo"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition"
            style={{
              background: tab === key ? "#0F766E" : "#fff",
              color: tab === key ? "#fff" : "#292524",
              border: "1px solid #E5E0D5",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {msg && (
        <div className="mb-4 rounded-lg px-4 py-3 text-sm" style={{ background: msg.startsWith("✅") ? "#E6F4EA" : "#FCE8E6", color: "#292524" }}>
          {msg}
        </div>
      )}

      {tab === "form" && (
        <Card>
          <h2 className="font-bold mb-4" style={{ color: "#0F766E" }}>
            Tạo buổi định hướng / phỏng vấn (nhóm chung)
          </h2>
          <div className="space-y-3">
            <Field label="Tên buổi *">
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Buổi định hướng chương trình — Mùa 2" />
            </Field>
            <Field label="Mô tả">
              <textarea className={inputCls} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Đối tượng">
                <select className={inputCls} value={audience} onChange={(e) => setAudience(e.target.value as any)}>
                  <option value="all">Tất cả</option>
                  <option value="mentor">Mentor</option>
                  <option value="mentee">Mentee</option>
                </select>
              </Field>
              <Field label="Thời gian *">
                <input type="datetime-local" className={inputCls} value={startAt} onChange={(e) => setStartAt(e.target.value)} />
              </Field>
            </div>
            <Field label="Link tham dự (Zoom)">
              <input className={inputCls} value={zoomLink} onChange={(e) => setZoomLink(e.target.value)} placeholder="https://zoom.us/j/..." />
            </Field>

            {/* Danh sách người tham dự */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold" style={{ color: "#292524" }}>
                  Danh sách người tham dự ({selected.size} đã chọn)
                </p>
                <button onClick={() => toggleAll(applicants)} className="text-xs font-semibold" style={{ color: "#0F766E" }}>
                  {applicants.every((a) => selected.has(a.user.id)) ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1.5 rounded-lg border p-2" style={{ borderColor: "#E5E0D5" }}>
                {applicants.length === 0 ? (
                  <p className="text-xs p-2" style={{ color: "#94A3B8" }}>Chưa có ứng viên.</p>
                ) : (
                  applicants.map((a) => {
                    const on = selected.has(a.user.id);
                    return (
                      <button
                        key={a.user.id}
                        type="button"
                        onClick={() => toggle(a.user.id)}
                        className="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition"
                        style={{ background: on ? "#F2F9F4" : "#fff", border: `1px solid ${on ? "#15B5B0" : "#F5F2EC"}` }}
                      >
                        <div>
                          <p className="text-sm font-medium" style={{ color: "#292524" }}>{a.user.fullName}</p>
                          <p className="text-xs" style={{ color: "#94A3B8" }}>{a.role} · {a.user.email}</p>
                        </div>
                        {on && <span style={{ color: "#15B5B0" }}>✓</span>}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={create} disabled={creating}>
                {creating ? "Đang tạo..." : "Tạo buổi & gửi email"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {tab === "list" && (
        <Card>
          <h2 className="font-bold mb-4" style={{ color: "#0F766E" }}>
            Các buổi định hướng / phỏng vấn
          </h2>
          {groupInterviews.length === 0 ? (
            <p className="text-sm" style={{ color: "#94A3B8" }}>Chưa có buổi nào.</p>
          ) : (
            <div className="space-y-3">
              {groupInterviews.map((g) => (
                <div key={g.id} className="p-4 rounded-xl border" style={{ borderColor: "#F5F2EC" }}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold" style={{ color: "#0F766E" }}>{g.title}</h3>
                    <Badge color="#D97706">{g.audience === "all" ? "Tất cả" : g.audience}</Badge>
                  </div>
                  <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
                    {g.startAt ? new Date(g.startAt).toLocaleString("vi-VN") : "Chưa xếp giờ"}
                    {g.zoomLink && <a href={g.zoomLink} target="_blank" style={{ color: "#15B5B0", marginLeft: 8 }}>Zoom</a>}
                  </p>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-semibold" style={{ color: "#292524" }}>
                      Xác nhận: <span style={{ color: "#15803D" }}>{g.counts.accepted} có</span> · <span style={{ color: "#B45309" }}>{g.counts.declined} không</span> · <span style={{ color: "#94A3B8" }}>{g.counts.pending} chờ</span> / {g.counts.total} người
                    </p>
                    {g.attendees.length > 0 && (
                      <div className="max-h-40 overflow-y-auto">
                        {g.attendees.map((at) => (
                          <div key={at.userId} className="flex justify-between text-xs py-1" style={{ color: "#292524" }}>
                            <span>{at.fullName}</span>
                            <span style={{ color: at.confirmation === "accepted" ? "#15803D" : at.confirmation === "declined" ? "#B45309" : "#94A3B8" }}>
                              {at.confirmation === "accepted" ? "✓ Có" : at.confirmation === "declined" ? "✗ Không" : "chờ"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </AppShell>
  );
}

const inputCls = "w-full px-3 py-2 rounded-lg border text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: "#292524" }}>{label}</label>
      {children}
    </div>
  );
}
