"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell, Card, Button, Badge } from "@/components/ui";

type Match = {
  id: string;
  status: string;
  agreementConfirmedAt: string | null;
  fitScore: number | null;
  mentorApplication: { user: { fullName: string } };
  menteeApplication: { user: { fullName: string } };
};

type Log = {
  id: string;
  visibility: string;
  content: string;
  createdAt: string;
  author: { fullName: string; role: string };
};

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = params.id as string;

  const [match, setMatch] = useState<Match | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [note, setNote] = useState("");
  const [visibility, setVisibility] = useState<"shared" | "private">("shared");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const load = useCallback(async () => {
    try {
      const [m, l] = await Promise.all([
        fetch(`/api/matches?id=${matchId}`).then((r) => r.json()),
        fetch(`/api/logs?matchId=${matchId}`).then((r) => r.json()),
      ]);
      setMatch(m.matches?.[0] ?? null);
      setLogs(l.logs ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    load();
  }, [load]);

  async function addLog(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setSending(true);
    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, visibility, content: note }),
      });
      setNote("");
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  async function confirmAgreement() {
    setConfirming(true);
    try {
      const res = await fetch(`/api/matches/${matchId}/confirm-agreement`, {
        method: "POST",
      });
      if (res.ok) await load();
    } catch (err) {
      console.error(err);
    } finally {
      setConfirming(false);
    }
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

  if (loading) {
    return (
      <AppShell title="Chi tiết">
        <p style={{ color: "#2C335D" }}>Đang tải...</p>
      </AppShell>
    );
  }

  if (!match) {
    return (
      <AppShell title="Chi tiết">
        <p style={{ color: "#2C335D" }}>Không tìm thấy cặp này.</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Chi tiết đồng hành">
      <Link href="/workspace" className="text-sm" style={{ color: "#093774" }}>
        ← Quay lại
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#093774" }}>
            {match.mentorApplication.user.fullName} ↔{" "}
            {match.menteeApplication.user.fullName}
          </h1>
          <Badge color={match.status === "active" ? "#15803D" : "#F2A93B"}>
            {statusLabel[match.status] ?? match.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Link href={`/workspace/${matchId}/reflect`}>
            <Button variant="secondary">Phản tư</Button>
          </Link>
          <Link href={`/workspace/${matchId}/support`}>
            <Button variant="danger">Cần hỗ trợ</Button>
          </Link>
        </div>
      </div>

      {/* THOẢ THUẬN */}
      <div className="mt-6">
        <Card>
          <h2 className="font-bold mb-2" style={{ color: "#093774" }}>
            Thoả thuận đồng hành
          </h2>
          {match.agreementConfirmedAt ? (
            <p className="text-sm" style={{ color: "#15803D" }}>
              ✅ Đã xác nhận thoả thuận{" "}
              {new Date(match.agreementConfirmedAt).toLocaleDateString("vi-VN")}
            </p>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: "#2C335D" }}>
                Chưa xác nhận thoả thuận đồng hành chính thức.
              </p>
              <Button onClick={confirmAgreement} disabled={confirming} variant="secondary">
                {confirming ? "Đang xác nhận..." : "Xác nhận thoả thuận"}
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* GHI CHÚ TỪNG BUỔI */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
            Thêm ghi chú buổi gặp
          </h2>
          <form onSubmit={addLog} className="space-y-3">
            <div className="flex gap-2">
              {(["shared", "private"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{
                    background: visibility === v ? "#093774" : "#F5F2EC",
                    color: visibility === v ? "#fff" : "#2C335D",
                  }}
                >
                  {v === "shared" ? "Chung" : "Riêng tư"}
                </button>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border text-sm"
              style={{ borderColor: "#E5E0D5", color: "#2C335D" }}
              placeholder="Ghi lại nội dung trao đổi, việc cần làm..."
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={sending || !note.trim()}>
                {sending ? "Đang gửi..." : "Lưu ghi chú"}
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
            Lịch sử ghi chú ({logs.length})
          </h2>
          {logs.length === 0 ? (
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              Chưa có ghi chú nào.
            </p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg border"
                  style={{
                    borderColor: log.visibility === "private" ? "#FCE8E6" : "#F5F2EC",
                    background: log.visibility === "private" ? "#FFF5F4" : "#fff",
                  }}
                >
                  <p className="text-sm" style={{ color: "#2C335D" }}>
                    {log.content}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
                    {log.author.fullName} ·{" "}
                    {new Date(log.createdAt).toLocaleString("vi-VN")}
                    {log.visibility === "private" && " · 🔒 Riêng tư"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
