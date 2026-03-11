"use client";

import { useAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { notificationsAtom } from "@/jotais/notifications";
import { useFavorites } from "@/hooks/use-favorites";
import { useAuth } from "@/hooks/use-auth";
import {
  isCompletedSeries,
  parseEpisodeNumber,
  generateMovieNotification,
} from "@/lib/episode-utils";
import type { EpisodeNotification } from "@/lib/episode-utils";
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

      const allNewNotifications: EpisodeNotification[] = [];
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

          // Compare episode numbers to detect new episodes
          const oldEp = parseEpisodeNumber(fav.episode_current);
          const newEp = parseEpisodeNumber(liveEp);
          if (oldEp === null || newEp === null || newEp <= oldEp) continue;

          // Extract real timestamp from API
          const updatedTime =
            data?.data?.seoOnPage?.updated_time || Date.now();

          // Extract latest episode slug from server_data
          const serverData = movie.episodes?.[0]?.server_data;
          const latestEpSlug =
            serverData && serverData.length > 0
              ? serverData[serverData.length - 1].slug
              : "";

          const notification = generateMovieNotification(
            fav.slug,
            fav.name,
            fav.posterUrl,
            liveEp,
            latestEpSlug,
            updatedTime,
          );

          allNewNotifications.push(notification);
          updates.push({ slug: fav.slug, newEp: liveEp });
        }

        // Delay between batches (skip after last batch)
        if (i + CONCURRENCY < toCheck.length) {
          await new Promise((r) => setTimeout(r, BATCH_DELAY));
        }
      }

      // Merge new notifications, dedup by id (slug), cap at MAX_ITEMS
      if (allNewNotifications.length > 0) {
        setState((prev) => {
          const updatedMap = new Map(prev.items.map((n) => [n.id, n]));
          for (const n of allNewNotifications) {
            // Upsert: update existing or add new, preserve read state
            const existing = updatedMap.get(n.id);
            updatedMap.set(n.id, existing ? { ...n, read: existing.read } : n);
          }
          const merged = Array.from(updatedMap.values())
            .sort((a, b) => b.updatedTime - a.updatedTime)
            .slice(0, MAX_ITEMS);
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

  const markRead = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        items: prev.items.map((n) =>
          n.id === id ? { ...n, read: true } : n,
        ),
      }));
    },
    [setState],
  );

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
    markRead,
    markAllRead,
    dismiss,
    clearAll,
  };
};
