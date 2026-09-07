"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell, Card, Badge, Button } from "@/components/ui";
import { useCurrentUser, isStaff } from "@/lib/use-current-user";

type Application = {
  id: string;
  status: string;
  submittedAt: string | null;
  season?: { name: string };
};

const statusColor: Record<string, string> = {
  draft: "#94A3B8",
  submitted: "#15B5B0",
  interview_scheduled: "#F2A93B",
  interview_awaiting_review: "#F2A93B",
  approved: "#15803D",
  in_pool: "#093774",
  rejected: "#FF6859",
};

const statusLabelMap: Record<string, string> = {
  draft: "Nháp",
  submitted: "Đã nộp",
  interview_scheduled: "Đã xếp lịch phỏng vấn",
  interview_awaiting_review: "Chờ đánh giá",
  approved: "Được duyệt",
  in_pool: "Chờ ghép cặp",
  rejected: "Chưa đạt",
};

export default function DashboardPage() {
  const user = useCurrentUser();
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

  if (loading || user === null) {
    return (
      <AppShell title="Trang chủ">
        <p style={{ color: "#2C335D" }}>Đang tải...</p>
      </AppShell>
    );
  }

  const staff = isStaff(user.role);
  const hasMentorApp = mentorApps.length > 0;
  const hasMenteeApp = menteeApps.length > 0;

  // Lời chào theo vai trò
  const roleGreeting = staff
    ? "Bảng điều hành"
    : hasMentorApp
      ? "Mentor"
      : hasMenteeApp
        ? "Mentee"
        : "";

  return (
    <AppShell title="Trang chủ">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "#093774" }}>
        Xin chào{user.fullName ? `, ${user.fullName}` : ""} 👋
      </h1>
      <p className="text-sm mb-4" style={{ color: "#94A3B8" }}>
        {roleGreeting ? `Bạn đang đồng hành với vai trò ${roleGreeting}.` : "Chào mừng bạn đến với chương trình mentoring cộng đồng."}
      </p>

      {/* Staff: shortcut đến bảng điều phối */}
      {staff && (
        <div className="mb-6 flex flex-wrap gap-3">
          <Link href="/coordinator"><Button>🎯 Bảng điều phối</Button></Link>
          <Link href="/coordinator/review"><Button variant="secondary">📋 Duyệt đơn</Button></Link>
        </div>
      )}

      {/* Mentor card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold" style={{ color: "#093774" }}>Vai trò Mentor</h2>
            {!hasMentorApp ? (
              <Link href="/onboarding/mentor"><Button variant="secondary">Đăng ký</Button></Link>
            ) : (
              <Badge color="#15B5B0">Đã đăng ký</Badge>
            )}
          </div>
          {!hasMentorApp ? (
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              Chia sẻ kinh nghiệm và đồng hành cùng mentee trong 9 tháng.
            </p>
          ) : (
            <div className="space-y-2">
              {mentorApps.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: "#F5F2EC" }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#2C335D" }}>{a.season?.name ?? "—"}</p>
                    <p className="text-xs" style={{ color: "#94A3B8" }}>
                      {a.submittedAt ? `Nộp ${new Date(a.submittedAt).toLocaleDateString("vi-VN")}` : "Chưa nộp"}
                    </p>
                  </div>
                  <Badge color={statusColor[a.status] ?? "#94A3B8"}>{statusLabelMap[a.status] ?? a.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Mentee card */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold" style={{ color: "#15B5B0" }}>Vai trò Mentee</h2>
            {!hasMenteeApp ? (
              <Link href="/onboarding/mentee"><Button variant="secondary">Đăng ký</Button></Link>
            ) : (
              <Badge color="#15B5B0">Đã đăng ký</Badge>
            )}
          </div>
          {!hasMenteeApp ? (
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              Được mentor có kinh nghiệm dẫn dắt trên hành trình phát triển của bạn.
            </p>
          ) : (
            <div className="space-y-2">
              {menteeApps.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: "#F5F2EC" }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#2C335D" }}>{a.season?.name ?? "—"}</p>
                    <p className="text-xs" style={{ color: "#94A3B8" }}>
                      {a.submittedAt ? `Nộp ${new Date(a.submittedAt).toLocaleDateString("vi-VN")}` : "Chưa nộp"}
                    </p>
                  </div>
                  <Badge color={statusColor[a.status] ?? "#94A3B8"}>{statusLabelMap[a.status] ?? a.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Hướng dẫn nhanh cho người mới */}
      {!hasMentorApp && !hasMenteeApp && !staff && (
        <Card className="mt-6">
          <h2 className="font-bold mb-3" style={{ color: "#093774" }}>Bắt đầu từ đâu?</h2>
          <div className="space-y-2 text-sm" style={{ color: "#2C335D" }}>
            <p>1️⃣ Chọn vai trò Mentor hoặc Mentee ở trên để đăng ký.</p>
            <p>2️⃣ Hoàn thành đơn đăng ký và chờ đội ngũ điều phối duyệt.</p>
            <p>3️⃣ Sau khi được duyệt, bạn sẽ được ghép cặp và bắt đầu hành trình.</p>
          </div>
        </Card>
      )}

      {/* Lộ trình mentoring (cho cả mentor & mentee) */}
      {(hasMentorApp || hasMenteeApp) && (
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold" style={{ color: "#093774" }}>
                🗺️ Lộ trình mentoring của bạn
              </h2>
              <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
                Đăng ký → Tham gia đào tạo → Tham gia mentoring → Hoàn thành mentoring → Cấp chứng nhận
              </p>
            </div>
            <Link href="/journey">
              <Button>Xem lộ trình</Button>
            </Link>
          </div>
        </Card>
      )}
    </AppShell>
  );
}
