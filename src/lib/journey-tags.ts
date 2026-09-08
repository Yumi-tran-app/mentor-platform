/**
 * Nhật ký hành trình — hệ thống nhãn (tags).
 * Người dùng viết tự do, sau đó gắn 1 hoặc nhiều nhãn trước khi lưu.
 * Có 3 nhãn gợi ý + cho phép thêm nhãn tuỳ chỉnh.
 */

export type JourneyTagDef = {
  key: string;
  emoji: string;
  label: string;
};

// 3 nhãn gợi ý (presets)
export const JOURNEY_TAGS: JourneyTagDef[] = [
  { key: "insight", emoji: "💡", label: "Đúc kết" },
  { key: "action", emoji: "🚀", label: "Bước tiếp theo" },
  { key: "memory", emoji: "🎯", label: "Kỷ niệm" },
];

/** Tên hiển thị của một tag key (kể cả tag tuỳ chỉnh không nằm trong presets). */
export function tagLabel(key: string): string {
  const preset = JOURNEY_TAGS.find((t) => t.key === key);
  if (preset) return `${preset.emoji} ${preset.label}`;
  return key;
}

/** Map tag key -> category enum (JourneyCategory hiện có trong DB). */
export function stageToCategory(key: string): string {
  switch (key) {
    case "insight":
      return "realized";
    case "action":
      return "next";
    case "memory":
      return "met";
    default:
      return "met";
  }
}

/**
 * Lấy category cho 1 entry từ danh sách tag key.
 * Ưu tiên tag preset đầu tiên; nếu không có preset thì dùng "met".
 */
export function resolveCategoryFromTags(tagKeys: string[]): string {
  for (const preset of JOURNEY_TAGS) {
    if (tagKeys.includes(preset.key)) return stageToCategory(preset.key);
  }
  return "met";
}

/** Map category enum -> tag preset key (để hiển thị tag khi load entry cũ). */
export function categoryToTagKey(category: string): string {
  if (category === "realized") return "insight";
  if (category === "next") return "action";
  return "memory";
}
