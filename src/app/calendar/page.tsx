"use client";

import { useEffect, useState, useCallback } from "react";
import { AppShell, Card, Badge, Button } from "@/components/ui";

type Event = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  match: {
    mentorApplication: { user: { fullName: string } };
    menteeApplication: { user: { fullName: string } };
  };
};

type Match = {
  id: string;
  mentorApplication: { user: { fullName: string } };
  menteeApplication: { user: { fullName: string } };
};

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);

  // form state
  const [matchId, setMatchId] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");

  const load = useCallback(async () => {
    const [ev, mt] = await Promise.all([
      fetch("/api/events").then((r) => r.json()),
      fetch("/api/matches").then((r) => r.json()),
    ]);
    setEvents(ev.events ?? []);
    setMatches(mt.matches ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!matchId || !title || !date || !time) return;
    setSending(true);
    try {
      const startsAt = new Date(`${date}T${time}:00`).toISOString();
      const endsAt = new Date(new Date(`${date}T${time}:00`).getTime() + 60 * 60 * 1000).toISOString();
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, title, startsAt, endsAt, location }),
      });
      setTitle("");
      setDate("");
      setTime("");
      setLocation("");
      setShowForm(false);
      await load();
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <AppShell title="Lịch gặp">
        <p style={{ color: "#2C335D" }}>Đang tải...</p>
      </AppShell>
    );
  }

  const upcoming = events.filter((e) => new Date(e.startsAt) >= new Date());
  const past = events.filter((e) => new Date(e.startsAt) < new Date());
  const inputCls = "w-full px-4 py-2.5 rounded-lg border text-sm";
  const inputStyle = { borderColor: "#E5E0D5", color: "#2C335D" };

  return (
    <AppShell title="Lịch gặp">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#093774" }}>
          Lịch gặp
        </h1>
        <Button onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Đóng" : "+ Tạo lịch gặp"}
        </Button>
      </div>

      {/* Form tạo lịch */}
      {showForm && (
        <Card className="mb-8">
          <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
            Tạo lịch gặp mới
          </h2>
          <form onSubmit={createEvent} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Cặp đồng hành</label>
              <select
                className={inputCls}
                style={inputStyle}
                value={matchId}
                onChange={(e) => setMatchId(e.target.value)}
                required
              >
                <option value="">— Chọn cặp —</option>
                {matches.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.mentorApplication.user.fullName} ↔ {m.menteeApplication.user.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Tiêu đề</label>
              <input
                className={inputCls}
                style={inputStyle}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Buổi định hướng đầu tiên"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Ngày</label>
                <input
                  type="date"
                  className={inputCls}
                  style={inputStyle}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Giờ</label>
                <input
                  type="time"
                  className={inputCls}
                  style={inputStyle}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Địa điểm (tuỳ chọn)</label>
              <input
                className={inputCls}
                style={inputStyle}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="VD: Google Meet / Văn phòng"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={sending}>
                {sending ? "Đang tạo..." : "Tạo lịch gặp"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <section className="mb-8">
        <h2 className="font-bold mb-3" style={{ color: "#093774" }}>
          Sắp tới ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <Card>
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              Không có lịch gặp sắp tới.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-bold mb-3" style={{ color: "#94A3B8" }}>
          Đã qua ({past.length})
        </h2>
        {past.length === 0 ? (
          <Card>
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              Chưa có buổi gặp nào trong quá khứ.
            </p>
          </Card>
        ) : (
          <div className="space-y-3 opacity-70">
            {past.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function EventCard({ event }: { event: Event }) {
  const d = new Date(event.startsAt);
  const dateStr = d.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold" style={{ color: "#093774" }}>
            {event.title}
          </h3>
          <p className="text-sm mt-1" style={{ color: "#2C335D" }}>
            🗓️ {dateStr} · 🕐 {timeStr}
          </p>
          <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
            {event.match.mentorApplication.user.fullName} ↔{" "}
            {event.match.menteeApplication.user.fullName}
          </p>
          {event.location && (
            <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
              📍 {event.location}
            </p>
          )}
        </div>
        <Badge color={new Date(event.startsAt) >= new Date() ? "#15B5B0" : "#94A3B8"}>
          {new Date(event.startsAt) >= new Date() ? "Sắp diễn ra" : "Đã qua"}
        </Badge>
      </div>
    </Card>
  );
}
