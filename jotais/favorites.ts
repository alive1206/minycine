import { atomWithStorage } from "jotai/utils";

// ─── Types ────────────────────────────────────────────────────

export interface FavoriteItem {
  slug: string;
  name: string;
  origin_name: string;
  posterUrl: string;
  thumbUrl: string;
  year: number;
  quality: string;
  episode_current: string;
  addedAt: number; // Date.now()
}

// ─── Atom ─────────────────────────────────────────────────────

export const favoritesAtom = atomWithStorage<FavoriteItem[]>("favorites", []);
