/**
 * Nhật ký hành trình — hệ thống nhãn (tags) theo 3 giai đoạn phản tư.
 * Người dùng viết tự do, sau đó gắn 1 hoặc nhiều tag trước khi lưu.
 */

export type JourneyStage = "fact" | "insight" | "action";

export type JourneyTag = {
  key: string;
  label: string;
  stage: JourneyStage;
};

export const JOURNEY_STAGES: { key: JourneyStage; label: string; hint: string }[] =
  [
    { key: "fact", label: "Thực tế", hint: "Đã làm gì / Đã gặp ai" },
    { key: "insight", label: "Nhận thức", hint: "Đã nhận ra / Đã học được" },
    { key: "action", label: "Hành động", hint: "Bước tiếp theo / To-do" },
  ];

export const JOURNEY_TAGS: JourneyTag[] = [
  { key: "met", label: "Đã gặp ai", stage: "fact" },
  { key: "done", label: "Đã làm gì", stage: "fact" },
  { key: "realized", label: "Đã nhận ra", stage: "insight" },
  { key: "learned", label: "Đã học được", stage: "insight" },
  { key: "next", label: "Bước tiếp theo", stage: "action" },
  { key: "todo", label: "To-do", stage: "action" },
];

/** Một entry có thể gắn nhiều tag ở nhiều giai đoạn. */
export type JourneyTagKey = string;

/** Map một tag key -> category enum (JourneyCategory hiện có trong DB). */
export function stageToCategory(stage: JourneyStage): string {
  switch (stage) {
    case "fact":
      return "met";
    case "insight":
      return "realized";
    case "action":
      return "next";
  }
}

/** Lấy giai đoạn đầu (theo thứ tự fact -> insight -> action) từ danh sách tag key. */
export function resolveCategoryFromTags(tagKeys: string[]): string {
  const stages: JourneyStage[] = [];
  for (const k of tagKeys) {
    const t = JOURNEY_TAGS.find((x) => x.key === k);
    if (t && !stages.includes(t.stage)) stages.push(t.stage);
  }
  const order: JourneyStage[] = ["fact", "insight", "action"];
  const first = order.find((s) => stages.includes(s)) ?? "fact";
  return stageToCategory(first);
}

/** Map category enum -> giai đoạn (để hiển thị tag khi load entry cũ). */
export function categoryToStage(category: string): JourneyStage {
  if (category === "realized") return "insight";
  if (category === "next") return "action";
  return "fact";
}
