"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell, Card, Badge, Button } from "@/components/ui";

export default function CoordinatorPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [pauses, setPauses] = useState<any[]>([]);
  const [support, setSupport] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [mp, ps, sp] = await Promise.all([
          fetch("/api/coordinator/queue").then((r) => r.json()),
          fetch("/api/matches/pause?status=pending_review").then((r) => r.json()),
          fetch("/api/support-requests?status=open").then((r) => r.json()),
        ]);
        setMatches(mp.matches ?? []);
        setPauses(ps.pauses ?? []);
        setSupport(sp.supportRequests ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <AppShell title="ĐPV">
        <p style={{ color: "#2C335D" }}>Đang tải...</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="ĐPV (Điều phối viên)">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#093774" }}>
        Bảng điều phối
      </h1>

      <div className="flex gap-3 mb-8">
        <Link href="/coordinator/interviews">
          <Button variant="secondary">🗓️ Quản lý phỏng vấn</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <StatCard label="Cặp chờ duyệt" value={matches.length} color="#093774" />
        <StatCard label="Yêu cầu tạm dừng" value={pauses.length} color="#F2A93B" />
        <StatCard label="Cần hỗ trợ" value={support.length} color="#FF6859" />
      </div>

      <div className="space-y-6">
        <Card>
          <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
            Cặp đang chờ ĐPV duyệt
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
                  <span className="text-sm" style={{ color: "#2C335D" }}>
                    Fit: {m.fitScore?.toFixed(2) ?? "—"} · #{m.id.slice(0, 8)}
                  </span>
                  <Badge color="#F2A93B">{m.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-bold mb-4" style={{ color: "#F2A93B" }}>
            Yêu cầu tạm dừng (pending)
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
                  <span className="text-sm" style={{ color: "#2C335D" }}>
                    {p.reasonText ?? "Không có lý do"}
                  </span>
                  <Badge color="#F2A93B">pending_review</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-bold mb-4" style={{ color: "#FF6859" }}>
            Yêu cầu hỗ trợ (open)
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
                  <p className="text-sm" style={{ color: "#2C335D" }}>
                    {s.message}
                  </p>
                  <span className="text-xs" style={{ color: "#94A3B8" }}>
                    Match #{s.matchId?.slice(0, 8) ?? "—"}
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
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-6 text-white shadow-sm"
      style={{ background: color }}
    >
      <p className="text-4xl font-bold">{value}</p>
      <p className="mt-1 text-sm opacity-90">{label}</p>
    </div>
  );
}
