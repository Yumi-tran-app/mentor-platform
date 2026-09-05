import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, getOrCreateCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-helpers";

const SupportSchema = z.object({
  matchId: z.string().uuid(),
  message: z.string().min(1),
});

/**
 * POST /api/support-requests
 * Mentor/mentee gửi yêu cầu cần ĐPV hỗ trợ.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireUser();
  const body = await req.json();
  const { matchId, message } = SupportSchema.parse(body);

  const request = await prisma.supportRequest.create({
    data: {
      matchId,
      requestedByUserId: user.id,
      message,
      status: "open",
    },
  });

  return NextResponse.json({ supportRequest: request }, { status: 201 });
});

export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? undefined;

  const requests = await prisma.supportRequest.findMany({
    where: status ? { status: status as any } : {},
    orderBy: { createdAt: "asc" },
    include: { match: true },
  });

  return NextResponse.json({ supportRequests: requests });
});
