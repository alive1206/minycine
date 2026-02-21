import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { favorites } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { verifyAccessToken, getAccessTokenFromHeader } from "@/lib/auth";

// ─── GET /api/user/favorites ─ list all favorites ─────────────
export async function GET(request: Request) {
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

    const items = await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, payload.userId))
      .orderBy(desc(favorites.addedAt));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Get favorites error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}

// ─── POST /api/user/favorites ─ toggle a favorite ─────────────
export async function POST(request: Request) {
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
    const {
      slug,
      name,
      origin_name,
      poster_url,
      thumb_url,
      year,
      quality,
      episode_current,
    } = body;

    if (!slug || !name) {
      return NextResponse.json(
        { error: "Thiếu thông tin phim" },
        { status: 400 },
      );
    }

    // Check if already favorited
    const [existing] = await db
      .select()
      .from(favorites)
      .where(
        and(eq(favorites.userId, payload.userId), eq(favorites.slug, slug)),
      )
      .limit(1);

    if (existing) {
      // Remove
      await db.delete(favorites).where(eq(favorites.id, existing.id));
      return NextResponse.json({ action: "removed" });
    }

    // Add
    await db.insert(favorites).values({
      userId: payload.userId,
      slug,
      name,
      originName: origin_name || "",
      posterUrl: poster_url || "",
      thumbUrl: thumb_url || "",
      year: year || 0,
      quality: quality || "",
      episodeCurrent: episode_current || "",
    });

    return NextResponse.json({ action: "added" });
  } catch (error) {
    console.error("Toggle favorite error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}

// ─── DELETE /api/user/favorites?slug=xxx ─ remove favorite ────
export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Thiếu slug" }, { status: 400 });
    }

    await db
      .delete(favorites)
      .where(
        and(eq(favorites.userId, payload.userId), eq(favorites.slug, slug)),
      );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete favorite error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
