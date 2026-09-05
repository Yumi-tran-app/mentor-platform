"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
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

  if (loading) {
    return (
      <AppShell title="Đào tạo">
        <p style={{ color: "#2C335D" }}>Đang tải...</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Đào tạo">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#093774" }}>
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
            const content = audience === "mentor"
              ? TRAINING_CONTENT.find((c) => c.title === m.title)
              : MENTEE_TRAINING_CONTENT.find((c) => c.title === m.title);
            const opened = openIdx === idx;
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
                        style={{ color: done ? "#94A3B8" : "#093774" }}
                      >
                        {m.title}
                        {m.required && (
                          <span
                            className="ml-2 text-xs font-normal"
                            style={{ color: "#FF6859" }}
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
                  {!done ? (
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
                    <p className="text-sm italic mb-4" style={{ color: "#2C335D" }}>
                      {content.summary}
                    </p>
                    {content.slides.map((slide, si) => (
                      <div key={si} className="mb-4">
                        <p className="text-sm font-bold mb-2" style={{ color: "#093774" }}>
                          {si + 1}. {slide.title}
                        </p>
                        <ul className="space-y-1.5">
                          {slide.bullets.map((b, bi) => (
                            <li
                              key={bi}
                              className="flex gap-2 text-sm"
                              style={{ color: "#2C335D" }}
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
    </AppShell>
  );
}
