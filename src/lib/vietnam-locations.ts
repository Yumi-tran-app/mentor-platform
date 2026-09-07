// Danh sách 63 tỉnh/thành Việt Nam (tên chính thức, dùng cho dropdown & filter).
export const VIETNAM_PROVINCES: string[] = [
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bạc Liêu",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Định",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Cần Thơ",
  "Đà Nẵng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Nội",
  "Hà Tĩnh",
  "Hải Dương",
  "Hải Phòng",
  "Hậu Giang",
  "Hòa Bình",
  "Hồ Chí Minh",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
];

/**
 * Chuẩn hoá tên tỉnh/thành về tên chính thức (khớp 63 tỉnh).
 * Hỗ trợ các biến thể thường gặp (TPHCM, TP. Hồ Chí Minh, HCM, ...).
 */
export function normalizeProvince(input?: string | null): string | null {
  if (!input) return null;
  const raw = input.trim().toLowerCase();

  // Map các biến thể thường gặp về chuẩn
  const alias: Record<string, string> = {
    "tphcm": "Hồ Chí Minh",
    "tp.hcm": "Hồ Chí Minh",
    "tp hcm": "Hồ Chí Minh",
    "hcmc": "Hồ Chí Minh",
    "hcm": "Hồ Chí Minh",
    "tp. hồ chí minh": "Hồ Chí Minh",
    "tp hồ chí minh": "Hồ Chí Minh",
    "sài gòn": "Hồ Chí Minh",
    "saigon": "Hồ Chí Minh",
    "hồ chí minh": "Hồ Chí Minh",
    "hà nội": "Hà Nội",
    "hanoi": "Hà Nội",
    "đà nẵng": "Đà Nẵng",
    "danang": "Đà Nẵng",
    "đà nẵng": "Đà Nẵng",
  };
  if (alias[raw]) return alias[raw];

  // Tìm khớp chính xác (bỏ qua hoa thường/tiền tố "tp."/"tỉnh ")
  const cleaned = raw
    .replace(/^tp\.?\s*/i, "")
    .replace(/^tỉnh\s*/i, "")
    .replace(/^thanh pho\s*/i, "")
    .trim();
  const found = VIETNAM_PROVINCES.find(
    (p) => p.toLowerCase() === cleaned || p.toLowerCase().replace(/\s+/g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "") === raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "")
  );
  return found ?? input.trim();
}
