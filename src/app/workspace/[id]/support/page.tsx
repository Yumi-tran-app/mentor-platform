"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Button } from "@/components/ui";

export default function SupportPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!message.trim()) {
      setError("Vui lòng nhập nội dung cần hỗ trợ.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/support-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, message }),
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
        <h1 className="text-2xl font-bold mt-2 mb-6" style={{ color: "#FF6859" }}>
          Cần ĐPV hỗ trợ
        </h1>

        {success ? (
          <Card>
            <p className="text-center" style={{ color: "#15803D" }}>
              ✅ Đã gửi yêu cầu hỗ trợ. ĐPV sẽ liên hệ sớm.
            </p>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
                Mô tả vấn đề
              </h2>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border text-sm"
                style={{ borderColor: "#E5E0D5", color: "#2C335D" }}
                placeholder="Bạn đang gặp khó khăn gì? Điều phối viên sẽ giúp bạn."
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
              <Button type="submit" variant="danger" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi yêu cầu hỗ trợ"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
