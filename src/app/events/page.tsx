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
  registered: boolean;
  checkedIn: string | null;
  slotsLeft: number | null;
  registrationsCount: number;
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/events").then((r) => r.json());
      setEvents(res.events ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function register(id: string) {
    setMsg(null);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: id }),
    });
    const d = await res.json();
    if (res.ok) setMsg("✅ Đăng ký thành công!");
    else setMsg(d.error ?? "Có lỗi khi đăng ký");
    await load();
  }

  const money = (n: number) => (n > 0 ? n.toLocaleString("vi-VN") + "đ" : "Miễn phí");
  const fmt = (s: string | null) => (s ? new Date(s).toLocaleString("vi-VN") : "—");

  return (
    <AppShell title="Workshop / Training">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#093774" }}>
        📅 Workshop & Training
      </h1>

      {msg && (
        <div className="mb-4 rounded-lg px-4 py-3 text-sm" style={{ background: msg.startsWith("✅") ? "#E6F4EA" : "#FCE8E6", color: "#2C335D" }}>
          {msg}
        </div>
      )}

      {loading ? (
        <p style={{ color: "#2C335D" }}>Đang tải...</p>
      ) : events.length === 0 ? (
        <Card><p className="text-sm" style={{ color: "#94A3B8" }}>Chưa có workshop/training nào đang mở.</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {events.map((e) => (
            <Card key={e.id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold" style={{ color: "#093774" }}>{e.title}</h3>
                  <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
                    {e.status === "open" ? "Đang mở đăng ký" : "Đã tổ chức"}
                  </p>
                </div>
                <Badge color={e.price > 0 ? "#F2A93B" : "#15B5B0"}>{money(e.price)}</Badge>
              </div>

              {e.description && (
                <p className="text-sm mt-2" style={{ color: "#2C335D" }}>{e.description}</p>
              )}

              <div className="mt-3 space-y-1 text-sm" style={{ color: "#2C335D" }}>
                <p>🕐 {fmt(e.startAt)} → {fmt(e.endAt)}</p>
                {e.location && <p>📍 {e.location}</p>}
                {e.zoomLink && <p>💻 <a href={e.zoomLink} target="_blank" style={{ color: "#15B5B0" }}>Zoom link</a></p>}
                <p>🎟️ Đã đăng ký: {e.registrationsCount}{e.capacity > 0 ? `/${e.capacity}` : ""}{e.slotsLeft !== null && e.slotsLeft === 0 ? " (đã đủ)" : ""}</p>
              </div>

              <div className="mt-4">
                {e.status === "open" ? (
                  e.registered ? (
                    <div className="flex items-center gap-3">
                      <Badge color="#15803D">✓ Đã đăng ký</Badge>
                      {e.checkedIn && <span className="text-xs" style={{ color: "#15B5B0" }}>Đã check-in</span>}
                    </div>
                  ) : e.capacity > 0 && e.registrationsCount >= e.capacity ? (
                    <Badge color="#94A3B8">Đã đủ chỗ</Badge>
                  ) : (
                    <Button onClick={() => register(e.id)}>Đăng ký tham dự</Button>
                  )
                ) : (
                  <Badge color="#94A3B8">Đã kết thúc</Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
