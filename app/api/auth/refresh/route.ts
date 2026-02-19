import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, refreshTokens } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  sanitizeUser,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refreshToken: token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Không tìm thấy refresh token" },
        { status: 401 },
      );
    }

    const payload = await verifyRefreshToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Refresh token không hợp lệ" },
        { status: 401 },
      );
    }

    const [storedToken] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.token, token),
          eq(refreshTokens.userId, payload.userId),
          gt(refreshTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!storedToken) {
      await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.userId, payload.userId));

      return NextResponse.json(
        { error: "Refresh token đã bị thu hồi" },
        { status: 401 },
      );
    }

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

    // Rotate tokens
    await db.delete(refreshTokens).where(eq(refreshTokens.id, storedToken.id));

    const newAccessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
    });

    const newRefreshToken = await signRefreshToken({
      userId: user.id,
      email: user.email,
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.insert(refreshTokens).values({
      token: newRefreshToken,
      userId: user.id,
      expiresAt,
    });

    return NextResponse.json({
      user: sanitizeUser(user),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
