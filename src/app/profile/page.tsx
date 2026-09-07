"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { AppShell, Card, Button, Badge } from "@/components/ui";

const ROLE_LABEL: Record<string, string> = {
  admin: "Quản trị viên",
  dpv: "Điều phối viên (ĐPV)",
  mentor: "Mentor",
  mentee: "Mentee",
};

const NEED_LABEL: Record<string, string> = {
  learning: "Học tập",
  career: "Sự nghiệp",
  personal_dev: "Phát triển cá nhân",
  life_transition: "Chuyển đổi giai đoạn",
};

const GENDER_LABEL: Record<string, string> = {
  nam: "Nam",
  "nữ": "Nữ",
  khác: "Khác",
};

export default function ProfilePage() {
  const { user: clerkUser } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [mentor, setMentor] = useState<any>(null);
  const [mentee, setMentee] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function load() {
    const res = await fetch("/api/profile").then((r) => r.json());
    setProfile(res.user);
    setMentor(res.mentor);
    setMentee(res.mentee);
    setFullName(res.user?.fullName ?? "");
    setPhone(res.user?.phone ?? "");
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, phone }),
    });
    setSaving(false);
    setSaved(true);
  }

  if (!profile) {
    return (
      <AppShell title="Hồ sơ">
        <p style={{ color: "#2C335D" }}>Đang tải...</p>
      </AppShell>
    );
  }

  const inputCls = "w-full px-4 py-2.5 rounded-lg border text-sm";
  const inputStyle = { borderColor: "#E5E0D5", color: "#2C335D" };

  // Mentor data
  const mIdentity = mentor?.identityJson ?? {};
  const mProf = mentor?.professionalJson ?? {};
  const mReadiness = mentor?.readinessJson ?? {};
  const mDocs = mentor?.docsJson ?? {};

  // Mentee data
  const eProfile = mentee?.profileJson ?? {};
  const eIdentity = mentee?.identityJson ?? {};
  const eNeeds = mentee?.needs ?? [];

  return (
    <AppShell title="Hồ sơ">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#093774" }}>
        Hồ sơ của bạn
      </h1>

      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <Card>
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white font-bold"
              style={{ background: "#093774" }}
            >
              {(profile.fullName?.[0] ?? "?").toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: "#093774" }}>
                {profile.fullName}
              </h2>
              <div className="mt-1">
                <Badge
                  color={
                    profile.role === "admin"
                      ? "#FF6859"
                      : profile.role === "dpv"
                        ? "#F2A93B"
                        : "#15B5B0"
                  }
                >
                  {ROLE_LABEL[profile.role] ?? profile.role}
                </Badge>
              </div>
              <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
                {clerkUser?.emailAddresses?.[0]?.emailAddress ?? profile.email}
              </p>
            </div>
          </div>
        </Card>

        {/* Hồ sơ Mentor */}
        {mentor && (
          <>
            <Card>
              <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
                👤 Thông tin cá nhân (Mentor)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm" style={{ color: "#2C335D" }}>
                <Field label="Họ và tên" value={mIdentity.fullName} />
                <Field label="Tên thường gọi" value={mIdentity.preferredName} />
                <Field label="Giới tính" value={GENDER_LABEL[mIdentity.gender] ?? mIdentity.gender} />
                <Field label="Năm sinh" value={mIdentity.birthYear} />
                <Field label="Thành phố" value={mIdentity.city} />
                <Field label="Email" value={mIdentity.email} />
                <Field label="Số điện thoại" value={mIdentity.phone} />
                <Field label="LinkedIn" value={mIdentity.linkedin} full />
              </div>
            </Card>

            <Card>
              <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
                💼 Kinh nghiệm nghề nghiệp
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm" style={{ color: "#2C335D" }}>
                <Field label="Công ty" value={mProf.company} />
                <Field label="Chức danh" value={mProf.title} />
                <Field label="Số năm kinh nghiệm" value={mProf.yearsExperience != null ? `${mProf.yearsExperience} năm` : undefined} />
                <Field label="Số năm quản lý" value={mProf.yearsManagement != null ? `${mProf.yearsManagement} năm` : undefined} />
                <Field label="Quy mô đội ngũ" value={mProf.teamSize} />
                <Field label="Ngành nghề" value={mProf.industry || mentor.industry} />
                <Field label="Bằng cấp" value={mProf.degree} />
                <Field label="Trường" value={mProf.school} />
              </div>
            </Card>

            <Card>
              <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
                🌱 Mức độ sẵn sàng & cam kết
              </h2>
              <div className="space-y-2 text-sm" style={{ color: "#2C335D" }}>
                <p>🔹 Đã từng làm mentor: <b>{mReadiness.hasMentoredBefore ? "Có" : "Chưa"}</b></p>
                <p>🔹 Đã mentor SME/startup: <b>{mReadiness.hasMentoredStartup ? "Có" : "Chưa"}</b></p>
                {mReadiness.mentoringFocus?.length > 0 && (
                  <div>
                    <p className="font-medium mb-1">🔹 Định hướng đồng hành:</p>
                    <div className="flex flex-wrap gap-2">
                      {mReadiness.mentoringFocus.map((f: string) => (
                        <Badge key={f} color="#093774">{NEED_LABEL[f] ?? f}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {mReadiness.reason && <p><b>Lý do muốn làm mentor:</b> {mReadiness.reason}</p>}
                <p>🔹 Số mentee muốn đồng hành: <b>{mentor.capacityMax}</b></p>
              </div>
            </Card>

            {mDocs && (mDocs.cvUrl || mDocs.photoUrl || mDocs.references || mDocs.source || mDocs.notes) && (
              <Card>
                <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
                  📎 Hồ sơ bổ sung
                </h2>
                <div className="space-y-2 text-sm" style={{ color: "#2C335D" }}>
                  {mDocs.photoUrl && <img src={mDocs.photoUrl} alt="Profile" style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover" }} />}
                  {mDocs.cvUrl && <p>🔗 CV: <a href={mDocs.cvUrl} target="_blank" style={{ color: "#15B5B0" }}>{mDocs.cvUrl}</a></p>}
                  {mDocs.references && <p>👥 Người giới thiệu: {mDocs.references}</p>}
                  {mDocs.source && <p>ℹ️ Biết đến chương trình từ: {mDocs.source}</p>}
                  {mDocs.notes && <p>📝 Ghi chú Core Team: {mDocs.notes}</p>}
                </div>
              </Card>
            )}
          </>
        )}

        {/* Hồ sơ Mentee */}
        {mentee && (
          <>
            <Card>
              <h2 className="font-bold mb-4" style={{ color: "#15B5B0" }}>
                🪪 Thông tin xác thực (Mentee)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm" style={{ color: "#2C335D" }}>
                <Field label="Họ và tên" value={eIdentity.fullName} />
                <Field label="Mã số sinh viên" value={eIdentity.studentId} />
                <Field label="Email trường" value={eIdentity.email} full />
                <Field label="Số điện thoại" value={eIdentity.phone} />
              </div>
            </Card>

            <Card>
              <h2 className="font-bold mb-4" style={{ color: "#15B5B0" }}>
                🎓 Thông tin học tập (Mentee)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm" style={{ color: "#2C335D" }}>
                <Field label="Ngành học" value={eProfile.major} />
                <Field label="Trường" value={eProfile.school} />
                <Field label="Năm học" value={eProfile.yearOfStudy ? `Năm ${eProfile.yearOfStudy}` : undefined} />
                <Field label="Thành phố" value={eProfile.city} />
              </div>
            </Card>

            <Card>
              <h2 className="font-bold mb-4" style={{ color: "#15B5B0" }}>
                🎯 Mục tiêu & nhu cầu
              </h2>
              <div className="space-y-2 text-sm" style={{ color: "#2C335D" }}>
                {mentee.goalText && (
                  <p><b>Mục tiêu:</b> {mentee.goalText}</p>
                )}
                {eNeeds.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {eNeeds.map((n: any) => (
                      <Badge key={n.id ?? n.needCategory} color="#15B5B0">
                        {NEED_LABEL[n.needCategory] ?? n.needCategory}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </>
        )}

        {/* Chỉnh sửa thông tin cơ bản */}
        <Card>
          <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
            Chỉnh sửa thông tin
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Họ tên</label>
              <input
                className={inputCls}
                style={inputStyle}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Số điện thoại</label>
              <input
                className={inputCls}
                style={inputStyle}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={save} disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
              {saved && (
                <span className="text-sm" style={{ color: "#15803D" }}>
                  ✅ Đã lưu
                </span>
              )}
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Field({ label, value, full }: { label: string; value?: string | number | null; full?: boolean }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <p className="text-xs" style={{ color: "#94A3B8" }}>{label}</p>
      <p className="font-medium break-words">{value}</p>
    </div>
  );
}
