import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getActiveSeasonId } from "@/lib/domain";
import { withErrorHandling } from "@/lib/api-helpers";

/**
 * POST /api/admin/roster/import?type=mentor|mentee
 * Nhập danh sách từ CSV (multipart form-data, field "file").
 * Xác định theo email: có → cập nhật, chưa có → tạo mới user + application.
 * Trả về { created, updated, skipped, errors }.
 */

export const runtime = "nodejs";

const BodySchema = z.object({
  // được parse từ FormData bên dưới
  type: z.enum(["mentor", "mentee"]).optional(),
});

export const POST = withErrorHandling(async (req: Request) => {
  await requireAdmin();

  const url = new URL(req.url);
  const type = (url.searchParams.get("type") ?? "mentor") as "mentor" | "mentee";

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Thiếu file CSV" }, { status: 400 });
  }

  const text = await file.text();
  const rows = parseCsv(text);
  if (rows.length === 0) {
    return NextResponse.json({ error: "File rỗng hoặc không có dòng dữ liệu" }, { status: 400 });
  }

  // Bỏ BOM nếu có ở ô đầu tiên
  if (rows[0].length > 0) {
    rows[0][0] = rows[0][0].replace(/^\uFEFF/, "");
  }

  const header = rows[0];
  const dataRows = rows.slice(1).filter((r) => r.some((c) => c.trim() !== ""));
  if (dataRows.length === 0) {
    return NextResponse.json({ error: "Chỉ có header, không có dữ liệu" }, { status: 400 });
  }

  const seasonId = await getActiveSeasonId();

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rec = headerToRecord(header, row);
    const email = (rec["Email"] ?? rec["email"] ?? "").trim().toLowerCase();
    if (!email) {
      skipped++;
      errors.push(`Dòng ${i + 2}: thiếu email, bỏ qua`);
      continue;
    }

    try {
      const existed = await prisma.user.findUnique({ where: { email } });
      if (type === "mentor") {
        await upsertMentor(existed, rec, email, seasonId);
        if (existed) updated++;
        else created++;
      } else {
        await upsertMentee(existed, rec, email, seasonId);
        if (existed) updated++;
        else created++;
      }
    } catch (e: any) {
      skipped++;
      errors.push(`Dòng ${i + 2} (${email}): ${e.message}`);
    }
  }

  return NextResponse.json({ created, updated, skipped, errors });
});

// ============================================================
// Parse CSV (hỗ trợ quoted cell + dấu phẩy/dòng mới trong ngoặc kép)
// ============================================================
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(cell);
        cell = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(cell);
        cell = "";
        rows.push(row);
        row = [];
      } else {
        cell += ch;
      }
    }
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function headerToRecord(header: string[], row: string[]): Record<string, string> {
  const rec: Record<string, string> = {};
  header.forEach((h, idx) => {
    rec[h] = row[idx] ?? "";
  });
  return rec;
}

function str(v: any): string {
  return v === undefined || v === null ? "" : String(v);
}
function orNull(v: any): string | null {
  return str(v).trim() === "" ? null : str(v).trim();
}
function orUndef(v: any): string | undefined {
  const s = str(v).trim();
  return s === "" ? undefined : s;
}
function intOrNull(v: any): number | null {
  const s = str(v).trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

async function upsertMentor(
  existed: { id: string } | null,
  rec: Record<string, string>,
  email: string,
  seasonId: string | null
) {
  const fullName = orNull(rec["Họ tên"] ?? rec["fullName"]) ?? email;

  let userId: string;
  if (!existed) {
    const u = await prisma.user.create({
      data: { email, fullName, phone: orNull(rec["SĐT"] ?? rec["phone"]) },
    });
    userId = u.id;
  } else {
    userId = existed.id;
    await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        phone: orNull(rec["SĐT"] ?? rec["phone"]) ?? undefined,
      },
    });
  }

  const identityJson = {
    preferredName: orUndef(rec["Tên gọi"]),
    gender: orUndef(rec["Giới tính"]),
    birthYear: intOrNull(rec["Năm sinh"]),
    city: orUndef(rec["Tỉnh/Thành phố"]),
    linkedin: orUndef(rec["LinkedIn"]),
  };

  const professionalJson = {
    company: orUndef(rec["Công ty"]),
    title: orUndef(rec["Chức danh"]),
    yearsExperience: intOrNull(rec["Năm kinh nghiệm"]),
    yearsManagement: intOrNull(rec["Năm quản lý"]),
    teamSize: intOrNull(rec["Quy mô đội"]),
    degree: orUndef(rec["Học vấn"]),
    school: orUndef(rec["Trường"]),
    industry: orUndef(rec["Ngành"]),
  };

  const readinessJson = {
    hasMentoredBefore: rec["Từng mentor"]?.toLowerCase() === "true" || undefined,
    hasMentoredStartup: rec["Từng mentor startup"]?.toLowerCase() === "true" || undefined,
    mentoringFocus: (rec["Định hướng đồng hành"] ?? "")
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean),
    reason: orUndef(rec["Lý do tham gia"]),
  };

  const docsJson = {
    cvUrl: orUndef(rec["Link CV"]),
    photoUrl: orUndef(rec["Link ảnh"]),
    references: orUndef(rec["Người tham chiếu"]),
    source: orUndef(rec["Nguồn biết đến"]),
    notes: orUndef(rec["Ghi chú"]),
  };

  const data: any = {
    identityJson,
    professionalJson,
    readinessJson,
    docsJson,
    industry: professionalJson.industry,
    commitText: orUndef(rec["Lời cam kết"]),
    capacityMax: intOrNull(rec["Số mentee tối đa"]) ?? 1,
  };

  const existingApp = seasonId
    ? await prisma.mentorApplication.findFirst({
        where: { userId, seasonId },
      })
    : null;

  if (existingApp) {
    await prisma.mentorApplication.update({ where: { id: existingApp.id }, data });
  } else if (seasonId) {
    await prisma.mentorApplication.create({
      data: { userId, seasonId, ...data },
    });
  } else {
    throw new Error("Không có mùa hoạt động để gán application");
  }
}

async function upsertMentee(
  existed: { id: string } | null,
  rec: Record<string, string>,
  email: string,
  seasonId: string | null
) {
  const fullName = orNull(rec["Họ tên"] ?? rec["fullName"]) ?? email;

  let userId: string;
  if (!existed) {
    const u = await prisma.user.create({
      data: { email, fullName, phone: orNull(rec["SĐT"] ?? rec["phone"]) },
    });
    userId = u.id;
  } else {
    userId = existed.id;
    await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        phone: orNull(rec["SĐT"] ?? rec["phone"]) ?? undefined,
      },
    });
  }

  const identityJson = {
    gender: orUndef(rec["Giới tính"]),
    birthYear: intOrNull(rec["Năm sinh"]),
    city: orUndef(rec["Tỉnh/Thành phố"]),
    school: orUndef(rec["Trường"]),
    major: orUndef(rec["Ngành học"]),
    graduationYear: intOrNull(rec["Năm tốt nghiệp"]),
  };

  const profileJson = {
    currentRole: orUndef(rec["Vai trò hiện tại"]),
    company: orUndef(rec["Công ty"]),
    yearsExperience: intOrNull(rec["Năm kinh nghiệm"]),
  };

  const data: any = {
    identityJson,
    profileJson,
    goalText: orUndef(rec["Mục tiêu"]),
  };

  const existingApp = seasonId
    ? await prisma.menteeApplication.findFirst({
        where: { userId, seasonId },
      })
    : null;

  if (existingApp) {
    await prisma.menteeApplication.update({ where: { id: existingApp.id }, data });
  } else if (seasonId) {
    await prisma.menteeApplication.create({
      data: { userId, seasonId, ...data },
    });
  } else {
    throw new Error("Không có mùa hoạt động để gán application");
  }
}
