"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell, Card, Badge, Button, LineIcon } from "@/components/ui";

export default function CoordinatorPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [pauses, setPauses] = useState<any[]>([]);
  const [support, setSupport] = useState<any[]>([]);
  const [journeyRows, setJourneyRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form tạo buổi trao đổi cho yêu cầu tạm dừng
  const [pauseForm, setPauseForm] = useState<{
    pauseRequestId: string;
    matchId: string;
    title: string;
    startAt: string;
    zoomLink: string;
  } | null>(null);
  const [creatingPause, setCreatingPause] = useState(false);
  const [pauseMsg, setPauseMsg] = useState<string | null>(null);

  async function createPauseReview() {
    if (!pauseForm) return;
    if (!pauseForm.startAt) {
      setPauseMsg("Vui lòng chọn thời gian.");
      return;
    }
    setCreatingPause(true);
    setPauseMsg(null);
    try {
      const res = await fetch("/api/admin/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pauseForm.title || "Buổi trao đổi về tạm dừng",
          description: "Buổi trao đổi giữa ĐPV và cặp đồng hành về yêu cầu tạm dừng.",
          audience: "all",
          startAt: new Date(pauseForm.startAt).toISOString(),
          zoomLink: pauseForm.zoomLink || undefined,
          purpose: "pause_review",
          matchId: pauseForm.matchId,
        }),
      });
      const d = await res.json();
      if (res.ok) {
        setPauseMsg(`✅ Đã tạo buổi trao đổi + gửi email cho ${d.mailed} người.`);
        setPauseForm(null);
        await load();
      } else {
        setPauseMsg(d.error ?? "Có lỗi khi tạo buổi.");
      }
    } finally {
      setCreatingPause(false);
    }
  }

  async function load() {
    setLoading(true);
    try {
      const [mp, ps, sp, js] = await Promise.all([
        fetch("/api/coordinator/queue").then((r) => r.json()),
        fetch("/api/matches/pause?status=pending_review").then((r) => r.json()),
        fetch("/api/support-requests?status=open").then((r) => r.json()),
        fetch("/api/coordinator/journey-stats").then((r) => r.json()),
      ]);
      setMatches(mp.matches ?? []);
      setPauses(ps.pauses ?? []);
      setSupport(sp.supportRequests ?? []);
      setJourneyRows(js.rows ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <AppShell title="ĐPV">
        <p style={{ color: "#292524" }}>Đang tải...</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="ĐPV (Điều phối viên)">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#0F766E" }}>
        Bảng điều phối
      </h1>

      <div className="flex gap-3 mb-8">
        <Link href="/coordinator/review">
          <Button variant="secondary"><span className="inline-flex items-center gap-2"><LineIcon name="checkCircle" size={16} /> Duyệt đơn đăng ký</span></Button>
        </Link>
        <Link href="/coordinator/interviews">
          <Button variant="secondary"><span className="inline-flex items-center gap-2"><LineIcon name="calendar" size={16} /> Quản lý phỏng vấn</span></Button>
        </Link>
        <Link href="/coordinator/matchmaking">
          <Button variant="secondary"><span className="inline-flex items-center gap-2"><LineIcon name="link" size={16} /> Ghép cặp</span></Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <StatCard label="Cặp chờ ĐPV duyệt" value={matches.length} color="#0F766E" />
        <StatCard label="Yêu cầu tạm dừng" value={pauses.length} color="#F2A93B" dark />
        <StatCard label="Cần hỗ trợ" value={support.length} color="#FF6859" />
      </div>

      <div className="space-y-6">
        <Card>
          <h2 className="font-bold mb-4" style={{ color: "#0F766E" }}>
            Cặp chờ ĐPV duyệt
          </h2>
          {matches.length === 0 ? (
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              Không có cặp nào chờ duyệt.
            </p>
          ) : (
            <div className="space-y-2">
              {matches.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  style={{ borderColor: "#F5F2EC" }}
                >
                  <span className="text-sm" style={{ color: "#292524" }}>
                    Fit: {m.fitScore?.toFixed(2) ?? " - "} · #{m.id.slice(0, 8)}
                  </span>
                  <Badge color="#F2A93B">{m.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-bold mb-4" style={{ color: "#B45309" }}>
            Yêu cầu tạm dừng (đang chờ)
          </h2>
          {pauses.length === 0 ? (
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              Không có yêu cầu tạm dừng.
            </p>
          ) : (
            <div className="space-y-2">
              {pauses.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  style={{ borderColor: "#F5F2EC" }}
                >
                  <span className="text-sm" style={{ color: "#292524" }}>
                    {p.reasonText ?? "Không có lý do"}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge color="#F2A93B">đang chờ</Badge>
                    <button
                      onClick={() =>
                        setPauseForm({
                          pauseRequestId: p.id,
                          matchId: p.matchId,
                          title: "Buổi trao đổi về tạm dừng",
                          startAt: "",
                          zoomLink: "",
                        })
                      }
                      className="text-xs font-semibold px-3 py-1.5 rounded-full"
                      style={{ background: "#0F766E", color: "#fff" }}
                    >
                      Tạo buổi trao đổi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {pauseForm && (
          <Card>
            <h2 className="font-bold mb-4" style={{ color: "#0F766E" }}>
              Tạo buổi trao đổi về tạm dừng
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#292524" }}>
                  Tên buổi
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "#E5E0D5", color: "#292524" }}
                  value={pauseForm.title}
                  onChange={(e) => setPauseForm({ ...pauseForm, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#292524" }}>
                  Thời gian *
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "#E5E0D5", color: "#292524" }}
                  value={pauseForm.startAt}
                  onChange={(e) => setPauseForm({ ...pauseForm, startAt: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#292524" }}>
                  Link tham dự (Zoom)
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "#E5E0D5", color: "#292524" }}
                  value={pauseForm.zoomLink}
                  placeholder="https://zoom.us/j/..."
                  onChange={(e) => setPauseForm({ ...pauseForm, zoomLink: e.target.value })}
                />
              </div>
              {pauseMsg && (
                <p className="text-sm" style={{ color: pauseMsg.startsWith("✅") ? "#15803D" : "#B45309" }}>
                  {pauseMsg}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setPauseForm(null);
                    setPauseMsg(null);
                  }}
                  className="px-4 py-2 rounded-full text-sm font-semibold"
                  style={{ color: "#57534E", border: "1px solid #E5E0D5" }}
                >
                  Hủy
                </button>
                <Button onClick={createPauseReview} disabled={creatingPause}>
                  {creatingPause ? "Đang tạo..." : "Tạo buổi & gửi email"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card>
          <h2 className="font-bold mb-4" style={{ color: "#0F766E" }}>
            Nhật ký hành trình (các cặp bạn phụ trách)
          </h2>
          {journeyRows.length === 0 ? (
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              Chưa có cặp nào được phân công cho bạn.
            </p>
          ) : (
            <div className="space-y-2">
              {journeyRows.map((r) => (
                <div
                  key={r.matchId}
                  className="p-3 rounded-lg border flex items-center justify-between"
                  style={{ borderColor: "#F5F2EC" }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#292524" }}>
                      {r.menteeName} ↔ {r.mentorName}
                    </p>
                    <p className="text-xs" style={{ color: "#94A3B8" }}>
                      Match #{r.matchId.slice(0, 8)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-xs" style={{ color: "#0F766E" }}>
                      Mentee: <b>{r.menteeEntries}</b>
                    </span>
                    <span className="text-xs" style={{ color: "#B45309" }}>
                      Mentor: <b>{r.mentorEntries}</b>
                    </span>
                    <Badge color="#F2A93B">Tổng {r.total}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-bold mb-4" style={{ color: "#B45309" }}>
            Yêu cầu hỗ trợ (mở)
          </h2>
          {support.length === 0 ? (
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              Không có yêu cầu hỗ trợ.
            </p>
          ) : (
            <div className="space-y-2">
              {support.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-lg border"
                  style={{ borderColor: "#F5F2EC" }}
                >
                  <p className="text-sm" style={{ color: "#292524" }}>
                    {s.message}
                  </p>
                  <span className="text-xs" style={{ color: "#94A3B8" }}>
                    Match #{s.matchId?.slice(0, 8) ?? " - "}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  color,
  dark,
}: {
  label: string;
  value: number;
  color: string;
  dark?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-6 shadow-sm"
      style={{ background: color, color: dark ? "#3B2A24" : "#fff" }}
    >
      <p className="text-4xl font-bold">{value}</p>
      <p className="mt-1 text-sm" style={{ opacity: 0.9 }}>{label}</p>
    </div>
  );
}
