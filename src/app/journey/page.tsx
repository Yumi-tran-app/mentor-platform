"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell, Card, Button } from "@/components/ui";

type Journey = {
  audience: "mentor" | "mentee";
  steps: { key: string; label: string; done: boolean; active: boolean }[];
  trainingStatus: { modulesCompleted: number; modulesTotal: number; testPassed: boolean };
  hasMatch: boolean;
  activeMatch: boolean;
  completedMatch: boolean;
  mentoringCert: { id: string; certificateNo: string } | null;
  certificates: { id: string; certificateNo: string; role: string; issuedAt: string; orgName: string }[];
};

export default function JourneyPage() {
  const [data, setData] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/journey").then((r) => r.json());
      if (res.error) {
        setData(null);
      } else {
        setData(res);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function issueCert() {
    setError(null);
    const res = await fetch("/api/journey", { method: "POST" });
    const d = await res.json();
    if (!res.ok) setError(d.error ?? "Có lỗi khi cấp chứng nhận");
    await load();
  }

  if (loading) {
    return (
      <AppShell title="Lộ trình mentoring">
        <p style={{ color: "#2C335D" }}>Đang tải...</p>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell title="Lộ trình mentoring">
        <Card>
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Bạn chưa đăng ký vai trò mentor hoặc mentee. Hãy đăng ký để bắt đầu lộ trình.
          </p>
          <div className="mt-4 flex gap-3">
            <Link href="/onboarding/mentor"><Button>Đăng ký Mentor</Button></Link>
            <Link href="/onboarding/mentee"><Button variant="secondary">Đăng ký Mentee</Button></Link>
          </div>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title="Lộ trình mentoring">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "#093774" }}>
        🗺️ Lộ trình mentoring của bạn
      </h1>
      <p className="text-sm mb-6" style={{ color: "#94A3B8" }}>
        Vai trò: <b style={{ color: "#15B5B0" }}>{data.audience === "mentor" ? "Mentor" : "Mentee"}</b>
      </p>

      {/* Các bước lộ trình */}
      <Card className="mb-6">
        <div className="space-y-1">
          {data.steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{
                    background: s.done ? "#15803D" : s.active ? "#15B5B0" : "#CBD5E1",
                  }}
                >
                  {s.done ? "✓" : i + 1}
                </div>
                {i < data.steps.length - 1 && (
                  <div className="w-0.5 h-6" style={{ background: s.done ? "#15803D" : "#E5E0D5" }} />
                )}
              </div>
              <div className="flex-1">
                <p
                  className="font-medium"
                  style={{
                    color: s.done ? "#2C335D" : s.active ? "#093774" : "#94A3B8",
                  }}
                >
                  {s.label}
                </p>
              </div>
              <div>
                {s.done ? (
                  <span className="text-xs font-medium" style={{ color: "#15803D" }}>Đã xong</span>
                ) : s.active ? (
                  <span className="text-xs font-medium" style={{ color: "#15B5B0" }}>Đang thực hiện</span>
                ) : (
                  <span className="text-xs" style={{ color: "#94A3B8" }}>Chờ</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tiến độ đào tạo */}
      <Card className="mb-6">
        <h2 className="font-bold mb-3" style={{ color: "#093774" }}>
          📚 Tiến độ đào tạo
        </h2>
        <p className="text-sm" style={{ color: "#2C335D" }}>
          {data.trainingStatus.modulesCompleted}/{data.trainingStatus.modulesTotal} module{" "}
          {data.audience === "mentor" && (
            <> · Bài test:{" "}
              <b style={{ color: data.trainingStatus.testPassed ? "#15803D" : "#FF6859" }}>
                {data.trainingStatus.testPassed ? "Đạt" : "Chưa đạt"}
              </b>
            </>
          )}
        </p>
        <div className="mt-3 flex gap-3">
          <Link href="/training"><Button variant="secondary">Đến trang đào tạo</Button></Link>
        </div>
      </Card>

      {/* Giấy chứng nhận mentoring */}
      <Card>
        <h2 className="font-bold mb-3" style={{ color: "#093774" }}>
          🏅 Chứng nhận hoàn thành mentoring
        </h2>

        {data.mentoringCert ? (
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: "#2C335D" }}>
              Bạn đã được cấp chứng nhận mentoring (Mã: {data.mentoringCert.certificateNo}).
            </p>
            <Link href={`/certificate/${data.mentoringCert.id}`}>
              <Button>Xem chứng nhận</Button>
            </Link>
          </div>
        ) : data.completedMatch ? (
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: "#2C335D" }}>
              🎉 Bạn đã hoàn thành mentoring, đủ điều kiện nhận chứng nhận.
            </p>
            <Button onClick={issueCert}>Nhận chứng nhận</Button>
          </div>
        ) : (
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Hoàn thành hành trình mentoring (kết thúc match) để nhận giấy chứng nhận.
          </p>
        )}

        {error && (
          <p className="text-sm mt-3" style={{ color: "#B42318" }}>⚠️ {error}</p>
        )}

        {/* Bảng danh sách chứng nhận */}
        {data.certificates.length > 0 && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-sm" style={{ color: "#2C335D" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #F5F2EC" }}>
                  <th className="text-left py-2 font-semibold">Mã chứng nhận</th>
                  <th className="text-left py-2 font-semibold">Vai trò</th>
                  <th className="text-left py-2 font-semibold">Ngày cấp</th>
                  <th className="text-left py-2 font-semibold">Tổ chức</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.certificates.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #F5F2EC" }}>
                    <td className="py-3">{c.certificateNo}</td>
                    <td className="py-3">{c.role === "mentor" ? "Mentor" : "Mentee"}</td>
                    <td className="py-3">{new Date(c.issuedAt).toLocaleDateString("vi-VN")}</td>
                    <td className="py-3">{c.orgName}</td>
                    <td className="py-3 text-right">
                      <Link href={`/certificate/${c.id}`}>
                        <span style={{ color: "#15B5B0", fontWeight: 600 }}>Xem</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
