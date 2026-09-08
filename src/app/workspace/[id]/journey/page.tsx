"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, Button } from "@/components/ui";
import { JOURNEY_TAGS, tagLabel } from "@/lib/journey-tags";

type Entry = {
  id: string;
  category: string;
  content: string;
  tags: string[] | null;
  createdAt: string;
  author: { fullName: string };
};

export default function JourneyPage() {
  const params = useParams();
  const matchId = params.id as string;
  const [entries, setEntries] = useState<Entry[]>([]);
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [addingTag, setAddingTag] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/journey-entries?matchId=${matchId}`).then((r) =>
        r.json()
      );
      setEntries(res.entries ?? []);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    load();
  }, [load]);

  function toggleTag(key: string) {
    setSelectedTags((s) =>
      s.includes(key) ? s.filter((k) => k !== key) : [...s, key]
    );
  }

  function toggleCustomTag(tag: string) {
    setSelectedTags((s) =>
      s.includes(tag) ? s.filter((k) => k !== tag) : [...s, tag]
    );
  }

  function addCustomTag() {
    const t = customInput.trim();
    if (!t) return;
    if (!customTags.includes(t)) setCustomTags((s) => [...s, t]);
    if (!selectedTags.includes(t)) setSelectedTags((s) => [...s, t]);
    setCustomInput("");
    setAddingTag(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      await fetch("/api/journey-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, content, tags: selectedTags }),
      });
      setContent("");
      setSelectedTags([]);
      setCustomTags([]);
      await load();
    } finally {
      setSending(false);
    }
  }

  function cancel() {
    setContent("");
    setSelectedTags([]);
    setCustomTags([]);
    setCustomInput("");
    setAddingTag(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen px-6 py-10" style={{ background: "#F5F2EC" }}>
        <p style={{ color: "#292524" }}>Đang tải...</p>
      </div>
    );
  }

  // Sắp tăng dần theo thời gian để đánh số buổi
  const ascending = [...entries].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  // map id -> session number (từ 1)
  const sessionOf = new Map<string, number>();
  ascending.forEach((e, i) => sessionOf.set(e.id, i + 1));

  // Nhóm theo tháng (desc để hiển thị mới nhất trước)
  const grouped = groupByMonth(ascending);
  const monthKeys = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));

  return (
    <div className="min-h-screen px-6 py-10" style={{ background: "#F5F2EC" }}>
      <div className="max-w-2xl mx-auto">
        <Link href={`/workspace/${matchId}`} className="text-sm" style={{ color: "#0F766E" }}>
          ← Quay lại
        </Link>
        <h1 className="text-2xl font-bold mt-2 mb-2" style={{ color: "#0F766E" }}>
          Nhật ký hành trình
        </h1>
        <p className="text-sm mb-6" style={{ color: "#292524" }}>
          Ghi lại hành trình của hai bạn như một dòng thời gian — kéo xuống để đọc lại toàn bộ câu chuyện.
        </p>

        {/* Form tạo mới */}
        <Card className="mb-8">
          <form onSubmit={save} className="space-y-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 rounded-lg border text-sm"
              style={{ borderColor: "#E5E0D5", color: "#292524" }}
              placeholder="Viết suy nghĩ, đúc kết sau buổi gặp..."
            />

            {/* Gắn nhãn */}
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "#94A3B8" }}>
                Gắn nhãn để dễ tìm lại:
              </p>
              <div className="flex flex-wrap gap-2 items-center">
                {JOURNEY_TAGS.map((t) => {
                  const on = selectedTags.includes(t.key);
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => toggleTag(t.key)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition"
                      style={{
                        background: on ? "#15B5B0" : "#F5F2EC",
                        color: on ? "#fff" : "#292524",
                        border: on ? "1px solid #15B5B0" : "1px solid transparent",
                      }}
                    >
                      {t.emoji} {t.label}
                    </button>
                  );
                })}

                {/* Nhãn tuỳ chỉnh đã thêm */}
                {customTags.map((tag) => {
                  const on = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleCustomTag(tag)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition"
                      style={{
                        background: on ? "#15B5B0" : "#F5F2EC",
                        color: on ? "#fff" : "#292524",
                        border: on ? "1px solid #15B5B0" : "1px solid transparent",
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}

                {/* Thêm nhãn + */}
                {addingTag ? (
                  <span className="inline-flex items-center gap-1">
                    <input
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomTag();
                        }
                      }}
                      autoFocus
                      placeholder="Tên nhãn"
                      className="px-3 py-1.5 rounded-full border text-xs"
                      style={{ borderColor: "#E5E0D5", color: "#292524", width: 120 }}
                    />
                    <button type="button" onClick={addCustomTag} className="text-xs font-semibold" style={{ color: "#0F766E" }}>
                      OK
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAddingTag(true)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border border-dashed"
                    style={{ color: "#0F766E", borderColor: "#94A3B8" }}
                  >
                    + Thêm nhãn
                  </button>
                )}
              </div>
            </div>

            {/* Nút */}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={cancel}
                className="px-5 py-2.5 rounded-full text-sm font-semibold"
                style={{ color: "#57534E", background: "transparent", border: "1px solid #E5E0D5" }}
              >
                Hủy
              </button>
              <Button type="submit" disabled={sending || !content.trim()}>
                {sending ? "Đang lưu..." : "Lưu nhật ký"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Timeline feed (theo tháng) */}
        {entries.length === 0 ? (
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Chưa có ghi chú nào.
          </p>
        ) : (
          monthKeys.map((monthKey) => (
            <div key={monthKey} className="mb-8">
              <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: "#0F766E" }}>
                {monthKey}
              </h3>
              <div className="space-y-3">
                {grouped[monthKey].map((item) => {
                  const n = sessionOf.get(item.id) ?? 0;
                  const sessionLabel = n === 1 ? "Buổi gặp Kick-off" : `Buổi gặp số ${n}`;
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-white border"
                      style={{ borderColor: "#F5F2EC" }}
                    >
                      <p className="text-xs font-semibold" style={{ color: "#0F766E" }}>
                        {formatDay(item.createdAt)} · {sessionLabel}
                      </p>
                      <p className="text-sm mt-2 whitespace-pre-wrap" style={{ color: "#292524" }}>
                        {item.content}
                      </p>
                      {(item.tags as string[] | null)?.length ? (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {(item.tags as string[]).map((key) => (
                            <span
                              key={key}
                              className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                              style={{ background: "#E4F4F1", color: "#0F766E" }}
                            >
                              {tagLabel(key)}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <p className="text-xs mt-2" style={{ color: "#94A3B8" }}>
                        {item.author.fullName}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function groupByMonth(entries: Entry[]): Record<string, Entry[]> {
  const map: Record<string, Entry[]> = {};
  for (const e of entries) {
    const d = new Date(e.createdAt);
    const key = `Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
    (map[key] ??= []).push(e);
  }
  return map;
}
