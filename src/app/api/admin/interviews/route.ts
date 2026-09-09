import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { getActiveSeasonId } from "@/lib/domain";
import { sendEmail, simpleHtml } from "@/lib/email";
import { withErrorHandling } from "@/lib/api-helpers";

const CreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  audience: z.enum(["all", "mentor", "mentee"]).default("all"),
  startAt: z.string().datetime().optional().nullable(),
  endAt: z.string().datetime().optional().nullable(),
  location: z.string().optional().nullable(),
  zoomLink: z.string().optional().nullable(),
  attendeeIds: z.array(z.string().uuid()).optional(), // danh sách userId tham dự (default: rỗng)
  purpose: z.enum(["orientation", "pause_review"]).default("orientation"),
  matchId: z.string().uuid().optional(), // chỉ dùng khi purpose=pause_review: tự lấy mentor+mentee
});

/**
 * POST /api/admin/interviews
 * ĐPV tạo "Buổi định hướng / phỏng vấn" (nhóm chung) type="interview".
 * Nếu có attendeeIds -> tạo registration cho từng người + gửi email chung.
 */
export const POST = withErrorHandling(async (req: Request) => {
  await requireStaff();

  const seasonId = await getActiveSeasonId();
  if (!seasonId) return NextResponse.json({ error: "No active season" }, { status: 400 });

  const body = await req.json();
  const parsed = CreateSchema.parse(body);

  // Khi purpose=pause_review, tự lấy mentor + mentee của cặp làm người tham dự
  let attendeeIds = parsed.attendeeIds ?? [];
  if (parsed.purpose === "pause_review") {
    if (!parsed.matchId) {
      return NextResponse.json(
        { error: "matchId required for pause_review" },
        { status: 400 }
      );
    }
    const match = await prisma.match.findUnique({
      where: { id: parsed.matchId },
      include: {
        mentorApplication: { select: { userId: true } },
        menteeApplication: { select: { userId: true } },
      },
    });
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }
    attendeeIds = [
      match.mentorApplication.userId,
      match.menteeApplication.userId,
    ];
  }

  const event = await prisma.trainingModule.create({
    data: {
      seasonId,
      title: parsed.title,
      description: parsed.description,
      audience: parsed.audience,
      type: "interview",
      status: "open",
      startAt: parsed.startAt ? new Date(parsed.startAt) : null,
      endAt: parsed.endAt ? new Date(parsed.endAt) : null,
      location: parsed.location,
      zoomLink: parsed.zoomLink,
      required: false,
      price: 0,
      capacity: 0,
    },
  });

  let mailed = 0;

  if (attendeeIds.length > 0) {
    // Tạo registration + gửi email cho từng người
    for (const userId of attendeeIds) {
      await prisma.trainingRegistration.upsert({
        where: { moduleId_userId: { moduleId: event.id, userId } },
        create: { moduleId: event.id, userId, confirmation: "pending" },
        update: {},
      });

      const u = await prisma.user.findUnique({ where: { id: userId } });
      if (u?.email) {
        const when = parsed.startAt
          ? new Date(parsed.startAt).toLocaleString("vi-VN", {
              day: "2-digit", month: "2-digit", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })
          : "sẽ thông báo sau";
        const zoom = parsed.zoomLink ?? "sẽ gửi link trước buổi";
        const isPause = parsed.purpose === "pause_review";
        const subject = isPause
          ? `Mời tham dự buổi trao đổi về tạm dừng: ${parsed.title}`
          : `Mời tham dự: ${parsed.title}`;
        const intro = isPause
          ? `Chương trình trân trọng mời bạn tham dự buổi trao đổi về yêu cầu tạm dừng của cặp đồng hành: <strong>${parsed.title}</strong>.`
          : `Chương trình Tre Việt Mentoring trân trọng mời bạn tham dự buổi: <strong>${parsed.title}</strong>.`;
        await sendEmail({
          to: u.email,
          subject,
          html: simpleHtml(subject, [
            `Xin chào ${u.fullName},`,
            intro,
            `⏰ Thời gian: ${when}`,
            `📍 Link tham dự (Zoom): ${zoom}`,
            `Vui lòng xác nhận tham gia (Có/Không) trong ứng dụng để chúng tôi sắp xếp.`,
          ]),
        });
        mailed++;
      }
    }
  }

  return NextResponse.json(
    { event, attendees: attendeeIds.length, mailed, purpose: parsed.purpose },
    { status: 201 }
  );
});

/**
 * GET /api/admin/interviews — danh sách buổi định hướng/phỏng vấn + số người xác nhận.
 */
export const GET = withErrorHandling(async (req: Request) => {
  await requireStaff();

  const events = await prisma.trainingModule.findMany({
    where: { type: "interview" },
    orderBy: { startAt: "asc" },
    include: {
      registrations: {
        include: { user: { select: { fullName: true, email: true } } },
      },
    },
  });

  const mapped = events.map((e) => {
    const accepted = e.registrations.filter((r) => r.confirmation === "accepted").length;
    const declined = e.registrations.filter((r) => r.confirmation === "declined").length;
    const pending = e.registrations.filter((r) => r.confirmation === "pending").length;
    return {
      id: e.id,
      title: e.title,
      audience: e.audience,
      status: e.status,
      startAt: e.startAt,
      zoomLink: e.zoomLink,
      attendees: e.registrations.map((r) => ({
        userId: r.userId,
        fullName: r.user.fullName,
        email: r.user.email,
        confirmation: r.confirmation,
      })),
      counts: { accepted, declined, pending, total: e.registrations.length },
    };
  });

  return NextResponse.json({ interviews: mapped });
});
