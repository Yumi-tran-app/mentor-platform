import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Bọc handler API để thống nhất xử lý lỗi:
 * - UNAUTHORIZED -> 401
 * - ZodError -> 400 (validation)
 * - Error thông thường -> 400/500 tùy message
 */
export function withErrorHandling(
  handler: (req: Request, ctx: any) => Promise<Response>
) {
  return async (req: Request, ctx: any) => {
    try {
      return await handler(req, ctx);
    } catch (err: any) {
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: "Invalid input", issues: err.issues },
          { status: 400 }
        );
      }
      if (err?.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const status = err?.status ?? 400;
      return NextResponse.json(
        { error: err?.message ?? "Internal error" },
        { status: status >= 400 && status < 600 ? status : 500 }
      );
    }
  };
}
