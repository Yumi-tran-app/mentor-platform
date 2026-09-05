"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";

export default function MentorOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    company: "",
    title: "",
    yearsExperience: 0,
    yearsManagement: 0,
    industry: "",
    capacityMax: 1,
    reason: "",
    codeOfConduct: false,
    timeCommitment: false,
    confidentiality: false,
    availability: false,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const allCommitments =
      form.codeOfConduct &&
      form.timeCommitment &&
      form.confidentiality &&
      form.availability;
    if (!allCommitments) {
      setError("Vui lòng cam kết đầy đủ cả 4 điều khoản.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/mentor-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identity: {},
          professional: {
            company: form.company,
            title: form.title,
            yearsExperience: Number(form.yearsExperience),
            yearsManagement: Number(form.yearsManagement),
            industry: form.industry,
          },
          readiness: { reason: form.reason },
          docs: {},
          capacityMax: Number(form.capacityMax),
          commitments: {
            codeOfConduct: form.codeOfConduct,
            timeCommitment: form.timeCommitment,
            confidentiality: form.confidentiality,
            availability: form.availability,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Có lỗi xảy ra");
        return;
      }

      const appId = data.application.id;
      // Auto-submit
      const submitRes = await fetch(
        `/api/mentor-applications/${appId}/submit`,
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

  const inputCls =
    "w-full px-4 py-2.5 rounded-lg border text-sm";
  const inputStyle = { borderColor: "#E5E0D5", color: "#2C335D" };

  return (
    <div className="min-h-screen px-6 py-10" style={{ background: "#FFF3E6" }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#093774" }}>
          Đăng ký Mentor
        </h1>
        <p className="text-sm mb-8" style={{ color: "#2C335D" }}>
          Điền thông tin nghề nghiệp để tham gia chương trình.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
              Thông tin nghề nghiệp
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Công ty</label>
                <input
                  className={inputCls}
                  style={inputStyle}
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Chức danh</label>
                <input
                  className={inputCls}
                  style={inputStyle}
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Số năm kinh nghiệm
                </label>
                <input
                  type="number"
                  className={inputCls}
                  style={inputStyle}
                  value={form.yearsExperience}
                  min={0}
                  onChange={(e) => set("yearsExperience", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Số năm quản lý
                </label>
                <input
                  type="number"
                  className={inputCls}
                  style={inputStyle}
                  value={form.yearsManagement}
                  min={0}
                  onChange={(e) => set("yearsManagement", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Ngành nghề</label>
                <input
                  className={inputCls}
                  style={inputStyle}
                  value={form.industry}
                  onChange={(e) => set("industry", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Số mentee muốn đồng hành (1–3)
                </label>
                <input
                  type="number"
                  className={inputCls}
                  style={inputStyle}
                  value={form.capacityMax}
                  min={1}
                  max={3}
                  onChange={(e) => set("capacityMax", Number(e.target.value))}
                />
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
              Vì sao bạn muốn làm mentor?
            </h2>
            <textarea
              className={inputCls}
              style={inputStyle}
              rows={3}
              value={form.reason}
              onChange={(e) => set("reason", e.target.value)}
            />
          </Card>

          <Card>
            <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
              Cam kết
            </h2>
            {[
              ["codeOfConduct", "Tôi tuân thủ quy tắc ứng xử của chương trình"],
              ["timeCommitment", "Tôi cam kết dành thời gian đồng hành"],
              ["confidentiality", "Tôi cam kết bảo mật thông tin của mentee"],
              ["availability", "Tôi sẵn sàng tham gia orientation & intro call"],
            ].map(([key, label]) => (
              <label
                key={key}
                className="flex items-start gap-3 py-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={form[key as keyof typeof form] as boolean}
                  onChange={(e) =>
                    set(key as any, e.target.checked)
                  }
                />
                <span className="text-sm" style={{ color: "#2C335D" }}>
                  {label}
                </span>
              </label>
            ))}
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
