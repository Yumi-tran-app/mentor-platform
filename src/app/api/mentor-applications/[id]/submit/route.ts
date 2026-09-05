import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { transitionMentorApplication } from "@/lib/domain";
import { withErrorHandling } from "@/lib/api-helpers";

// PATCH /api/mentor-applications/:id/submit
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const user = await requireUser();

    // Chỉ chủ đơn được submit đơn của mình
    const app = await prisma.mentorApplication.findUnique({
      where: { id },
    });
    if (!app || app.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await transitionMentorApplication(
      id,
      "submitted",
      user.id
    );
    return NextResponse.json({ application: updated });
  })(req, { params: await params });
}
