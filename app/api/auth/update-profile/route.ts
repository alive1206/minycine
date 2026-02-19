import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  verifyAccessToken,
  getAccessTokenFromHeader,
  sanitizeUser,
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
    const { name, avatar } = body;

    const updateData: Record<string, string> = {};
    if (name && typeof name === "string" && name.trim().length > 0) {
      updateData.name = name.trim();
    }
    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Không có dữ liệu cần cập nhật" },
        { status: 400 },
      );
    }

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, payload.userId))
      .returning();

    return NextResponse.json({ user: sanitizeUser(updated) });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
