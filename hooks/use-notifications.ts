"use client";

import { useAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { notificationsAtom } from "@/jotais/notifications";
import { useFavorites } from "@/hooks/use-favorites";
import { useAuth } from "@/hooks/use-auth";
import {
  isCompletedSeries,
  generateEpisodeNotifications,
} from "@/lib/episode-utils";
import api from "@/lib/api";

const CHECK_COOLDOWN = 30 * 60 * 1000; // 30 minutes
const CONCURRENCY = 3;
const BATCH_DELAY = 200; // ms between batches
const MAX_ITEMS = 100;

export const useNotifications = () => {
  const [state, setState] = useAtom(notificationsAtom);
  const { items: favorites, updateEpisodeCurrent } = useFavorites();
  const { user } = useAuth();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (!user) return;
    if (hasChecked.current) return;
    if (favorites.length === 0) return;

    const now = Date.now();
    if (now - state.lastCheckedAt < CHECK_COOLDOWN) return;

    hasChecked.current = true;

    const checkForNewEpisodes = async () => {
      // Filter out completed series
      const toCheck = favorites.filter(
        (f) => !isCompletedSeries(f.episode_current),
      );

      if (toCheck.length === 0) {
        setState((prev) => ({ ...prev, lastCheckedAt: now }));
        return;
      }

      const allNewNotifications: ReturnType<
        typeof generateEpisodeNotifications
      > = [];
      const updates: { slug: string; newEp: string }[] = [];

      // Process in batches of CONCURRENCY
      for (let i = 0; i < toCheck.length; i += CONCURRENCY) {
        const batch = toCheck.slice(i, i + CONCURRENCY);

        const results = await Promise.allSettled(
          batch.map(async (fav) => {
            const res = await api.get(`/phim/${fav.slug}`);
            return { fav, data: res.data };
          }),
        );

        for (const result of results) {
          if (result.status !== "fulfilled") continue;
          const { fav, data } = result.value;
          const movie = data?.data?.item;
          if (!movie) continue;

          const liveEp = movie.episode_current;
          if (!liveEp || liveEp === fav.episode_current) continue;

          const notifications = generateEpisodeNotifications(
            fav.slug,
            fav.name,
            fav.posterUrl,
            fav.episode_current,
            liveEp,
          );

          if (notifications.length > 0) {
            allNewNotifications.push(...notifications);
            updates.push({ slug: fav.slug, newEp: liveEp });
          }
        }

        // Delay between batches (skip after last batch)
        if (i + CONCURRENCY < toCheck.length) {
          await new Promise((r) => setTimeout(r, BATCH_DELAY));
        }
      }

      // Merge new notifications, dedup by id, cap at MAX_ITEMS
      if (allNewNotifications.length > 0) {
        setState((prev) => {
          const existingIds = new Set(prev.items.map((n) => n.id));
          const fresh = allNewNotifications.filter(
            (n) => !existingIds.has(n.id),
          );
          const merged = [...fresh, ...prev.items].slice(0, MAX_ITEMS);
          return { items: merged, lastCheckedAt: now };
        });

        // Update episode_current in favorites + sync DB
        for (const { slug, newEp } of updates) {
          updateEpisodeCurrent(slug, newEp);
        }
      } else {
        setState((prev) => ({ ...prev, lastCheckedAt: now }));
      }
    };

    checkForNewEpisodes();
  }, [user, favorites, state.lastCheckedAt, setState, updateEpisodeCurrent]);

  // Reset check flag on user change
  useEffect(() => {
    if (!user) {
      hasChecked.current = false;
    }
  }, [user]);

  const unreadCount = state.items.filter((n) => !n.read).length;

  const markAllRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((n) => ({ ...n, read: true })),
    }));
  }, [setState]);

  const dismiss = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        items: prev.items.filter((n) => n.id !== id),
      }));
    },
    [setState],
  );

  const clearAll = useCallback(() => {
    setState({ items: [], lastCheckedAt: state.lastCheckedAt });
  }, [setState, state.lastCheckedAt]);

  return {
    items: state.items,
    unreadCount,
    markAllRead,
    dismiss,
    clearAll,
  };
};
