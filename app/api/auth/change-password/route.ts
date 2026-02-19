import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  verifyAccessToken,
  getAccessTokenFromHeader,
  verifyPassword,
  hashPassword,
} from "@/lib/auth";

export async function PUT(request: Request) {
  try {
    const token = getAccessTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Token không hợp lệ" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ mật khẩu" },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải có ít nhất 6 ký tự" },
        { status: 400 },
      );
    }

    // Get current user
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

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Mật khẩu hiện tại không đúng" },
        { status: 400 },
      );
    }

    // Hash and save new password
    const hashedPassword = await hashPassword(newPassword);
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, payload.userId));

    return NextResponse.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
