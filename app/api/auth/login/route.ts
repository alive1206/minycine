import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, refreshTokens } from "@/lib/db/schema";
import { eq, and, lt } from "drizzle-orm";
import {
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  sanitizeUser,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Vui lòng điền email và mật khẩu" },
        { status: 400 },
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không đúng" },
        { status: 401 },
      );
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không đúng" },
        { status: 401 },
      );
    }

    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = await signRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // Clean up expired tokens only (keep active sessions on other devices)
    await db
      .delete(refreshTokens)
      .where(
        and(
          eq(refreshTokens.userId, user.id),
          lt(refreshTokens.expiresAt, new Date()),
        ),
      );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.insert(refreshTokens).values({
      token: refreshToken,
      userId: user.id,
      expiresAt,
    });

    return NextResponse.json({
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi, vui lòng thử lại" },
      { status: 500 },
    );
  }
}
