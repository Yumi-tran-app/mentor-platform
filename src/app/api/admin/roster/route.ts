import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";
import {
  fetchMentorRoster,
  fetchMenteeRoster,
  buildCsv,
  MENTOR_COLUMNS,
  MENTEE_COLUMNS,
} from "@/lib/roster";

/**
 * GET /api/admin/roster - danh sách mentor/mentee (JSON) để hiển thị bảng.
 * Query: ?type=mentor|mentee (mặc định mentor)
 */
export const GET = withErrorHandling(async (req: Request) => {
  await requireAdmin();

  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? "mentor";

  if (type === "mentee") {
    const rows = await fetchMenteeRoster();
    const columns = MENTEE_COLUMNS.map((c) => ({ key: c.key, label: c.label }));
    const data = rows.map((r) =>
      Object.fromEntries(MENTEE_COLUMNS.map((c) => [c.key, c.get(r)]))
    );
    return NextResponse.json({ type: "mentee", columns, data, total: rows.length });
  }

  const rows = await fetchMentorRoster();
  const columns = MENTOR_COLUMNS.map((c) => ({ key: c.key, label: c.label }));
  const data = rows.map((r) =>
    Object.fromEntries(MENTOR_COLUMNS.map((c) => [c.key, c.get(r)]))
  );
  return NextResponse.json({ type: "mentor", columns, data, total: rows.length });
});
