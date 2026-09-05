"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell, Card, Badge, Button } from "@/components/ui";

type Match = {
  id: string;
  status: string;
  fitScore: number | null;
  goalText: string | null;
  mentorApplication: { user: { fullName: string; id: string } };
  menteeApplication: { user: { fullName: string; id: string } };
};

export default function WorkspacePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/matches")
      .then((r) => r.json())
      .then((d) => setMatches(d.matches ?? []))
      .finally(() => setLoading(false));
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setMyId(d.user?.id ?? null));
  }, []);

  async function respond(matchId: string, accept: boolean) {
    await fetch(`/api/matches/${matchId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accept }),
    });
    const res = await fetch("/api/matches").then((r) => r.json());
    setMatches(res.matches ?? []);
  }

  const statusLabel: Record<string, string> = {
    recommended: "Đã đề xuất",
    pending_coordinator_review: "ĐPV đang duyệt",
    proposed_to_parties: "Chờ hai bên xác nhận",
    mentor_accepted: "Mentor đã đồng ý",
    mutual_accepted: "Hai bên đồng ý",
    first_connection_done: "Đã kết nối lần đầu",
    active: "Đang đồng hành",
    paused: "Tạm dừng",
    ended: "Đã kết thúc",
  };
  const statusColor: Record<string, string> = {
    recommended: "#94A3B8",
    pending_coordinator_review: "#F2A93B",
    proposed_to_parties: "#F2A93B",
    mentor_accepted: "#15B5B0",
    mutual_accepted: "#15B5B0",
    first_connection_done: "#093774",
    active: "#15803D",
    paused: "#F2A93B",
    ended: "#94A3B8",
  };

  if (loading) {
    return (
      <AppShell title="Workspace">
        <p style={{ color: "#2C335D" }}>Đang tải...</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Workspace">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#093774" }}>
          Không gian đồng hành
        </h1>
      </div>

      {matches.length === 0 ? (
        <Card>
          <h2 className="font-bold mb-2" style={{ color: "#093774" }}>
            Chưa có cặp đồng hành
          </h2>
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Sau khi đơn đăng ký của bạn được duyệt, đội ngũ điều phối sẽ ghép
            cặp phù hợp và cặp của bạn sẽ hiển thị tại đây.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {matches.map((m) => (
            <Card key={m.id}>
              <div className="flex items-center justify-between mb-3">
                <Badge color={statusColor[m.status] ?? "#94A3B8"}>
                  {statusLabel[m.status] ?? m.status}
                </Badge>
                {m.fitScore != null && (
                  <span className="text-xs" style={{ color: "#94A3B8" }}>
                    Fit {m.fitScore.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-sm" style={{ color: "#2C335D" }}>
                <span className="font-semibold">Mentor:</span>{" "}
                {m.mentorApplication.user.fullName}
              </p>
              <p className="text-sm mt-1" style={{ color: "#2C335D" }}>
                <span className="font-semibold">Mentee:</span>{" "}
                {m.menteeApplication.user.fullName}
              </p>

              {m.goalText && (
                <div className="mt-3 p-3 rounded-lg text-sm" style={{ background: "#F2F9F4", color: "#2C335D" }}>
                  🎯 <b>Mục tiêu:</b> {m.goalText}
                </div>
              )}

              {/* Nút respond khi có yêu cầu kết nối đang chờ */}
              {(m.status === "proposed_to_parties" || m.status === "mentor_accepted") && (
                <div className="mt-3 flex gap-2">
                  <Button onClick={() => respond(m.id, true)}>💚 Đồng ý</Button>
                  <Button variant="danger" onClick={() => respond(m.id, false)}>Từ chối</Button>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/workspace/${m.id}`}>
                  <Button>Mở chi tiết</Button>
                </Link>
                <Link href={`/workspace/${m.id}/reflect`}>
                  <Button variant="secondary">Phản tư</Button>
                </Link>
                <Link href={`/workspace/${m.id}/support`}>
                  <Button variant="danger">Cần hỗ trợ</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
