"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, Skeleton } from "@heroui/react";
import { Play, Info, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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

// ─── Individual slide that fetches its own data ────────────────
interface HeroSlideProps {
  movie: Movie;
  isActive: boolean;
}

const HeroSlide = ({ movie, isActive }: HeroSlideProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { data: detailData } = useMovieDetail(movie.slug);
  const { data: tmdbImages } = useMovieImages(movie.slug);

  const originalUrl = getImageUrl(movie.poster_url || movie.thumb_url);
  const backdropUrl = tmdbImages?.backdropUrl || originalUrl;

  return (
    <div
      className="absolute inset-0 transition-opacity duration-700 ease-in-out"
      style={{
        opacity:
          isActive && imageLoaded
            ? 1
            : isActive && !backdropUrl
              ? 1
              : isActive
                ? imageLoaded
                  ? 1
                  : 0
                : 0,
      }}
    >
      {backdropUrl && (
        <Image
          src={backdropUrl}
          alt={movie.name}
          fill
          priority
          className="object-cover"
          unoptimized
          onLoad={() => setImageLoaded(true)}
        />
      )}
    </div>
  );
};

/** Hook to get slide content (detail + images) for a given movie */
const useSlideContent = (movie: Movie | undefined) => {
  const slug = movie?.slug || "";
  const { data: detailData } = useMovieDetail(slug);
  const { data: tmdbImages } = useMovieImages(slug);

  const content = detailData?.movie?.content;
  const synopsis = content ? truncateText(stripHtml(content)) : "";
  const voteAverage =
    detailData?.movie?.tmdb?.vote_average ?? movie?.tmdb?.vote_average;

  return { synopsis, voteAverage, tmdbImages };
};

// ─── Content overlay component with AnimatePresence ───────────
interface SlideContentProps {
  movie: Movie;
  synopsis: string;
  voteAverage?: number;
}

const SlideContent = ({ movie, synopsis, voteAverage }: SlideContentProps) => (
  <motion.div
    key={movie.slug}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="flex flex-col gap-5 items-start"
  >
    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight drop-shadow-lg">
      {movie.name}
    </h1>

    {movie.origin_name && (
      <p className="text-lg text-gray-400 font-medium">{movie.origin_name}</p>
    )}

    {/* Meta */}
    <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-200">
      <RatingBadge voteAverage={voteAverage} />
      {movie.quality && (
        <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
          {movie.quality}
        </span>
      )}
      {movie.lang && (
        <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
          {movie.lang}
        </span>
      )}
      {movie.episode_current && (
        <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
          {movie.episode_current.toLowerCase().includes("undefined")
            ? "? tập"
            : movie.episode_current}
        </span>
      )}
      <span className="text-gray-400">
        {movie.time && !movie.time.toLowerCase().includes("undefined")
          ? movie.time
          : "? phút/tập"}
      </span>
    </div>

    {/* Category tags */}
    {movie.category?.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {movie.category.slice(0, 4).map((cat) => (
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
        href={`/phim/${movie.slug}`}
        color="primary"
        size="lg"
        className="font-bold shadow-lg shadow-red-900/20 hover:scale-105 transition-transform"
        startContent={<Play className="w-5 h-5 fill-white" />}
      >
        Xem Phim
      </Button>
      <Button
        as={Link}
        href={`/phim/${movie.slug}`}
        variant="flat"
        size="lg"
        className="bg-white/20 text-white backdrop-blur-sm font-bold border border-white/10"
        startContent={<Info className="w-5 h-5" />}
      >
        Chi Tiết
      </Button>
    </div>
  </motion.div>
);

// ─── Main HeroBanner ──────────────────────────────────────────
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

  // Prefetch content for the active slide
  const { synopsis, voteAverage } = useSlideContent(currentMovie);

  // Navigation helpers
  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % heroMovies.length);
  }, [heroMovies.length]);

  const goPrev = useCallback(() => {
    setActiveIndex(
      (prev) => (prev - 1 + heroMovies.length) % heroMovies.length,
    );
  }, [heroMovies.length]);

  // Reset auto-advance timer whenever user interacts
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (heroMovies.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroMovies.length);
    }, INTERVAL_MS);
  }, [heroMovies.length]);

  // Auto-advance
  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

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
      {/* Stacked backgrounds — each slide prefetches its own data */}
      {heroMovies.map((movie, idx) => (
        <HeroSlide
          key={movie.slug}
          movie={movie}
          isActive={idx === activeIndex}
        />
      ))}

      {/* Gradient overlays */}
      <div className="absolute inset-0 hero-gradient-left" />
      <div className="absolute inset-0 hero-gradient-bottom" />

      {/* Content with AnimatePresence crossfade */}
      <div className="absolute inset-0 flex items-center">
        <div className="px-4 md:px-10 w-full max-w-7xl mx-auto pt-20">
          <div className="max-w-2xl flex flex-col gap-5 items-start">
            <AnimatePresence mode="wait">
              <SlideContent
                key={currentMovie.slug}
                movie={currentMovie}
                synopsis={synopsis}
                voteAverage={voteAverage}
              />
            </AnimatePresence>
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
