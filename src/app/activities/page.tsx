"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const ORG_NAME = "Tre Việt Mentoring";

type Post = {
  id: string;
  title: string | null;
  excerpt: string | null;
  imageUrl: string | null;
  tags: string[];
  createdAt: string;
  author: { fullName: string; avatarUrl: string | null; role: string };
};

export default function ActivitiesIndex() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/community/announcements")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.posts) setPosts(d.posts);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => (p.tags ?? []).forEach((t) => set.add(t)));
    return Array.from(set);
  }, [posts]);

  const filtered = useMemo(() => {
    if (!activeTag) return posts;
    return posts.filter((p) => (p.tags ?? []).includes(activeTag));
  }, [posts, activeTag]);

  return (
    <div className="min-h-screen" style={{ background: "#F5F2EC" }}>
      {/* HEADER */}
      <header className="sticky top-0 z-50" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)", borderBottom: "1px solid #E7E5E4" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-teal-700 flex items-center justify-center text-white font-bold text-sm">
              TVM
            </div>
            <span className="font-bold text-teal-700 leading-tight">{ORG_NAME}</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-teal-700 hover:opacity-80"
          >
            ← Trang chủ
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* HEADING */}
        <div className="mb-10">
          <div className="inline-block px-4 py-2 bg-teal-100 text-teal-700 font-semibold rounded-full text-sm mb-4">
            TRANG TIN
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900">
            Hoạt động cộng đồng
          </h1>
          <p className="text-stone-600 mt-2 max-w-2xl">
            Cập nhật các hoạt động, sự kiện và câu chuyện từ cộng đồng {ORG_NAME}.
          </p>
        </div>

        {/* TAG FILTER */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                activeTag === null
                  ? "bg-teal-700 text-white"
                  : "bg-white text-stone-600 border border-stone-200 hover:border-teal-300"
              }`}
            >
              Tất cả
            </button>
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTag(t === activeTag ? null : t)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  activeTag === t
                    ? "bg-teal-700 text-white"
                    : "bg-white text-stone-600 border border-stone-200 hover:border-teal-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* LIST */}
        {!loaded ? (
          <p className="text-stone-400 py-20 text-center">Đang tải...</p>
        ) : filtered.length === 0 ? (
          <p className="text-stone-400 py-20 text-center">
            Chưa có bài viết nào.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((p) => (
              <Link
                key={p.id}
                href={`/activities/${p.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-stone-100 flex flex-col"
              >
                <div className="h-44 bg-stone-200 overflow-hidden">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.title ?? ""}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-teal-700">
                      <svg className="w-12 h-12 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2zm-2 0V8h-4V4H5v16h12z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  {(p.tags ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(p.tags as string[]).slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-teal-700 bg-teal-50"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <h2 className="text-lg font-bold text-stone-800 mb-2 line-clamp-2 group-hover:text-teal-700 transition-colors">
                    {p.title || "Hoạt động cộng đồng"}
                  </h2>
                  {p.excerpt && (
                    <p className="text-sm text-stone-600 line-clamp-2 mb-3">{p.excerpt}</p>
                  )}
                  <div className="mt-auto pt-3 text-xs text-stone-400 flex items-center justify-between">
                    <span>{new Date(p.createdAt).toLocaleDateString("vi-VN")}</span>
                    <span className="text-teal-700 font-semibold">Đọc tiếp →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="pt-10 pb-8 border-t border-stone-200 text-center text-sm text-stone-400">
        <p>&copy; 2026 {ORG_NAME}. All rights reserved.</p>
      </footer>
    </div>
  );
}
