import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { refreshTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refreshToken: token } = body;

    if (token) {
      // Only delete the specific token, not all tokens for the user
      // This preserves sessions on other devices/tabs
      await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
    }

    return NextResponse.json({ message: "Đã đăng xuất" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ message: "Đã đăng xuất" });
  }
}
