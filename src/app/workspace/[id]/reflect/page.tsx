"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Button } from "@/components/ui";

const MOODS = [
  { id: "good", icon: "💚", label: "Đang kết nối tốt", color: "#E6F4EA", border: "#22C55E", ring: "rgba(34,197,94,.3)" },
  { id: "neutral", icon: "🔵", label: "Đang tìm nhịp phù hợp", color: "#F4F8FE", border: "#3B82F6", ring: "rgba(59,130,246,.3)" },
  { id: "uneasy", icon: "🟡", label: "Có điều gì đó chưa ổn", color: "#FEF9E7", border: "#F2A93B", ring: "rgba(242,169,59,.3)" },
  { id: "support_needed", icon: "🔴", label: "Cần hỗ trợ", color: "#FFF5F4", border: "#FF6859", ring: "rgba(255,104,89,.3)" },
] as const;

export default function ReflectionPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [monthNumber, setMonthNumber] = useState(1);
  const [mood, setMood] = useState<string>("good");
  const [note, setNote] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          monthNumber,
          mood,
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Có lỗi xảy ra");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/workspace"), 1500);
    } catch (err: any) {
      setError(err.message ?? "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-6 py-10" style={{ background: "#FFF3E6" }}>
      <div className="max-w-xl mx-auto">
        <Link href="/workspace" className="text-sm" style={{ color: "#093774" }}>
          ← Quay lại
        </Link>
        <h1 className="text-2xl font-bold mt-2 mb-6" style={{ color: "#093774" }}>
          Phản tư tháng
        </h1>

        {success ? (
          <Card>
            <p className="text-center" style={{ color: "#15803D" }}>
              ✅ Đã gửi phản tư. Đang quay lại...
            </p>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
                Tháng thứ mấy?
              </h2>
              <input
                type="number"
                min={1}
                max={9}
                value={monthNumber}
                onChange={(e) => setMonthNumber(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg border text-sm"
                style={{ borderColor: "#E5E0D5", color: "#2C335D" }}
              />
            </Card>

            <Card>
              <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
                Cảm nhận của bạn
              </h2>
              <div className="space-y-2">
                {MOODS.map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition"
                    style={{
                      borderColor: mood === m.id ? m.border : "#E5E0D5",
                      background: mood === m.id ? m.color : "#fff",
                      ...(mood === m.id ? { boxShadow: `0 0 0 3px ${m.ring}` } : {}),
                    }}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <input
                      type="radio"
                      name="mood"
                      className="sr-only"
                      checked={mood === m.id}
                      onChange={() => setMood(m.id)}
                    />
                    <span className="text-sm font-medium" style={{ color: "#2C335D" }}>
                      {m.label}
                    </span>
                  </label>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
                Ghi chú (tuỳ chọn)
              </h2>
              <textarea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border text-sm"
                style={{ borderColor: "#E5E0D5", color: "#2C335D" }}
                placeholder="Chia sẻ suy nghĩ của bạn..."
              />
            </Card>

            {error && (
              <div
                className="rounded-lg px-4 py-3 text-sm"
                style={{ background: "#FCE8E6", color: "#C0392B" }}
              >
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi phản tư"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
