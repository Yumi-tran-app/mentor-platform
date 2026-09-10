// Danh mục lĩnh vực chuẩn — dùng chung cho:
// - Dropdown "Ngành nghề chính" trong đăng ký Mentor
// - Bộ lọc nhu cầu trong đăng ký Mentee
// - Landing page (ô "Khám phá các lĩnh vực") + API thống kê mentor/mentee
// Mỗi phần tử: [key, label, icon-helper]
export const INDUSTRIES = [
  { key: "tech_it", label: "Công nghệ & IT" },
  { key: "marketing_sales", label: "Marketing & Sales" },
  { key: "finance_accounting", label: "Tài chính & Kế toán" },
  { key: "hr_psychology", label: "Nhân sự & Tâm lý" },
  { key: "design_creative", label: "Thiết kế & Sáng tạo" },
  { key: "education_training", label: "Giáo dục & Đào tạo" },
  { key: "healthcare", label: "Y tế & Sức khoẻ" },
  { key: "manufacturing_engineering", label: "Sản xuất & Kỹ thuật" },
  { key: "music_arts", label: "Âm nhạc & Nghệ thuật" },
  { key: "supply_chain_logistics", label: "Supply Chain & Logistics" },
  { key: "transport_warehousing", label: "Vận tải & Kho bãi" },
  { key: "agriculture_processing", label: "Nông nghiệp & Chế biến" },
  { key: "business_startup", label: "Kinh doanh & Khởi nghiệp" },
  { key: "legal_compliance", label: "Pháp lý & Tuân thủ" },
  { key: "other", label: "Lĩnh vực khác" },
] as const;

export type IndustryKey = (typeof INDUSTRIES)[number]["key"];

export const INDUSTRY_LABELS: Record<IndustryKey, string> = INDUSTRIES.reduce(
  (acc, i) => {
    acc[i.key] = i.label;
    return acc;
  },
  {} as Record<IndustryKey, string>
);

export function industryLabel(key: string | null | undefined): string {
  if (!key) return "";
  return INDUSTRY_LABELS[key as IndustryKey] ?? key;
}
