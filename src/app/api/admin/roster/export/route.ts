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
 * GET /api/admin/roster/export?type=mentor|mentee
 * Xuất file CSV (tách riêng mentor / mentee).
 */
export const GET = withErrorHandling(async (req: Request) => {
  await requireAdmin();

  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? "mentor";

  let csv: string;
  let filename: string;

  if (type === "mentee") {
    const rows = await fetchMenteeRoster();
    csv = buildCsv(MENTEE_COLUMNS, rows);
    filename = `mentee-roster-${dateStamp()}.csv`;
  } else {
    const rows = await fetchMentorRoster();
    csv = buildCsv(MENTOR_COLUMNS, rows);
    filename = `mentor-roster-${dateStamp()}.csv`;
  }

  // BOM để Excel nhận diện UTF-8 đúng dấu tiếng Việt.
  const body = "\uFEFF" + csv;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
});

function dateStamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
}
