import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

const ConfirmSchema = z.object({
  eventId: z.string().uuid(),
  confirmation: z.enum(["accepted", "declined"]),
});

/**
 * POST /api/events/confirm
 * Mentor/mentee xác nhận tham gia (Có / Không) một buổi định hướng/phỏng vấn.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { eventId, confirmation } = ConfirmSchema.parse(body);

  const event = await prisma.trainingModule.findUnique({ where: { id: eventId } });
  if (!event) return NextResponse.json({ error: "Không tìm thấy buổi" }, { status: 404 });

  const reg = await prisma.trainingRegistration.upsert({
    where: { moduleId_userId: { moduleId: eventId, userId: user.id } },
    create: {
      moduleId: eventId,
      userId: user.id,
      confirmation,
      confirmedAt: new Date(),
    },
    update: {
      confirmation,
      confirmedAt: new Date(),
    },
  });

  return NextResponse.json({ registration: reg });
});
