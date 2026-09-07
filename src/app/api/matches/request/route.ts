import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { getActiveSeasonId, notifyUser } from "@/lib/domain";
import { getMentorCertificationStatus } from "@/lib/certification";
import { withErrorHandling } from "@/lib/api-helpers";

const RequestSchema = z.object({
  targetId: z.string().uuid(), // mentorApplicationId hoặc menteeApplicationId của đối phương
  goalText: z.string().optional(),
});

/**
 * POST /api/matches/request
 * Người dùng chủ động chọn đối phương để kết nối.
 * Hệ thống tự xác định user là mentor hay mentee (dựa trên application),
 * rồi tạo Match ở proposed_to_parties.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { targetId, goalText } = RequestSchema.parse(body);

  const sid = await getActiveSeasonId();
  if (!sid) return NextResponse.json({ error: "No active season" }, { status: 400 });

  // Xác định user là mentor hay mentee
  const myMentorApp = await prisma.mentorApplication.findFirst({ where: { userId: user.id, seasonId: sid } });
  const myMenteeApp = await prisma.menteeApplication.findFirst({ where: { userId: user.id, seasonId: sid } });

  let mentorAppId: string | null = null;
  let menteeAppId: string | null = null;

  if (myMentorApp) {
    // user là mentor -> target là mentee
    mentorAppId = myMentorApp.id;
    menteeAppId = targetId;
  } else if (myMenteeApp) {
    // user là mentee -> target là mentor
    mentorAppId = targetId;
    menteeAppId = myMenteeApp.id;

    // Nguyên tắc: mentor phải pass chương trình đào tạo online + bài test mới được nhận mentee
    const mentorApp = await prisma.mentorApplication.findUnique({
      where: { id: targetId },
      select: { userId: true },
    });
    if (mentorApp) {
      const cert = await getMentorCertificationStatus(mentorApp.userId, sid);
      if (!cert.eligible) {
        return NextResponse.json(
          {
            error:
              "Mentor này chưa hoàn thành chương trình đào tạo và bài kiểm tra, nên chưa thể nhận mentee.",
          },
          { status: 400 }
        );
      }
    }
  } else {
    return NextResponse.json(
      { error: "Bạn cần đăng ký làm mentor/mentee trước" },
      { status: 400 }
    );
  }

  // Kiểm tra đã có match chưa
  const existing = await prisma.match.findFirst({
    where: { mentorApplicationId: mentorAppId, menteeApplicationId: menteeAppId, status: { not: "ended" } },
  });
  if (existing) {
    return NextResponse.json({ error: "Đã có yêu cầu kết nối giữa hai người" }, { status: 400 });
  }

  const match = await prisma.match.create({
    data: {
      seasonId: sid,
      mentorApplicationId: mentorAppId,
      menteeApplicationId: menteeAppId,
      goalText,
      status: "proposed_to_parties",
      proposedAt: new Date(),
    },
  });

  // Gửi thông báo cho đối phương
  const targetAppId = mentorAppId === myMentorApp?.id ? menteeAppId : mentorAppId;
  const targetApp = mentorAppId === myMentorApp?.id
    ? await prisma.menteeApplication.findUnique({ where: { id: targetAppId } })
    : await prisma.mentorApplication.findUnique({ where: { id: targetAppId } });
  if (targetApp) {
    await notifyUser({
      userId: targetApp.userId,
      type: "match.request_received",
      payload: { matchId: match.id },
    });
  }

  return NextResponse.json({ match }, { status: 201 });
});
