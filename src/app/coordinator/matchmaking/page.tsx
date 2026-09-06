"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell, Card, Badge, Button } from "@/components/ui";

type Mentee = {
  id: string;
  hasActiveMatch: boolean;
  goalText: string | null;
  availabilityStatus: string;
  user: { fullName: string; email: string };
  profileJson: any;
  needs: { needCategory: string }[];
};

type Mentor = {
  id: string;
  industry: string | null;
  capacityMax: number;
  capacityUsed: number;
  user: { fullName: string; email: string };
};

type QueueMatch = {
  id: string;
  status: string;
  fitScore: number | null;
  goalText: string | null;
  mentorApplication: { id: string; user: { fullName: string } };
  menteeApplication: { id: string; user: { fullName: string } };
  reviews: { id: string; decision: string; decidedAt: string | null }[];
};

const NEED_LABEL: Record<string, string> = {
  learning: "Học tập",
  career: "Sự nghiệp",
  personal_dev: "Phát triển cá nhân",
  life_transition: "Chuyển đổi giai đoạn",
};

const STATUS_LABEL: Record<string, string> = {
  recommended: "Đã đề xuất",
  pending_coordinator_review: "Chờ ĐPV duyệt",
  proposed_to_parties: "Đã gửi hai bên",
  mentor_accepted: "Mentor đã đồng ý",
  mutual_accepted: "Hai bên đồng ý",
  first_connection_done: "Đã kết nối lần đầu",
  active: "Đang đồng hành",
  paused: "Tạm dừng",
  ended: "Đã kết thúc",
};

export default function MatchmakingPage() {
  const [tab, setTab] = useState<"pool" | "queue">("queue");
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [queue, setQueue] = useState<QueueMatch[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pool, q, profile] = await Promise.all([
        fetch("/api/coordinator/pool").then((r) => r.json()),
        fetch("/api/coordinator/queue").then((r) => r.json()),
        fetch("/api/profile").then((r) => r.json()),
      ]);
      setMentees(pool.mentees ?? []);
      setMentors(pool.mentors ?? []);
      setQueue(q.matches ?? []);
      setMyId(profile.user?.id ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function flash(text: string, ok = true) {
    setMsg(text);
    setTimeout(() => setMsg(null), 4000);
  }

  async function recommend(menteeId: string) {
    setBusy(menteeId);
    try {
      const res = await fetch("/api/matches/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menteeApplicationId: menteeId }),
      });
      const data = await res.json();
      if (res.ok) {
        flash("✅ Đã đề xuất cặp ghép. Xem tab 'Cặp chờ duyệt' để phân công.");
        await load();
      } else {
        flash(`⚠️ ${data.error ?? "Lỗi"}`, false);
      }
    } catch (e) {
      flash("⚠️ Có lỗi xảy ra", false);
    } finally {
      setBusy(null);
    }
  }

  async function assign(matchId: string) {
    setBusy(matchId);
    try {
      // Lấy match_review pending của cặp
      const m = queue.find((x) => x.id === matchId);
      const reviewId = m?.reviews?.find((r) => r.decision === "pending")?.id;
      if (!reviewId) {
        flash("⚠️ Không tìm thấy review đang chờ", false);
        setBusy(null);
        return;
      }
      const res = await fetch("/api/coordinator/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchReviewId: reviewId, coordinatorId: myId }),
      });
      const data = await res.json();
      if (res.ok) {
        flash("✅ Đã phân công cho bạn duyệt.");
        await load();
      } else {
        flash(`⚠️ ${data.error ?? "Lỗi"}`, false);
      }
    } catch (e) {
      flash("⚠️ Có lỗi xảy ra", false);
    } finally {
      setBusy(null);
    }
  }

  async function decide(matchId: string, decision: "approved" | "needs_more_info") {
    setBusy(matchId);
    try {
      const m = queue.find((x) => x.id === matchId);
      const reviewId = m?.reviews?.find((r) => r.decision === "pending")?.id;
      if (!reviewId) {
        flash("⚠️ Không tìm thấy review đang chờ", false);
        setBusy(null);
        return;
      }
      const res = await fetch("/api/coordinator/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchReviewId: reviewId, decision }),
      });
      const data = await res.json();
      if (res.ok) {
        flash(decision === "approved" ? "✅ Đã duyệt cặp, hai bên sẽ nhận thông báo." : "ℹ️ Đã đánh dấu cần bổ sung thông tin.");
        await load();
      } else {
        flash(`⚠️ ${data.error ?? "Lỗi"}`, false);
      }
    } catch (e) {
      flash("⚠️ Có lỗi xảy ra", false);
    } finally {
      setBusy(null);
    }
  }

  function ph(json: any, key: string): string {
    return json?.[key] ?? "—";
  }

  return (
    <AppShell title="Ghép cặp">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "#093774" }}>
        Ghép cặp & duyệt kết nối
      </h1>
      <p className="text-sm mb-6" style={{ color: "#94A3B8" }}>
        Đề xuất cặp phù hợp, phân công và duyệt để kích hoạt kết nối.
      </p>

      <div className="flex gap-2 mb-6">
        {(
          [
            ["queue", `Cặp chờ duyệt (${queue.length})`],
            ["pool", `Nguồn ghép cặp`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition"
            style={{
              background: tab === key ? "#093774" : "#fff",
              color: tab === key ? "#fff" : "#2C335D",
              border: "1px solid #E5E0D5",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {msg && (
        <div
          className="mb-4 rounded-lg px-4 py-3 text-sm"
          style={{ background: msg.startsWith("✅") || msg.startsWith("ℹ️") ? "#E6F4EA" : "#FCE8E6", color: "#2C335D" }}
        >
          {msg}
        </div>
      )}

      {loading ? (
        <p style={{ color: "#2C335D" }}>Đang tải...</p>
      ) : tab === "queue" ? (
        queue.length === 0 ? (
          <Card><p className="text-sm" style={{ color: "#94A3B8" }}>Không có cặp nào chờ duyệt.</p></Card>
        ) : (
          <div className="space-y-4">
            {queue.map((m) => {
              const pendingReview = m.reviews?.find((r) => r.decision === "pending");
              const assigned = m.status === "pending_coordinator_review";
              return (
                <Card key={m.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge color={assigned ? "#15B5B0" : "#F2A93B"}>
                          {STATUS_LABEL[m.status] ?? m.status}
                        </Badge>
                        {m.fitScore != null && (
                          <span className="text-xs" style={{ color: "#94A3B8" }}>
                            Fit {m.fitScore.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm" style={{ color: "#2C335D" }}>
                        <span>🧑‍🏫 <b>Mentor:</b> {m.mentorApplication.user.fullName}</span>
                        <span>🎓 <b>Mentee:</b> {m.menteeApplication.user.fullName}</span>
                      </div>
                      {m.goalText && (
                        <p className="mt-2 text-sm" style={{ color: "#2C335D" }}>
                          🎯 <b>Mục tiêu:</b> {m.goalText}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      {!assigned && pendingReview ? (
                        <Button onClick={() => assign(m.id)} disabled={busy === m.id}>
                          👤 Phân công duyệt
                        </Button>
                      ) : (
                        <>
                          <Button onClick={() => decide(m.id, "approved")} disabled={busy === m.id}>
                            ✓ Duyệt kết nối
                          </Button>
                          <Button variant="danger" onClick={() => decide(m.id, "needs_more_info")} disabled={busy === m.id}>
                            ↻ Cần bổ sung
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Nguồn mentee chờ ghép */}
          <div>
            <h2 className="font-bold mb-3" style={{ color: "#15B5B0" }}>
              Mentee chờ ghép ({mentees.length})
            </h2>
            <div className="space-y-3">
              {mentees.length === 0 && (
                <Card><p className="text-sm" style={{ color: "#94A3B8" }}>Chưa có mentee chờ ghép.</p></Card>
              )}
              {mentees.map((m) => (
                <Card key={m.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-sm" style={{ color: "#093774" }}>{m.user.fullName}</h3>
                      <p className="text-xs" style={{ color: "#94A3B8" }}>
                        {ph(m.profileJson, "major")} · {ph(m.profileJson, "school")}
                      </p>
                      {m.needs?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {m.needs.map((n) => (
                            <Badge key={n.needCategory} color="#15B5B0">{NEED_LABEL[n.needCategory] ?? n.needCategory}</Badge>
                          ))}
                        </div>
                      )}
                      {m.hasActiveMatch && (
                        <p className="mt-1 text-xs" style={{ color: "#FF6859" }}>Đã có cặp đang hoạt động</p>
                      )}
                    </div>
                    <Button onClick={() => recommend(m.id)} disabled={busy === m.id || m.hasActiveMatch}>
                      🔗 Đề xuất
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Mentor khả dụng */}
          <div>
            <h2 className="font-bold mb-3" style={{ color: "#093774" }}>
              Mentor khả dụng ({mentors.length})
            </h2>
            <div className="space-y-3">
              {mentors.length === 0 && (
                <Card><p className="text-sm" style={{ color: "#94A3B8" }}>Chưa có mentor sẵn sàng.</p></Card>
              )}
              {mentors.map((m) => (
                <Card key={m.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-sm" style={{ color: "#093774" }}>{m.user.fullName}</h3>
                      {m.industry && <Badge color="#15B5B0">{m.industry}</Badge>}
                    </div>
                    <span className="text-xs" style={{ color: "#94A3B8" }}>
                      {m.capacityUsed}/{m.capacityMax} mentee
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
