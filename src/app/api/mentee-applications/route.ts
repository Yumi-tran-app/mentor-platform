import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, getOrCreateCurrentUser } from "@/lib/auth";
import { getActiveSeasonId, transitionMenteeApplication } from "@/lib/domain";
import { withErrorHandling } from "@/lib/api-helpers";

const MenteeApplicationSchema = z.object({
  seasonId: z.string().uuid().optional(),
  identity: z.object({
    fullName: z.string().min(1).optional(),
    studentId: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }),
  profile: z.object({
    major: z.string().min(1),
    school: z.string().min(1),
    yearOfStudy: z.number().int().optional(),
    city: z.string().optional(),
  }),
  goalText: z.string().optional(),
  needs: z.array(
    z.enum(["learning", "career", "personal_dev", "life_transition"])
  ).min(1),
});

export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireUser();
  const body = await req.json();
  const parsed = MenteeApplicationSchema.parse(body);

  const seasonId = parsed.seasonId ?? (await getActiveSeasonId());
  if (!seasonId) {
    return NextResponse.json(
      { error: "No active season open for registration" },
      { status: 400 }
    );
  }

  const app = await prisma.menteeApplication.create({
    data: {
      userId: user.id,
      seasonId,
      status: "draft",
      identityJson: parsed.identity as any,
      profileJson: parsed.profile as any,
      goalText: parsed.goalText,
      availabilityStatus: "waiting",
      needs: {
        create: parsed.needs.map((n) => ({ needCategory: n })),
      },
    },
    include: { needs: true },
  });

  return NextResponse.json({ application: app }, { status: 201 });
});

export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const applications = await prisma.menteeApplication.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { season: true, needs: true },
  });

  return NextResponse.json({ applications });
});
