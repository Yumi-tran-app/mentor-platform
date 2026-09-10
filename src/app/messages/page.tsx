"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AppShell, Card, Button, Avatar } from "@/components/ui";

type Match = {
  id: string;
  mentorApplication: { user: { fullName: string; id: string; avatarUrl: string | null } };
  menteeApplication: { user: { fullName: string; id: string; avatarUrl: string | null } };
};

type Message = {
  id: string;
  content: string;
  createdAt: string;
  sender: { fullName: string; avatarUrl: string | null; role: string };
  senderUserId: string;
};

type Coordinator = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
} | null;

export default function MessagesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [myId, setMyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"match" | "coordinator">("match");
  const [coordinator, setCoordinator] = useState<Coordinator>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/matches")
      .then((r) => r.json())
      .then((d) => setMatches(d.matches ?? []))
      .finally(() => setLoading(false));
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setMyId(d.user?.id ?? null));
  }, []);

  const loadMessages = useCallback(
    async (matchId: string, kind: "match" | "coordinator") => {
      const res = await fetch(`/api/messages?matchId=${matchId}&kind=${kind}`).then((r) => r.json());
      setMessages(res.messages ?? []);
    },
    []
  );

  const loadCoordinator = useCallback(async (matchId: string) => {
    const res = await fetch(`/api/messages/coordinator?matchId=${matchId}`).then((r) => r.json());
    setCoordinator(res.coordinator ?? null);
  }, []);

  useEffect(() => {
    if (activeId) {
      setMessages([]);
      if (tab === "match") {
        loadMessages(activeId, "match");
      } else {
        loadMessages(activeId, "coordinator");
        loadCoordinator(activeId);
      }
    }
  }, [activeId, tab, loadMessages, loadCoordinator]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || !draft.trim()) return;
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId: activeId, content: draft, kind: tab }),
    });
    setDraft("");
    await loadMessages(activeId, tab);
  }

  if (loading) {
    return (
      <AppShell title="Tin nhắn">
        <p style={{ color: "#292524" }}>Đang tải...</p>
      </AppShell>
    );
  }

  function partnerOf(m: Match): { name: string; role: string; avatarUrl: string | null } {
    const isMentor = myId === m.mentorApplication.user.id;
    if (isMentor)
      return { name: m.menteeApplication.user.fullName, role: "Mentee", avatarUrl: m.menteeApplication.user.avatarUrl };
    return { name: m.mentorApplication.user.fullName, role: "Mentor", avatarUrl: m.mentorApplication.user.avatarUrl };
  }

  return (
    <AppShell title="Tin nhắn">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#0F766E" }}>
        Tin nhắn
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("match")}
          className="px-5 py-2 rounded-full font-semibold text-sm transition"
          style={{
            background: tab === "match" ? "#0F766E" : "#F5F2EC",
            color: tab === "match" ? "#fff" : "#292524",
          }}
        >
          Đồng hành
        </button>
        <button
          onClick={() => setTab("coordinator")}
          className="px-5 py-2 rounded-full font-semibold text-sm transition"
          style={{
            background: tab === "coordinator" ? "#0F766E" : "#F5F2EC",
            color: tab === "coordinator" ? "#fff" : "#292524",
          }}
        >
          Điều phối viên
        </button>
      </div>

      {matches.length === 0 ? (
        <Card>
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Bạn chưa có cặp đồng hành nào để nhắn tin.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5">
          {/* Danh sách đối phương */}
          <div className="space-y-2">
            {matches.map((m) => {
              const p = partnerOf(m);
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveId(m.id)}
                  className="w-full text-left p-3 rounded-lg border transition flex items-center gap-3"
                  style={{
                    borderColor: activeId === m.id ? "#15B5B0" : "#F5F2EC",
                    background: activeId === m.id ? "#F2F9F4" : "#fff",
                  }}
                >
                  <Avatar src={p.avatarUrl} name={p.name} size={40} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#0F766E" }}>
                      {p.name}
                    </p>
                    <p className="text-xs" style={{ color: "#94A3B8" }}>{p.role}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Khung chat */}
          <Card className="flex flex-col">
            {!activeId ? (
              <p className="text-sm m-auto" style={{ color: "#94A3B8" }}>
                Chọn một cặp để bắt đầu nhắn tin.
              </p>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 pb-3 mb-3 border-b" style={{ borderColor: "#F5F2EC" }}>
                  {tab === "coordinator" ? (
                    <>
                      <Avatar src={coordinator?.avatarUrl ?? null} name={coordinator?.fullName ?? "ĐPV"} size={40} />
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#0F766E" }}>
                          {coordinator?.fullName ?? "Điều phối viên"}
                        </p>
                        <p className="text-xs" style={{ color: "#94A3B8" }}>Điều phối viên hỗ trợ</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm" style={{ color: "#94A3B8" }}>
                      Trao đổi với người đồng hành của bạn
                    </p>
                  )}
                </div>

                {tab === "coordinator" && !coordinator && (
                  <p className="text-sm mb-3" style={{ color: "#94A3B8" }}>
                    Chưa có điều phối viên được phân công cho cặp này.
                  </p>
                )}

                <div
                  ref={scrollRef}
                  className="flex-1 max-h-[380px] overflow-y-auto space-y-3 mb-4"
                >
                  {messages.length === 0 ? (
                    <p className="text-sm" style={{ color: "#94A3B8" }}>
                      {tab === "coordinator"
                        ? "Chưa có tin nhắn. Hãy gửi yêu cầu hỗ trợ cho điều phối viên."
                        : "Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!"}
                    </p>
                  ) : (
                    messages.map((msg) => {
                      const mine = msg.senderUserId === myId;
                      return (
                        <div key={msg.id} className={`flex gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                          {!mine && (
                            <Avatar src={msg.sender.avatarUrl} name={msg.sender.fullName} size={32} />
                          )}
                          <div
                            className="max-w-[75%] px-4 py-2 rounded-2xl text-sm"
                            style={{
                              background: mine ? "#0F766E" : "#F2F9F4",
                              color: mine ? "#fff" : "#292524",
                            }}
                          >
                            <p>{msg.content}</p>
                            <p
                              className="text-[10px] mt-1"
                              style={{ color: mine ? "rgba(255,255,255,.7)" : "#94A3B8" }}
                            >
                              {msg.sender.fullName} ·{" "}
                              {new Date(msg.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <form onSubmit={send} className="flex gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={
                      tab === "coordinator"
                        ? "Nhắn tin hỗ trợ cho điều phối viên..."
                        : "Nhập tin nhắn..."
                    }
                    className="flex-1 px-4 py-2.5 rounded-lg border text-sm"
                    style={{ borderColor: "#E5E0D5", color: "#292524" }}
                  />
                  <Button type="submit" disabled={!draft.trim()}>
                    Gửi
                  </Button>
                </form>
              </>
            )}
          </Card>
        </div>
      )}
    </AppShell>
  );
}
