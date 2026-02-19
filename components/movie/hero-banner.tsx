"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, Skeleton } from "@heroui/react";
import { Play, Info, Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { Movie } from "@/types/api";
import { useMovieDetail } from "@/hooks/use-movie-detail";
import { useMovieImages } from "@/hooks/use-movie-images";

const getImageUrl = (url: string | undefined): string => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${process.env.NEXT_PUBLIC_IMG_URL}/${url}`;
};

const stripHtml = (html: string): string => {
  return html.replace(/<[^>]+>/g, "").trim();
};

const truncateText = (text: string, maxLength: number = 200): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, "") + "...";
};

/** Renders the rating badge – shows "Chưa có đánh giá" when vote is 0 or missing */
const RatingBadge = ({ voteAverage }: { voteAverage?: number }) => {
  if (voteAverage != null && voteAverage > 0) {
    return (
      <span className="flex items-center text-yellow-500 gap-1">
        <Star className="w-4 h-4 fill-current" />
        {voteAverage.toFixed(1)}
      </span>
    );
  }
  return (
    <span className="flex items-center text-gray-400 gap-1 text-xs">
      <Star className="w-4 h-4" />
      Chưa có đánh giá
    </span>
  );
};

interface HeroBannerProps {
  movies?: Movie[];
  isLoading?: boolean;
}

const INTERVAL_MS = 5000;
const SWIPE_THRESHOLD = 50;

export const HeroBanner = ({ movies, isLoading }: HeroBannerProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const heroMovies = movies?.slice(0, 5) || [];
  const currentMovie = heroMovies[activeIndex];

  // Fetch detail for the active movie to get content/synopsis
  const { data: detailData } = useMovieDetail(currentMovie?.slug || "");
  // Fetch TMDb images for high-quality backdrop
  const { data: tmdbImages } = useMovieImages(currentMovie?.slug || "");

  const content = detailData?.movie?.content;
  const synopsis = content ? truncateText(stripHtml(content)) : "";

  // Navigation helpers
  const goTo = (index: number) => {
    setActiveIndex(index);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % heroMovies.length);
  };

  const goPrev = () => {
    setActiveIndex(
      (prev) => (prev - 1 + heroMovies.length) % heroMovies.length,
    );
  };

  // Reset auto-advance timer whenever user interacts
  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (heroMovies.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroMovies.length);
    }, INTERVAL_MS);
  };

  // Auto-advance
  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroMovies.length]);

  // Touch / swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
    touchEndX.current = e.changedTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) < SWIPE_THRESHOLD) return;

    if (diff > 0) {
      goNext(); // swipe left → next
    } else {
      goPrev(); // swipe right → prev
    }
    resetTimer();
  };

  // Resolve vote_average (detail data takes priority)
  const voteAverage =
    detailData?.movie?.tmdb?.vote_average ?? currentMovie?.tmdb?.vote_average;

  if (isLoading || heroMovies.length === 0) {
    return (
      <section className="relative h-[85vh] w-full overflow-hidden bg-[#0D0D0D]">
        <Skeleton className="w-full h-full rounded-none" />
      </section>
    );
  }

  return (
    <section
      className="relative h-[85vh] w-full overflow-hidden group/hero"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Stacked backgrounds with crossfade */}
      {heroMovies.map((movie, idx) => {
        const originalUrl = getImageUrl(movie.poster_url || movie.thumb_url);
        // Use TMDb backdrop for the active slide, fallback to original
        const backdropUrl =
          idx === activeIndex && tmdbImages?.backdropUrl
            ? tmdbImages.backdropUrl
            : originalUrl;
        return (
          <div
            key={movie.slug}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: idx === activeIndex ? 1 : 0 }}
          >
            {backdropUrl && (
              <Image
                src={backdropUrl}
                alt={movie.name}
                fill
                priority={idx === 0}
                className="object-cover"
                unoptimized
              />
            )}
          </div>
        );
      })}

      {/* Gradient overlays */}
      <div className="absolute inset-0 hero-gradient-left" />
      <div className="absolute inset-0 hero-gradient-bottom" />

      {/* Content with crossfade */}
      <div className="absolute inset-0 flex items-center">
        <div className="px-4 md:px-10 w-full max-w-7xl mx-auto pt-20">
          <div className="max-w-2xl flex flex-col gap-5 items-start">
            {/* Animated content block */}
            <div
              key={currentMovie.slug}
              className="flex flex-col gap-5 items-start animate-fade-in"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight drop-shadow-lg">
                {currentMovie.name}
              </h1>

              {currentMovie.origin_name && (
                <p className="text-lg text-gray-400 font-medium">
                  {currentMovie.origin_name}
                </p>
              )}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-200">
                <RatingBadge voteAverage={voteAverage} />
                {currentMovie.quality && (
                  <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                    {currentMovie.quality}
                  </span>
                )}
                {currentMovie.lang && (
                  <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                    {currentMovie.lang}
                  </span>
                )}
                {currentMovie.episode_current && (
                  <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                    {currentMovie.episode_current
                      .toLowerCase()
                      .includes("undefined")
                      ? "? tập"
                      : currentMovie.episode_current}
                  </span>
                )}
                <span className="text-gray-400">
                  {currentMovie.time &&
                  !currentMovie.time.toLowerCase().includes("undefined")
                    ? currentMovie.time
                    : "? phút/tập"}
                </span>
              </div>

              {/* Category tags */}
              {currentMovie.category?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentMovie.category.slice(0, 4).map((cat) => (
                    <span
                      key={cat.slug}
                      className="bg-white/10 text-gray-300 text-xs px-2 py-0.5 rounded"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Movie synopsis */}
              {synopsis && (
                <p className="text-sm md:text-base text-gray-300/90 leading-relaxed max-w-xl line-clamp-3">
                  {synopsis}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 mt-2">
                <Button
                  as={Link}
                  href={`/phim/${currentMovie.slug}`}
                  color="primary"
                  size="lg"
                  className="font-bold shadow-lg shadow-red-900/20 hover:scale-105 transition-transform"
                  startContent={<Play className="w-5 h-5 fill-white" />}
                >
                  Xem Phim
                </Button>
                <Button
                  as={Link}
                  href={`/phim/${currentMovie.slug}`}
                  variant="flat"
                  size="lg"
                  className="bg-white/20 text-white backdrop-blur-sm font-bold border border-white/10"
                  startContent={<Info className="w-5 h-5" />}
                >
                  Chi Tiết
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Arrow navigation (desktop) */}
      {heroMovies.length > 1 && (
        <>
          <button
            onClick={() => {
              goPrev();
              resetTimer();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white opacity-0 group-hover/hero:opacity-100 transition-opacity duration-300 hover:bg-black/60 hover:scale-110"
            aria-label="Phim trước"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => {
              goNext();
              resetTimer();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white opacity-0 group-hover/hero:opacity-100 transition-opacity duration-300 hover:bg-black/60 hover:scale-110"
            aria-label="Phim kế tiếp"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {heroMovies.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {heroMovies.map((movie, idx) => (
            <button
              key={movie.slug}
              onClick={() => {
                goTo(idx);
                resetTimer();
              }}
              className={`rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? "w-8 h-2.5 bg-primary"
                  : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Chuyển đến phim ${movie.name}`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {heroMovies.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-20">
          <div
            className="h-full bg-primary"
            style={{
              animation: `progress ${INTERVAL_MS}ms linear`,
              animationIterationCount: 1,
            }}
            key={`${activeIndex}-progress`}
          />
        </div>
      )}
    </section>
  );
};
