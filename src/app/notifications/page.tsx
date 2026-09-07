"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell, Card, Button } from "@/components/ui";

type Notification = {
  id: string;
  type: string;
  payload: any;
  readAt: string | null;
  createdAt: string;
};

const TYPE_LABEL: Record<string, string> = {
  match_proposed: "Đề xuất ghép cặp mới",
  match_request_received: "Yêu cầu kết nối mới",
  match_mentor_accepted: "Mentor đã đồng ý",
  match_mutual_accepted: "Hai bên đã đồng ý",
  match_first_connection_done: "Đã gặp buổi đầu tiên",
  "application.approved": "Đơn đăng ký được duyệt",
  "application.rejected": "Đơn đăng ký chưa đạt",
  "match.proposed": "Được đề xuất ghép cặp",
  "match.declined": "Yêu cầu bị từ chối",
  interview_result: "Kết quả phỏng vấn",
  pause_flagged: "Yêu cầu tạm dừng",
  sla_reminder: "Nhắc đúng hạn duyệt",
  support_needed: "Cần hỗ trợ",
  reflection_uneasy_streak: "Cảnh báo phản tư",
};

export default function NotificationsPage() {
    const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch("/api/notifications").then((r) => r.json());
      setItems(res.notifications ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markAll() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    await load();
  }

  if (loading) {
    return (
      <AppShell title="Thông báo">
        <p style={{ color: "#2C335D" }}>Đang tải...</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Thông báo">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#093774" }}>
          Thông báo
        </h1>
        <Button variant="secondary" onClick={markAll}>
          Đánh dấu tất cả đã đọc
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Bạn chưa có thông báo nào.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <div
              key={n.id}
              className="flex items-start gap-3 p-4 rounded-xl border"
              style={{
                borderColor: n.readAt ? "#F5F2EC" : "#15B5B0",
                background: n.readAt ? "#fff" : "#F2F9F4",
              }}
            >
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: "#093774" }}>
                  {TYPE_LABEL[n.type] ?? n.type}
                </p>
                {n.payload && Object.keys(n.payload).length > 0 && (
                  <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
                    {typeof n.payload === "string"
                      ? n.payload
                      : JSON.stringify(n.payload)}
                  </p>
                )}
                <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
                  {new Date(n.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              {!n.readAt && (
                <span
                  className="w-2 h-2 rounded-full shrink-0 mt-1"
                  style={{ background: "#15B5B0" }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
