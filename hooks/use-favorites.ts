import { useAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { favoritesAtom, type FavoriteItem } from "@/jotais/favorites";
import { useAuth } from "@/hooks/use-auth";
import { authFetch } from "@/lib/auth-fetch";

export const useFavorites = () => {
  const [items, setItems] = useAtom(favoritesAtom);
  const { user } = useAuth();
  const hasSynced = useRef(false);

  // Hydrate from DB on mount when user is logged in
  useEffect(() => {
    if (!user || hasSynced.current) return;
    hasSynced.current = true;

    (async () => {
      try {
        const res = await authFetch("/api/user/favorites");
        if (!res.ok) return;
        const data = await res.json();
        const dbItems: FavoriteItem[] = (data.items || []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (row: any) => ({
            slug: row.slug,
            name: row.name,
            origin_name: row.originName || row.origin_name || "",
            posterUrl: row.posterUrl || row.poster_url || "",
            thumbUrl: row.thumbUrl || row.thumb_url || "",
            year: row.year || 0,
            quality: row.quality || "",
            episode_current: row.episodeCurrent || row.episode_current || "",
            addedAt: new Date(row.addedAt || row.added_at).getTime(),
          }),
        );
        setItems(dbItems);
      } catch {
        // Silently fail — keep localStorage data
      }
    })();
  }, [user, setItems]);

  // Reset sync flag when user changes (login/logout)
  useEffect(() => {
    if (!user) {
      hasSynced.current = false;
    }
  }, [user]);

  const isFavorite = useCallback(
    (slug: string) => items.some((f) => f.slug === slug),
    [items],
  );

  const toggle = useCallback(
    (movie: {
      slug: string;
      name: string;
      origin_name: string;
      poster_url?: string;
      thumb_url: string;
      year: number;
      quality: string;
      episode_current: string;
    }) => {
      setItems((prev) => {
        const exists = prev.find((f) => f.slug === movie.slug);
        if (exists) {
          return prev.filter((f) => f.slug !== movie.slug);
        }
        const item: FavoriteItem = {
          slug: movie.slug,
          name: movie.name,
          origin_name: movie.origin_name,
          posterUrl: movie.poster_url || "",
          thumbUrl: movie.thumb_url,
          year: movie.year,
          quality: movie.quality,
          episode_current: movie.episode_current,
          addedAt: Date.now(),
        };
        return [item, ...prev];
      });

      // Sync to DB in background
      if (user) {
        authFetch("/api/user/favorites", {
          method: "POST",
          body: JSON.stringify({
            slug: movie.slug,
            name: movie.name,
            origin_name: movie.origin_name,
            poster_url: movie.poster_url || "",
            thumb_url: movie.thumb_url,
            year: movie.year,
            quality: movie.quality,
            episode_current: movie.episode_current,
          }),
        }).catch(() => {
          /* silent */
        });
      }
    },
    [setItems, user],
  );

  const removeItem = useCallback(
    (slug: string) => {
      setItems((prev) => prev.filter((f) => f.slug !== slug));

      // Sync to DB in background
      if (user) {
        authFetch(`/api/user/favorites?slug=${encodeURIComponent(slug)}`, {
          method: "DELETE",
        }).catch(() => {
          /* silent */
        });
      }
    },
    [setItems, user],
  );

  return { items, toggle, isFavorite, removeItem };
};
