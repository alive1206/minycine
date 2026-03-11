// ─── Episode string parsing & diff utilities ────────────────

export interface EpisodeNotification {
  id: string; // `${slug}-ep-${episodeNumber}`
  slug: string;
  movieName: string;
  posterUrl: string;
  episodeNumber: number;
  createdAt: number;
  read: boolean;
}

/**
 * Parse episode number from OPhim's `episode_current` string.
 * Examples: "Tập 12" → 12, "Hoàn tất (20/24)" → 20, "Full" → null
 */
export function parseEpisodeNumber(str: string): number | null {
  if (!str) return null;

  const trimmed = str.trim();

  // "Full" → skip
  if (/^full$/i.test(trimmed)) return null;

  // "Hoàn tất (20/24)" → 20
  const completedMatch = trimmed.match(/[Hh]oàn\s*tất\s*\((\d+)\/\d+\)/);
  if (completedMatch) return parseInt(completedMatch[1], 10);

  // "Tập 12" → 12
  const epMatch = trimmed.match(/[Tt]ập\s*(\d+)/);
  if (epMatch) return parseInt(epMatch[1], 10);

  // Try bare number
  const bareNumber = trimmed.match(/^(\d+)$/);
  if (bareNumber) return parseInt(bareNumber[1], 10);

  return null;
}

/**
 * Check if the series is completed.
 * "Full" or "Hoàn tất (X/X)" where numerator = denominator → true
 */
export function isCompletedSeries(str: string): boolean {
  if (!str) return false;
  const trimmed = str.trim();

  if (/^full$/i.test(trimmed)) return true;

  const match = trimmed.match(/[Hh]oàn\s*tất\s*\((\d+)\/(\d+)\)/);
  if (match) return match[1] === match[2];

  return false;
}

/**
 * Generate notification objects for each new episode between old and new.
 */
export function generateEpisodeNotifications(
  slug: string,
  movieName: string,
  posterUrl: string,
  oldEpStr: string,
  newEpStr: string,
): EpisodeNotification[] {
  const oldEp = parseEpisodeNumber(oldEpStr);
  const newEp = parseEpisodeNumber(newEpStr);

  if (oldEp === null || newEp === null) return [];
  if (newEp <= oldEp) return [];

  const notifications: EpisodeNotification[] = [];
  // Cap at 10 notifications per movie to avoid flooding
  const start = Math.max(oldEp + 1, newEp - 9);

  for (let ep = start; ep <= newEp; ep++) {
    notifications.push({
      id: `${slug}-ep-${ep}`,
      slug,
      movieName,
      posterUrl,
      episodeNumber: ep,
      createdAt: Date.now(),
      read: false,
    });
  }

  return notifications;
}
