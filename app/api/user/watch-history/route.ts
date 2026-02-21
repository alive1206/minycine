import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { watchHistory } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { verifyAccessToken, getAccessTokenFromHeader } from "@/lib/auth";

// ─── GET /api/user/watch-history ─ list watch history ─────────
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
      .from(watchHistory)
      .where(eq(watchHistory.userId, payload.userId))
      .orderBy(desc(watchHistory.updatedAt))
      .limit(50);

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Get watch history error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}

// ─── POST /api/user/watch-history ─ upsert progress ───────────
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
      movieSlug,
      movieName,
      posterUrl,
      episodeSlug,
      episodeName,
      currentTime,
      duration,
    } = body;

    if (!movieSlug || !episodeSlug) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    // Check existing entry
    const [existing] = await db
      .select()
      .from(watchHistory)
      .where(
        and(
          eq(watchHistory.userId, payload.userId),
          eq(watchHistory.movieSlug, movieSlug),
          eq(watchHistory.episodeSlug, episodeSlug),
        ),
      )
      .limit(1);

    if (existing) {
      // Update existing
      await db
        .update(watchHistory)
        .set({
          movieName: movieName || existing.movieName,
          posterUrl: posterUrl ?? existing.posterUrl,
          episodeName: episodeName ?? existing.episodeName,
          currentTime: currentTime ?? existing.currentTime,
          duration: duration ?? existing.duration,
          updatedAt: new Date(),
        })
        .where(eq(watchHistory.id, existing.id));
    } else {
      // Insert new
      await db.insert(watchHistory).values({
        userId: payload.userId,
        movieSlug,
        movieName: movieName || "",
        posterUrl: posterUrl || "",
        episodeSlug,
        episodeName: episodeName || "",
        currentTime: currentTime || 0,
        duration: duration || 0,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Save watch history error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}

// ─── DELETE /api/user/watch-history?movieSlug=xxx[&all=true] ──
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
    const movieSlug = searchParams.get("movieSlug");
    const clearAll = searchParams.get("all") === "true";

    if (clearAll) {
      await db
        .delete(watchHistory)
        .where(eq(watchHistory.userId, payload.userId));
      return NextResponse.json({ ok: true });
    }

    if (!movieSlug) {
      return NextResponse.json({ error: "Thiếu movieSlug" }, { status: 400 });
    }

    await db
      .delete(watchHistory)
      .where(
        and(
          eq(watchHistory.userId, payload.userId),
          eq(watchHistory.movieSlug, movieSlug),
        ),
      );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete watch history error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
