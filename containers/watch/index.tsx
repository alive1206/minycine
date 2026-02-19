"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button, Skeleton, Divider } from "@heroui/react";
import { ArrowLeft, Film, Sparkles } from "lucide-react";
import { useMovieDetail } from "@/hooks/use-movie-detail";
import { useMoviesByGenre } from "@/hooks/use-movies";
import { useWatchHistory } from "@/hooks/use-watch-history";
import { VideoPlayer } from "@/components/player/video-player";
import { EpisodeDrawer } from "@/components/player/episode-drawer";
import { MovieCarousel } from "@/components/movie/movie-carousel";

export const WatchPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const tapParam = searchParams.get("tap");

  const { data, isLoading } = useMovieDetail(slug);
  const { saveProgress, items: watchHistory } = useWatchHistory();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const movie = data?.movie;
  const firstGenreSlug = movie?.category?.[0]?.slug || "";

  const { data: similarMovies, isLoading: loadingSimilar } = useMoviesByGenre(
    firstGenreSlug,
    1,
  );

  const filteredSimilar = useMemo(
    () => similarMovies?.items?.filter((m) => m.slug !== slug) || [],
    [similarMovies, slug],
  );
  const allEpisodes = useMemo(() => {
    const eps = data?.episodes || [];
    if (!eps.length) return [];
    // Prefer first non-AI server
    const server = eps.find((s) => !s.is_ai) || eps[0];
    return server?.server_data || [];
  }, [data?.episodes]);

  // Current episode
  const currentEp = useMemo(() => {
    if (allEpisodes.length === 0) return null;
    if (tapParam) {
      const found = allEpisodes.find((ep) => ep.slug === tapParam);
      if (found) return found;
    }
    return allEpisodes[0];
  }, [allEpisodes, tapParam]);

  const currentSrc = currentEp?.link_m3u8 || currentEp?.link_embed || "";

  // Get initial time from watch history
  const initialTime = useMemo(() => {
    if (!currentEp) return undefined;
    const entry = watchHistory.find(
      (h) => h.movieSlug === slug && h.episodeSlug === currentEp.slug,
    );
    // Don't resume if within 10s of start or 30s of end
    if (
      entry &&
      entry.currentTime > 10 &&
      entry.duration - entry.currentTime > 30
    ) {
      return entry.currentTime;
    }
    return undefined;
  }, [watchHistory, slug, currentEp]);

  // Build poster URL for history
  const posterUrl = useMemo(() => {
    const url = data?.movie?.poster_url || data?.movie?.thumb_url || "";
    if (url.startsWith("http")) return url;
    return url ? `${process.env.NEXT_PUBLIC_IMG_URL}/${url}` : "";
  }, [data]);

  const handleProgressSave = useCallback(
    (progress: { currentTime: number; duration: number }) => {
      if (!movie || !currentEp) return;
      saveProgress({
        movieSlug: movie.slug,
        movieName: movie.name,
        posterUrl,
        episodeSlug: currentEp.slug,
        episodeName: currentEp.name || currentEp.slug,
        currentTime: progress.currentTime,
        duration: progress.duration,
      });
    },
    [movie, currentEp, posterUrl, saveProgress],
  );

  const handleSelectEpisode = useCallback((epSlug: string) => {
    // Use pushState to avoid full page reload
    const url = new URL(window.location.href);
    url.searchParams.set("tap", epSlug);
    window.history.pushState({}, "", url.toString());
    window.location.reload();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 pt-20">
          <Skeleton className="rounded-xl">
            <div className="aspect-video w-full" />
          </Skeleton>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Không tìm thấy phim
          </h1>
          <Button
            as={Link}
            href="/"
            color="primary"
            startContent={<ArrowLeft className="w-4 h-4" />}
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Player area */}
      <div className="max-w-7xl mx-auto pt-16">
        <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
          {currentSrc ? (
            <VideoPlayer
              src={currentSrc}
              title={movie.name}
              onOpenEpisodeList={() => setDrawerOpen(true)}
              hasEpisodes={allEpisodes.length > 1}
              onProgressSave={handleProgressSave}
              initialTime={initialTime}
              episodeDrawerSlot={
                <EpisodeDrawer
                  isOpen={drawerOpen}
                  onClose={() => setDrawerOpen(false)}
                  episodes={allEpisodes}
                  currentSlug={currentEp?.slug}
                  movieSlug={movie.slug}
                  onSelectEpisode={handleSelectEpisode}
                />
              }
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-400">Không tìm thấy nguồn phát</p>
            </div>
          )}
        </div>
      </div>

      {/* Movie info + episode list below player */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <Button
              as={Link}
              href={`/phim/${movie.slug}`}
              variant="light"
              size="sm"
              className="text-gray-400 -ml-3 mb-2"
              startContent={<ArrowLeft className="w-4 h-4" />}
            >
              Chi tiết phim
            </Button>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              {movie.name}
            </h1>
            <p className="text-gray-400 text-sm mt-1">{movie.origin_name}</p>
          </div>
        </div>

        {/* Episode grid below player */}
        {allEpisodes.length > 1 && (
          <div className="mt-6">
            <h3 className="text-white font-semibold mb-3">Danh sách tập</h3>
            <div className="flex flex-wrap gap-2">
              {allEpisodes.map((ep) => (
                <Button
                  key={ep.slug}
                  as={Link}
                  href={`/xem/${movie.slug}?tap=${ep.slug}`}
                  size="sm"
                  variant="flat"
                  className={`min-w-14 border border-white/10 ${
                    currentEp?.slug === ep.slug
                      ? "bg-primary text-white"
                      : "bg-[#1A1A1A] text-white hover:bg-white/10"
                  }`}
                >
                  {ep.name}
                </Button>
              ))}
            </div>
          </div>
        )}
        {/* Similar movies */}
        {filteredSimilar.length > 0 && (
          <>
            <Divider className="my-8 bg-white/10" />
            <MovieCarousel
              title="Phim Tương Tự"
              icon={<Sparkles className="w-6 h-6" />}
              movies={filteredSimilar}
              href={`/the-loai/${firstGenreSlug}`}
              isLoading={loadingSimilar}
            />
          </>
        )}
      </div>
    </div>
  );
};
