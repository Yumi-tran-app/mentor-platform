"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell, Card, Button, LineIcon, Badge } from "@/components/ui";

type Season = {
  id: string;
  name: string;
  cohort: string | null;
  status: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string | null;
};

type Milestone = {
  id: string;
  key: string;
  title: string;
  sortOrder: number;
  deadline: string | null;
  done: boolean;
  doneAt: string | null;
};

type Mentee = {
  matchId: string;
  partnerName: string;
  status: string;
  kickoffAt: string | null;
  agreementAt: string | null;
  sessionCount: number;
  scheduleCount: number;
  reportSubmittedAt: string | null;
  completedAt: string | null;
  targetSessions: number;
};

type JourneyV2 = {
  audience: "mentor" | "mentee";
  seasons: Season[];
  season: Season;
  milestones: Milestone[];
  mentees: Mentee[];
  mentoringCert: { id: string; certificateNo: string; issuedAt: string } | null;
  trainingStatus: { modulesCompleted: number; modulesTotal: number; testPassed: boolean };
};

const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString("vi-VN") : "—";

function daysRemaining(endDate: string): number {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function JourneyPage() {
  const [data, setData] = useState<JourneyV2 | null>(null);
  const [loading, setLoading] = useState(true);
  const [seasonId, setSeasonId] = useState<string | null>(null);
  const [activeMentee, setActiveMentee] = useState<string | null>(null);

  async function load(selected?: string) {
    setLoading(true);
    try {
      const q = selected ? `?seasonId=${selected}` : "";
      const res = await fetch(`/api/journey${q}`).then((r) => r.json());
      if (res.error) {
        setData(null);
      } else {
        setData(res);
        if (!selected && res.seasons?.length > 0) {
          setSeasonId(res.season.id);
        }
        if (res.mentees?.length > 0 && !activeMentee) {
          setActiveMentee(res.mentees[0].matchId);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <AppShell title="Lộ trình mentoring">
        <p style={{ color: "#292524" }}>Đang tải...</p>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell title="Lộ trình mentoring">
        <Card>
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Bạn chưa đăng ký vai trò mentor hoặc mentee.
          </p>
          <div className="mt-4 flex gap-3">
            <Link href="/onboarding/mentor"><Button>Đăng ký Mentor</Button></Link>
            <Link href="/onboarding/mentee"><Button variant="secondary">Đăng ký Mentee</Button></Link>
          </div>
        </Card>
      </AppShell>
    );
  }

  const remaining = daysRemaining(data.season.endDate);
  const isActiveSeason = data.season.status !== "closed";

  return (
    <AppShell title="Lộ trình mentoring">
      {/* TOP BAR — Bộ lọc mùa + thời gian */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "#0F766E" }}>
            <LineIcon name="map" size={22} /> Lộ trình mentoring
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={seasonId ?? data.season.id}
            onChange={(e) => { setSeasonId(e.target.value); load(e.target.value); }}
            className="px-4 py-2 rounded-lg border text-sm font-semibold"
            style={{ borderColor: "#E5E0D5", color: "#292524", background: "#fff" }}
          >
            {data.seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.cohort || s.name} ({s.status === "closed" ? "Đã kết thúc" : "Đang diễn ra"})
              </option>
            ))}
          </select>
          <Badge color={isActiveSeason ? "#0F766E" : "#94A3B8"}>
            {isActiveSeason ? "Đang diễn ra" : "Lịch sử"}
          </Badge>
        </div>
      </div>

      {/* Badge thời gian toàn mùa */}
      <Card className="mb-6" >
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <LineIcon name="clock" size={16} />
          <b style={{ color: "#292524" }}>Thời gian chương trình:</b>
          <span style={{ color: "#292524" }}>
            {fmtDate(data.season.startDate)} – {fmtDate(data.season.endDate)}
          </span>
          {isActiveSeason && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: remaining > 30 ? "#E6F4EA" : "#FEF9E7", color: remaining > 30 ? "#15803D" : "#B45309" }}
            >
              {remaining > 0 ? `Còn ${remaining} ngày` : "Đã quá hạn tổng kết"}
            </span>
          )}
        </div>
      </Card>

      {/* KHUNG A — Tiến độ chung của Mùa */}
      <Card className="mb-6">
        <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: "#0F766E" }}>
          <LineIcon name="calendar" size={18} /> Tiến độ chung của Mùa
        </h2>
        <div className="space-y-1">
          {data.milestones.map((ms, i) => (
            <div key={ms.id} className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{
                    background: ms.done ? "#15803D" : i === data.milestones.findIndex((m) => !m.done) ? "#15B5B0" : "#CBD5E1",
                  }}
                >
                  {ms.done ? <LineIcon name="check" size={16} /> : i + 1}
                </div>
                {i < data.milestones.length - 1 && (
                  <div className="w-0.5 h-7" style={{ background: ms.done ? "#15803D" : "#E5E0D5" }} />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium" style={{ color: ms.done ? "#292524" : "#0F766E" }}>{ms.title}</p>
                <MilestoneTimestamp ms={ms} now={new Date()} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* KHUNG B — Tiến độ theo từng Mentee */}
      <Card>
        <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: "#0F766E" }}>
          <LineIcon name="users" size={18} /> Tiến độ đồng hành theo Mentee
        </h2>

        {data.mentees.length === 0 ? (
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Chưa có mentee nào được ghép cặp trong mùa này.
          </p>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {data.mentees.map((m) => (
                <button
                  key={m.matchId}
                  onClick={() => setActiveMentee(m.matchId)}
                  className="px-4 py-2 rounded-full text-sm font-semibold transition"
                  style={{
                    background: activeMentee === m.matchId ? "#0F766E" : "#F5F2EC",
                    color: activeMentee === m.matchId ? "#fff" : "#292524",
                  }}
                >
                  {m.partnerName}
                </button>
              ))}
            </div>

            {data.mentees
              .filter((m) => m.matchId === activeMentee)
              .map((m) => (
                <div key={m.matchId}>
                  {/* Trạng thái + header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Badge color={m.status === "ended" ? "#15803D" : "#0F766E"}>
                        {m.status === "ended" ? "Hoàn thành" : "Đang thực hiện"}
                      </Badge>
                    </div>
                    {m.reportSubmittedAt && (
                      <span className="text-xs" style={{ color: "#94A3B8" }}>
                        Báo cáo nghiệm thu: {fmtDate(m.reportSubmittedAt)}
                      </span>
                    )}
                  </div>

                  {/* Per-mentee milestones */}
                  <div className="space-y-2">
                    <PerMenteeRow
                      icon="spark"
                      label="Gặp Kick-off"
                      done={!!m.kickoffAt}
                      doneDate={m.kickoffAt}
                      deadline={m.kickoffAt ? null : null}
                    />
                    <PerMenteeRow
                      icon="chat"
                      label={`Thực hiện Mentoring (${m.sessionCount}/${m.targetSessions} buổi)`}
                      done={m.sessionCount >= m.targetSessions}
                      doneDate={m.sessionCount > 0 ? m.kickoffAt : null}
                      deadline={null}
                      inProgress={m.sessionCount > 0 && m.sessionCount < m.targetSessions}
                    />
                    <PerMenteeRow
                      icon="checkCircle"
                      label="Đánh giá giữa kỳ"
                      done={m.sessionCount >= Math.ceil(m.targetSessions / 2)}
                      doneDate={null}
                    />
                    <PerMenteeRow
                      icon="edit"
                      label="Nộp báo cáo nghiệm thu"
                      done={!!m.reportSubmittedAt}
                      doneDate={m.reportSubmittedAt}
                      deadline={data.season.endDate}
                    />
                  </div>
                </div>
              ))}
          </>
        )}
      </Card>

      {/* Chứng nhận mentoring */}
      {data.mentoringCert && (
        <Card className="mt-6">
          <h2 className="font-bold mb-3 flex items-center gap-2" style={{ color: "#0F766E" }}>
            <LineIcon name="award" size={18} /> Chứng nhận hoàn thành
          </h2>
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: "#292524" }}>
              Mã: {data.mentoringCert.certificateNo} · Cấp {fmtDate(data.mentoringCert.issuedAt)}
            </p>
            <Link href={`/certificate/${data.mentoringCert.id}`}>
              <Button>Xem chứng nhận</Button>
            </Link>
          </div>
        </Card>
      )}
    </AppShell>
  );
}

function MilestoneTimestamp({ ms, now }: { ms: Milestone; now: Date }) {
  if (ms.done && ms.doneAt) {
    return (
      <span className="text-xs" style={{ color: "#15803D" }}>
        Đã hoàn thành: {fmtDate(ms.doneAt)}
      </span>
    );
  }
  if (ms.done) {
    return <span className="text-xs" style={{ color: "#15803D" }}>Đã hoàn thành</span>;
  }
  if (ms.deadline) {
    const overdue = new Date(ms.deadline) < now;
    return (
      <span className="text-xs" style={{ color: overdue ? "#B42318" : "#94A3B8" }}>
        {overdue ? `Trễ hạn` : "Dự kiến"}: {fmtDate(ms.deadline)}
      </span>
    );
  }
  return null;
}

function PerMenteeRow({
  icon,
  label,
  done,
  doneDate,
  deadline,
  inProgress,
}: {
  icon: any;
  label: string;
  done: boolean;
  doneDate?: string | null;
  deadline?: string | null;
  inProgress?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white"
        style={{ background: done ? "#15803D" : inProgress ? "#15B5B0" : "#CBD5E1" }}
      >
        {done ? <LineIcon name="check" size={15} /> : <LineIcon name={icon} size={15} />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium" style={{ color: done ? "#292524" : "#0F766E" }}>{label}</p>
        <div>
          {done && doneDate ? (
            <span className="text-xs" style={{ color: "#15803D" }}>Đã xong · {fmtDate(doneDate)}</span>
          ) : done ? (
            <span className="text-xs" style={{ color: "#15803D" }}>Đã xong</span>
          ) : inProgress ? (
            <span className="text-xs" style={{ color: "#15B5B0" }}>Đang diễn ra</span>
          ) : deadline ? (
            <span className="text-xs" style={{ color: "#94A3B8" }}>Dự kiến: {fmtDate(deadline)}</span>
          ) : (
            <span className="text-xs" style={{ color: "#B42318" }}>Chưa thực hiện</span>
          )}
        </div>
      </div>
    </div>
  );
}
