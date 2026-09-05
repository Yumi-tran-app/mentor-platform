"use client";

import { useEffect, useState } from "react";
import { AppShell, Card, Badge, Button } from "@/components/ui";

type Mentor = {
  id: string;
  industry: string | null;
  capacityMax: number;
  user: { fullName: string };
  professionalJson: any;
  identityJson: any;
  readinessJson: any;
};

export default function DiscoverPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  async function load(search: string) {
    setLoading(true);
    try {
      const q = search ? `?industry=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/discover${q}`).then((r) => r.json());
      setMentors(res.mentors ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load("");
  }, []);

  function ph(json: any, key: string): string {
    return json?.[key] ?? "—";
  }

  return (
    <AppShell title="Khám phá">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#093774" }}>
        Khám phá Mentor
      </h1>

      <div className="flex gap-3 mb-6">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(filter)}
          placeholder="Tìm theo ngành nghề..."
          className="flex-1 px-4 py-2.5 rounded-lg border text-sm"
          style={{ borderColor: "#E5E0D5", color: "#2C335D" }}
        />
        <Button variant="secondary" onClick={() => load(filter)}>
          Tìm
        </Button>
      </div>

      {loading ? (
        <p style={{ color: "#2C335D" }}>Đang tải...</p>
      ) : mentors.length === 0 ? (
        <Card>
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Chưa có mentor nào được duyệt trong mùa này.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mentors.map((m) => (
            <Card key={m.id}>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: "#093774" }}
                >
                  {(m.user.fullName?.[0] ?? "?").toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: "#093774" }}>
                    {m.user.fullName}
                  </h3>
                  <p className="text-xs" style={{ color: "#94A3B8" }}>
                    {ph(m.professionalJson, "title")}
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-sm" style={{ color: "#2C335D" }}>
                <p>
                  🏢 {ph(m.professionalJson, "company")}
                </p>
                <p>
                  💼 {ph(m.professionalJson, "yearsExperience")} năm kinh nghiệm
                </p>
                <p>
                  📍 {ph(m.identityJson, "city") || "—"}
                </p>
              </div>

              {m.industry && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge color="#15B5B0">{m.industry}</Badge>
                  {m.capacityMax > 0 && (
                    <Badge color="#F2A93B">Còn {m.capacityMax} chỗ</Badge>
                  )}
                </div>
              )}

              {m.readinessJson?.reason && (
                <p className="mt-3 text-xs leading-relaxed" style={{ color: "#94A3B8" }}>
                  "{m.readinessJson.reason}"
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
