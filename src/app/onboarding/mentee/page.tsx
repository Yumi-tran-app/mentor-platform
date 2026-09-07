"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";

const NEEDS = [
  ["learning", "📚 Học tập"],
  ["career", "💼 Nghề nghiệp"],
  ["personal_dev", "🌱 Phát triển bản thân"],
  ["life_transition", "🔄 Chuyển tiếp giai đoạn"],
] as const;

const CONSENTS = [
  "Đồng ý để nền tảng trích dẫn ngắn gọn nhu cầu của tôi nhằm hiển thị cho mentor (phục vụ tính năng \"Vì sao ghép cặp này\").",
  "Tôi hiểu rằng thông tin tôi chia sẻ được giữ riêng tư, trừ trường hợp liên quan đến an toàn.",
  "Tôi nắm được quyền yêu cầu ghép cặp lại bất cứ lúc nào mà không bị ghi nhận tiêu cực vào hồ sơ.",
  "Tôi đồng ý tham gia một buổi phỏng vấn ngắn với Đội phỏng vấn trước khi ghép cặp chính thức.",
];

export default function MenteeOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    // Bước 1: thông tin xác thực
    fullName: "",
    studentId: "",
    schoolEmail: "",
    phone: "",
    // Bước 2: demographics
    major: "",
    school: "",
    yearOfStudy: "",
    city: "",
    // Bước 3: nhu cầu
    needs: [] as string[],
    // Bước 4: mục tiêu
    goalText: "",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleNeed(n: string) {
    setForm((f) => ({
      ...f,
      needs: f.needs.includes(n)
        ? f.needs.filter((x) => x !== n)
        : [...f.needs, n],
    }));
  }

  // Validate từng bước
  function stepValid(s: number): boolean {
    if (s === 1) {
      return !!form.fullName.trim() && !!form.studentId.trim() && !!form.schoolEmail.trim() && !!form.phone.trim();
    }
    if (s === 2) {
      return !!form.major.trim() && !!form.school.trim() && !!form.yearOfStudy.trim() && !!form.city.trim();
    }
    if (s === 3) return form.needs.length > 0;
    if (s === 4) return !!form.goalText.trim();
    return true; // bước 5 luôn cho phép xác nhận
  }

  function next() {
    if (!stepValid(step)) return;
    setStep((s) => Math.min(5, s + 1));
  }

  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/mentee-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identity: {
            fullName: form.fullName,
            studentId: form.studentId,
            email: form.schoolEmail,
            phone: form.phone,
          },
          profile: {
            major: form.major,
            school: form.school,
            yearOfStudy: Number(form.yearOfStudy) || undefined,
            city: form.city,
          },
          goalText: form.goalText,
          needs: form.needs,
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
        `/api/mentee-applications/${appId}/submit`,
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

  const progressPct = (step / 5) * 100;

  return (
    <div className="min-h-screen px-6 py-10" style={{ background: "#FFF3E6" }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#15B5B0" }}>
          Đăng ký Mentee
        </h1>
        <p className="text-sm mb-4" style={{ color: "#2C335D" }}>
          Bước {step}/5 · {STEPS[step - 1]}
        </p>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full mb-8" style={{ background: "#F5F2EC" }}>
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: `${progressPct}%`, background: "#15B5B0" }}
          />
        </div>

        {step === 1 && (
          <Card>
            <h2 className="font-bold mb-2" style={{ color: "#093774" }}>
              1. Thông tin xác thực
            </h2>
            <p className="text-sm mb-4" style={{ color: "#94A3B8" }}>
              Chúng tôi cần xác minh bạn đang là sinh viên theo học.
            </p>

            <div className="mb-4 flex gap-3 p-3 rounded-lg" style={{ background: "#F2F9F4", border: "1px solid #D1E7D9" }}>
              <span className="text-lg">🛡️</span>
              <p className="text-sm" style={{ color: "#2C335D" }}>
                Khuyến khích sử dụng email có đuôi <b>@edu</b> hoặc <b>@*.edu.vn</b> để xác thực diễn ra thuận lợi. Thông tin này <b>không hiển thị công khai</b>.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Họ và tên đầy đủ *</label>
                <input className={inputCls} style={inputStyle} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="VD: Trần Văn An" />
              </div>
              <div>
                <label className={labelCls}>Mã số sinh viên *</label>
                <input className={inputCls} style={inputStyle} value={form.studentId} onChange={(e) => set("studentId", e.target.value)} placeholder="VD: 21346678" />
              </div>
              <div>
                <label className={labelCls}>Email trường *</label>
                <input type="email" className={inputCls} style={inputStyle} value={form.schoolEmail} onChange={(e) => set("schoolEmail", e.target.value)} placeholder="VD: tva@email.com" />
              </div>
              <div>
                <label className={labelCls}>Số điện thoại *</label>
                <input className={inputCls} style={inputStyle} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="VD: 0987432567" />
              </div>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <h2 className="font-bold mb-2" style={{ color: "#093774" }}>
              2. Thông tin cá nhân
            </h2>
            <p className="text-sm mb-4" style={{ color: "#94A3B8" }}>
              Giúp chúng tôi tìm mentor ở gần bạn.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Ngành học *</label>
                <input className={inputCls} style={inputStyle} value={form.major} onChange={(e) => set("major", e.target.value)} placeholder="VD: Công nghệ thông tin" />
              </div>
              <div>
                <label className={labelCls}>Trường *</label>
                <input className={inputCls} style={inputStyle} value={form.school} onChange={(e) => set("school", e.target.value)} placeholder="VD: ĐH Bách Khoa TP.HCM" />
              </div>
              <div>
                <label className={labelCls}>Năm học</label>
                <select className={inputCls} style={inputStyle} value={form.yearOfStudy} onChange={(e) => set("yearOfStudy", e.target.value)}>
                  <option value="">— Chọn —</option>
                  {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>Năm {n}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Thành phố</label>
                <input className={inputCls} style={inputStyle} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="VD: TP. Hồ Chí Minh" />
              </div>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <h2 className="font-bold mb-2" style={{ color: "#093774" }}>
              3. Bạn cần hỗ trợ điều gì?
            </h2>
            <p className="text-sm mb-4" style={{ color: "#94A3B8" }}>
              Chọn một hoặc nhiều nhóm vấn đề bạn muốn được đồng hành.
            </p>
            <div className="space-y-2">
              {NEEDS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleNeed(value)}
                  className="w-full text-left px-4 py-3 rounded-lg border transition"
                  style={{
                    borderColor: form.needs.includes(value) ? "#15B5B0" : "#E5E0D5",
                    background: form.needs.includes(value) ? "#F2F9F4" : "#fff",
                  }}
                >
                  <span className="text-sm" style={{ color: "#2C335D" }}>{label}</span>
                  {form.needs.includes(value) && (
                    <span className="float-right" style={{ color: "#15B5B0" }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <h2 className="font-bold mb-2" style={{ color: "#093774" }}>
              4. Mục tiêu kỳ vọng
            </h2>
            <p className="text-sm mb-4" style={{ color: "#94A3B8" }}>
              Xác định một mục tiêu cụ thể bạn muốn đạt được trong 9 tháng tới.
            </p>
            <div className="mb-3 p-3 rounded-lg" style={{ background: "#F5F2EC", color: "#94A3B8", fontSize: 14 }}>
              "Trong 9 tháng tới, tôi muốn tập trung vào <b>[kỹ năng]</b> để đạt được <b>[mục tiêu]</b>"
            </div>
            <label className={labelCls}>Mục tiêu của bạn *</label>
            <textarea
              className={inputCls}
              style={inputStyle}
              rows={4}
              value={form.goalText}
              onChange={(e) => set("goalText", e.target.value)}
              placeholder="Trong 9 tháng tới, tôi muốn..."
            />
          </Card>
        )}

        {step === 5 && (
          <Card>
            <h2 className="font-bold mb-2" style={{ color: "#093774" }}>
              5. Đồng thuận & Bảo mật
            </h2>
            <p className="text-sm mb-4" style={{ color: "#94A3B8" }}>
              Vui lòng xác nhận bạn đã hiểu các điều khoản sau.
            </p>
            <ul className="space-y-3 mb-6">
              {CONSENTS.map((c, i) => (
                <li key={i} className="flex gap-3 text-sm" style={{ color: "#2C335D" }}>
                  <span style={{ color: "#15B5B0" }}>✓</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {error && (
          <div className="mt-4 rounded-lg px-4 py-3 text-sm" style={{ background: "#FCE8E6", color: "#C0392B" }}>
            {error}
          </div>
        )}

        {/* Nút điều hướng */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            className="text-sm font-medium px-4 py-2.5 rounded-full transition disabled:opacity-40"
            style={{ color: "#94A3B8", background: "transparent" }}
          >
            ← Quay lại
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={next}
              disabled={!stepValid(step)}
              className="px-6 py-2.5 rounded-full font-semibold text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: stepValid(step) ? "#093774" : "#CBD5E1" }}
            >
              Tiếp tục →
            </button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Đang gửi..." : "Tôi đã hiểu và đồng ý"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  "Thông tin xác thực",
  "Thông tin cá nhân",
  "Phân loại nhu cầu",
  "Mục tiêu kỳ vọng",
  "Đồng thuận & Bảo mật",
];
