"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell, Card, Badge, Button } from "@/components/ui";

type Application = {
  id: string;
  status: string;
  submittedAt: string | null;
  season?: { name: string };
};

export default function DashboardPage() {
  const [mentorApps, setMentorApps] = useState<Application[]>([]);
  const [menteeApps, setMenteeApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [m, me] = await Promise.all([
          fetch("/api/mentor-applications").then((r) => r.json()),
          fetch("/api/mentee-applications").then((r) => r.json()),
        ]);
        setMentorApps(m.applications ?? []);
        setMenteeApps(me.applications ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statusColor: Record<string, string> = {
    draft: "#94A3B8",
    submitted: "#15B5B0",
    interview_scheduled: "#F2A93B",
    interview_awaiting_review: "#F2A93B",
    approved: "#15803D",
    in_pool: "#093774",
    rejected: "#FF6859",
  };

  function statusLabel(s: string): string {
    const map: Record<string, string> = {
      draft: "Nháp",
      submitted: "Đã nộp",
      interview_scheduled: "Đã xếp lịch phỏng vấn",
      interview_awaiting_review: "Chờ đánh giá",
      approved: "Được duyệt",
      in_pool: "Chờ ghép cặp",
      rejected: "Chưa đạt",
    };
    return map[s] ?? s;
  }

  if (loading) {
    return (
      <AppShell title="Dashboard">
        <p style={{ color: "#2C335D" }}>Đang tải...</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Dashboard">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#093774" }}>
        Dashboard của bạn
      </h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <Link href="/workspace">
          <Button variant="secondary">🌱 Không gian đồng hành</Button>
        </Link>
        <Link href="/training">
          <Button variant="secondary">🎓 Đào tạo</Button>
        </Link>
        <Link href="/profile">
          <Button variant="secondary">👤 Hồ sơ</Button>
        </Link>
        <Link href="/coordinator">
          <Button variant="secondary">🎯 Bảng điều phối (ĐPV)</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold" style={{ color: "#093774" }}>
              Đơn đăng ký Mentor
            </h2>
            <Link href="/onboarding/mentor">
              <Button variant="secondary">Đăng ký mới</Button>
            </Link>
          </div>
          {mentorApps.length === 0 ? (
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              Chưa có đơn nào.
            </p>
          ) : (
            <div className="space-y-3">
              {mentorApps.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  style={{ borderColor: "#F5F2EC" }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#2C335D" }}>
                      {a.season?.name ?? "—"}
                    </p>
                    <p className="text-xs" style={{ color: "#94A3B8" }}>
                      {a.submittedAt
                        ? `Nộp ${new Date(a.submittedAt).toLocaleDateString("vi-VN")}`
                        : "Chưa nộp"}
                    </p>
                  </div>
                  <Badge color={statusColor[a.status] ?? "#94A3B8"}>
                    {statusLabel(a.status)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold" style={{ color: "#15B5B0" }}>
              Đơn đăng ký Mentee
            </h2>
            <Link href="/onboarding/mentee">
              <Button variant="secondary">Đăng ký mới</Button>
            </Link>
          </div>
          {menteeApps.length === 0 ? (
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              Chưa có đơn nào.
            </p>
          ) : (
            <div className="space-y-3">
              {menteeApps.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  style={{ borderColor: "#F5F2EC" }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#2C335D" }}>
                      {a.season?.name ?? "—"}
                    </p>
                    <p className="text-xs" style={{ color: "#94A3B8" }}>
                      {a.submittedAt
                        ? `Nộp ${new Date(a.submittedAt).toLocaleDateString("vi-VN")}`
                        : "Chưa nộp"}
                    </p>
                  </div>
                  <Badge color={statusColor[a.status] ?? "#94A3B8"}>
                    {statusLabel(a.status)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
