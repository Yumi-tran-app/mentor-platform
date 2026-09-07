import { prisma } from "./prisma";

/**
 * Quản lý danh sách (roster) Mentor & Mentee cho màn Admin.
 * - Xuất CSV đầy đủ thông tin (flatten các Json field).
 * - Nhập CSV ngược lại (tạo/cập nhật user + application).
 *
 * Mỗi loại (mentor/mentee) có bộ cột RIÊNG vì dữ liệu khác nhau.
 */

// ============================================================
// Định nghĩa cột
// ============================================================

export type CsvColumn = {
  key: string;
  label: string;
  get: (app: any) => string;
};

// ---- Cột chung (dùng cho cả mentor + mentee) ----
const COMMON_COLUMNS: CsvColumn[] = [
  { key: "email", label: "Email", get: (a) => a.user?.email ?? "" },
  { key: "fullName", label: "Họ tên", get: (a) => a.user?.fullName ?? "" },
  { key: "phone", label: "SĐT", get: (a) => a.user?.phone ?? "" },
  {
    key: "season",
    label: "Mùa (Cohort)",
    get: (a) => a.season?.name ?? a.season?.cohort ?? "",
  },
  { key: "status", label: "Trạng thái đơn", get: (a) => a.status ?? "" },
  {
    key: "submittedAt",
    label: "Ngày nộp đơn",
    get: (a) => (a.submittedAt ? new Date(a.submittedAt).toISOString() : ""),
  },
  {
    key: "createdAt",
    label: "Ngày tạo",
    get: (a) => (a.createdAt ? new Date(a.createdAt).toISOString() : ""),
  },
];

// ---- Cột riêng MENTOR ----
export const MENTOR_COLUMNS: CsvColumn[] = [
  ...COMMON_COLUMNS,
  {
    key: "programStatus",
    label: "Trạng thái tham gia",
    get: (a) => a.programStatus ?? "",
  },
  { key: "industry", label: "Ngành", get: (a) => a.industry ?? "" },
  // identity
  { key: "preferredName", label: "Tên gọi", get: (a) => a.identityJson?.preferredName ?? "" },
  { key: "gender", label: "Giới tính", get: (a) => a.identityJson?.gender ?? "" },
  { key: "birthYear", label: "Năm sinh", get: (a) => a.identityJson?.birthYear ?? "" },
  { key: "city", label: "Tỉnh/Thành phố", get: (a) => a.identityJson?.city ?? "" },
  { key: "linkedin", label: "LinkedIn", get: (a) => a.identityJson?.linkedin ?? "" },
  // professional
  { key: "company", label: "Công ty", get: (a) => a.professionalJson?.company ?? "" },
  { key: "title", label: "Chức danh", get: (a) => a.professionalJson?.title ?? "" },
  { key: "yearsExperience", label: "Năm kinh nghiệm", get: (a) => a.professionalJson?.yearsExperience ?? "" },
  { key: "yearsManagement", label: "Năm quản lý", get: (a) => a.professionalJson?.yearsManagement ?? "" },
  { key: "teamSize", label: "Quy mô đội", get: (a) => a.professionalJson?.teamSize ?? "" },
  { key: "degree", label: "Học vấn", get: (a) => a.professionalJson?.degree ?? "" },
  { key: "school", label: "Trường", get: (a) => a.professionalJson?.school ?? "" },
  // readiness
  { key: "hasMentoredBefore", label: "Từng mentor", get: (a) => a.readinessJson?.hasMentoredBefore ?? "" },
  { key: "hasMentoredStartup", label: "Từng mentor startup", get: (a) => a.readinessJson?.hasMentoredStartup ?? "" },
  { key: "mentoringFocus", label: "Định hướng đồng hành", get: (a) => (a.readinessJson?.mentoringFocus ?? []).join("; ") },
  { key: "reason", label: "Lý do tham gia", get: (a) => a.readinessJson?.reason ?? "" },
  // docs
  { key: "cvUrl", label: "Link CV", get: (a) => a.docsJson?.cvUrl ?? "" },
  { key: "photoUrl", label: "Link ảnh", get: (a) => a.docsJson?.photoUrl ?? "" },
  { key: "references", label: "Người tham chiếu", get: (a) => a.docsJson?.references ?? "" },
  { key: "source", label: "Nguồn biết đến", get: (a) => a.docsJson?.source ?? "" },
  { key: "docsNotes", label: "Ghi chú", get: (a) => a.docsJson?.notes ?? "" },
  // capacity & commit
  { key: "capacityMax", label: "Số mentee tối đa", get: (a) => a.capacityMax ?? "" },
  { key: "capacityUsed", label: "Số mentee đã có", get: (a) => a.capacityUsed ?? "" },
  { key: "commitText", label: "Lời cam kết", get: (a) => a.commitText ?? "" },
];

// ---- Cột riêng MENTEE ----
export const MENTEE_COLUMNS: CsvColumn[] = [
  ...COMMON_COLUMNS,
  {
    key: "availabilityStatus",
    label: "Trạng thái ghép cặp",
    get: (a) => a.availabilityStatus ?? "",
  },
  // identity
  { key: "gender", label: "Giới tính", get: (a) => a.identityJson?.gender ?? "" },
  { key: "birthYear", label: "Năm sinh", get: (a) => a.identityJson?.birthYear ?? "" },
  { key: "city", label: "Tỉnh/Thành phố", get: (a) => a.identityJson?.city ?? "" },
  { key: "school", label: "Trường", get: (a) => a.identityJson?.school ?? "" },
  { key: "major", label: "Ngành học", get: (a) => a.identityJson?.major ?? "" },
  { key: "graduationYear", label: "Năm tốt nghiệp", get: (a) => a.identityJson?.graduationYear ?? "" },
  // profile
  { key: "currentRole", label: "Vai trò hiện tại", get: (a) => a.profileJson?.currentRole ?? "" },
  { key: "company", label: "Công ty", get: (a) => a.profileJson?.company ?? "" },
  { key: "yearsExperience", label: "Năm kinh nghiệm", get: (a) => a.profileJson?.yearsExperience ?? "" },
  // needs
  { key: "needs", label: "Nhu cầu", get: (a) => (a.needs ?? []).map((n: any) => n.needCategory).join("; ") },
  { key: "goalText", label: "Mục tiêu", get: (a) => a.goalText ?? "" },
  {
    key: "consentedAt",
    label: "Ngày đồng thuận",
    get: (a) => (a.consentedAt ? new Date(a.consentedAt).toISOString() : ""),
  },
];

// ============================================================
// Fetch dữ liệu
// ============================================================

export async function fetchMentorRoster() {
  return prisma.mentorApplication.findMany({
    include: { user: true, season: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function fetchMenteeRoster() {
  return prisma.menteeApplication.findMany({
    include: { user: true, season: true, needs: true },
    orderBy: { createdAt: "desc" },
  });
}

// ============================================================
// CSV helpers
// ============================================================

export function escapeCsvCell(value: string): string {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function buildCsv(columns: CsvColumn[], rows: any[]): string {
  const header = columns.map((c) => escapeCsvCell(c.label)).join(",");
  const lines = rows.map((row) =>
    columns.map((c) => escapeCsvCell(c.get(row))).join(",")
  );
  return [header, ...lines].join("\r\n");
}
