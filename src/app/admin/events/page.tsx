"use client";

import { useEffect, useState } from "react";
import { AppShell, Card, Button, Badge } from "@/components/ui";

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  audience: string;
  status: string;
  startAt: string | null;
  endAt: string | null;
  location: string | null;
  zoomLink: string | null;
  price: number;
  capacity: number;
  checkInCode: string | null;
  createdAt: string;
  _count: { registrations: number };
};

type Stats = { total: number; open: number; draft: number; completed: number; totalRegistrations: number };

const STATUS_LABEL: Record<string, string> = {
  draft: "Nháp",
  open: "Đang mở",
  completed: "Đã tổ chức",
};
const STATUS_COLOR: Record<string, string> = {
  draft: "#94A3B8",
  open: "#15803D",
  completed: "#0D2B45",
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  // form state
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [form, setForm] = useState({ title: "", description: "", audience: "all", startAt: "", endAt: "", location: "", zoomLink: "", price: 0, capacity: 0 });

  // detail modal
  const [detail, setDetail] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== "all") params.set("status", filter);
    if (q) params.set("q", q);
    const res = await fetch(`/api/admin/events?${params}`).then((r) => r.json());
    setEvents(res.events ?? []);
    setStats(res.stats ?? null);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [filter]);

  function openCreate() {
    setEditing(null);
    setForm({ title: "", description: "", audience: "all", startAt: "", endAt: "", location: "", zoomLink: "", price: 0, capacity: 0 });
    setShowForm(true);
  }

  function openEdit(e: EventItem) {
    setEditing(e);
    setForm({
      title: e.title,
      description: e.description ?? "",
      audience: e.audience,
      startAt: e.startAt ? e.startAt.slice(0, 16) : "",
      endAt: e.endAt ? e.endAt.slice(0, 16) : "",
      location: e.location ?? "",
      zoomLink: e.zoomLink ?? "",
      price: e.price,
      capacity: e.capacity,
    });
    setShowForm(true);
  }

  async function save(action: "draft" | "publish") {
    const payload = {
      ...form,
      price: Number(form.price) || 0,
      capacity: Number(form.capacity) || 0,
      startAt: form.startAt ? new Date(form.startAt).toISOString() : null,
      endAt: form.endAt ? new Date(form.endAt).toISOString() : null,
      action,
    };
    if (editing) {
      await fetch(`/api/admin/events/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setShowForm(false);
    load();
  }

  async function viewDetail(id: string) {
    const res = await fetch(`/api/admin/events/${id}`).then((r) => r.json());
    setDetail(res);
  }

  async function doDelete(id: string) {
    await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    setConfirmDelete(null);
    load();
  }

  async function closeEvent(id: string) {
    await fetch(`/api/admin/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "close" }),
    });
    load();
  }

  const fmt = (s: string | null) => (s ? new Date(s).toLocaleString("vi-VN") : "—");
  const money = (n: number) => (n > 0 ? n.toLocaleString("vi-VN") + "đ" : "Miễn phí");

  return (
    <AppShell title="Quản lý Workshop/Training">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#093774" }}>
          📅 Workshop / Training
        </h1>
        <Button onClick={openCreate}>+ Tạo Workshop/Training</Button>
      </div>

      {/* Dashboard thống kê */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatBox label="Tổng" value={stats?.total ?? 0} color="#093774" />
        <StatBox label="Đang mở" value={stats?.open ?? 0} color="#15803D" />
        <StatBox label="Nháp" value={stats?.draft ?? 0} color="#94A3B8" />
        <StatBox label="Đã tổ chức" value={stats?.completed ?? 0} color="#0D2B45" />
        <StatBox label="Tổng đăng ký" value={stats?.totalRegistrations ?? 0} color="#FF7A59" />
      </div>

      {/* Tìm kiếm & lọc */}
      <div className="flex gap-3 mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Tìm theo tên..."
          className="flex-1 px-4 py-2 rounded-lg border text-sm"
          style={{ borderColor: "#E5E0D5", color: "#2C335D" }}
        />
        <Button variant="secondary" onClick={load}>Tìm</Button>
        {["all", "open", "draft", "completed"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-4 py-2 rounded-full text-sm font-semibold"
            style={{
              background: filter === s ? "#093774" : "#fff",
              color: filter === s ? "#fff" : "#2C335D",
              border: "1px solid #E5E0D5",
            }}
          >
            {s === "all" ? "Tất cả" : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {/* Danh sách */}
      {loading ? (
        <p style={{ color: "#2C335D" }}>Đang tải...</p>
      ) : events.length === 0 ? (
        <Card><p className="text-sm" style={{ color: "#94A3B8" }}>Chưa có workshop/training nào.</p></Card>
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <Card key={e.id}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold" style={{ color: "#093774" }}>{e.title}</h3>
                    <Badge color={STATUS_COLOR[e.status]}>{STATUS_LABEL[e.status]}</Badge>
                  </div>
                  <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
                    {fmt(e.startAt)} · {money(e.price)} · {e.capacity > 0 ? `Giới hạn ${e.capacity}` : "Không giới hạn"}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium" style={{ color: "#2C335D" }}>
                  🎟️ {e._count.registrations}{e.capacity > 0 ? `/${e.capacity}` : ""}
                </div>
                <div className="flex items-center gap-1">
                  <IconBtn title="Xem chi tiết" onClick={() => viewDetail(e.id)}>👁️</IconBtn>
                  <IconBtn title="Chỉnh sửa" onClick={() => openEdit(e)}>✏️</IconBtn>
                  <IconBtn title="Xóa" onClick={() => setConfirmDelete(e.id)}>🗑️</IconBtn>
                  {e.status === "open" && e.checkInCode && (
                    <IconBtn title={`Mã check-in: ${e.checkInCode}`} onClick={() => viewDetail(e.id)}>🔳</IconBtn>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <Modal title={editing ? "Chỉnh sửa Workshop/Training" : "Tạo mới Workshop/Training"} onClose={() => setShowForm(false)}>
          <div className="space-y-3">
            <Field label="Tên Workshop/Training *">
              <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Mô tả">
              <textarea className={inputCls} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Danh mục / Đối tượng">
                <select className={inputCls} value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                  <option value="all">Tất cả</option>
                  <option value="mentor">Mentor</option>
                  <option value="mentee">Mentee</option>
                </select>
              </Field>
              <Field label="Giá vé (đ)">
                <input type="number" className={inputCls} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Thời gian bắt đầu">
                <input type="datetime-local" className={inputCls} value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} />
              </Field>
              <Field label="Thời gian kết thúc">
                <input type="datetime-local" className={inputCls} value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Địa điểm">
                <input className={inputCls} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </Field>
              <Field label="Zoom link">
                <input className={inputCls} value={form.zoomLink} onChange={(e) => setForm({ ...form, zoomLink: e.target.value })} />
              </Field>
            </div>
            <Field label="Giới hạn số lượng đăng ký (0 = không giới hạn)">
              <input type="number" className={inputCls} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
            </Field>
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => save("draft")}>💾 Lưu nháp</Button>
              <Button onClick={() => save("publish")}>🚀 Xuất bản / Đăng</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Detail modal */}
      {detail && (
        <Modal title="Chi tiết Workshop/Training" onClose={() => setDetail(null)}>
          <div className="space-y-3 text-sm" style={{ color: "#2C335D" }}>
            <p><b>Tên:</b> {detail.event.title}</p>
            <p><b>Trạng thái:</b> <Badge color={STATUS_COLOR[detail.event.status]}>{STATUS_LABEL[detail.event.status]}</Badge></p>
            <p><b>Thời gian:</b> {fmt(detail.event.startAt)} → {fmt(detail.event.endAt)}</p>
            <p><b>Địa điểm:</b> {detail.event.location || "—"} · <b>Zoom:</b> {detail.event.zoomLink || "—"}</p>
            <p><b>Giá:</b> {money(detail.event.price)}</p>
            <p><b>Đăng ký:</b> {detail.filled} · <b>Check-in:</b> {detail.checkedIn}/{detail.checkedTotal}</p>
            {detail.event.checkInCode && (
              <div className="p-3 rounded-lg" style={{ background: "#F2F9F4" }}>
                <p><b>Mã Check-in:</b> <span style={{ fontSize: 18, letterSpacing: 2, color: "#093774", fontWeight: 700 }}>{detail.event.checkInCode}</span></p>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${detail.event.checkInCode}`}
                  alt="QR check-in"
                  width={160}
                  height={160}
                />
              </div>
            )}
            <div>
              <p className="font-bold mb-1">Học viên đã đăng ký ({detail.event.registrations?.length ?? 0}):</p>
              {detail.event.registrations?.length === 0 ? (
                <p className="text-xs" style={{ color: "#94A3B8" }}>Chưa có ai đăng ký.</p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {detail.event.registrations.map((r: any) => (
                    <div key={r.id} className="flex justify-between text-xs">
                      <span>{r.user.fullName} ({r.user.email})</span>
                      <span style={{ color: r.checkedInAt ? "#15803D" : "#94A3B8" }}>
                        {r.checkedInAt ? "✓ đã check-in" : "chưa check-in"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {detail.event.status === "open" && (
              <Button variant="danger" onClick={() => { closeEvent(detail.event.id); setDetail(null); }}>Đóng & chuyển sang Đã tổ chức</Button>
            )}
          </div>
        </Modal>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <Modal title="Xác nhận xóa" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm mb-4" style={{ color: "#2C335D" }}>
            Bạn chắc chắn muốn xóa workshop/training này? Hành động không thể hoàn tác.
          </p>
          <div className="flex gap-3">
            <Button variant="danger" onClick={() => doDelete(confirmDelete)}>Xóa</Button>
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Hủy</Button>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}

const inputCls = "w-full px-3 py-2 rounded-lg border text-sm";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: "#2C335D" }}>{label}</label>
      {children}
    </div>
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
function IconBtn({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button title={title} onClick={onClick} className="w-9 h-9 rounded-lg flex items-center justify-center text-base hover:bg-gray-100">
      {children}
    </button>
  );
}
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(9,55,116,.5)" }}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: "#093774" }}>{title}</h2>
          <button onClick={onClose} className="text-2xl leading-none" style={{ color: "#94A3B8" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
