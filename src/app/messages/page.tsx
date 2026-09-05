"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AppShell, Card, Button } from "@/components/ui";

type Match = {
  id: string;
  mentorApplication: { user: { fullName: string } };
  menteeApplication: { user: { fullName: string } };
};

type Message = {
  id: string;
  content: string;
  createdAt: string;
  sender: { fullName: string };
  senderUserId: string;
};

export default function MessagesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [myId, setMyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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

  const loadMessages = useCallback(async (matchId: string) => {
    const res = await fetch(`/api/messages?matchId=${matchId}`).then((r) => r.json());
    setMessages(res.messages ?? []);
  }, []);

  useEffect(() => {
    if (activeId) {
      loadMessages(activeId);
    }
  }, [activeId, loadMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || !draft.trim()) return;
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId: activeId, content: draft }),
    });
    setDraft("");
    await loadMessages(activeId);
  }

  if (loading) {
    return (
      <AppShell title="Tin nhắn">
        <p style={{ color: "#2C335D" }}>Đang tải...</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Tin nhắn">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#093774" }}>
        Tin nhắn
      </h1>

      {matches.length === 0 ? (
        <Card>
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Bạn chưa có cặp đồng hành nào để nhắn tin.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5">
          {/* Danh sách cặp */}
          <div className="space-y-2">
            {matches.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveId(m.id)}
                className="w-full text-left p-3 rounded-lg border transition"
                style={{
                  borderColor: activeId === m.id ? "#15B5B0" : "#F5F2EC",
                  background: activeId === m.id ? "#F2F9F4" : "#fff",
                }}
              >
                <p className="text-sm font-semibold truncate" style={{ color: "#093774" }}>
                  {m.mentorApplication.user.fullName} ↔ {m.menteeApplication.user.fullName}
                </p>
              </button>
            ))}
          </div>

          {/* Khung chat */}
          <Card className="flex flex-col" >
            {!activeId ? (
              <p className="text-sm m-auto" style={{ color: "#94A3B8" }}>
                Chọn một cặp để bắt đầu nhắn tin.
              </p>
            ) : (
              <>
                <div
                  ref={scrollRef}
                  className="flex-1 max-h-[420px] overflow-y-auto space-y-3 mb-4"
                >
                  {messages.length === 0 ? (
                    <p className="text-sm" style={{ color: "#94A3B8" }}>
                      Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!
                    </p>
                  ) : (
                    messages.map((msg) => {
                      const mine = msg.senderUserId === myId;
                      return (
                        <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div
                            className="max-w-[75%] px-4 py-2 rounded-2xl text-sm"
                            style={{
                              background: mine ? "#093774" : "#F2F9F4",
                              color: mine ? "#fff" : "#2C335D",
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
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-2.5 rounded-lg border text-sm"
                    style={{ borderColor: "#E5E0D5", color: "#2C335D" }}
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
