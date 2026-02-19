import { atomWithStorage } from "jotai/utils";

// ─── Types ────────────────────────────────────────────────────

export interface WatchHistoryItem {
  movieSlug: string;
  movieName: string;
  posterUrl: string;
  episodeSlug: string;
  episodeName: string;
  currentTime: number; // seconds
  duration: number; // seconds
  updatedAt: number; // Date.now()
}

// ─── Atom ─────────────────────────────────────────────────────

export const watchHistoryAtom = atomWithStorage<WatchHistoryItem[]>(
  "watch_history",
  [],
);
