import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { transitionMenteeApplication } from "@/lib/domain";
import { withErrorHandling } from "@/lib/api-helpers";

// PATCH /api/mentee-applications/:id/submit
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const user = await requireUser();

    const app = await prisma.menteeApplication.findUnique({
      where: { id },
    });
    if (!app || app.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await transitionMenteeApplication(
      id,
      "submitted",
      user.id
    );
    return NextResponse.json({ application: updated });
  })(req, { params: await params });
}
