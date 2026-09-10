"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell, Card, Badge, Button, LineIcon, Avatar } from "@/components/ui";

type Match = {
  id: string;
  status: string;
  agreementConfirmedAt: string | null;
  firstConnectionAt: string | null;
  fitScore: number | null;
  mentorApplication: { user: { fullName: string; id: string; avatarUrl: string | null }; professionalJson: any };
  menteeApplication: { user: { fullName: string; id: string; avatarUrl: string | null }; profileJson: any };
};

type TimelineItem = {
  id: string;
  kind: "log" | "journey" | "reflection" | "milestone";
  visibility: string;
  content: string;
  authorFullName: string;
  createdAt: string;
  mood: string | null;
  tags: any;
  monthNumber: number | null;
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

// Màu chuẩn hoá: các trạng thái thuận lợi đều xanh ngọc/xanh lá.
const statusColor: Record<string, string> = {
  recommended: "#94A3B8",
  pending_coordinator_review: "#94A3B8",
  proposed_to_parties: "#15B5B0",
  mentor_accepted: "#15B5B0",
  mutual_accepted: "#0F766E",
  first_connection_done: "#0F766E",
  active: "#15803D",
  paused: "#F2A93B",
  ended: "#94A3B8",
};

const KIND_META: Record<string, { icon: string; label: string; color: string }> = {
  log: { icon: "chat", label: "Ghi chú", color: "#0F766E" },
  journey: { icon: "map", label: "Nhật ký", color: "#15B5B0" },
  reflection: { icon: "bulb", label: "Phản tư", color: "#D97706" },
  milestone: { icon: "checkCircle", label: "Cột mốc", color: "#15803D" },
};

const MOOD_LABEL: Record<string, string> = {
  good: "Đang kết nối tốt",
  neutral: "Đang tìm nhịp phù hợp",
  uneasy: "Có điều gì đó chưa ổn",
  support_needed: "Cần hỗ trợ",
};

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = params.id as string;

  const [match, setMatch] = useState<Match | null>(null);
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // post form
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"shared" | "private">("shared");
  const [posting, setPosting] = useState(false);

  // milestones
  const [confirming, setConfirming] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // báo cáo cuối khóa
  const [report, setReport] = useState<any>(null);
  const [reportForm, setReportForm] = useState({
    sessionCount: 0,
    journeyHighlights: "",
    valueReceived: "",
    messageToPartner: "",
    messageToOrg: "",
    satisfaction: 5,
    wantRejoin: false,
    suggestions: "",
  });
  const [reportSaving, setReportSaving] = useState(false);
  const [reportMsg, setReportMsg] = useState<string | null>(null);

  // agreement items
  const [agreementItems, setAgreementItems] = useState<Record<string, boolean>>({
    purpose: false,
    confidentiality: false,
    schedule: false,
    proactive: false,
    punctuality: false,
    journal: false,
    quarterly: false,
    nonprofit: false,
    exit: false,
  });
  const [showAgreement, setShowAgreement] = useState(false);

  const load = useCallback(async () => {
    try {
      const [m, t, p, r] = await Promise.all([
        fetch(`/api/matches?id=${matchId}`).then((r) => r.json()),
        fetch(`/api/timeline?matchId=${matchId}`).then((r) => r.json()),
        fetch("/api/profile").then((r) => r.json()),
        fetch(`/api/reports/final?matchId=${matchId}`).then((r) => r.json()),
      ]);
      setMatch(m.matches?.[0] ?? null);
      setItems(t.items ?? []);
      setMyId(p.user?.id ?? null);
      if (r.report) {
        setReport(r.report);
        setReportForm({
          sessionCount: r.report.sessionCount,
          journeyHighlights: r.report.journeyHighlights ?? "",
          valueReceived: r.report.valueReceived ?? "",
          messageToPartner: r.report.messageToPartner ?? "",
          messageToOrg: r.report.messageToOrg ?? "",
          satisfaction: r.report.satisfaction ?? 5,
          wantRejoin: r.report.wantRejoin ?? false,
          suggestions: r.report.suggestions ?? "",
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    load();
  }, [load]);

  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try {
      await fetch("/api/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, content, visibility, tags: [] }),
      });
      setContent("");
      await load();
    } finally {
      setPosting(false);
    }
  }

  async function confirmAgreement() {
    setConfirming(true);
    try {
      const res = await fetch(`/api/matches/${matchId}/confirm-agreement`, { method: "POST" });
      if (res.ok) await load();
    } finally {
      setConfirming(false);
    }
  }

  async function markFirstConnection() {
    setConnecting(true);
    try {
      const res = await fetch(`/api/matches/${matchId}/first-connection`, { method: "POST" });
      if (res.ok) await load();
    } finally {
      setConnecting(false);
    }
  }

  async function submitReport(e: React.FormEvent) {
    e.preventDefault();
    setReportSaving(true);
    setReportMsg(null);
    try {
      const res = await fetch("/api/reports/final", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, ...reportForm }),
      });
      const d = await res.json();
      setReportMsg(
        d.certificatesIssued?.length
          ? "🎉 Đã nộp báo cáo! Chứng nhận mentoring đã được cấp."
          : d.error ?? "✅ Đã nộp báo cáo cuối khóa."
      );
      await load();
    } finally {
      setReportSaving(false);
    }
  }

  if (loading) {
    return (
      <AppShell title="Chi tiết">
        <p style={{ color: "#292524" }}>Đang tải...</p>
      </AppShell>
    );
  }

  if (!match) {
    return (
      <AppShell title="Chi tiết">
        <p style={{ color: "#292524" }}>Không tìm thấy cặp này.</p>
      </AppShell>
    );
  }

  const isMentor = myId === match.mentorApplication.user.id;
  const partner = isMentor
    ? {
        fullName: match.menteeApplication.user.fullName,
        title: match.menteeApplication.profileJson?.currentRole ?? "Mentee",
        avatarUrl: match.menteeApplication.user.avatarUrl,
      }
    : {
        fullName: match.mentorApplication.user.fullName,
        title: match.mentorApplication.professionalJson?.title ?? "Mentor",
        avatarUrl: match.mentorApplication.user.avatarUrl,
      };

  const agreementAllOn = Object.values(agreementItems).every(Boolean);

  return (
    <AppShell title="Chi tiết đồng hành">
      <Link href="/workspace" className="text-sm" style={{ color: "#0F766E" }}>
        ← Quay lại
      </Link>

      {/* Header */}
      <div className="mt-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0F766E" }}>
            {match.mentorApplication.user.fullName} & {match.menteeApplication.user.fullName}
          </h1>
          <Badge color={statusColor[match.status] ?? "#94A3B8"}>
            {statusLabel[match.status] ?? match.status}
          </Badge>
        </div>
      </div>

      {/* Layout 2 cột bất đối xứng 7:3 */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* CỘT CHÍNH (70%) — Timeline */}
        <div className="lg:col-span-7 space-y-4">
          {/* Khung Post bài */}
          <Card>
            <form onSubmit={post} className="space-y-3">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border text-sm"
                style={{ borderColor: "#E5E0D5", color: "#292524" }}
                placeholder="Ghi lại buổi gặp, điều bạn nhận ra, hay bước tiếp theo..."
              />
              <div className="flex flex-wrap items-center gap-2">
                {/* Công tắc Chung/Riêng tư */}
                <div className="flex items-center gap-1 rounded-full p-1" style={{ background: "#F5F2EC" }}>
                  {(["shared", "private"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVisibility(v)}
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: visibility === v ? "#0F766E" : "transparent",
                        color: visibility === v ? "#fff" : "#57534E",
                      }}
                    >
                      {v === "shared" ? "Chung" : "Riêng tư"}
                    </button>
                  ))}
                </div>

                <div className="ml-auto">
                  <Button type="submit" disabled={posting || !content.trim()}>
                    {posting ? "Đang đăng..." : "Đăng"}
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          {/* Timeline feed */}
          <div className="space-y-3">
            {items.length === 0 ? (
              <Card>
                <p className="text-sm" style={{ color: "#94A3B8" }}>
                  Chưa có ghi chú nào. Hãy viết dòng đầu tiên về hành trình của bạn.
                </p>
              </Card>
            ) : (
              items.map((it) => {
                const meta = KIND_META[it.kind] ?? KIND_META.log;
                return (
                  <div
                    key={it.id}
                    className={`rounded-xl p-4 border ${it.kind === "milestone" ? "" : "bg-white"}`}
                    style={{
                      borderColor: it.kind === "milestone" ? "#C7E9E7" : "#F5F2EC",
                      background: it.kind === "milestone" ? "#F0FDFA" : "#fff",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                        style={{ background: meta.color }}
                      >
                        <LineIcon name={meta.icon as any} size={13} />
                      </span>
                      <span className="text-xs font-semibold" style={{ color: meta.color }}>
                        {meta.label}
                      </span>
                      {it.kind === "reflection" && it.mood && (
                        <span className="text-xs" style={{ color: "#94A3B8" }}>
                          · {MOOD_LABEL[it.mood] ?? it.mood}
                          {it.monthNumber ? ` · Tháng ${it.monthNumber}` : ""}
                        </span>
                      )}
                      {it.visibility === "private" && (
                        <span className="text-xs ml-auto" style={{ color: "#B45309" }}>
                          Riêng tư
                        </span>
                      )}
                    </div>
                    {it.content && (
                      <p className="text-sm whitespace-pre-wrap" style={{ color: "#292524" }}>
                        {it.content}
                      </p>
                    )}
                    <p className="text-xs mt-2" style={{ color: "#94A3B8" }}>
                      {it.authorFullName} · {new Date(it.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Báo cáo cuối khóa (khi match kết thúc) */}
          {match.status === "ended" && (
            <Card>
              <h2 className="font-bold mb-3" style={{ color: "#0F766E" }}>Báo cáo cuối khóa</h2>
              {report ? (
                <p className="text-sm" style={{ color: "#15803D" }}>
                  ✅ Bạn đã nộp báo cáo cuối khóa vào {new Date(report.submittedAt).toLocaleDateString("vi-VN")}.
                </p>
              ) : (
                <form onSubmit={submitReport} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "#292524" }}>
                      Số buổi mentoring đã thực hiện *
                    </label>
                    <input type="number" min={0} value={reportForm.sessionCount}
                      onChange={(e) => setReportForm({ ...reportForm, sessionCount: Number(e.target.value) })}
                      className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "#292524" }}>
                      Những ghi nhận trong hành trình
                    </label>
                    <textarea rows={2} value={reportForm.journeyHighlights}
                      onChange={(e) => setReportForm({ ...reportForm, journeyHighlights: e.target.value })}
                      className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "#292524" }}>
                      Giá trị nhận được từ chương trình
                    </label>
                    <textarea rows={2} value={reportForm.valueReceived}
                      onChange={(e) => setReportForm({ ...reportForm, valueReceived: e.target.value })}
                      className={inputCls} />
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "#292524" }}>
                        Điều muốn chia sẻ với mentor/mentee của bạn
                      </label>
                      <textarea rows={2} value={reportForm.messageToPartner}
                        onChange={(e) => setReportForm({ ...reportForm, messageToPartner: e.target.value })}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "#292524" }}>
                        Điều muốn chia sẻ với Ban tổ chức
                      </label>
                      <textarea rows={2} value={reportForm.messageToOrg}
                        onChange={(e) => setReportForm({ ...reportForm, messageToOrg: e.target.value })}
                        className={inputCls} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm" style={{ color: "#292524" }}>
                      Mức độ hài lòng:
                      <select value={reportForm.satisfaction}
                        onChange={(e) => setReportForm({ ...reportForm, satisfaction: Number(e.target.value) })}
                        className="ml-2 px-2 py-1 rounded border" style={{ borderColor: "#E5E0D5" }}>
                        {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </label>
                    <label className="text-sm flex items-center gap-2" style={{ color: "#292524" }}>
                      <input type="checkbox" checked={reportForm.wantRejoin}
                        onChange={(e) => setReportForm({ ...reportForm, wantRejoin: e.target.checked })} />
                      Muốn tham gia mùa sau
                    </label>
                  </div>
                  {reportMsg && (
                    <p className="text-sm" style={{ color: reportMsg.startsWith("🎉") ? "#15803D" : "#B45309" }}>
                      {reportMsg}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={reportSaving}>
                      {reportSaving ? "Đang nộp..." : "Nộp báo cáo & nhận chứng nhận"}
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          )}
        </div>

        {/* CỘT PHỤ (30%) — Thông tin & Quản trị */}
        <div className="lg:col-span-3 space-y-4">
          {/* Điều hướng phản tư / nhật ký */}
          <Card className="space-y-2">
            <Link
              href={`/workspace/${matchId}/reflect`}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-stone-50"
              style={{ color: "#D97706" }}
            >
              <LineIcon name="bulb" size={16} /> Phản tư tháng
            </Link>
            <Link
              href={`/workspace/${matchId}/journey`}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-stone-50"
              style={{ color: "#15B5B0" }}
            >
              <LineIcon name="map" size={16} /> Nhật ký hành trình
            </Link>
          </Card>

          {/* Hồ sơ nhanh đối tác */}
          <Card>
            <h2 className="font-bold mb-3" style={{ color: "#0F766E" }}>Đối tác của bạn</h2>
            <div className="flex items-center gap-3">
              <Avatar src={partner.avatarUrl} name={partner.fullName} size={48} />
              <div>
                <p className="text-base font-bold" style={{ color: "#292524" }}>{partner.fullName}</p>
                <p className="text-sm" style={{ color: "#94A3B8" }}>{partner.title}</p>
              </div>
            </div>
          </Card>

          {/* Milestone actions */}
          {match.status === "mutual_accepted" && (
            <Card>
              <h3 className="font-bold mb-2 text-sm" style={{ color: "#0F766E" }}>Buổi gặp đầu tiên</h3>
              <p className="text-xs mb-3" style={{ color: "#94A3B8" }}>
                Đánh dấu khi hai bên đã hoàn thành buổi gặp đầu.
              </p>
              <Button onClick={markFirstConnection} disabled={connecting} variant="secondary">
                {connecting ? "Đang cập nhật..." : "Đã gặp buổi đầu tiên"}
              </Button>
            </Card>
          )}

          {/* Thoả thuận (link nhỏ) */}
          <Card>
            <h3 className="font-bold mb-2 text-sm" style={{ color: "#0F766E" }}>Thoả thuận đồng hành</h3>
            {match.agreementConfirmedAt ? (
              <>
                <p className="text-xs mb-2" style={{ color: "#15803D" }}>
                  ✅ Đã xác nhận {new Date(match.agreementConfirmedAt).toLocaleDateString("vi-VN")}
                </p>
                <Button onClick={() => setShowAgreement(true)} variant="secondary">
                  Xem lại thoả thuận
                </Button>
              </>
            ) : (
              <>
                <p className="text-xs mb-2" style={{ color: "#94A3B8" }}>
                  Cùng xác nhận những điều quan trọng trước khi bắt đầu.
                </p>
                <Button onClick={() => setShowAgreement(true)} variant="secondary">
                  Xem lại thoả thuận
                </Button>
                <div style={{ height: 8 }} />
                {AGREEMENT_ROWS.map(([key, label]) => {
                  const on = agreementItems[key];
                  return (
                    <button key={key} onClick={() => setAgreementItems((s) => ({ ...s, [key]: !s[key] }))}
                      className="w-full text-left px-2 py-1.5 rounded flex items-center gap-2 text-sm"
                      style={{ color: on ? "#292524" : "#94A3B8" }}>
                      <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs"
                        style={{ borderColor: "#15B5B0", background: on ? "#15B5B0" : "transparent", color: "#fff", flexShrink: 0 }}>
                        {on ? "✓" : ""}
                      </span>
                      {label}
                    </button>
                  );
                })}
                <Button onClick={confirmAgreement} disabled={confirming || !agreementAllOn} variant="secondary">
                  {confirming ? "Đang xác nhận..." : "Xác nhận thoả thuận"}
                </Button>
              </>
            )}
          </Card>

          {/* Hỗ trợ */}
          <Card>
            <h3 className="font-bold mb-2 text-sm" style={{ color: "#B45309" }}>Cần hỗ trợ</h3>
            <p className="text-xs mb-3" style={{ color: "#94A3B8" }}>
              Gặp khó khăn? Điều phối viên sẽ giúp bạn.
            </p>
            <Link href={`/workspace/${matchId}/support`}>
              <Button variant="danger">Cần hỗ trợ từ BTC</Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Modal xem lại thoả thuận đồng hành */}
      {showAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setShowAgreement(false)}>
          <div className="absolute inset-0 bg-stone-900/50" />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowAgreement(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
              aria-label="Đóng"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h3 className="text-2xl font-bold mb-1" style={{ color: "#0F766E" }}>Thoả thuận đồng hành</h3>
            <p className="text-xs mb-6" style={{ color: "#94A3B8" }}>
              Khung nguyên tắc chung dành cho Mentor &amp; Mentee.
            </p>
            <div className="space-y-5">
              {AGREEMENT_ROWS.map(([key, label], i) => (
                <div key={key} className="flex gap-3">
                  <div className="w-6 h-6 shrink-0 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm mb-1" style={{ color: "#292524" }}>{label}</p>
                    {(AGREEMENT_DETAILS[key] ?? []).map((d, j) => (
                      <p key={j} className="text-sm mb-1.5 leading-relaxed" style={{ color: "#57534E" }}>{d}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

const AGREEMENT_ROWS: [string, string][] = [
  ["purpose", "Mục đích & Ranh giới chuyên môn"],
  ["confidentiality", "Bảo mật & Đạo đức chia sẻ tình huống"],
  ["schedule", "Tần suất & Hình thức đồng hành"],
  ["proactive", "Tính chủ động & Chuẩn bị trước buổi gặp"],
  ["punctuality", "Đúng giờ & Văn hoá báo hủy"],
  ["journal", "Phản tư & Nhật ký đồng hành"],
  ["quarterly", "Đánh giá định kỳ (Quarterly Review)"],
  ["nonprofit", "Tinh thần Phi lợi nhuận & Tôn trọng cộng đồng"],
  ["exit", "Chuyển giao an toàn & Rút lui nhân văn"],
];

// Mô tả chi tiết từng điều khoản (hiển thị khi xem lại thoả thuận)
const AGREEMENT_DETAILS: Record<string, string[]> = {
  purpose: [
    "Định hướng phát triển: Quá trình đồng hành tập trung vào việc chia sẻ trải nghiệm thực tế, mở rộng góc nhìn chuyên môn và định hướng sự nghiệp.",
    "Ranh giới rõ ràng: Mối quan hệ mentoring không phải là phiên Trị liệu / Tham vấn tâm lý cá nhân, cũng không phải dịch vụ Tư vấn Nhân sự / Phát triển doanh nghiệp. Mentor đóng vai trò gợi mở và dẫn dắt; Mentee là người hoàn toàn chịu trách nhiệm cho các quyết định và hành động của mình.",
  ],
  confidentiality: [
    "Bảo mật nội bộ: Mọi thông tin cá nhân và chia sẻ trong các buổi gặp đều được giữ kín tuyệt đối giữa hai bên.",
    "Ẩn danh bên thứ ba: Khi thảo luận các tình huống thực tế (ca tham vấn tâm lý, vụ việc nhân sự, khủng hoảng nội bộ), hai bên cam kết ẩn danh hoàn toàn thông tin của thân chủ, nhân viên hoặc doanh nghiệp liên quan để đảm bảo đạo đức nghề nghiệp.",
  ],
  schedule: [
    "Nhịp độ: Duy trì tần suất gặp định kỳ (khuyên dùng: 1 tháng/lần, mỗi buổi 60–90 phút) trong suốt hành trình 9 tháng.",
    "Hình thức: Thống nhất kênh tương tác chính (Ưu tiên gặp trực tiếp / Offline hoặc Video call) ngay từ buổi đầu tiên.",
  ],
  proactive: [
    "Mentee giữ thế chủ động: Mentee là người đặt lịch và gửi trước chủ đề/câu hỏi cần gỡ rối (Agenda) cho Mentor trước tối thiểu 24–48 giờ.",
    "Mentor lắng nghe & Chuẩn bị: Mentor xem trước agenda để định hình cấu trúc chia sẻ phù hợp cho buổi gặp.",
  ],
  punctuality: [
    "Báo trước 48h: Nếu có việc đột xuất không thể tham gia, cần thông báo cho đối phương trước tối thiểu 48 giờ để chủ động sắp xếp lại lịch.",
    "Thời gian chờ: Thời gian chờ trễ tối đa là 15 phút. Nếu quá thời gian này mà không có lý do chính đáng, buổi gặp sẽ tự động hủy.",
  ],
  journal: [
    "Mentee có trách nhiệm hoàn thành Nhật ký đồng hành sau mỗi buổi gặp.",
    "Đây vừa là công cụ đúc kết bài học cá nhân, giúp Mentor theo dõi tiến độ, vừa là căn cứ để Ban Tổ Chức (BTC) cấp chứng nhận hoàn thành.",
  ],
  quarterly: [
    "Mỗi 3 tháng, hai bên dành 15–20 phút để cùng nhìn lại tiến độ: đánh giá mức độ phù hợp, đo lường sự phát triển và điều chỉnh lại mục tiêu (nếu thực tế thay đổi).",
  ],
  nonprofit: [
    "Mối quan hệ dựa trên sự tự nguyện và trao giá trị.",
    "Cam kết không sử dụng không gian này cho mục đích chèo kéo nhân sự (headhunting), kinh doanh thương mại hoặc bán dịch vụ cá nhân khi chưa có sự đồng ý từ hai bên và BTC.",
  ],
  exit: [
    "Chuyển giao an toàn: Trong ngành Tâm lý, nếu Mentee xuất hiện các dấu hiệu kiệt sức hoặc khủng hoảng vượt quá phạm vi mentoring, Mentor sẽ chủ động thông báo với BTC để hỗ trợ chuyển giao sang kênh tham vấn/trị liệu chuyên nghiệp.",
    "Kết thúc sớm: Nếu nhận thấy không còn phù hợp hoặc không đủ điều kiện tiếp tục cam kết, một trong hai bên có quyền đề xuất dừng hành trình thông qua BTC trong tinh thần tôn trọng và văn minh.",
  ],
};

const inputCls =
  "w-full px-3 py-2 rounded-lg border text-sm";
