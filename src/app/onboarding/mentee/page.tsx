"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";

const NEEDS = [
  ["learning", "📚 Học tập (kiến thức chuyên môn)"],
  ["career", "💼 Sự nghiệp (định hướng, thăng tiến)"],
  ["personal_dev", "🌱 Phát triển cá nhân"],
  ["life_transition", "🔄 Chuyển đổi giai đoạn cuộc đời"],
] as const;

export default function MenteeOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    major: "",
    school: "",
    city: "",
    goalText: "",
    needs: [] as string[],
  });

  function toggleNeed(n: string) {
    setForm((f) => ({
      ...f,
      needs: f.needs.includes(n)
        ? f.needs.filter((x) => x !== n)
        : [...f.needs, n],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.needs.length === 0) {
      setError("Vui lòng chọn ít nhất 1 nhu cầu.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/mentee-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identity: {},
          profile: {
            major: form.major,
            school: form.school,
            city: form.city,
          },
          goalText: form.goalText,
          needs: form.needs,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Có lỗi xảy ra");
        return;
      }

      const appId = data.application.id;
      const submitRes = await fetch(
        `/api/mentee-applications/${appId}/submit`,
        { method: "PATCH" }
      );
      if (!submitRes.ok) {
        setError("Đã lưu nhưng chưa submit được, thử lại sau.");
        return;
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full px-4 py-2.5 rounded-lg border text-sm";
  const inputStyle = { borderColor: "#E5E0D5", color: "#2C335D" };

  return (
    <div className="min-h-screen px-6 py-10" style={{ background: "#FFF3E6" }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#15B5B0" }}>
          Đăng ký Mentee
        </h1>
        <p className="text-sm mb-8" style={{ color: "#2C335D" }}>
          Cho chúng tôi biết về bạn và điều bạn mong muốn.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
              Thông tin học tập
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Ngành học</label>
                <input
                  className={inputCls}
                  style={inputStyle}
                  value={form.major}
                  onChange={(e) => setForm({ ...form, major: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Trường</label>
                <input
                  className={inputCls}
                  style={inputStyle}
                  value={form.school}
                  onChange={(e) => setForm({ ...form, school: e.target.value })}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium block mb-1">Thành phố</label>
                <input
                  className={inputCls}
                  style={inputStyle}
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
              Mục tiêu & nhu cầu
            </h2>
            <label className="text-sm font-medium block mb-1">
              Mục tiêu của bạn
            </label>
            <textarea
              className={inputCls}
              style={inputStyle}
              rows={3}
              value={form.goalText}
              onChange={(e) => setForm({ ...form, goalText: e.target.value })}
            />

            <label className="text-sm font-medium block mb-2 mt-4">
              Bạn cần hỗ trợ những gì?
            </label>
            <div className="space-y-2">
              {NEEDS.map(([value, label]) => (
                <label
                  key={value}
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer"
                  style={{
                    borderColor: form.needs.includes(value)
                      ? "#15B5B0"
                      : "#E5E0D5",
                    background: form.needs.includes(value) ? "#F2F9F4" : "#fff",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.needs.includes(value)}
                    onChange={() => toggleNeed(value)}
                  />
                  <span className="text-sm" style={{ color: "#2C335D" }}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
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
              {loading ? "Đang gửi..." : "Gửi đơn đăng ký"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
