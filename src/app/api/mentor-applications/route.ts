import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, getOrCreateCurrentUser } from "@/lib/auth";
import { getActiveSeasonId, transitionMentorApplication } from "@/lib/domain";
import { withErrorHandling } from "@/lib/api-helpers";

const MentorApplicationSchema = z.object({
  seasonId: z.string().uuid().optional(),
  identity: z.object({
    fullName: z.string().min(1).optional(),
    preferredName: z.string().optional(),
    gender: z.string().optional(),
    birthYear: z.number().int().optional(),
    city: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    linkedin: z.string().url().optional(),
  }),
  professional: z.object({
    company: z.string().min(1),
    title: z.string().min(1),
    yearsExperience: z.number().nonnegative(),
    yearsManagement: z.number().nonnegative().optional(),
    teamSize: z.number().int().nonnegative().optional(),
    industry: z.string().min(1),
    degree: z.string().optional(),
    school: z.string().optional(),
  }),
  readiness: z.object({
    hasMentoredBefore: z.boolean().optional(),
    hasMentoredStartup: z.boolean().optional(),
    reason: z.string().optional(),
    readyForOrientation: z.boolean().optional(),
    readyForIntroCall: z.boolean().optional(),
    mentoringFocus: z
      .array(z.enum(["learning", "career", "personal_dev", "life_transition"]))
      .optional(),
  }),
  docs: z.object({
    cvUrl: z.string().optional(),
    photoUrl: z.string().optional(),
    references: z.string().optional(),
    source: z.string().optional(),
    notes: z.string().optional(),
  }),
  capacityMax: z.number().int().min(1).max(3).default(1),
  commitText: z.string().optional(),
  commitments: z.object({
    codeOfConduct: z.boolean().optional(),
    timeCommitment: z.boolean().optional(),
    confidentiality: z.boolean().optional(),
    availability: z.boolean().optional(),
    // 4 điều khoản mới (bước 6)
    timePerMonth: z.boolean().optional(),
    infoAccuracy: z.boolean().optional(),
    crossIndustry: z.boolean().optional(),
    respectNoImpose: z.boolean().optional(),
  }),
});

export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireUser();
  const body = await req.json();
  const parsed = MentorApplicationSchema.parse(body);

  const seasonId = parsed.seasonId ?? (await getActiveSeasonId());
  if (!seasonId) {
    return NextResponse.json(
      { error: "No active season open for registration" },
      { status: 400 }
    );
  }

  const app = await prisma.mentorApplication.create({
    data: {
      userId: user.id,
      seasonId,
      status: "draft",
      identityJson: parsed.identity as any,
      professionalJson: parsed.professional as any,
      readinessJson: parsed.readiness as any,
      docsJson: parsed.docs as any,
      industry: parsed.professional.industry,
      capacityMax: parsed.capacityMax,
      commitText: parsed.commitText,
      commitmentsJson: {
        ...parsed.commitments,
        tickedAt: new Date().toISOString(),
      } as any,
    },
  });

  return NextResponse.json({ application: app }, { status: 201 });
});

export const GET = withErrorHandling(async (req: Request) => {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const applications = await prisma.mentorApplication.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { season: true },
  });

  return NextResponse.json({ applications });
});
