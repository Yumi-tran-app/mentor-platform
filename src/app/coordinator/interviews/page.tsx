"use client";

import { useEffect, useState } from "react";
import { AppShell, Card, Badge, Button } from "@/components/ui";

type Application = {
  id: string;
  status: string;
  industry?: string;
  capacityMax?: number;
  user: { fullName: string; email: string };
};

type Interview = {
  id: string;
  status: string;
  purpose: string;
  applicantRole: string;
  applicant: { fullName: string };
  interviewer: { fullName: string };
  slotAt: string | null;
};

export default function InterviewsPage() {
  const [mentorApps, setMentorApps] = useState<Application[]>([]);
  const [menteeApps, setMenteeApps] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [tab, setTab] = useState<"mentor" | "mentee" | "list">("mentor");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [m, me, iv] = await Promise.all([
          fetch("/api/coordinator/applications?kind=mentor").then((r) => r.json()),
          fetch("/api/coordinator/applications?kind=mentee").then((r) => r.json()),
          fetch("/api/interviews").then((r) => r.json()),
        ]);
        setMentorApps(m.applications ?? []);
        setMenteeApps(me.applications ?? []);
        setInterviews(iv.interviews ?? []);
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
      <AppShell title="Phỏng vấn">
        <p style={{ color: "#2C335D" }}>Đang tải...</p>
      </AppShell>
    );
  }

  const pending = (apps: Application[]) => apps.filter((a) => a.status === "submitted");

  return (
    <AppShell title="Phỏng vấn">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#093774" }}>
        Quản lý phỏng vấn
      </h1>

      <div className="flex gap-2 mb-6">
        {(
          [
            ["mentor", "Đơn Mentor"],
            ["mentee", "Đơn Mentee"],
            ["list", "Lịch phỏng vấn"],
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

      {tab === "mentor" && (
        <AppList apps={pending(mentorApps)} role="mentor" />
      )}
      {tab === "mentee" && (
        <AppList apps={pending(menteeApps)} role="mentee" />
      )}
      {tab === "list" && (
        <Card>
          <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
            Lịch phỏng vấn
          </h2>
          {interviews.length === 0 ? (
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              Chưa có lịch phỏng vấn nào.
            </p>
          ) : (
            <div className="space-y-2">
              {interviews.map((iv) => (
                <div
                  key={iv.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  style={{ borderColor: "#F5F2EC" }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#2C335D" }}>
                      {iv.applicant.fullName}{" "}
                      <span className="text-xs" style={{ color: "#94A3B8" }}>
                        ({iv.applicantRole} · {iv.purpose})
                      </span>
                    </p>
                    <p className="text-xs" style={{ color: "#94A3B8" }}>
                      {iv.slotAt
                        ? new Date(iv.slotAt).toLocaleString("vi-VN")
                        : "Chưa xếp giờ"}{" "}
                      · PV: {iv.interviewer.fullName}
                    </p>
                  </div>
                  <Badge color={iv.status === "scheduled" ? "#15B5B0" : "#F2A93B"}>
                    {iv.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </AppShell>
  );
}

function AppList({ apps, role }: { apps: Application[]; role: string }) {
  return (
    <Card>
      <h2 className="font-bold mb-4" style={{ color: "#093774" }}>
        Đơn {role} chờ phỏng vấn ({apps.length})
      </h2>
      {apps.length === 0 ? (
        <p className="text-sm" style={{ color: "#94A3B8" }}>
          Không có đơn nào đang chờ.
        </p>
      ) : (
        <div className="space-y-2">
          {apps.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between p-3 rounded-lg border"
              style={{ borderColor: "#F5F2EC" }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: "#2C335D" }}>
                  {a.user.fullName}
                </p>
                <p className="text-xs" style={{ color: "#94A3B8" }}>
                  {a.user.email}
                  {a.industry ? ` · ${a.industry}` : ""}
                </p>
              </div>
              <Button variant="secondary">Xếp lịch</Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
