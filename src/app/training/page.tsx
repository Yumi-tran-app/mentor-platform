"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AppShell, Card, Button } from "@/components/ui";
import { TRAINING_CONTENT, MENTEE_TRAINING_CONTENT } from "@/lib/training-content";

type Module = { id: string; title: string; description: string | null; required: boolean };

export default function TrainingPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [audience, setAudience] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<{ score: number; status: string } | null>(null);
  const [tab, setTab] = useState<"training" | "events">("training");

  const load = useCallback(async () => {
    const res = await fetch("/api/training").then((r) => r.json());
    setModules(res.modules ?? []);
    setCompleted(res.completedIds ?? []);
    setProgress(res.progress ?? 0);
    setAudience(res.audience ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function markDone(id: string) {
    await fetch("/api/training", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId: id }),
    });
    await load();
  }

  // Lấy trạng thái bài test (cho mentor & mentee) — hiển thị bên trong module "Kiểm tra & chứng nhận"
  useEffect(() => {
    if (!audience) return;
    fetch("/api/training/test")
      .then((r) => r.json())
      .then((d) => {
        if (d?.lastAttempt) setTestStatus(d.lastAttempt);
        else setTestStatus(null);
      })
      .catch(() => {});
  }, [audience]);

  // Module "Kiểm tra & chứng nhận" là module đặc biệt: hoàn thành = pass bài test
  function isTestModule(m: Module): boolean {
    const t = m.title.toLowerCase();
    return t.includes("kiểm tra") || t.includes("chứng nhận") || t.includes("test");
  }

  if (loading) {
    return (
      <AppShell title="Đào tạo">
        <p style={{ color: "#292524" }}>Đang tải...</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Đào tạo & Workshop">
      {/* Tabs gộp: Đào tạo + Workshop/Training */}
      <div className="flex gap-2 mb-6">
        {(
          [
            ["training", "Đào tạo"],
            ["events", "Workshop/Training"],
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

      {tab === "events" ? (
        <EventsTab />
      ) : (
        <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#0F766E" }}>
          Chương trình đào tạo
        </h1>
        <span className="text-lg font-bold" style={{ color: "#15B5B0" }}>
          {progress}%
        </span>
      </div>

      <div className="w-full h-3 rounded-full mb-8" style={{ background: "#F5F2EC" }}>
        <div
          className="h-3 rounded-full transition-all"
          style={{ width: `${progress}%`, background: "#15B5B0" }}
        />
      </div>

      {modules.length === 0 ? (
        <Card>
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Chưa có module đào tạo nào trong mùa hiện tại.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {modules.map((m, idx) => {
            const done = completed.includes(m.id);
            const isTest = isTestModule(m);
            const content = audience === "mentor"
              ? TRAINING_CONTENT.find((c) => c.title === m.title)
              : MENTEE_TRAINING_CONTENT.find((c) => c.title === m.title);
            const opened = openIdx === idx;
            const testPassed = testStatus?.status === "passed";
            return (
              <Card key={m.id}>
                <div className="flex items-start justify-between gap-4">
                  <button
                    onClick={() => setOpenIdx(opened ? null : idx)}
                    className="flex items-start gap-3 text-left flex-1"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: done ? "#15B5B0" : "#94A3B8" }}
                    >
                      {done ? "✓" : idx + 1}
                    </div>
                    <div>
                      <h3
                        className="font-bold"
                        style={{ color: done ? "#94A3B8" : "#0F766E" }}
                      >
                        {m.title}
                        {m.required && (
                          <span
                            className="ml-2 text-xs font-normal"
                            style={{ color: "#B45309" }}
                          >
                            Bắt buộc
                          </span>
                        )}
                      </h3>
                      {m.description && (
                        <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
                          {m.description}
                        </p>
                      )}
                      <span className="text-xs mt-1 inline-block" style={{ color: "#15B5B0" }}>
                        {opened ? "▲ Thu gọn" : "▼ Xem nội dung"}
                      </span>
                    </div>
                  </button>

                  {/* Module "Kiểm tra & chứng nhận": hoàn thành qua bài test */}
                  {isTest ? (
                    testStatus ? (
                      <span
                        className="text-sm font-medium"
                        style={{ color: testPassed ? "#15803D" : "#B45309" }}
                      >
                        {testPassed
                          ? `✅ Hoàn thành (${testStatus.score}%)`
                          : `❌ Chưa hoàn thành (${testStatus.score}%)`}
                      </span>
                    ) : (
                      <Link href="/training/test">
                        <Button>Làm bài kiểm tra</Button>
                      </Link>
                    )
                  ) : !done ? (
                    <Button variant="secondary" onClick={() => markDone(m.id)}>
                      Hoàn thành
                    </Button>
                  ) : (
                    <span className="text-sm font-medium" style={{ color: "#15803D" }}>
                      Đã xong
                    </span>
                  )}
                </div>

                {/* Nội dung chi tiết */}
                {opened && content && (
                  <div
                    className="mt-4 pt-4 border-t"
                    style={{ borderColor: "#F5F2EC" }}
                  >
                    <p className="text-sm italic mb-4" style={{ color: "#292524" }}>
                      {content.summary}
                    </p>
                    {content.slides.map((slide, si) => (
                      <div key={si} className="mb-4">
                        <p className="text-sm font-bold mb-2" style={{ color: "#0F766E" }}>
                          {si + 1}. {slide.title}
                        </p>
                        <ul className="space-y-1.5">
                          {slide.bullets.map((b, bi) => (
                            <li
                              key={bi}
                              className="flex gap-2 text-sm"
                              style={{ color: "#292524" }}
                            >
                              <span style={{ color: "#15B5B0" }}>•</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Giấy chứng nhận đào tạo (nếu đủ điều kiện) */}
      <TrainingCertificateSection audience={audience} />
        </>
      )}
    </AppShell>
  );
}

function EventsTab() {
  const [events, setEvents] = useState<any[]>([]);
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
    <div>
      {msg && (
        <div className="mb-4 rounded-lg px-4 py-3 text-sm" style={{ background: msg.startsWith("✅") ? "#E6F4EA" : "#FCE8E6", color: "#292524" }}>
          {msg}
        </div>
      )}
      {loading ? (
        <p style={{ color: "#292524" }}>Đang tải...</p>
      ) : events.length === 0 ? (
        <Card><p className="text-sm" style={{ color: "#94A3B8" }}>Chưa có workshop/training nào đang mở.</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {events.map((e) => (
            <Card key={e.id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold" style={{ color: "#0F766E" }}>{e.title}</h3>
                  <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
                    {e.status === "open" ? "Đang mở đăng ký" : "Đã tổ chức"}
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full text-white" style={{ background: e.price > 0 ? "#D97706" : "#15B5B0" }}>
                  {money(e.price)}
                </span>
              </div>
              {e.description && <p className="text-sm mt-2" style={{ color: "#292524" }}>{e.description}</p>}
              <div className="mt-3 space-y-1 text-sm" style={{ color: "#292524" }}>
                <p>{fmt(e.startAt)} → {fmt(e.endAt)}</p>
                {e.location && <p>{e.location}</p>}
                {e.zoomLink && <p><a href={e.zoomLink} target="_blank" style={{ color: "#15B5B0" }}>Zoom link</a></p>}
                <p>Đã đăng ký: {e.registrationsCount}{e.capacity > 0 ? `/${e.capacity}` : ""}</p>
              </div>
              <div className="mt-4">
                {e.status === "open" ? (
                  e.registered ? (
                    <span className="text-sm font-medium" style={{ color: "#15803D" }}>✓ Đã đăng ký</span>
                  ) : e.capacity > 0 && e.registrationsCount >= e.capacity ? (
                    <span className="text-sm" style={{ color: "#94A3B8" }}>Đã đủ chỗ</span>
                  ) : (
                    <Button onClick={() => register(e.id)}>Đăng ký tham dự</Button>
                  )
                ) : (
                  <span className="text-sm" style={{ color: "#94A3B8" }}>Đã kết thúc</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function TrainingCertificateSection({
  audience,
}: {
  audience: string | null;
}) {
  const [cert, setCert] = useState<any>(null);

  useEffect(() => {
    if (!audience) return;
    fetch("/api/certification")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setCert(d))
      .catch(() => {});
  }, [audience]);

  if (!audience || !cert) return null;

  const certExisting = cert.certificates?.[0];

  return (
    <Card className="mt-6">
      <h2 className="font-bold mb-3" style={{ color: "#0F766E" }}>
        Chứng nhận đào tạo
      </h2>
      {certExisting ? (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: "#292524" }}>
            Bạn đã được cấp chứng nhận đào tạo (Mã: {certExisting.certificateNo}).
          </p>
          <Link href={`/certificate/${certExisting.id}`}>
            <Button>Xem chứng nhận</Button>
          </Link>
        </div>
      ) : cert.eligible ? (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: "#292524" }}>
            Bạn đã đủ điều kiện nhận chứng nhận đào tạo.
          </p>
          <Button
            onClick={async () => {
              const r = await fetch("/api/certification", { method: "POST" });
              if (r.ok) location.reload();
            }}
          >
            Nhận chứng nhận
          </Button>
        </div>
      ) : (
        <p className="text-sm" style={{ color: "#94A3B8" }}>
          Hoàn thành tất cả module bắt buộc và đạt bài kiểm tra để nhận chứng nhận đào tạo.
        </p>
      )}
    </Card>
  );
}
