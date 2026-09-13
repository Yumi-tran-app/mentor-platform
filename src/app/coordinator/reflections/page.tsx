"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell, Card, Badge } from "@/components/ui";

type Mood = "good" | "neutral" | "uneasy" | "support_needed";

const MOOD_META: Record<Mood, { label: string; color: string }> = {
  good: { label: "Đang kết nối tốt", color: "#22C55E" },
  neutral: { label: "Đang tìm nhịp phù hợp", color: "#3B82F6" },
  uneasy: { label: "Có điều gì đó chưa ổn", color: "#F2A93B" },
  support_needed: { label: "Cần hỗ trợ", color: "#DC2626" },
};

type Summary = Record<Mood, number> & { total: number };
type MonthRow = { month: number; total: number } & Record<Mood, number>;
type MatchRow = {
  matchId: string;
  mentorName: string;
  menteeName: string;
  status: string | null;
  totalReflections: number;
  latestMood: Mood | null;
  latestMonth: number | null;
  supportNeededCount: number;
};

const MOOD_ORDER: Mood[] = ["good", "neutral", "uneasy", "support_needed"];

export default function CoordinatorReflections() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [byMonth, setByMonth] = useState<MonthRow[]>([]);
  const [rows, setRows] = useState<MatchRow[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/coordinator/reflection-stats");
      const d = await r.json();
      setSummary(d.summary ?? null);
      setByMonth(d.byMonth ?? []);
      setRows(d.rows ?? []);
      setIsAdmin(d.isAdmin ?? false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AppShell title="Thống kê phản tư">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0F766E" }}>
            Thống kê phản tư hằng tháng
          </h1>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
            {isAdmin ? "Toàn bộ các cặp đồng hành" : "Các cặp bạn phụ trách"}
          </p>
        </div>
        <button
          onClick={load}
          className="text-sm font-semibold px-4 py-2 rounded-full border"
          style={{ color: "#0F766E", borderColor: "#E5E0D5" }}
        >
          Làm mới
        </button>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: "#94A3B8" }}>Đang tải...</p>
      ) : !summary ? (
        <p className="text-sm" style={{ color: "#94A3B8" }}>Chưa có dữ liệu phản tư.</p>
      ) : (
        <>
          {/* TỔNG QUAN */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatBox label="Tổng phản tư" value={summary.total} color="#0F766E" />
            {MOOD_ORDER.map((m) => (
              <StatBox
                key={m}
                label={MOOD_META[m].label}
                value={summary[m] ?? 0}
                color={MOOD_META[m].color}
              />
            ))}
          </div>

          {/* PHÂN BỐ THEO THÁNG */}
          {byMonth.length > 0 && (
            <Card className="mb-6">
              <h2 className="font-bold mb-4" style={{ color: "#0F766E" }}>
                Phân bố theo tháng
              </h2>
              <div className="space-y-3">
                {byMonth.map((m) => (
                  <div key={m.month} className="flex items-center gap-3">
                    <span className="text-xs font-bold w-20 shrink-0" style={{ color: "#57534E" }}>
                      Tháng {m.month}
                    </span>
                    <div className="flex flex-1 items-center gap-1 h-6 rounded overflow-hidden bg-stone-100">
                      {MOOD_ORDER.map((mood) => {
                        const count = (m[mood] as number) ?? 0;
                        if (count === 0) return null;
                        const pct = (count / m.total) * 100;
                        return (
                          <div
                            key={mood}
                            title={`${MOOD_META[mood].label}: ${count}`}
                            style={{
                              width: `${pct}%`,
                              background: MOOD_META[mood].color,
                            }}
                          />
                        );
                      })}
                    </div>
                    <span className="text-xs w-8 text-right shrink-0" style={{ color: "#94A3B8" }}>
                      {m.total}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* BẢNG CHI TIẾT THEO CẶP */}
          <Card>
            <h2 className="font-bold mb-4" style={{ color: "#0F766E" }}>
              Chi tiết theo cặp đồng hành
            </h2>
            {rows.length === 0 ? (
              <p className="text-sm" style={{ color: "#94A3B8" }}>Chưa có cặp nào phản tư.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b" style={{ borderColor: "#F5F2EC" }}>
                      <th className="py-2 pr-3 font-semibold" style={{ color: "#57534E" }}>Mentor</th>
                      <th className="py-2 pr-3 font-semibold" style={{ color: "#57534E" }}>Mentee</th>
                      <th className="py-2 pr-3 font-semibold" style={{ color: "#57534E" }}>Số phản tư</th>
                      <th className="py-2 pr-3 font-semibold" style={{ color: "#57534E" }}>Mood gần nhất</th>
                      <th className="py-2 pr-3 font-semibold" style={{ color: "#57534E" }}>Cần hỗ trợ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.matchId} className="border-b" style={{ borderColor: "#F5F2EC" }}>
                        <td className="py-2 pr-3 font-medium" style={{ color: "#292524" }}>{r.mentorName}</td>
                        <td className="py-2 pr-3" style={{ color: "#292524" }}>{r.menteeName}</td>
                        <td className="py-2 pr-3" style={{ color: "#57534E" }}>{r.totalReflections}</td>
                        <td className="py-2 pr-3">
                          {r.latestMood ? (
                            <Badge color={MOOD_META[r.latestMood].color}>
                              {MOOD_META[r.latestMood].label}
                              {r.latestMonth ? ` · T${r.latestMonth}` : ""}
                            </Badge>
                          ) : (
                            <span style={{ color: "#94A3B8" }}>-</span>
                          )}
                        </td>
                        <td className="py-2 pr-3">
                          {r.supportNeededCount > 0 ? (
                            <span className="font-bold" style={{ color: "#DC2626" }}>
                              {r.supportNeededCount} lần
                            </span>
                          ) : (
                            <span style={{ color: "#94A3B8" }}>0</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </AppShell>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card className="text-center">
      <div className="text-3xl font-bold" style={{ color }}>{value}</div>
      <div className="text-xs mt-1" style={{ color: "#94A3B8" }}>{label}</div>
    </Card>
  );
}
