"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";

export default function MentorOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    // identity
    preferredName: "",
    gender: "",
    birthYear: "",
    city: "",
    linkedin: "",
    // professional
    company: "",
    title: "",
    yearsExperience: "",
    yearsManagement: "",
    teamSize: "",
    industry: "",
    degree: "",
    school: "",
    // readiness
    hasMentoredBefore: false,
    hasMentoredStartup: false,
    reason: "",
    readyForOrientation: false,
    readyForIntroCall: false,
    // docs
    cvUrl: "",
    references: "",
    source: "",
    // capacity
    capacityMax: 1,
    // commitments
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
          identity: {
            fullName: form.preferredName || undefined,
            preferredName: form.preferredName || undefined,
            gender: form.gender || undefined,
            birthYear: form.birthYear ? Number(form.birthYear) : undefined,
            city: form.city || undefined,
            linkedin: form.linkedin || undefined,
          },
          professional: {
            company: form.company,
            title: form.title,
            yearsExperience: Number(form.yearsExperience) || 0,
            yearsManagement: Number(form.yearsManagement) || 0,
            teamSize: form.teamSize ? Number(form.teamSize) : undefined,
            industry: form.industry,
            degree: form.degree || undefined,
            school: form.school || undefined,
          },
          readiness: {
            hasMentoredBefore: form.hasMentoredBefore,
            hasMentoredStartup: form.hasMentoredStartup,
            reason: form.reason,
            readyForOrientation: form.readyForOrientation,
            readyForIntroCall: form.readyForIntroCall,
          },
          docs: {
            cvUrl: form.cvUrl || undefined,
            references: form.references || undefined,
            source: form.source || undefined,
          },
          capacityMax: Number(form.capacityMax),
          commitText: form.reason || undefined,
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

  const inputCls = "w-full px-4 py-2.5 rounded-lg border text-sm";
  const inputStyle = { borderColor: "#E5E0D5", color: "#2C335D" };
  const labelCls = "text-sm font-medium block mb-1";

  return (
    <div className="min-h-screen px-6 py-10" style={{ background: "#FFF3E6" }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#093774" }}>
          Đăng ký trở thành Mentor
        </h1>
        <p className="text-sm mb-8" style={{ color: "#2C335D" }}>
          Cảm ơn bạn muốn đồng hành! Hãy điền đầy đủ thông tin để chúng tôi hiểu
          rõ và ghép cặp phù hợp nhất.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
              1. Thông tin cá nhân
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Tên muốn gọi</label>
                <input className={inputCls} style={inputStyle} value={form.preferredName} onChange={(e) => set("preferredName", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Giới tính</label>
                <select className={inputCls} style={inputStyle} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                  <option value="">— Chọn —</option>
                  <option value="nam">Nam</option>
                  <option value="nữ">Nữ</option>
                  <option value="khác">Khác</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Năm sinh</label>
                <input type="number" className={inputCls} style={inputStyle} value={form.birthYear} min={1950} max={2010} onChange={(e) => set("birthYear", e.target.value)} placeholder="VD: 1985" />
              </div>
              <div>
                <label className={labelCls}>Thành phố đang sống</label>
                <input className={inputCls} style={inputStyle} value={form.city} onChange={(e) => set("city", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>LinkedIn (URL)</label>
                <input className={inputCls} style={inputStyle} value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." />
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
              2. Kinh nghiệm nghề nghiệp
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Công ty hiện tại *</label>
                <input className={inputCls} style={inputStyle} value={form.company} onChange={(e) => set("company", e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Chức danh *</label>
                <input className={inputCls} style={inputStyle} value={form.title} onChange={(e) => set("title", e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Số năm kinh nghiệm *</label>
                <input type="number" className={inputCls} style={inputStyle} value={form.yearsExperience} min={0} onChange={(e) => set("yearsExperience", e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Số năm quản lý người</label>
                <input type="number" className={inputCls} style={inputStyle} value={form.yearsManagement} min={0} onChange={(e) => set("yearsManagement", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Quy mô đội ngũ (quản lý trực tiếp)</label>
                <input type="number" className={inputCls} style={inputStyle} value={form.teamSize} min={0} onChange={(e) => set("teamSize", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Ngành nghề *</label>
                <input className={inputCls} style={inputStyle} value={form.industry} onChange={(e) => set("industry", e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Bằng cấp cao nhất</label>
                <input className={inputCls} style={inputStyle} value={form.degree} onChange={(e) => set("degree", e.target.value)} placeholder="VD: Thạc sĩ Quản trị" />
              </div>
              <div>
                <label className={labelCls}>Trường (nếu có)</label>
                <input className={inputCls} style={inputStyle} value={form.school} onChange={(e) => set("school", e.target.value)} />
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
              3. Mức độ sẵn sàng
            </h2>
            <div className="space-y-3 mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.hasMentoredBefore} onChange={(e) => set("hasMentoredBefore", e.target.checked)} />
                <span className="text-sm" style={{ color: "#2C335D" }}>Tôi đã từng làm mentor trước đây</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.hasMentoredStartup} onChange={(e) => set("hasMentoredStartup", e.target.checked)} />
                <span className="text-sm" style={{ color: "#2C335D" }}>Tôi đã từng mentor cho SME/startup</span>
              </label>
            </div>
            <label className={labelCls}>Vì sao bạn muốn làm mentor?</label>
            <textarea className={inputCls} style={inputStyle} rows={4} value={form.reason} onChange={(e) => set("reason", e.target.value)} />
          </Card>

          <Card>
            <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
              4. Hồ sơ bổ sung
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelCls}>Link CV (Google Drive/Dropbox)</label>
                <input className={inputCls} style={inputStyle} value={form.cvUrl} onChange={(e) => set("cvUrl", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Người tham chiếu (họ tên, chức vụ)</label>
                <input className={inputCls} style={inputStyle} value={form.references} onChange={(e) => set("references", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Bạn biết đến chương trình từ đâu?</label>
                <input className={inputCls} style={inputStyle} value={form.source} onChange={(e) => set("source", e.target.value)} />
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
              5. Cam kết đồng hành
            </h2>
            <div className="mb-4">
              <label className={labelCls}>Số mentee bạn muốn đồng hành (1–3)</label>
              <input type="number" className={inputCls} style={inputStyle} value={form.capacityMax} min={1} max={3} onChange={(e) => set("capacityMax", Number(e.target.value))} />
            </div>
            {[
              ["codeOfConduct", "Tôi tuân thủ quy tắc ứng xử của chương trình"],
              ["timeCommitment", "Tôi cam kết dành thời gian đồng hành xuyên suốt mùa"],
              ["confidentiality", "Tôi cam kết bảo mật thông tin của mentee"],
              ["availability", "Tôi sẵn sàng tham gia orientation & intro call"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-start gap-3 py-2 cursor-pointer">
                <input type="checkbox" className="mt-1" checked={form[key as keyof typeof form] as boolean} onChange={(e) => set(key as any, e.target.checked)} />
                <span className="text-sm" style={{ color: "#2C335D" }}>{label}</span>
              </label>
            ))}
          </Card>

          {error && (
            <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "#FCE8E6", color: "#C0392B" }}>
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
