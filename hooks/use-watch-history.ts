import { useAtom } from "jotai";
import { useCallback } from "react";
import {
  watchHistoryAtom,
  type WatchHistoryItem,
} from "@/jotais/watch-history";

const MAX_HISTORY = 50;

export const useWatchHistory = () => {
  const [items, setItems] = useAtom(watchHistoryAtom);

  const saveProgress = useCallback(
    (entry: Omit<WatchHistoryItem, "updatedAt">) => {
      setItems((prev) => {
        // Remove existing entry for same movie+episode
        const filtered = prev.filter(
          (h) =>
            !(
              h.movieSlug === entry.movieSlug &&
              h.episodeSlug === entry.episodeSlug
            ),
        );
        const updated: WatchHistoryItem = {
          ...entry,
          updatedAt: Date.now(),
        };
        // Prepend and cap at MAX_HISTORY
        return [updated, ...filtered].slice(0, MAX_HISTORY);
      });
    },
    [setItems],
  );

  const removeItem = useCallback(
    (movieSlug: string) => {
      setItems((prev) => prev.filter((h) => h.movieSlug !== movieSlug));
    },
    [setItems],
  );

  const clearAll = useCallback(() => {
    setItems([]);
  }, [setItems]);

  return { items, saveProgress, removeItem, clearAll };
};
