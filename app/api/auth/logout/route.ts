import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { refreshTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyRefreshToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refreshToken: token } = body;

    if (token) {
      const payload = await verifyRefreshToken(token);
      if (payload) {
        await db
          .delete(refreshTokens)
          .where(eq(refreshTokens.userId, payload.userId));
      }
    }

    return NextResponse.json({ message: "Đã đăng xuất" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ message: "Đã đăng xuất" });
  }
}
