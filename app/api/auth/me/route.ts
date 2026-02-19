import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  verifyAccessToken,
  getAccessTokenFromHeader,
  sanitizeUser,
} from "@/lib/auth";

export async function GET(request: Request) {
  try {
    // ─── Extract & verify token ──────────────────────────
    const token = getAccessTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Token không hợp lệ hoặc đã hết hạn" },
        { status: 401 },
      );
    }

    // ─── Get user from DB ────────────────────────────────
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Người dùng không tồn tại" },
        { status: 404 },
      );
    }

    return NextResponse.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error("Get me error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
