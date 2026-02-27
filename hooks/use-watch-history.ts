import { useAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import {
  watchHistoryAtom,
  type WatchHistoryItem,
} from "@/jotais/watch-history";
import { useAuth } from "@/hooks/use-auth";
import { authFetch } from "@/lib/auth-fetch";
import { appStore } from "@/lib/store";
import { accessTokenAtom } from "@/jotais/auth";

const MAX_HISTORY = 50;

export const useWatchHistory = () => {
  const [items, setItems] = useAtom(watchHistoryAtom);
  const { user } = useAuth();
  const hasSynced = useRef(false);
  const pendingSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from DB on mount when user is logged in
  useEffect(() => {
    if (!user || hasSynced.current) return;
    hasSynced.current = true;

    (async () => {
      try {
        const res = await authFetch("/api/user/watch-history");
        if (!res.ok) return;
        const data = await res.json();
        const dbItems: WatchHistoryItem[] = (data.items || []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (row: any) => ({
            movieSlug: row.movieSlug || row.movie_slug,
            movieName: row.movieName || row.movie_name,
            posterUrl: row.posterUrl || row.poster_url || "",
            episodeSlug: row.episodeSlug || row.episode_slug,
            episodeName: row.episodeName || row.episode_name || "",
            currentTime: row.currentTime ?? row.current_time ?? 0,
            duration: row.duration ?? 0,
            updatedAt: new Date(row.updatedAt || row.updated_at).getTime(),
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

  // Track pending save data for flush-on-unmount / beforeunload
  const pendingEntryRef = useRef<Omit<WatchHistoryItem, "updatedAt"> | null>(
    null,
  );

  const flushPendingSave = useCallback(() => {
    const entry = pendingEntryRef.current;
    if (!entry || !user) return;
    pendingEntryRef.current = null;

    authFetch("/api/user/watch-history", {
      method: "POST",
      body: JSON.stringify({
        movieSlug: entry.movieSlug,
        movieName: entry.movieName,
        posterUrl: entry.posterUrl,
        episodeSlug: entry.episodeSlug,
        episodeName: entry.episodeName,
        currentTime: entry.currentTime,
        duration: entry.duration,
      }),
    }).catch(() => {
      /* silent */
    });
  }, [user]);

  const saveProgress = useCallback(
    (entry: Omit<WatchHistoryItem, "updatedAt">) => {
      setItems((prev) => {
        // Remove existing entry for same movie (dedupe by movie, not episode)
        const filtered = prev.filter((h) => h.movieSlug !== entry.movieSlug);
        const updated: WatchHistoryItem = {
          ...entry,
          updatedAt: Date.now(),
        };
        // Prepend and cap at MAX_HISTORY
        return [updated, ...filtered].slice(0, MAX_HISTORY);
      });

      // Store pendingEntry for flush-on-unmount/unload
      pendingEntryRef.current = entry;

      // Debounced DB sync — save at most once per 3 seconds
      if (user) {
        if (pendingSaveTimer.current) {
          clearTimeout(pendingSaveTimer.current);
        }
        pendingSaveTimer.current = setTimeout(() => {
          pendingEntryRef.current = null;
          authFetch("/api/user/watch-history", {
            method: "POST",
            body: JSON.stringify({
              movieSlug: entry.movieSlug,
              movieName: entry.movieName,
              posterUrl: entry.posterUrl,
              episodeSlug: entry.episodeSlug,
              episodeName: entry.episodeName,
              currentTime: entry.currentTime,
              duration: entry.duration,
            }),
          }).catch(() => {
            /* silent */
          });
        }, 3000);
      }
    },
    [setItems, user],
  );

  // Flush pending save on unmount (e.g. navigating away)
  useEffect(() => {
    return () => {
      if (pendingSaveTimer.current) {
        clearTimeout(pendingSaveTimer.current);
      }
      flushPendingSave();
    };
  }, [flushPendingSave]);

  // Flush on page unload (tab close / browser close)
  useEffect(() => {
    const handleBeforeUnload = () => {
      const entry = pendingEntryRef.current;
      if (!entry) return;
      pendingEntryRef.current = null;

      // Use fetch with keepalive (survives page unload, supports auth headers)
      const token = appStore.get(accessTokenAtom);
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      fetch("/api/user/watch-history", {
        method: "POST",
        headers,
        body: JSON.stringify({
          movieSlug: entry.movieSlug,
          movieName: entry.movieName,
          posterUrl: entry.posterUrl,
          episodeSlug: entry.episodeSlug,
          episodeName: entry.episodeName,
          currentTime: entry.currentTime,
          duration: entry.duration,
        }),
        keepalive: true,
      }).catch(() => {});
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const removeItem = useCallback(
    (movieSlug: string) => {
      setItems((prev) => prev.filter((h) => h.movieSlug !== movieSlug));

      if (user) {
        authFetch(
          `/api/user/watch-history?movieSlug=${encodeURIComponent(movieSlug)}`,
          { method: "DELETE" },
        ).catch(() => {
          /* silent */
        });
      }
    },
    [setItems, user],
  );

  const clearAll = useCallback(() => {
    setItems([]);

    if (user) {
      authFetch("/api/user/watch-history?all=true", {
        method: "DELETE",
      }).catch(() => {
        /* silent */
      });
    }
  }, [setItems, user]);

  return { items, saveProgress, removeItem, clearAll };
};
