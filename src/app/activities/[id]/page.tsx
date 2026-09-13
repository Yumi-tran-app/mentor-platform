"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const ORG_NAME = "Tre Việt Mentoring";

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

  return (
    <div className="min-h-screen" style={{ background: "#F5F2EC" }}>
      {/* HEADER */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #E7E5E4",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-teal-700 flex items-center justify-center text-white font-bold text-sm">
              TVM
            </div>
            <span className="font-bold text-teal-700 leading-tight">{ORG_NAME}</span>
          </Link>
          <Link href="/activities" className="text-sm font-semibold text-teal-700 hover:opacity-80">
            ← Trang tin
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {loading ? (
          <p style={{ color: "#94A3B8" }}>Đang tải...</p>
        ) : err || !post ? (
          <div className="py-20 text-center">
            <p style={{ color: "#B45309" }}>
              {err ?? "Không tìm thấy bài viết."}
            </p>
            <Link
              href="/activities"
              className="inline-block mt-6 text-teal-700 font-semibold hover:opacity-80"
            >
              ← Quay lại Trang tin
            </Link>
          </div>
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
              · {ORG_NAME}
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
      </main>

      <footer className="pt-10 pb-8 border-t border-stone-200 text-center text-sm text-stone-400">
        <p>&copy; 2026 {ORG_NAME}. All rights reserved.</p>
      </footer>
    </div>
  );
}
