"use client";

import { useEffect, useState } from "react";
import { AppShell, Card, Badge } from "@/components/ui";

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

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/events").then((r) => r.json());
    setEvents(res.events ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <AppShell title="Lịch gặp">
        <p style={{ color: "#2C335D" }}>Đang tải...</p>
      </AppShell>
    );
  }

  const upcoming = events.filter((e) => new Date(e.startsAt) >= new Date());
  const past = events.filter((e) => new Date(e.startsAt) < new Date());

  return (
    <AppShell title="Lịch gặp">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#093774" }}>
        Lịch gặp
      </h1>

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
