"use client";

import { useEffect, useState, useCallback } from "react";
import { AppShell, Card, Badge, Button } from "@/components/ui";

type Mentor = {
  id: string;
  industry: string | null;
  capacityMax: number;
  user: { fullName: string };
  professionalJson: any;
  identityJson: any;
  readinessJson: any;
  connected?: number;
  pendingCount?: number;
  slotsLeft?: number;
  certified?: boolean;
};

type Mentee = {
  id: string;
  goalText: string | null;
  user: { fullName: string };
  profileJson: any;
  needs: { needCategory: string }[];
};

const NEED_LABEL: Record<string, string> = {
  learning: "Học tập",
  career: "Sự nghiệp",
  personal_dev: "Phát triển cá nhân",
  life_transition: "Chuyển tiếp giai đoạn",
};

export default function DiscoverPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [viewing, setViewing] = useState<"mentor" | "mentee">("mentor");
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mr, me] = await Promise.all([
        fetch("/api/discover?type=mentor").then((r) => r.json()),
        fetch("/api/discover?type=mentee").then((r) => r.json()),
      ]);
      setMentors(mr.mentors ?? []);
      setMentees(me.mentees ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function ph(json: any, key: string): string {
    return json?.[key] ?? "—";
  }

  async function requestConnect(targetId: string) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/matches/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("✅ Đã gửi yêu cầu kết nối! Chờ đối phương đồng ý.");
      } else {
        setMsg(data.error ?? "Có lỗi xảy ra");
      }
    } catch (e) {
      setMsg("Có lỗi xảy ra");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell title="Khám phá & Kết nối">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#093774" }}>
        Kết nối đồng hành
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(
          [
            ["mentor", `Mentor sẵn sàng (${mentors.length})`],
            ["mentee", `Mentee cần đồng hành (${mentees.length})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setViewing(key)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition"
            style={{
              background: viewing === key ? "#093774" : "#fff",
              color: viewing === key ? "#fff" : "#2C335D",
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
          style={{ background: msg.startsWith("✅") ? "#E6F4EA" : "#FCE8E6", color: "#2C335D" }}
        >
          {msg}
        </div>
      )}

      {loading ? (
        <p style={{ color: "#2C335D" }}>Đang tải...</p>
      ) : viewing === "mentor" ? (
        mentors.length === 0 ? (
          <Card><p className="text-sm" style={{ color: "#94A3B8" }}>Chưa có mentor sẵn sàng ghép cặp.</p></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mentors.map((m) => (
              <Card key={m.id}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "#093774" }}>
                    {(m.user.fullName?.[0] ?? "?").toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: "#093774" }}>{m.user.fullName}</h3>
                    <p className="text-xs" style={{ color: "#94A3B8" }}>{ph(m.professionalJson, "title")}</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm" style={{ color: "#2C335D" }}>
                  <p>🏢 {ph(m.professionalJson, "company")}</p>
                  <p>💼 {ph(m.professionalJson, "yearsExperience")} năm KN</p>
                  <p>📍 {ph(m.identityJson, "city") || "—"}</p>
                  <p>
                    🪑 Slot: {m.connected ?? 0} đã kết nối /{" "}
                    {m.capacityMax} · còn {m.slotsLeft ?? "—"} chỗ
                    {m.pendingCount ? ` · ${m.pendingCount} đang chờ` : ""}
                  </p>
                  {m.certified === false && (
                    <p style={{ color: "#F2A93B" }}>
                      ⏳ Chưa hoàn thành đào tạo &amp; kiểm tra
                    </p>
                  )}
                </div>
                {m.industry && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge color="#15B5B0">{m.industry}</Badge>
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" onClick={() => setSelectedMentor(m)}>Xem chi tiết</Button>
                  <Button onClick={() => requestConnect(m.id)} disabled={busy || m.certified === false}>
                    {m.certified === false ? "Chưa sẵn sàng" : "Kết nối"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : mentees.length === 0 ? (
        <Card><p className="text-sm" style={{ color: "#94A3B8" }}>Chưa có mentee cần đồng hành.</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mentees.map((m) => (
            <Card key={m.id}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "#15B5B0" }}>
                  {(m.user.fullName?.[0] ?? "?").toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: "#093774" }}>{m.user.fullName}</h3>
                  <p className="text-xs" style={{ color: "#94A3B8" }}>{ph(m.profileJson, "major")} · {ph(m.profileJson, "school")}</p>
                </div>
              </div>
              <div className="space-y-1 text-sm" style={{ color: "#2C335D" }}>
                <p>📍 {ph(m.profileJson, "city") || "—"}</p>
              </div>
              {m.needs?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {m.needs.map((n) => (
                    <Badge key={n.needCategory} color="#15B5B0">{NEED_LABEL[n.needCategory] ?? n.needCategory}</Badge>
                  ))}
                </div>
              )}
              {m.goalText && (
                <p className="mt-2 text-xs leading-relaxed" style={{ color: "#94A3B8" }}>🎯 {m.goalText}</p>
              )}
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" onClick={() => setSelectedMentee(m)}>Xem chi tiết</Button>
                <Button onClick={() => requestConnect(m.id)} disabled={busy}>Kết nối</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal chi tiết mentor */}
      {selectedMentor && (
        <DetailModal title="Hồ sơ Mentor" onClose={() => setSelectedMentor(null)}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ background: "#093774" }}>
              {(selectedMentor.user.fullName?.[0] ?? "?").toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: "#093774" }}>{selectedMentor.user.fullName}</h3>
              <p className="text-sm" style={{ color: "#94A3B8" }}>{ph(selectedMentor.professionalJson, "title")} @ {ph(selectedMentor.professionalJson, "company")}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm" style={{ color: "#2C335D" }}>
            <p><b>Kinh nghiệm:</b> {ph(selectedMentor.professionalJson, "yearsExperience")} năm · Quản lý {ph(selectedMentor.professionalJson, "yearsManagement")} năm</p>
            <p><b>Ngành:</b> {selectedMentor.industry ?? "—"}</p>
            <p><b>Thành phố:</b> {ph(selectedMentor.identityJson, "city") || "—"}</p>
            <p><b>Bằng cấp:</b> {ph(selectedMentor.professionalJson, "degree") || "—"}</p>
          </div>
          {selectedMentor.readinessJson?.reason && (
            <div className="mt-3 p-3 rounded-lg italic text-sm" style={{ background: "#F2F9F4", color: "#2C335D" }}>
              "{selectedMentor.readinessJson.reason}"
            </div>
          )}
          <div className="mt-4">
            <Button onClick={() => { requestConnect(selectedMentor.id); setSelectedMentor(null); }} disabled={busy}>
              💚 Gửi yêu cầu kết nối
            </Button>
          </div>
        </DetailModal>
      )}

      {/* Modal chi tiết mentee */}
      {selectedMentee && (
        <DetailModal title="Hồ sơ Mentee" onClose={() => setSelectedMentee(null)}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ background: "#15B5B0" }}>
              {(selectedMentee.user.fullName?.[0] ?? "?").toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: "#093774" }}>{selectedMentee.user.fullName}</h3>
              <p className="text-sm" style={{ color: "#94A3B8" }}>{ph(selectedMentee.profileJson, "major")} · {ph(selectedMentee.profileJson, "school")}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm" style={{ color: "#2C335D" }}>
            <p><b>Thành phố:</b> {ph(selectedMentee.profileJson, "city") || "—"}</p>
            <p><b>Năm học:</b> {ph(selectedMentee.profileJson, "yearOfStudy") || "—"}</p>
          </div>
          {selectedMentee.needs?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedMentee.needs.map((n) => (
                <Badge key={n.needCategory} color="#15B5B0">{NEED_LABEL[n.needCategory] ?? n.needCategory}</Badge>
              ))}
            </div>
          )}
          {selectedMentee.goalText && (
            <p className="mt-3 text-sm" style={{ color: "#2C335D" }}>🎯 <b>Mục tiêu:</b> {selectedMentee.goalText}</p>
          )}
          <div className="mt-4">
            <Button onClick={() => { requestConnect(selectedMentee.id); setSelectedMentee(null); }} disabled={busy}>
              💚 Gửi yêu cầu kết nối
            </Button>
          </div>
        </DetailModal>
      )}
    </AppShell>
  );
}

function DetailModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(9,55,116,.5)" }}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: "#093774" }}>{title}</h2>
          <button onClick={onClose} className="text-2xl leading-none" style={{ color: "#94A3B8" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
