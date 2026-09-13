"use client";

import { useEffect, useState } from "react";
import { AppShell, Card, Button, Badge, LineIcon } from "@/components/ui";

type Announcement = {
  id: string;
  title: string | null;
  excerpt: string | null;
  imageUrl: string | null;
  content: string;
  tags: string[];
  status: string;
  createdAt: string;
};

const CATEGORY_OPTIONS = [
  "Sự kiện",
  "Tin tức",
  "Tuyển Mentor/Mentee",
  "Góc chia sẻ",
  "Workshop",
];

export default function CoordinatorAnnouncements() {
  const [posts, setPosts] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    imageUrl: "",
    content: "",
    tags: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [msgType, setMsgType] = useState<"ok" | "err">("ok");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/community/announcements?scope=all");
      const d = await r.json();
      setPosts(d.posts ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function toggleTag(t: string) {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t],
    }));
  }

  async function submit() {
    if (!form.title.trim() || !form.content.trim()) {
      setMsg("Vui lòng nhập tiêu đề và nội dung.");
      setMsgType("err");
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          excerpt: form.excerpt,
          imageUrl: form.imageUrl,
          content: form.content,
          tags: form.tags,
          isOfficial: true,
        }),
      });
      const d = await res.json();
      if (res.ok) {
        setMsg("✅ Đã đăng hoạt động thành công (tự động công khai).");
        setMsgType("ok");
        setForm({ title: "", excerpt: "", imageUrl: "", content: "", tags: [] });
        await load();
      } else {
        setMsg(d.error ?? "Có lỗi khi đăng.");
        setMsgType("err");
      }
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Gỡ bài hoạt động này?")) return;
    try {
      await fetch("/api/community/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "delete" }),
      });
      await load();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <AppShell title="Đăng hoạt động cộng đồng">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#0F766E" }}>
        Hoạt động cộng đồng
      </h1>

      {/* Form đăng bài */}
      <Card className="mb-8">
        <h2 className="font-bold mb-4" style={{ color: "#0F766E" }}>
          Đăng hoạt động mới
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#292524" }}>
              Tiêu đề *
            </label>
            <input
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: "#E5E0D5", color: "#292524" }}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="VD: Trà Chiều Nghề Nghiệp - Buổi 3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#292524" }}>
              Tóm tắt (hiển thị trên trang tin)
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: "#E5E0D5", color: "#292524" }}
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="1-2 câu giới thiệu ngắn gọn"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#292524" }}>
              Ảnh minh hoạ (URL)
            </label>
            <input
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: "#E5E0D5", color: "#292524" }}
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://.../anh-minh-hoa.jpg"
            />
            {form.imageUrl && (
              <img
                src={form.imageUrl}
                alt="preview"
                className="mt-2 rounded-lg object-cover h-32 w-full border"
                style={{ borderColor: "#E5E0D5" }}
                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#292524" }}>
              Thể loại
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleTag(c)}
                  className="px-3 py-1.5 rounded-full text-sm font-semibold transition border"
                  style={{
                    background: form.tags.includes(c) ? "#0F766E" : "#fff",
                    color: form.tags.includes(c) ? "#fff" : "#57534E",
                    borderColor: form.tags.includes(c) ? "#0F766E" : "#E5E0D5",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#292524" }}>
              Nội dung *
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: "#E5E0D5", color: "#292524" }}
              rows={8}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Nội dung chi tiết hoạt động..."
            />
          </div>

          {msg && (
            <p className="text-sm" style={{ color: msgType === "ok" ? "#15803D" : "#B45309" }}>
              {msg}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button onClick={submit} disabled={saving}>
              {saving ? "Đang đăng..." : "Đăng hoạt động"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Danh sách đã đăng */}
      <Card>
        <h2 className="font-bold mb-4" style={{ color: "#0F766E" }}>
          Các hoạt động đã đăng
        </h2>
        {loading ? (
          <p className="text-sm" style={{ color: "#94A3B8" }}>Đang tải...</p>
        ) : posts.length === 0 ? (
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Chưa có hoạt động nào được đăng.
          </p>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => (
              <div
                key={p.id}
                className="flex items-start gap-4 p-3 rounded-lg border"
                style={{ borderColor: "#F5F2EC" }}
              >
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt=""
                    className="rounded-lg object-cover shrink-0"
                    style={{ width: 72, height: 72 }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate" style={{ color: "#292524" }}>
                    {p.title || "(không tiêu đề)"}
                  </p>
                  <p className="text-xs truncate" style={{ color: "#94A3B8" }}>
                    {p.excerpt || p.content.slice(0, 80)}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(p.tags ?? []).map((t) => (
                      <Badge key={t} color="#15B5B0">{t}</Badge>
                    ))}
                    <span className="text-xs" style={{ color: "#94A3B8" }}>
                      {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => remove(p.id)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full shrink-0"
                  style={{ color: "#B45309", border: "1px solid #E5E0D5" }}
                >
                  Gỡ
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </AppShell>
  );
}
