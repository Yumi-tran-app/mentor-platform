"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell, Card, Button } from "@/components/ui";

type Question = {
  id: string;
  type: "multiple_choice" | "essay";
  prompt: string;
  options?: { label: string }[];
};

type TestData = {
  test: { id: string; title: string; passScore: number };
  questions: Question[];
  lastAttempt: { score: number; status: string } | null;
};

export default function TestPage() {
  const [data, setData] = useState<TestData | null>(null);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    status: string;
    correctCount: number;
    mcqTotal: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/training/test").then((r) => r.json());
      setData(res);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function setAnswer(qid: string, val: number | string) {
    setAnswers((prev) => ({ ...prev, [qid]: val }));
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, value]) => ({
          questionId,
          value,
        })),
      };
      const res = await fetch("/api/training/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error ?? "Có lỗi khi nộp bài.");
      } else {
        setResult(d);
      }
      await load();
    } catch {
      setError("Có lỗi khi nộp bài.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !data) {
    return (
      <AppShell title="Bài kiểm tra">
        <p style={{ color: "#2C335D" }}>Đang tải...</p>
      </AppShell>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const total = data.questions.length;

  return (
    <AppShell title="Bài kiểm tra">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#093774" }}>
            {data.test.title}
          </h1>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
            Đạt tối thiểu {data.test.passScore}% · {total} câu hỏi
          </p>
        </div>
        <Link href="/training">
          <Button variant="secondary">← Về đào tạo</Button>
        </Link>
      </div>

      {data.lastAttempt && (
        <Card className="mb-6">
          <p className="text-sm" style={{ color: "#2C335D" }}>
            Lần làm gần nhất:{" "}
            <b style={{ color: data.lastAttempt.status === "passed" ? "#15803D" : "#FF6859" }}>
              {data.lastAttempt.score}% ({data.lastAttempt.status === "passed" ? "Đạt" : "Chưa đạt"})
            </b>
          </p>
        </Card>
      )}

      {result && (
        <Card className="mb-6" >
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <p className="text-3xl font-bold" style={{ color: result.status === "passed" ? "#15803D" : "#FF6859" }}>
              {result.score}%
            </p>
            <p className="text-sm mt-1" style={{ color: "#2C335D" }}>
              Đúng {result.correctCount}/{result.mcqTotal} câu trắc nghiệm ·{" "}
              {result.status === "passed" ? "🎉 Đạt yêu cầu" : "Chưa đạt, hãy ôn lại và thử lại"}
            </p>
          </div>
        </Card>
      )}

      {error && (
        <div className="mb-4 rounded-lg px-4 py-3 text-sm" style={{ background: "#FCE8E6", color: "#B42318" }}>
          ⚠️ {error}
        </div>
      )}

      <div className="space-y-4">
        {data.questions.map((q, i) => (
          <Card key={q.id}>
            <p className="font-semibold mb-3" style={{ color: "#093774" }}>
              <span style={{ color: "#15B5B0" }}>{i + 1}.</span> {q.prompt}
              {q.type === "essay" && (
                <span className="ml-2 text-xs font-normal" style={{ color: "#FF6859" }}>
                  Tự luận
                </span>
              )}
            </p>

            {q.type === "multiple_choice" && q.options ? (
              <div className="space-y-2">
                {q.options.map((o, oi) => {
                  const selected = answers[q.id] === oi;
                  return (
                    <button
                      key={oi}
                      onClick={() => setAnswer(q.id, oi)}
                      className="w-full text-left px-4 py-2.5 rounded-lg border transition"
                      style={{
                        borderColor: selected ? "#15B5B0" : "#E5E0D5",
                        background: selected ? "#F2F9F4" : "#fff",
                        color: "#2C335D",
                      }}
                    >
                      <span className="font-bold mr-2" style={{ color: selected ? "#15B5B0" : "#94A3B8" }}>
                        {String.fromCharCode(65 + oi)}.
                      </span>
                      {o.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={(answers[q.id] as string) ?? ""}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                rows={4}
                placeholder="Nhập câu trả lời của bạn..."
                className="w-full px-4 py-3 rounded-lg border text-sm"
                style={{ borderColor: "#E5E0D5", color: "#2C335D" }}
              />
            )}
          </Card>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm" style={{ color: "#94A3B8" }}>
          Đã trả lời {answeredCount}/{total}
        </p>
        <Button onClick={submit} disabled={submitting || answeredCount < total}>
          {submitting ? "Đang chấm..." : "Nộp bài"}
        </Button>
      </div>
    </AppShell>
  );
}
