import { useAtom } from "jotai";
import { useCallback } from "react";
import { favoritesAtom, type FavoriteItem } from "@/jotais/favorites";

export const useFavorites = () => {
  const [items, setItems] = useAtom(favoritesAtom);

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
    },
    [setItems],
  );

  const removeItem = useCallback(
    (slug: string) => {
      setItems((prev) => prev.filter((f) => f.slug !== slug));
    },
    [setItems],
  );

  return { items, toggle, isFavorite, removeItem };
};
