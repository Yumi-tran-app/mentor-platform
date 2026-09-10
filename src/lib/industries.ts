// Danh mục chuyên ngành chuẩn (Tâm lý + Nhân sự) — dùng chung cho:
// - Dropdown "Ngành nghề chính" trong đăng ký Mentor
// - Dropdown "Lĩnh vực quan tâm" trong đăng ký Mentee
// Không dùng cho feed cộng đồng (đã bỏ tag lĩnh vực ở feed).

export type IndustryKey = string;

export interface IndustryOption {
  key: string;
  label: string;
}

export interface IndustryGroup {
  group: string;
  options: IndustryOption[];
}

// Nhóm chuyên ngành (dùng cho optgroup trong dropdown)
export const INDUSTRY_GROUPS: IndustryGroup[] = [
  {
    group: "Tâm lý",
    options: [
      { key: "psy_clinical", label: "Tâm lý học lâm sàng" },
      { key: "psy_counseling", label: "Tham vấn tâm lý" },
      { key: "psy_educational", label: "Tâm lý học giáo dục & học đường" },
      { key: "psy_organizational", label: "Tâm lý học tổ chức – nhân sự" },
      { key: "psy_social", label: "Tâm lý học xã hội" },
      { key: "psy_developmental", label: "Tâm lý học phát triển" },
    ],
  },
  {
    group: "Nhân sự",
    options: [
      { key: "hr_recruitment", label: "Tuyển dụng & Thu hút tài năng" },
      { key: "hr_ld", label: "Đào tạo & Phát triển (L&D)" },
      { key: "hr_cb", label: "Lương thưởng & Phúc lợi (C&B)" },
      { key: "hr_perf_er", label: "Quản lý hiệu suất & Quan hệ lao động" },
      { key: "hr_bp", label: "Đối tác chiến lược nhân sự (HRBP)" },
    ],
  },
  {
    group: "Khác",
    options: [
      { key: "other", label: "Lĩnh vực khác" },
    ],
  },
];

// Danh sách phẳng (flatten) — dùng khi chỉ cần lặp 1 chiều
export const INDUSTRIES: IndustryOption[] = INDUSTRY_GROUPS.flatMap(
  (g) => g.options
);

export const INDUSTRY_LABELS: Record<string, string> = INDUSTRIES.reduce(
  (acc, i) => {
    acc[i.key] = i.label;
    return acc;
  },
  {} as Record<string, string>
);

export function industryLabel(key: string | null | undefined): string {
  if (!key) return "";
  return INDUSTRY_LABELS[key] ?? key;
}

// Map key -> nhóm (group label), dùng để gộp thống kê theo ngành mẹ
const INDUSTRY_GROUP_OF: Record<string, string> = {};
for (const g of INDUSTRY_GROUPS) {
  for (const o of g.options) {
    INDUSTRY_GROUP_OF[o.key] = g.group;
  }
}

export function industryGroupOf(key: string | null | undefined): string {
  if (!key) return "Khác";
  return INDUSTRY_GROUP_OF[key] ?? "Khác";
}

export const INDUSTRY_GROUP_NAMES = INDUSTRY_GROUPS.map((g) => g.group);
