"use client";

import { useEffect, useState, useCallback } from "react";
import { AppShell, Card, Button, Avatar } from "@/components/ui";
import { useCurrentUser, isStaff } from "@/lib/use-current-user";
import { INDUSTRIES } from "@/lib/industries";

type Author = { fullName: string; avatarUrl: string | null; role: string };

type Post = {
  id: string;
  content: string;
  tags: string[] | null;
  status: string;
  commentsLocked: boolean;
  createdAt: string;
  author: Author;
  _count?: { comments: number };
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
};

function tagLabel(key: string): string {
  return INDUSTRIES.find((i) => i.key === key)?.label ?? key;
}

export default function CommunityPage() {
  const user = useCurrentUser();
  const staff = isStaff(user?.role);

  const [posts, setPosts] = useState<Post[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [draft, setDraft] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Comment state per expanded post
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [openPostId, setOpenPostId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [p, q] = await Promise.all([
        fetch("/api/community/posts").then((r) => r.json()),
        staff
          ? fetch("/api/community/posts?scope=pending").then((r) => r.json())
          : Promise.resolve({ posts: [] }),
      ]);
      setPosts(p.posts ?? []);
      setPendingPosts(q.posts ?? []);
    } catch (e) {
      console.error(e);
    }
  }, [staff]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleTag(key: string) {
    setSelectedTags((s) =>
      s.includes(key) ? s.filter((k) => k !== key) : [...s, key]
    );
  }

  async function submitPost() {
    if (!draft.trim()) return;
    setPosting(true);
    setNotice(null);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft, tags: selectedTags }),
      });
      const d = await res.json();
      if (res.ok) {
        setNotice("✅ Bài viết đã gửi, chờ điều phối viên duyệt.");
        setDraft("");
        setSelectedTags([]);
      } else {
        setNotice(d.error ?? "Có lỗi khi đăng bài.");
      }
    } finally {
      setPosting(false);
    }
  }

  async function moderate(postId: string, action: string) {
    await fetch("/api/community/posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: postId, action }),
    });
    await load();
  }

  async function loadComments(postId: string) {
    const res = await fetch(`/api/community/posts/${postId}/comments`).then((r) =>
      r.json()
    );
    setComments((c) => ({ ...c, [postId]: res.comments ?? [] }));
  }

  async function submitComment(postId: string) {
    const content = (commentDraft[postId] ?? "").trim();
    if (!content) return;
    await fetch(`/api/community/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setCommentDraft((c) => ({ ...c, [postId]: "" }));
    await loadComments(postId);
  }

  return (
    <AppShell title="Cộng đồng">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#0F766E" }}>
        Cộng đồng
      </h1>

      {/* Form đăng bài */}
      <Card className="mb-8">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          placeholder="Chia sẻ câu chuyện, bài học hay câu hỏi của bạn..."
          className="w-full px-4 py-3 rounded-lg border text-sm"
          style={{ borderColor: "#E5E0D5", color: "#292524" }}
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {INDUSTRIES.map((i) => {
            const on = selectedTags.includes(i.key);
            return (
              <button
                key={i.key}
                type="button"
                onClick={() => toggleTag(i.key)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition"
                style={{
                  background: on ? "#15B5B0" : "#F5F2EC",
                  color: on ? "#fff" : "#292524",
                }}
              >
                {i.label}
              </button>
            );
          })}
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={submitPost} disabled={posting || !draft.trim()}>
            {posting ? "Đang gửi..." : "Đăng bài"}
          </Button>
        </div>
        {notice && (
          <p className="text-sm mt-3" style={{ color: notice.startsWith("✅") ? "#15803D" : "#B45309" }}>
            {notice}
          </p>
        )}
      </Card>

      {/* Hàng đợi duyệt (staff) */}
      {staff && pendingPosts.length > 0 && (
        <div className="mb-8">
          <h2 className="font-bold mb-3" style={{ color: "#B45309" }}>
            Bài chờ duyệt ({pendingPosts.length})
          </h2>
          <div className="space-y-3">
            {pendingPosts.map((p) => (
              <Card key={p.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold" style={{ color: "#292524" }}>
                      {p.author.fullName}
                    </p>
                    <p className="text-sm mt-1 whitespace-pre-wrap" style={{ color: "#292524" }}>
                      {p.content}
                    </p>
                    {p.tags?.length ? (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(p.tags as string[]).map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: "#E4F4F1", color: "#0F766E" }}>{tagLabel(t)}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => moderate(p.id, "approve")}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                      style={{ background: "#15803D" }}
                    >
                      Duyệt
                    </button>
                    <button
                      onClick={() => moderate(p.id, "reject")}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{ background: "#F5F2EC", color: "#B45309" }}
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Feed */}
      <h2 className="font-bold mb-4" style={{ color: "#0F766E" }}>
        Bài chia sẻ
      </h2>
      {posts.length === 0 ? (
        <Card>
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Chưa có bài viết nào. Hãy là người mở đầu cộng đồng!
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => {
            const open = openPostId === p.id;
            const postComments = comments[p.id] ?? [];
            return (
              <Card key={p.id}>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar src={p.author.avatarUrl} name={p.author.fullName} size={40} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#0F766E" }}>
                      {p.author.fullName}
                    </p>
                    <p className="text-xs" style={{ color: "#94A3B8" }}>
                      {new Date(p.createdAt).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap" style={{ color: "#292524" }}>
                  {p.content}
                </p>
                {p.tags?.length ? (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(p.tags as string[]).map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                        style={{ background: "#E4F4F1", color: "#0F766E" }}
                      >
                        {tagLabel(t)}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="flex items-center gap-4 mt-4 pt-3 border-t" style={{ borderColor: "#F5F2EC" }}>
                  <button
                    onClick={() => {
                      if (open) {
                        setOpenPostId(null);
                      } else {
                        setOpenPostId(p.id);
                        loadComments(p.id);
                      }
                    }}
                    className="text-xs font-semibold"
                    style={{ color: "#0F766E" }}
                  >
                    💬 Bình luận ({p._count?.comments ?? 0})
                  </button>
                  {staff && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => moderate(p.id, p.commentsLocked ? "unlock" : "lock")}
                        className="text-xs font-semibold"
                        style={{ color: p.commentsLocked ? "#B45309" : "#94A3B8" }}
                      >
                        {p.commentsLocked ? "Mở bình luận" : "Đóng bình luận"}
                      </button>
                      <button
                        onClick={() => moderate(p.id, "delete")}
                        className="text-xs font-semibold"
                        style={{ color: "#C0392B" }}
                      >
                        Xoá bài
                      </button>
                    </div>
                  )}
                </div>

                {/* Comments */}
                {open && (
                  <div className="mt-4 space-y-3">
                    {p.commentsLocked && (
                      <p className="text-xs" style={{ color: "#B45309" }}>
                        Bình luận đã bị đóng.
                      </p>
                    )}
                    {postComments.length === 0 ? (
                      <p className="text-xs" style={{ color: "#94A3B8" }}>
                        Chưa có bình luận.
                      </p>
                    ) : (
                      postComments.map((c) => (
                        <div key={c.id} className="flex gap-2">
                          <Avatar src={c.author.avatarUrl} name={c.author.fullName} size={28} />
                          <div
                            className="flex-1 px-3 py-2 rounded-lg text-sm"
                            style={{ background: "#F5F2EC", color: "#292524" }}
                          >
                            <p className="font-semibold text-xs" style={{ color: "#0F766E" }}>
                              {c.author.fullName}
                            </p>
                            <p>{c.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                    {!p.commentsLocked && (
                      <div className="flex gap-2">
                        <input
                          value={commentDraft[p.id] ?? ""}
                          onChange={(e) =>
                            setCommentDraft((c) => ({ ...c, [p.id]: e.target.value }))
                          }
                          placeholder="Viết bình luận..."
                          className="flex-1 px-3 py-2 rounded-lg border text-sm"
                          style={{ borderColor: "#E5E0D5", color: "#292524" }}
                        />
                        <button
                          onClick={() => submitComment(p.id)}
                          className="px-4 py-2 rounded-full text-xs font-semibold text-white"
                          style={{ background: "#0F766E" }}
                        >
                          Gửi
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
