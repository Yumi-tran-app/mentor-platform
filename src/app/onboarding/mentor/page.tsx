"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";

const FOCUS_OPTIONS = [
  ["learning", "📚 Học tập"],
  ["career", "💼 Nghề nghiệp"],
  ["personal_dev", "🌱 Phát triển bản thân"],
  ["life_transition", "🔄 Chuyển tiếp giai đoạn"],
] as const;

const COMMITMENTS = [
  ["timePerMonth", "Tôi cam kết dành 1–2 giờ/tháng/mentee và duy trì xuyên suốt 9 tháng."],
  ["infoAccuracy", "Tôi cam kết thông tin kinh nghiệm tôi cung cấp là chính xác."],
  ["crossIndustry", "Tôi sẵn sàng lắng nghe và định hướng dù mentee khác ngành nghề."],
  ["respectNoImpose", "Tôi tôn trọng mentee, cởi mở và không áp đặt góc nhìn cá nhân."],
] as const;

export default function MentorOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    // Bước 1: định danh & liên hệ
    fullName: "",
    preferredName: "",
    gender: "",
    birthYear: "",
    city: "",
    email: "",
    phone: "",
    linkedin: "",
    // Bước 2: nghề nghiệp
    company: "",
    title: "",
    yearsExperience: "",
    yearsManagement: "",
    teamSize: "",
    industry: "",
    degree: "",
    school: "",
    // Bước 3: định hướng đồng hành
    mentoringFocus: [] as string[],
    // Bước 4: kinh nghiệm mentoring
    hasMentoredBefore: false,
    hasMentoredStartup: false,
    reason: "",
    // Bước 5: khả năng đồng hành & tài liệu
    capacityMax: 1,
    cvUrl: "",
    photoUrl: "",
    references: "",
    source: "",
    notes: "",
    commitText: "",
    // Bước 6: cam kết
    timePerMonth: false,
    infoAccuracy: false,
    crossIndustry: false,
    respectNoImpose: false,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleFocus(v: string) {
    setForm((f) => ({
      ...f,
      mentoringFocus: f.mentoringFocus.includes(v)
        ? f.mentoringFocus.filter((x) => x !== v)
        : [...f.mentoringFocus, v],
    }));
  }

  function stepValid(s: number): boolean {
    if (s === 1) {
      return !!form.fullName.trim() && !!form.email.trim() && !!form.phone.trim();
    }
    if (s === 2) {
      return (
        !!form.company.trim() &&
        !!form.title.trim() &&
        !!form.yearsExperience &&
        !!form.yearsManagement &&
        !!form.industry.trim() &&
        !!form.school.trim()
      );
    }
    if (s === 3) return form.mentoringFocus.length > 0;
    if (s === 4) return form.reason.trim().length >= 100;
    if (s === 5) return !!form.commitText.trim();
    if (s === 6) {
      return form.timePerMonth && form.infoAccuracy && form.crossIndustry && form.respectNoImpose;
    }
    return true;
  }

  function next() {
    if (!stepValid(step)) return;
    setStep((s) => Math.min(6, s + 1));
  }
  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/mentor-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identity: {
            fullName: form.fullName,
            preferredName: form.preferredName || form.fullName,
            gender: form.gender || undefined,
            birthYear: form.birthYear ? Number(form.birthYear) : undefined,
            city: form.city || undefined,
            email: form.email,
            phone: form.phone,
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
            school: form.school,
          },
          readiness: {
            hasMentoredBefore: form.hasMentoredBefore,
            hasMentoredStartup: form.hasMentoredStartup,
            reason: form.reason,
            mentoringFocus: form.mentoringFocus,
          },
          docs: {
            cvUrl: form.cvUrl || undefined,
            photoUrl: form.photoUrl || undefined,
            references: form.references || undefined,
            source: form.source || undefined,
            notes: form.notes || undefined,
          },
          capacityMax: Number(form.capacityMax),
          commitText: form.commitText,
          commitments: {
            timePerMonth: form.timePerMonth,
            infoAccuracy: form.infoAccuracy,
            crossIndustry: form.crossIndustry,
            respectNoImpose: form.respectNoImpose,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Có lỗi xảy ra");
        setLoading(false);
        return;
      }

      const appId = data.application.id;
      const submitRes = await fetch(
        `/api/mentor-applications/${appId}/submit`,
        { method: "PATCH" }
      );
      if (!submitRes.ok) {
        setError("Đã lưu nhưng chưa submit được, thử lại sau.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Có lỗi xảy ra");
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
        <p className="text-sm mb-4" style={{ color: "#2C335D" }}>
          Bước {step}/6 · {STEPS[step - 1]}
        </p>

        <div className="w-full h-2 rounded-full mb-8" style={{ background: "#F5F2EC" }}>
          <div className="h-2 rounded-full transition-all" style={{ width: `${(step / 6) * 100}%`, background: "#093774" }} />
        </div>

        {step === 1 && (
          <Card>
            <h2 className="font-bold mb-2" style={{ color: "#093774" }}>1. Thông tin định danh & liên hệ</h2>
            <p className="text-sm mb-4" style={{ color: "#94A3B8" }}>Thông tin dùng cho xác thực nội bộ.</p>
            <div className="mb-4 flex gap-3 p-3 rounded-lg" style={{ background: "#EEF2F9", border: "1px solid #D9E2F2" }}>
              <span className="text-lg">🔒</span>
              <p className="text-sm" style={{ color: "#2C335D" }}>
                Dữ liệu chỉ dùng nội bộ, không hiển thị công khai (ngoại trừ tên và chức danh khi đề xuất ghép cặp).
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>Họ và tên đầy đủ *</label><input className={inputCls} style={inputStyle} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} /></div>
              <div><label className={labelCls}>Tên thường gọi</label><input className={inputCls} style={inputStyle} value={form.preferredName} onChange={(e) => set("preferredName", e.target.value)} /></div>
              <div>
                <label className={labelCls}>Giới tính</label>
                <select className={inputCls} style={inputStyle} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                  <option value="">— Chọn —</option>
                  <option value="nam">Nam</option>
                  <option value="nữ">Nữ</option>
                  <option value="khác">Khác</option>
                </select>
              </div>
              <div><label className={labelCls}>Năm sinh</label><input type="number" className={inputCls} style={inputStyle} value={form.birthYear} min={1950} max={2010} onChange={(e) => set("birthYear", e.target.value)} placeholder="VD: 1985" /></div>
              <div><label className={labelCls}>Thành phố hiện tại</label><input className={inputCls} style={inputStyle} value={form.city} onChange={(e) => set("city", e.target.value)} /></div>
              <div><label className={labelCls}>Email *</label><input type="email" className={inputCls} style={inputStyle} value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
              <div><label className={labelCls}>Số điện thoại *</label><input className={inputCls} style={inputStyle} value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
              <div className="sm:col-span-2"><label className={labelCls}>LinkedIn URL</label><input className={inputCls} style={inputStyle} value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <h2 className="font-bold mb-2" style={{ color: "#093774" }}>2. Nghề nghiệp & chuyên môn</h2>
            <p className="text-sm mb-4" style={{ color: "#94A3B8" }}>Thông tin giúp đánh giá năng lực và kinh nghiệm thực tế.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>Công ty hiện tại *</label><input className={inputCls} style={inputStyle} value={form.company} onChange={(e) => set("company", e.target.value)} /></div>
              <div><label className={labelCls}>Chức danh *</label><input className={inputCls} style={inputStyle} value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
              <div><label className={labelCls}>Tổng số năm kinh nghiệm *</label><input type="number" className={inputCls} style={inputStyle} value={form.yearsExperience} min={0} onChange={(e) => set("yearsExperience", e.target.value)} /></div>
              <div><label className={labelCls}>Số năm kinh nghiệm quản lý *</label><input type="number" className={inputCls} style={inputStyle} value={form.yearsManagement} min={0} onChange={(e) => set("yearsManagement", e.target.value)} /></div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Quy mô đội ngũ lớn nhất từng quản lý</label>
                <input type="number" className={inputCls} style={inputStyle} value={form.teamSize} min={0} onChange={(e) => set("teamSize", e.target.value)} />
                <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>Số người bạn từng trực tiếp quản lý trong tổ chức (không tính cộng tác gián tiếp).</p>
              </div>
              <div><label className={labelCls}>Ngành nghề chính *</label><input className={inputCls} style={inputStyle} value={form.industry} onChange={(e) => set("industry", e.target.value)} /></div>
              <div><label className={labelCls}>Bằng cấp cao nhất</label><input className={inputCls} style={inputStyle} value={form.degree} onChange={(e) => set("degree", e.target.value)} placeholder="VD: Thạc sĩ Quản trị" /></div>
              <div className="sm:col-span-2"><label className={labelCls}>Trường đại học tốt nghiệp *</label><input className={inputCls} style={inputStyle} value={form.school} onChange={(e) => set("school", e.target.value)} /></div>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <h2 className="font-bold mb-2" style={{ color: "#093774" }}>3. Định hướng đồng hành</h2>
            <p className="text-sm mb-4" style={{ color: "#94A3B8" }}>Chọn nhóm năng lực bạn tự tin hỗ trợ tốt nhất.</p>
            <div className="space-y-2">
              {FOCUS_OPTIONS.map(([value, label]) => (
                <button key={value} type="button" onClick={() => toggleFocus(value)}
                  className="w-full text-left px-4 py-3 rounded-lg border transition"
                  style={{ borderColor: form.mentoringFocus.includes(value) ? "#093774" : "#E5E0D5", background: form.mentoringFocus.includes(value) ? "#EEF2F9" : "#fff" }}>
                  <span className="text-sm" style={{ color: "#2C335D" }}>{label}</span>
                  {form.mentoringFocus.includes(value) && <span className="float-right" style={{ color: "#093774" }}>✓</span>}
                </button>
              ))}
            </div>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <h2 className="font-bold mb-2" style={{ color: "#093774" }}>4. Kinh nghiệm mentoring & sẵn sàng</h2>
            <div className="space-y-3 mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.hasMentoredBefore} onChange={(e) => set("hasMentoredBefore", e.target.checked)} />
                <span className="text-sm" style={{ color: "#2C335D" }}>Tôi đã từng làm mentor cho cộng đồng</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.hasMentoredStartup} onChange={(e) => set("hasMentoredStartup", e.target.checked)} />
                <span className="text-sm" style={{ color: "#2C335D" }}>Tôi đã từng mentor cho SME/Startup</span>
              </label>
            </div>
            <label className={labelCls}>Lý do muốn tham gia làm mentor * (tối thiểu 100 ký tự)</label>
            <textarea className={inputCls} style={inputStyle} rows={4} value={form.reason} onChange={(e) => set("reason", e.target.value)} />
            <p className="text-xs mt-1 text-right" style={{ color: form.reason.length >= 100 ? "#15803D" : "#94A3B8" }}>
              {form.reason.length}/100
            </p>
          </Card>
        )}

        {step === 5 && (
          <Card>
            <h2 className="font-bold mb-2" style={{ color: "#093774" }}>5. Khả năng đồng hành & tài liệu bổ sung</h2>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Số lượng Mentee có thể nhận</label>
                <select className={inputCls} style={inputStyle} value={form.capacityMax} onChange={(e) => set("capacityMax", Number(e.target.value))}>
                  <option value={1}>1 mentee</option>
                  <option value={2}>2 mentee</option>
                  <option value={3}>3 mentee</option>
                </select>
              </div>
              <div><label className={labelCls}>Link CV/Bio</label><input className={inputCls} style={inputStyle} value={form.cvUrl} onChange={(e) => set("cvUrl", e.target.value)} /></div>
              <div><label className={labelCls}>Ảnh profile (URL)</label><input className={inputCls} style={inputStyle} value={form.photoUrl} onChange={(e) => set("photoUrl", e.target.value)} placeholder="https://..." /></div>
              <div><label className={labelCls}>Người giới thiệu / tham chiếu</label><input className={inputCls} style={inputStyle} value={form.references} onChange={(e) => set("references", e.target.value)} /></div>
              <div><label className={labelCls}>Nguồn biết đến chương trình</label><input className={inputCls} style={inputStyle} value={form.source} onChange={(e) => set("source", e.target.value)} /></div>
              <div><label className={labelCls}>Ghi chú gửi Core Team</label><textarea className={inputCls} style={inputStyle} rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
              <div>
                <label className={labelCls}>Lời cam kết cá nhân *</label>
                <textarea className={inputCls} style={inputStyle} rows={3} value={form.commitText} onChange={(e) => set("commitText", e.target.value)} placeholder="Tôi cam kết đồng hành với tinh thần..." />
              </div>
            </div>
          </Card>
        )}

        {step === 6 && (
          <Card>
            <h2 className="font-bold mb-2" style={{ color: "#093774" }}>6. Xác nhận & cam kết</h2>
            <p className="text-sm mb-4" style={{ color: "#94A3B8" }}>
              "Mentoring là hành trình cho đi trên tinh thần tự nguyện và tử tế. Cảm ơn bạn đã sẵn lòng đồng hành."
            </p>
            <div className="space-y-3 mb-6">
              {COMMITMENTS.map(([key, label]) => (
                <label key={key} className="flex items-start gap-3 py-1 cursor-pointer">
                  <input type="checkbox" className="mt-1" checked={form[key as keyof typeof form] as boolean} onChange={(e) => set(key as any, e.target.checked)} />
                  <span className="text-sm" style={{ color: "#2C335D" }}>{label}</span>
                </label>
              ))}
            </div>
          </Card>
        )}

        {error && (
          <div className="mt-4 rounded-lg px-4 py-3 text-sm" style={{ background: "#FCE8E6", color: "#C0392B" }}>{error}</div>
        )}

        <div className="flex justify-between mt-6">
          <button type="button" onClick={back} disabled={step === 1} className="text-sm font-medium px-4 py-2.5 rounded-full transition disabled:opacity-40" style={{ color: "#94A3B8", background: "transparent" }}>
            ← Quay lại
          </button>
          {step < 6 ? (
            <button type="button" onClick={next} disabled={!stepValid(step)} className="px-6 py-2.5 rounded-full font-semibold text-white transition disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: stepValid(step) ? "#093774" : "#CBD5E1" }}>
              Tiếp tục →
            </button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Đang gửi..." : "Hoàn tất & gửi hồ sơ"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  "Định danh & liên hệ",
  "Nghề nghiệp & chuyên môn",
  "Định hướng đồng hành",
  "Kinh nghiệm mentoring",
  "Khả năng đồng hành",
  "Xác nhận & cam kết",
];
