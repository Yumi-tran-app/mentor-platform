"use client";

import { useEffect, useState, useCallback } from "react";
import { AppShell, Card, Badge, Button, LineIcon } from "@/components/ui";
import { useCurrentUser } from "@/lib/use-current-user";
import { VIETNAM_PROVINCES } from "@/lib/vietnam-locations";

type Mentor = {
  id: string;
  industry: string | null;
  capacityMax: number;
  city?: string | null;
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
  city?: string | null;
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

const PAGE_SIZE = 15;

export default function DiscoverPage() {
  const user = useCurrentUser();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [mentees, setMentees] = useState<Mentee[]>([]);
  // Xác định vai trò: mentee chỉ xem mentor, mentor chỉ xem mentee
  const [role, setRole] = useState<"mentor" | "mentee" | null>(null);
  const [myCity, setMyCity] = useState<string>("");
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mr, me, prof] = await Promise.all([
        fetch("/api/discover?type=mentor").then((r) => r.json()),
        fetch("/api/discover?type=mentee").then((r) => r.json()),
        fetch("/api/profile").then((r) => r.json()),
      ]);
      setMentors(mr.mentors ?? []);
      setMentees(me.mentees ?? []);

      // Xác định vai trò theo application
      if (prof.mentor) {
        setRole("mentor");
        setMyCity(prof.mentor.identityJson?.city ?? "");
      } else if (prof.mentee) {
        setRole("mentee");
        setMyCity(prof.mentee.profileJson?.city ?? "");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Dữ liệu theo vai trò
  const isMentor = role === "mentor"; // mentor chỉ xem danh sách mentee
  const title = isMentor ? "Mentee cần đồng hành" : "Mentor sẵn sàng";

  // Lấy danh sách city để filter (dùng danh sách 63 tỉnh/thành chuẩn)
  const allItems = isMentor
    ? (mentees as { city?: string | null }[])
    : (mentors as { city?: string | null }[]);
  const availableCities = Array.from(
    new Set(allItems.map((i) => i.city).filter(Boolean))
  ) as string[];
  const cities = VIETNAM_PROVINCES.filter((c) => availableCities.includes(c));

  // Filter theo city (mặc định dùng city của chính mình nếu có)
  const [cityFilter, setCityFilter] = useState<string>("");
  const effectiveCity = cityFilter || myCity || "";
  const filteredMentors = effectiveCity
    ? mentors.filter((m) => m.city === effectiveCity)
    : mentors;
  const filteredMentees = effectiveCity
    ? mentees.filter((m) => m.city === effectiveCity)
    : mentees;

  const mentorList = filteredMentors.slice(0, visibleCount);
  const menteeList = filteredMentees.slice(0, visibleCount);
  const totalCount = isMentor ? filteredMentees.length : filteredMentors.length;
  const hasMore = totalCount > visibleCount;

  return (
    <AppShell title="Khám phá & Kết nối">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "#0F766E" }}>
          <LineIcon name="compass" size={22} /> {title}
        </h1>
        {/* Bộ lọc tỉnh thành */}
        <div className="flex items-center gap-2">
          <LineIcon name="pin" size={16} />
          <select
            value={effectiveCity}
            onChange={(e) => { setCityFilter(e.target.value); setVisibleCount(PAGE_SIZE); }}
            className="px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: "#E5E0D5", color: "#292524", background: "#fff" }}
          >
            <option value="">Tất cả tỉnh/thành</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {msg && (
        <div className="mb-4 rounded-lg px-4 py-3 text-sm" style={{ background: msg.startsWith("✅") ? "#E6F4EA" : "#FCE8E6", color: "#292524" }}>
          {msg}
        </div>
      )}

      {loading ? (
        <p style={{ color: "#292524" }}>Đang tải...</p>
      ) : totalCount === 0 ? (
        <Card>
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            {isMentor ? "Chưa có mentee cần đồng hành trong khu vực này." : "Chưa có mentor sẵn sàng trong khu vực này."}
          </p>
        </Card>
      ) : isMentor ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {menteeList.map((m) => (
              <Card key={m.id}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "#15B5B0" }}>
                    {(m.user.fullName?.[0] ?? "?").toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: "#0F766E" }}>{m.user.fullName}</h3>
                    <p className="text-xs" style={{ color: "#94A3B8" }}>{ph(m.profileJson, "major")} · {ph(m.profileJson, "school")}</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm" style={{ color: "#292524" }}>
                  <p className="flex items-center gap-1.5"><LineIcon name="pin" size={14} /> {m.city || ph(m.profileJson, "city") || "—"}</p>
                </div>
                {m.needs?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.needs.map((n) => (
                      <Badge key={n.needCategory} color="#15B5B0">{NEED_LABEL[n.needCategory] ?? n.needCategory}</Badge>
                    ))}
                  </div>
                )}
                {m.goalText && (
                  <p className="mt-2 text-xs leading-relaxed" style={{ color: "#94A3B8" }}>{m.goalText}</p>
                )}
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" onClick={() => setSelectedMentee(m)}>Xem chi tiết</Button>
                  <Button onClick={() => requestConnect(m.id)} disabled={busy}>Kết nối</Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mentorList.map((m) => (
            <Card key={m.id}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "#0F766E" }}>
                  {(m.user.fullName?.[0] ?? "?").toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: "#0F766E" }}>{m.user.fullName}</h3>
                  <p className="text-xs" style={{ color: "#94A3B8" }}>{ph(m.professionalJson, "title")}</p>
                </div>
              </div>
              <div className="space-y-1 text-sm" style={{ color: "#292524" }}>
                <p className="flex items-center gap-1.5"><LineIcon name="briefcase" size={14} /> {ph(m.professionalJson, "company")}</p>
                <p className="flex items-center gap-1.5"><LineIcon name="clock" size={14} /> {ph(m.professionalJson, "yearsExperience")} năm KN</p>
                <p className="flex items-center gap-1.5"><LineIcon name="pin" size={14} /> {m.city || ph(m.identityJson, "city") || "—"}</p>
                <p>
                  <span className="inline-flex items-center gap-1"><LineIcon name="users" size={14} /> Slot:</span> {m.connected ?? 0} đã kết nối /{" "}
                  {m.capacityMax} · còn {m.slotsLeft ?? "—"} chỗ
                  {m.pendingCount ? ` · ${m.pendingCount} đang chờ` : ""}
                </p>
                {m.certified === false && (
                  <p style={{ color: "#F2A93B" }}>
                    <span className="inline-flex items-center gap-1"><LineIcon name="clock" size={14} /> Chưa hoàn thành đào tạo</span>
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
      )}

      {/* Nút xem thêm */}
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-white"
            style={{ background: "#0F766E" }}
          >
            Xem thêm <LineIcon name="arrowRight" size={16} />
          </button>
        </div>
      )}

      {/* Modal chi tiết mentor */}
      {selectedMentor && (
        <DetailModal title="Hồ sơ Mentor" onClose={() => setSelectedMentor(null)}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ background: "#0F766E" }}>
              {(selectedMentor.user.fullName?.[0] ?? "?").toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: "#0F766E" }}>{selectedMentor.user.fullName}</h3>
              <p className="text-sm" style={{ color: "#94A3B8" }}>{ph(selectedMentor.professionalJson, "title")} @ {ph(selectedMentor.professionalJson, "company")}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm" style={{ color: "#292524" }}>
            <p><b>Kinh nghiệm:</b> {ph(selectedMentor.professionalJson, "yearsExperience")} năm · Quản lý {ph(selectedMentor.professionalJson, "yearsManagement")} năm</p>
            <p><b>Ngành:</b> {selectedMentor.industry ?? "—"}</p>
            <p><b>Thành phố:</b> {selectedMentor.city || ph(selectedMentor.identityJson, "city") || "—"}</p>
            <p><b>Bằng cấp:</b> {ph(selectedMentor.professionalJson, "degree") || "—"}</p>
          </div>
          {selectedMentor.readinessJson?.reason && (
            <div className="mt-3 p-3 rounded-lg italic text-sm" style={{ background: "#F2F9F4", color: "#292524" }}>
              "{selectedMentor.readinessJson.reason}"
            </div>
          )}
          <div className="mt-4">
            <Button onClick={() => { requestConnect(selectedMentor.id); setSelectedMentor(null); }} disabled={busy}>
              <span className="inline-flex items-center gap-2"><LineIcon name="heart" size={16} /> Gửi yêu cầu kết nối</span>
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
              <h3 className="text-lg font-bold" style={{ color: "#0F766E" }}>{selectedMentee.user.fullName}</h3>
              <p className="text-sm" style={{ color: "#94A3B8" }}>{ph(selectedMentee.profileJson, "major")} · {ph(selectedMentee.profileJson, "school")}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm" style={{ color: "#292524" }}>
            <p><b>Thành phố:</b> {selectedMentee.city || ph(selectedMentee.profileJson, "city") || "—"}</p>
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
            <p className="mt-3 text-sm" style={{ color: "#292524" }}><b>Mục tiêu:</b> {selectedMentee.goalText}</p>
          )}
          <div className="mt-4">
            <Button onClick={() => { requestConnect(selectedMentee.id); setSelectedMentee(null); }} disabled={busy}>
              <span className="inline-flex items-center gap-2"><LineIcon name="heart" size={16} /> Gửi yêu cầu kết nối</span>
            </Button>
          </div>
        </DetailModal>
      )}
    </AppShell>
  );
}

function DetailModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(19,78,74,.5)" }}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: "#0F766E" }}>{title}</h2>
          <button onClick={onClose} className="text-2xl leading-none" style={{ color: "#94A3B8" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
