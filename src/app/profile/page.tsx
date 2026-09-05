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

export default function ProfilePage() {
  const { user: clerkUser } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function load() {
    const res = await fetch("/api/profile").then((r) => r.json());
    setProfile(res.user);
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
    await load();
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

  return (
    <AppShell title="Hồ sơ">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#093774" }}>
        Hồ sơ của bạn
      </h1>

      <div className="max-w-2xl space-y-6">
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
