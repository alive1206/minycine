// ─── Episode string parsing & diff utilities ────────────────

export interface EpisodeNotification {
  id: string; // just `slug` (one per movie)
  slug: string;
  movieName: string;
  posterUrl: string;
  latestEpisode: string; // raw string from API, e.g. "Tập 4"
  episodeSlug: string; // slug of latest episode for direct link
  updatedTime: number; // seoOnPage.updated_time from API
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
 * Generate a single notification for a movie's latest episode.
 */
export function generateMovieNotification(
  slug: string,
  movieName: string,
  posterUrl: string,
  latestEpisode: string,
  episodeSlug: string,
  updatedTime: number,
): EpisodeNotification {
  return {
    id: slug,
    slug,
    movieName,
    posterUrl,
    latestEpisode,
    episodeSlug,
    updatedTime,
    read: false,
  };
}
