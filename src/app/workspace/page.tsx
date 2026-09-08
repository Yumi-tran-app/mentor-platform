"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell, Card, Badge, LineIcon } from "@/components/ui";

type Match = {
  id: string;
  status: string;
  fitScore: number | null;
  goalText: string | null;
  mentorApplication: { user: { fullName: string; id: string } };
  menteeApplication: { user: { fullName: string; id: string } };
};

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

// Màu chuẩn hoá: trạng thái thuận lợi (mở được) dùng xanh ngọc/xanh lá.
const statusColor: Record<string, string> = {
  recommended: "#94A3B8",
  pending_coordinator_review: "#94A3B8",
  proposed_to_parties: "#F2A93B",
  mentor_accepted: "#15B5B0",
  mutual_accepted: "#15B5B0",
  first_connection_done: "#0F766E",
  active: "#15803D",
  paused: "#F2A93B",
  ended: "#94A3B8",
};

export default function WorkspacePage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/matches")
      .then((r) => r.json())
      .then((d) => setMatches(d.matches ?? []))
      .finally(() => setLoading(false));
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setMyId(d.user?.id ?? null));
  }, []);

  // Đóng menu ⋮ khi click ra ngoài
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuFor(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
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

  if (loading) {
    return (
      <AppShell title="Workspace">
        <p style={{ color: "#292524" }}>Đang tải...</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Workspace">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#0F766E" }}>
          Không gian đồng hành
        </h1>
      </div>

      {matches.length === 0 ? (
        <Card>
          <h2 className="font-bold mb-2" style={{ color: "#0F766E" }}>
            Chưa có cặp đồng hành
          </h2>
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Sau khi đơn đăng ký của bạn được duyệt, đội ngũ điều phối sẽ ghép
            cặp phù hợp và cặp của bạn sẽ hiển thị tại đây.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {matches.map((m) => {
            const myRole =
              myId === m.mentorApplication.user.id
                ? "mentor"
                : myId === m.menteeApplication.user.id
                  ? "mentee"
                  : null;

            const canAct =
              (m.status === "proposed_to_parties" && myRole === "mentor") ||
              (m.status === "mentor_accepted" && myRole === "mentee");

            return (
              <div
                key={m.id}
                onClick={() => router.push(`/workspace/${m.id}`)}
                className="rounded-2xl p-6 shadow-sm border cursor-pointer hover:shadow-md transition relative"
                style={{ background: "#fff", borderColor: "#F5F2EC" }}
              >
                {/* menu ⋮ */}
                <div className="absolute top-4 right-4" ref={menuFor === m.id ? menuRef : undefined}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuFor(menuFor === m.id ? null : m.id);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-100"
                    title="Tuỳ chọn"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#57534E" }}>
                      <circle cx="5" cy="12" r="1.6" />
                      <circle cx="12" cy="12" r="1.6" />
                      <circle cx="19" cy="12" r="1.6" />
                    </svg>
                  </button>
                  {menuFor === m.id && (
                    <div
                      className="absolute right-0 mt-1 w-44 rounded-xl shadow-lg border bg-white z-20 overflow-hidden"
                      style={{ borderColor: "#F5F2EC" }}
                    >
                      <MenuLink href={`/workspace/${m.id}/reflect`} label="Phản tư" icon="bulb" onDone={() => setMenuFor(null)} />
                      <MenuLink href={`/workspace/${m.id}/support`} label="Cần hỗ trợ" icon="alert" onDone={() => setMenuFor(null)} danger />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3 pr-10">
                  <Badge color={statusColor[m.status] ?? "#94A3B8"}>
                    {statusLabel[m.status] ?? m.status}
                  </Badge>
                  {m.fitScore != null && (
                    <span className="text-xs" style={{ color: "#94A3B8" }}>
                      Fit {m.fitScore.toFixed(2)}
                    </span>
                  )}
                </div>

                <p className="text-sm" style={{ color: "#292524" }}>
                  <span className="font-semibold">Mentor:</span>{" "}
                  {m.mentorApplication.user.fullName}
                </p>
                <p className="text-sm mt-1" style={{ color: "#292524" }}>
                  <span className="font-semibold">Mentee:</span>{" "}
                  {m.menteeApplication.user.fullName}
                </p>

                {m.goalText && (
                  <div className="mt-3 p-3 rounded-lg text-sm" style={{ background: "#F2F9F4", color: "#292524" }}>
                    <LineIcon name="target" size={14} /> <b>Mục tiêu:</b> {m.goalText}
                  </div>
                )}

                {/* Respond khi đang chờ xác nhận kết nối */}
                {(m.status === "proposed_to_parties" || m.status === "mentor_accepted") && (
                  <div onClick={(e) => e.stopPropagation()}>
                    {!canAct ? (
                      <p className="mt-3 text-xs italic" style={{ color: "#94A3B8" }}>
                        <LineIcon name="clock" size={14} /> Đang chờ đối phương xác nhận.
                      </p>
                    ) : (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => respond(m.id, true)}
                          className="px-4 py-2 rounded-full text-white text-sm font-semibold"
                          style={{ background: "#0F766E" }}
                        >
                          Đồng ý
                        </button>
                        <button
                          onClick={() => respond(m.id, false)}
                          className="px-4 py-2 rounded-full text-white text-sm font-semibold"
                          style={{ background: "#B45309" }}
                        >
                          Từ chối
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 text-sm font-semibold" style={{ color: "#0F766E" }}>
                  Mở chi tiết →
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

function MenuLink({
  href,
  label,
  icon,
  danger,
  onDone,
}: {
  href: string;
  label: string;
  icon: string;
  danger?: boolean;
  onDone: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onDone}
      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium hover:bg-stone-50"
      style={{ color: danger ? "#B45309" : "#292524" }}
    >
      <LineIcon name={icon as any} size={15} /> {label}
    </Link>
  );
}
