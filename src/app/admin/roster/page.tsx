"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell, Card, Button, Badge } from "@/components/ui";

type RosterResponse = {
  type: "mentor" | "mentee";
  columns: { key: string; label: string }[];
  data: Record<string, string>[];
  total: number;
};

export default function AdminRosterPage() {
  const [tab, setTab] = useState<"mentor" | "mentee">("mentor");
  const [roster, setRoster] = useState<RosterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    created: number;
    updated: number;
    skipped: number;
    errors: string[];
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load(type: "mentor" | "mentee") {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/roster?type=${type}`);
      if (r.ok) {
        setRoster(await r.json());
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(tab);
  }, [tab]);

  function switchTab(t: "mentor" | "mentee") {
    setResult(null);
    setTab(t);
  }

  function exportCsv() {
    window.location.href = `/api/admin/roster/export?type=${tab}`;
  }

  async function handleImport(file: File) {
    setImporting(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`/api/admin/roster/import?type=${tab}`, {
        method: "POST",
        body: fd,
      });
      if (r.ok) {
        const d = await r.json();
        setResult(d);
        await load(tab);
      } else {
        const e = await r.json().catch(() => null);
        setResult({
          created: 0,
          updated: 0,
          skipped: 1,
          errors: [e?.error ?? "Lỗi khi nhập file"],
        });
      }
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const columns = roster?.columns ?? [];
  const data = roster?.data ?? [];

  return (
    <AppShell title="Danh sách Mentor & Mentee">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0F766E" }}>
            Danh sách Mentor & Mentee
          </h1>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
            Xuất / nhập danh sách để lưu trữ &amp; backup định kỳ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={exportCsv}>
            ⬇ Xuất CSV ({tab === "mentor" ? "Mentor" : "Mentee"})
          </Button>
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
          >
            {importing ? "Đang nhập…" : "⬆ Nhập CSV"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f);
            }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <TabButton
          active={tab === "mentor"}
          onClick={() => switchTab("mentor")}
          label="Mentor"
        />
        <TabButton
          active={tab === "mentee"}
          onClick={() => switchTab("mentee")}
          label="Mentee"
        />
      </div>

      {result && (
        <div
          className="rounded-xl p-4 mb-6 text-sm"
          style={{ background: "#F0FDFA", border: "1px solid #99F6E4", color: "#134E4A" }}
        >
          <p className="font-semibold">
            Kết quả nhập: {result.created} tạo mới · {result.updated} cập nhật ·{" "}
            {result.skipped} bỏ qua
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 space-y-1" style={{ color: "#B45309" }}>
              {result.errors.slice(0, 10).map((e, i) => (
                <li key={i}>• {e}</li>
              ))}
              {result.errors.length > 10 && (
                <li>…và {result.errors.length - 10} lỗi khác</li>
              )}
            </ul>
          )}
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold" style={{ color: "#0F766E" }}>
            {tab === "mentor" ? "Danh sách Mentor" : "Danh sách Mentee"}
          </h2>
          {roster && (
            <Badge color={tab === "mentor" ? "#0F766E" : "#15B5B0"}>
              {roster.total} bản ghi
            </Badge>
          )}
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Đang tải…
          </p>
        ) : data.length === 0 ? (
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Chưa có dữ liệu.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: "900px" }}>
              <thead>
                <tr style={{ background: "#F5F2EC" }}>
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      className="px-3 py-2 text-left font-semibold whitespace-nowrap"
                      style={{ color: "#57534E" }}
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, ri) => (
                  <tr key={ri} className="border-t" style={{ borderColor: "#F5F2EC" }}>
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className="px-3 py-2 align-top"
                        style={{ color: "#292524", maxWidth: "220px" }}
                      >
                        <span className="block overflow-hidden" style={{ textOverflow: "ellipsis" }}>
                          {row[c.key] ?? ""}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppShell>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-2 rounded-full text-sm font-semibold transition"
      style={{
        background: active ? "#0F766E" : "#fff",
        color: active ? "#fff" : "#57534E",
        border: "1px solid #E5E0D5",
      }}
    >
      {label}
    </button>
  );
}
