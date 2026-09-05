import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/domain";

export const maxDuration = 60;

export const dynamic = "force-dynamic";

/**
 * Cron job SLA — chạy định kỳ (Vercel Cron / Supabase scheduled function).
 * Quét coordinator_assignments quá hạn -> reassign cho ĐPV khác + ghi KPI breach.
 * POST /api/cron/sla-check
 *
 * Bảo vệ bằng secret (Authorization Bearer) khi deploy thật.
 */
export async function POST(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const expected = process.env.CRON_SECRET;
  if (expected && auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const overdue = await prisma.coordinatorAssignment.findMany({
    where: { status: "pending", dueAt: { lt: now } },
    include: { matchReview: { include: { match: true } } },
  });

  let reassigned = 0;

  for (const assignment of overdue) {
    // Tìm ĐPV khác (đơn giản: ĐPV nào không phải người cũ, lấy gần nhất)
    const otherCoordinator = await prisma.user.findFirst({
      where: { id: { not: assignment.coordinatorId } },
    });

    await prisma.$transaction(async (tx) => {
      // Đánh dấu cũ quá hạn
      await tx.coordinatorAssignment.update({
        where: { id: assignment.id },
        data: { status: "overdue_reassigned", completedAt: now },
      });

      // Ghi KPI breach cho ĐPV cũ
      await tx.coordinatorKpiEvent.create({
        data: {
          coordinatorId: assignment.coordinatorId,
          assignmentId: assignment.id,
          eventType: "sla_breach",
          occurredAt: now,
        },
      });

      // Tạo assignment mới cho ĐPV khác (round-robin tạm thời)
      if (otherCoordinator) {
        const sla = await tx.seasonCriteria.findUnique({
          where: {
            seasonId_key: {
              seasonId: assignment.matchReview.match.seasonId,
              key: "match_review_sla_business_days",
            },
          },
        });
        const days = sla ? parseInt(sla.value, 10) : 7;
        const dueAt = new Date(now);
        dueAt.setDate(dueAt.getDate() + days);

        await tx.coordinatorAssignment.create({
          data: {
            matchReviewId: assignment.matchReviewId,
            coordinatorId: otherCoordinator.id,
            status: "pending",
            dueAt,
            reassignedFromAssignmentId: assignment.id,
          },
        });

        await tx.coordinatorKpiEvent.create({
          data: {
            coordinatorId: otherCoordinator.id,
            assignmentId: assignment.id,
            eventType: "reassignment_received",
            occurredAt: now,
          },
        });
      }
    });

    reassigned++;
  }

  await writeAudit({
    action: "cron.sla_check",
    entityType: "CoordinatorAssignment",
    after: { overdueCount: overdue.length, reassigned },
  });

  return NextResponse.json({ overdue: overdue.length, reassigned });
}

export async function GET(req: Request) {
  // GET để test nhanh trong môi trường dev
  return POST(req);
}
