"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell, Card, Badge, Button, LineIcon } from "@/components/ui";
import { useCurrentUser, isStaff } from "@/lib/use-current-user";

type Application = {
  id: string;
  status: string;
  submittedAt: string | null;
  season?: { name: string };
};

type DashboardStats = {
  role: "mentor" | "mentee" | null;
  stats: {
    seasons?: number;
    mentees?: number;
    trainingCourses?: number;
    eventsDelivered?: number;
    certificates?: number;
    joinedAt?: string | null;
    journeys?: number;
  };
};

const statusColor: Record<string, string> = {
  draft: "#94A3B8",
  submitted: "#15B5B0",
  interview_scheduled: "#F2A93B",
  interview_awaiting_review: "#F2A93B",
  approved: "#15803D",
  in_pool: "#0F766E",
  rejected: "#B45309",
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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [m, me, s] = await Promise.all([
          fetch("/api/mentor-applications").then((r) => r.json()),
          fetch("/api/mentee-applications").then((r) => r.json()),
          fetch("/api/dashboard-stats").then((r) => r.json()),
        ]);
        setMentorApps(m.applications ?? []);
        setMenteeApps(me.applications ?? []);
        setStats(s);
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
      <AppShell title="Tổng quan">
        <p style={{ color: "#292524" }}>Đang tải...</p>
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
    <AppShell title="Tổng quan">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "#0F766E" }}>
        Xin chào{user.fullName ? `, ${user.fullName}` : ""}
      </h1>
      <p className="text-sm mb-4" style={{ color: "#94A3B8" }}>
        {roleGreeting ? `Bạn đang đồng hành với vai trò ${roleGreeting}.` : "Chào mừng bạn đến với chương trình mentoring cộng đồng."}
      </p>

      {/* Staff: shortcut đến bảng điều phối */}
      {staff && (
        <div className="mb-6 flex flex-wrap gap-3">
          <Link href="/coordinator"><Button><span className="inline-flex items-center gap-2"><LineIcon name="target" size={16} /> Bảng điều phối</span></Button></Link>
          <Link href="/coordinator/review"><Button variant="secondary"><span className="inline-flex items-center gap-2"><LineIcon name="checkCircle" size={16} /> Duyệt đơn</span></Button></Link>
        </div>
      )}

      {/* Số liệu Tổng quan theo vai trò */}
      {stats && stats.role && (
        <Card className="mb-6">
          <h2 className="font-bold mb-3" style={{ color: "#0F766E" }}>
            Hoạt động của bạn
          </h2>
          {stats.role === "mentor" ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatItem label="Đã tham gia (mùa)" value={stats.stats.seasons ?? 0} />
              <StatItem label="Kết nối (mentee)" value={stats.stats.mentees ?? 0} />
              <StatItem label="Tham gia (khoá đào tạo)" value={stats.stats.trainingCourses ?? 0} />
              <StatItem label="Đã làm diễn giả (khoá đào tạo)" value={stats.stats.eventsDelivered ?? 0} />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatItem
                label="Đã tham gia"
                value={stats.stats.joinedAt ? formatDate(stats.stats.joinedAt) : " - "}
              />
              <StatItem label="Hoàn thành (nhật ký hành trình)" value={stats.stats.journeys ?? 0} />
              <StatItem label="Tham gia (khoá đào tạo)" value={stats.stats.trainingCourses ?? 0} />
            </div>
          )}
        </Card>
      )}

      {/* Trạng thái của bạn (thay cho 2 ô đăng ký vai trò song song) */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold" style={{ color: "#0F766E" }}>Trạng thái của bạn</h2>
          {!hasMentorApp && !hasMenteeApp && !staff && (
            <Link href="/onboarding"><Button>Đăng ký tham gia</Button></Link>
          )}
        </div>

        {staff ? (
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Bạn là {roleGreeting} - không cần đăng ký vai trò mentor/mentee.
          </p>
        ) : !hasMentorApp && !hasMenteeApp ? (
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Bạn chưa đăng ký tham gia. Đăng ký làm Mentor hoặc Mentee để bắt đầu hành trình.
          </p>
        ) : (
          <div className="space-y-3">
            {mentorApps.map((a) => (
              <StatusRow
                key={a.id}
                roleLabel="Mentor"
                color="#0F766E"
                season={a.season?.name}
                submittedAt={a.submittedAt}
                status={a.status}
              />
            ))}
            {menteeApps.map((a) => (
              <StatusRow
                key={a.id}
                roleLabel="Mentee"
                color="#15B5B0"
                season={a.season?.name}
                submittedAt={a.submittedAt}
                status={a.status}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Hướng dẫn nhanh cho người mới */}
      {!hasMentorApp && !hasMenteeApp && !staff && (
        <Card className="mt-6">
          <h2 className="font-bold mb-3" style={{ color: "#0F766E" }}>Bắt đầu từ đâu?</h2>
          <div className="space-y-2 text-sm" style={{ color: "#292524" }}>
            <p><span className="inline-flex items-center gap-1"><LineIcon name="checkCircle" size={14} /> Đăng ký làm Mentor (chia sẻ kinh nghiệm) hoặc Mentee (được đồng hành).</span></p>
            <p>Hoàn thành đơn đăng ký và chờ đội ngũ điều phối duyệt.</p>
            <p>Sau khi được duyệt, bạn sẽ được ghép cặp và bắt đầu hành trình.</p>
          </div>
        </Card>
      )}
    </AppShell>
  );
}

function StatusRow({
  roleLabel,
  color,
  season,
  submittedAt,
  status,
}: {
  roleLabel: string;
  color: string;
  season?: string;
  submittedAt: string | null;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: "#F5F2EC" }}>
      <div className="flex items-center gap-3">
        <Badge color={color}>{roleLabel}</Badge>
        <div>
          <p className="text-sm font-medium" style={{ color: "#292524" }}>{season ?? "-"}</p>
          <p className="text-xs" style={{ color: "#94A3B8" }}>
            {submittedAt ? `Nộp ${new Date(submittedAt).toLocaleDateString("vi-VN")}` : "Chưa nộp"}
          </p>
        </div>
      </div>
      <Badge color={statusColor[status] ?? "#94A3B8"}>{statusLabelMap[status] ?? status}</Badge>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function StatItem({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "#F5F2EC" }}>
      <p className="text-2xl font-bold" style={{ color: "#0F766E" }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: "#57534E" }}>{label}</p>
    </div>
  );
}
