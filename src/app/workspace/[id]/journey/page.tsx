"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, Button } from "@/components/ui";

const CATEGORIES: { id: string; icon: string; label: string }[] = [
  { id: "met", icon: "👥", label: "Người đã gặp" },
  { id: "explored", icon: "🔍", label: "Điều đã cùng khám phá" },
  { id: "realized", icon: "💡", label: "Điều đã nhận ra" },
  { id: "changed", icon: "🔄", label: "Điều đã thay đổi" },
  { id: "tried", icon: "🧪", label: "Điều đã thử" },
  { id: "next", icon: "🚀", label: "Điều tiếp theo" },
];

type Entry = {
  id: string;
  category: string;
  content: string;
  createdAt: string;
  author: { fullName: string };
};

export default function JourneyPage() {
  const params = useParams();
  const matchId = params.id as string;
  const [entries, setEntries] = useState<Entry[]>([]);
  const [category, setCategory] = useState("met");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/journey?matchId=${matchId}`).then((r) => r.json());
    setEntries(res.entries ?? []);
    setLoading(false);
  }, [matchId]);

  useEffect(() => {
    load();
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      await fetch("/api/journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, category, content }),
      });
      setContent("");
      await load();
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen px-6 py-10" style={{ background: "#FFF3E6" }}>
        <p style={{ color: "#2C335D" }}>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10" style={{ background: "#FFF3E6" }}>
      <div className="max-w-2xl mx-auto">
        <Link href={`/workspace/${matchId}`} className="text-sm" style={{ color: "#093774" }}>
          ← Quay lại
        </Link>
        <h1 className="text-2xl font-bold mt-2 mb-2" style={{ color: "#093774" }}>
          Nhật ký hành trình
        </h1>
        <p className="text-sm mb-6" style={{ color: "#2C335D" }}>
          Ghi lại hành trình của hai bạn — những gì đã cùng nhau trải qua và nhận ra.
        </p>

        {/* Form thêm */}
        <Card className="mb-8">
          <h2 className="font-bold mb-3" style={{ color: "#093774" }}>
            Thêm vào nhật ký
          </h2>
          <form onSubmit={add} className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition"
                  style={{
                    background: category === c.id ? "#093774" : "#F5F2EC",
                    color: category === c.id ? "#fff" : "#2C335D",
                  }}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border text-sm"
              style={{ borderColor: "#E5E0D5", color: "#2C335D" }}
              placeholder={`Ghi ${CATEGORIES.find((c) => c.id === category)?.label.toLowerCase()}...`}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={sending || !content.trim()}>
                {sending ? "Đang lưu..." : "Lưu vào nhật ký"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Hiển thị theo category */}
        {CATEGORIES.map((cat) => {
          const items = entries.filter((e) => e.category === cat.id);
          return (
            <div key={cat.id} className="mb-6">
              <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: "#093774" }}>
                <span>{cat.icon}</span> {cat.label}
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
                      <p className="text-sm" style={{ color: "#2C335D" }}>
                        {item.content}
                      </p>
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
