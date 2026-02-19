import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, refreshTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  signAccessToken,
  signRefreshToken,
  sanitizeUser,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ thông tin" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email không hợp lệ" },
        { status: 400 },
      );
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Email đã được sử dụng" },
        { status: 409 },
      );
    }

    const hashedPassword = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({ email, name, password: hashedPassword })
      .returning();

    const accessToken = await signAccessToken({
      userId: newUser.id,
      email: newUser.email,
    });

    const refreshToken = await signRefreshToken({
      userId: newUser.id,
      email: newUser.email,
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.insert(refreshTokens).values({
      token: refreshToken,
      userId: newUser.id,
      expiresAt,
    });

    return NextResponse.json(
      {
        user: sanitizeUser(newUser),
        accessToken,
        refreshToken,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi, vui lòng thử lại" },
      { status: 500 },
    );
  }
}
