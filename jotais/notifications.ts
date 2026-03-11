import { atomWithStorage } from "jotai/utils";
import type { EpisodeNotification } from "@/lib/episode-utils";

// ─── Types ────────────────────────────────────────────────────

export interface NotificationState {
  items: EpisodeNotification[];
  lastCheckedAt: number;
}

// ─── Atom ─────────────────────────────────────────────────────

export const notificationsAtom = atomWithStorage<NotificationState>(
  "notifications_v2",
  { items: [], lastCheckedAt: 0 },
);
