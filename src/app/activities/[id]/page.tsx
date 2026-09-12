"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/ui";

type Post = {
  id: string;
  title: string | null;
  excerpt: string | null;
  imageUrl: string | null;
  content: string;
  tags: string[];
  createdAt: string;
  author: { fullName: string; avatarUrl: string | null; role: string };
};

export default function ActivityDetail() {
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/community/announcements?id=${params.id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setPost(d.post))
      .catch(() => setErr("Không tìm thấy bài viết hoặc bài chưa được công khai."))
      .finally(() => setLoading(false));
  }, [params.id]);

  const body = (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold mb-6 hover:opacity-80"
        style={{ color: "#0F766E" }}
      >
        ← Trở về trang chủ
      </Link>

      {loading ? (
        <p style={{ color: "#94A3B8" }}>Đang tải...</p>
      ) : err || !post ? (
        <p style={{ color: "#B45309" }}>{err ?? "Không tìm thấy bài viết."}</p>
      ) : (
        <article>
          <div className="flex flex-wrap gap-2 mb-4">
            {(post.tags ?? []).map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ background: "#0F766E" }}
              >
                {t}
              </span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: "#292524" }}>
            {post.title || "Hoạt động cộng đồng"}
          </h1>
          <p className="text-sm mb-6" style={{ color: "#94A3B8" }}>
            {new Date(post.createdAt).toLocaleDateString("vi-VN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            · Tre Việt Mentoring
          </p>
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title ?? ""}
              className="w-full rounded-2xl object-cover mb-8 max-h-[480px] shadow-md"
            />
          )}
          <div
            className="prose prose-stone max-w-none"
            style={{ color: "#292524", lineHeight: 1.8, whiteSpace: "pre-wrap" }}
          >
            {post.content}
          </div>
        </article>
      )}
    </div>
  );

  return <AppShell title="Hoạt động cộng đồng">{body}</AppShell>;
}
