"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, Button, LineIcon } from "@/components/ui";
import { JOURNEY_STAGES, JOURNEY_TAGS } from "@/lib/journey-tags";

type Entry = {
  id: string;
  category: string;
  content: string;
  tags: string[] | null;
  createdAt: string;
  author: { fullName: string };
};

const STAGE_ICON: Record<string, string> = {
  fact: "users",
  insight: "bulb",
  action: "rocket",
};

export default function JourneyPage() {
  const params = useParams();
  const matchId = params.id as string;
  const [entries, setEntries] = useState<Entry[]>([]);
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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

  async function add(e: React.FormEvent) {
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
      await load();
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen px-6 py-10" style={{ background: "#F5F2EC" }}>
        <p style={{ color: "#292524" }}>Đang tải...</p>
      </div>
    );
  }

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
          Viết tự do về buổi trò chuyện của bạn, sau đó gắn 1 hoặc nhiều nhãn trước khi lưu.
        </p>

        {/* Form thêm */}
        <Card className="mb-8">
          <h2 className="font-bold mb-3" style={{ color: "#0F766E" }}>
            Thêm vào nhật ký
          </h2>
          <form onSubmit={add} className="space-y-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border text-sm"
              style={{ borderColor: "#E5E0D5", color: "#292524" }}
              placeholder="Hôm nay bạn đã gặp ai, làm gì, nhận ra điều gì, và bước tiếp theo là gì?"
            />

            {/* Tags theo 3 giai đoạn */}
            <div className="space-y-3">
              <p className="text-xs font-semibold" style={{ color: "#94A3B8" }}>
                Gắn nhãn cho bài viết (có thể chọn nhiều):
              </p>
              {JOURNEY_STAGES.map((stage) => (
                <div key={stage.key}>
                  <p className="text-xs font-bold mb-1 flex items-center gap-1.5" style={{ color: "#0F766E" }}>
                    <LineIcon name={STAGE_ICON[stage.key] as any} size={14} />
                    {stage.label}
                    <span className="font-normal" style={{ color: "#C0C5CE" }}>
                      · {stage.hint}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {JOURNEY_TAGS.filter((t) => t.stage === stage.key).map((t) => {
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
                          {on ? "✓ " : ""}
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={sending || !content.trim()}>
                {sending ? "Đang lưu..." : "Lưu vào nhật ký"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Hiển thị theo 3 giai đoạn */}
        {JOURNEY_STAGES.map((stage) => {
          const stageTags = JOURNEY_TAGS.filter((t) => t.stage === stage.key).map(
            (t) => t.key
          );
          const items = entries.filter((e) => {
            const tags = (e.tags as string[] | null) ?? [];
            if (tags.length > 0) return tags.some((k) => stageTags.includes(k));
            // fallback: entry cũ chưa có tags -> dùng category
            return stageCategoryMatch(e.category, stage.key);
          });
          return (
            <div key={stage.key} className="mb-6">
              <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: "#0F766E" }}>
                <LineIcon name={STAGE_ICON[stage.key] as any} size={16} /> {stage.label}
                <span className="text-xs font-normal" style={{ color: "#94A3B8" }}>
                  ({items.length})
                </span>
              </h3>
              {items.length === 0 ? (
                <p className="text-xs" style={{ color: "#C0C5CE" }}>
                  Chưa có ghi chú nào.
                </p>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg bg-white border"
                      style={{ borderColor: "#F5F2EC" }}
                    >
                      <p className="text-sm" style={{ color: "#292524" }}>
                        {item.content}
                      </p>
                      {renderEntryTags(item)}
                      <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
                        {item.author.fullName} ·{" "}
                        {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function stageCategoryMatch(category: string, stage: string): boolean {
  if (stage === "fact") return category === "met" || category === "tried";
  if (stage === "insight") return category === "realized";
  if (stage === "action") return category === "next";
  return false;
}

function renderEntryTags(item: Entry) {
  const tags = (item.tags as string[] | null) ?? [];
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {tags.map((key) => {
        const t = JOURNEY_TAGS.find((x) => x.key === key);
        if (!t) return null;
        return (
          <span
            key={key}
            className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
            style={{ background: "#E4F4F1", color: "#0F766E" }}
          >
            {t.label}
          </span>
        );
      })}
    </div>
  );
}
