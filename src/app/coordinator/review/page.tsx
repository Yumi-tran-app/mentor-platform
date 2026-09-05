"use client";

import { useEffect, useState } from "react";
import { AppShell, Card, Badge, Button } from "@/components/ui";

type MentorApp = {
  id: string;
  status: string;
  industry: string | null;
  capacityMax: number;
  user: { fullName: string; email: string };
  professionalJson: any;
  identityJson: any;
  readinessJson: any;
  docsJson: any;
};

export default function ReviewApplicationsPage() {
  const [mentors, setMentors] = useState<MentorApp[]>([]);
  const [tab, setTab] = useState<"mentor" | "mentee">("mentor");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  async function load(kind: "mentor" | "mentee") {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/coordinator/applications?kind=${kind}&status=submitted`
      ).then((r) => r.json());
      if (kind === "mentor") setMentors(res.applications ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load("mentor");
  }, []);

  async function decide(id: string, decision: "approve" | "reject") {
    setBusy(id);
    try {
      await fetch("/api/coordinator/review-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: tab,
          applicationId: id,
          decision,
        }),
      });
      await load(tab);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(null);
    }
  }

  function ph(json: any, key: string): string {
    return json?.[key] ?? "—";
  }

  return (
    <AppShell title="Duyệt đơn">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#093774" }}>
        Duyệt đơn đăng ký
      </h1>

      <div className="flex gap-2 mb-6">
        {(
          [
            ["mentor", "Đơn Mentor"],
            ["mentee", "Đơn Mentee"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => {
              setTab(key);
              load(key);
            }}
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

      {loading ? (
        <p style={{ color: "#2C335D" }}>Đang tải...</p>
      ) : tab === "mentor" ? (
        mentors.length === 0 ? (
          <Card>
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              Không có đơn mentor nào đang chờ duyệt.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {mentors.map((m) => (
              <Card key={m.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="font-bold" style={{ color: "#093774" }}>
                      {m.user.fullName}
                    </h2>
                    <p className="text-xs" style={{ color: "#94A3B8" }}>
                      {m.user.email}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm" style={{ color: "#2C335D" }}>
                      <span>
                        <b>Công ty:</b> {ph(m.professionalJson, "company")}
                      </span>
                      <span>
                        <b>Chức danh:</b> {ph(m.professionalJson, "title")}
                      </span>
                      <span>
                        <b>KN (năm):</b> {ph(m.professionalJson, "yearsExperience")}
                      </span>
                      <span>
                        <b>Quản lý (năm):</b> {ph(m.professionalJson, "yearsManagement")}
                      </span>
                      <span>
                        <b>Ngành:</b> {m.industry ?? ph(m.professionalJson, "industry")}
                      </span>
                      <span>
                        <b>Sức chứa:</b> {m.capacityMax} mentee
                      </span>
                    </div>
                    {m.readinessJson?.reason && (
                      <p className="mt-2 text-sm" style={{ color: "#2C335D" }}>
                        <b>Lý do:</b> {m.readinessJson.reason}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button
                      variant="secondary"
                      disabled={busy === m.id}
                      onClick={() => decide(m.id, "approve")}
                    >
                      ✓ Duyệt
                    </Button>
                    <Button
                      variant="danger"
                      disabled={busy === m.id}
                      onClick={() => decide(m.id, "reject")}
                    >
                      ✗ Từ chối
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        <Card>
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Đơn mentee sẽ hiển thị tương tự. (Đang hoàn thiện)
          </p>
        </Card>
      )}
    </AppShell>
  );
}
