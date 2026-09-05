"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Button } from "@/components/ui";

const MOODS = [
  ["good", "😊 Tốt"],
  ["neutral", "😐 Bình thường"],
  ["uneasy", "😟 Băn khoăn"],
  ["support_needed", "🆘 Cần hỗ trợ"],
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
                {MOODS.map(([value, label]) => (
                  <label
                    key={value}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer"
                    style={{
                      borderColor: mood === value ? "#15B5B0" : "#E5E0D5",
                      background: mood === value ? "#F2F9F4" : "#fff",
                    }}
                  >
                    <input
                      type="radio"
                      name="mood"
                      checked={mood === value}
                      onChange={() => setMood(value)}
                    />
                    <span className="text-sm" style={{ color: "#2C335D" }}>
                      {label}
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
