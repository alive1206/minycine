"use client";

import { useMemo } from "react";

import {
  useLatestMovies,
  useMoviesByCategory,
  useMoviesByCountry,
} from "@/hooks/use-movies";
import { HeroBanner } from "@/components/movie/hero-banner";
import { MovieCarousel } from "@/components/movie/movie-carousel";
import { ContinueWatching } from "@/components/movie/continue-watching";
import { Clapperboard, Film, Tv, Flame, Sparkles, Globe } from "lucide-react";
import type { Movie } from "@/types/api";

const sortByYear = (items: Movie[]) =>
  [...items].sort((a, b) => (b.year || 0) - (a.year || 0));

export const Home = () => {
  const { data: latest, isLoading: loadingLatest } = useLatestMovies(1);
  const { data: phimLe, isLoading: loadingPhimLe } = useMoviesByCategory(
    "phim-le",
    1,
  );
  const { data: phimBo, isLoading: loadingPhimBo } = useMoviesByCategory(
    "phim-bo",
    1,
  );
  const { data: phimDangChieu, isLoading: loadingDangChieu } =
    useMoviesByCategory("phim-dang-chieu", 1);
  const { data: tvShows, isLoading: loadingTvShows } = useMoviesByCategory(
    "tv-shows",
    1,
  );
  const { data: hoatHinh, isLoading: loadingHoatHinh } = useMoviesByCategory(
    "hoat-hinh",
    1,
  );
  const { data: phimTrungQuoc, isLoading: loadingTrungQuoc } =
    useMoviesByCountry("trung-quoc", 1);
  const { data: phimHanQuoc, isLoading: loadingHanQuoc } = useMoviesByCountry(
    "han-quoc",
    1,
  );

  const heroMovies = useMemo(
    () => sortByYear(latest?.items || []).slice(0, 5),
    [latest],
  );

  const sortedLatest = useMemo(() => sortByYear(latest?.items || []), [latest]);
  const sortedPhimLe = useMemo(() => sortByYear(phimLe?.items || []), [phimLe]);
  const sortedPhimBo = useMemo(() => sortByYear(phimBo?.items || []), [phimBo]);
  const sortedDangChieu = useMemo(
    () => sortByYear(phimDangChieu?.items || []),
    [phimDangChieu],
  );
  const sortedTrungQuoc = useMemo(
    () => sortByYear(phimTrungQuoc?.items || []),
    [phimTrungQuoc],
  );
  const sortedHanQuoc = useMemo(
    () => sortByYear(phimHanQuoc?.items || []),
    [phimHanQuoc],
  );
  const sortedTvShows = useMemo(
    () => sortByYear(tvShows?.items || []),
    [tvShows],
  );
  const sortedHoatHinh = useMemo(
    () => sortByYear(hoatHinh?.items || []),
    [hoatHinh],
  );

  return (
    <div className="-mt-16">
      {/* Hero Banner */}
      <HeroBanner movies={heroMovies} isLoading={loadingLatest} />

      {/* Movie sections */}
      <div className="px-4 md:px-10 max-w-7xl mx-auto flex flex-col gap-12 pt-12 pb-20 relative z-10">
        {/* Continue Watching */}
        <ContinueWatching />
        <MovieCarousel
          title="Phim Mới Cập Nhật"
          icon={<Clapperboard className="w-6 h-6" />}
          movies={sortedLatest}
          href="/phim-moi"
          isLoading={loadingLatest}
        />

        <MovieCarousel
          title="Phim Lẻ"
          icon={<Film className="w-6 h-6" />}
          movies={sortedPhimLe}
          href="/danh-sach/phim-le"
          isLoading={loadingPhimLe}
        />

        <MovieCarousel
          title="Phim Bộ"
          icon={<Tv className="w-6 h-6" />}
          movies={sortedPhimBo}
          href="/danh-sach/phim-bo"
          isLoading={loadingPhimBo}
        />

        <MovieCarousel
          title="Đang Chiếu"
          icon={<Flame className="w-6 h-6" />}
          movies={sortedDangChieu}
          href="/danh-sach/phim-dang-chieu"
          isLoading={loadingDangChieu}
        />

        <MovieCarousel
          title="Phim Trung Quốc"
          icon={<Globe className="w-6 h-6" />}
          movies={sortedTrungQuoc}
          href="/quoc-gia/trung-quoc"
          isLoading={loadingTrungQuoc}
        />

        <MovieCarousel
          title="Phim Hàn Quốc"
          icon={<Globe className="w-6 h-6" />}
          movies={sortedHanQuoc}
          href="/quoc-gia/han-quoc"
          isLoading={loadingHanQuoc}
        />

        <MovieCarousel
          title="TV Shows"
          icon={<Tv className="w-6 h-6" />}
          movies={sortedTvShows}
          href="/danh-sach/tv-shows"
          isLoading={loadingTvShows}
        />

        <MovieCarousel
          title="Hoạt Hình"
          icon={<Sparkles className="w-6 h-6" />}
          movies={sortedHoatHinh}
          href="/danh-sach/hoat-hinh"
          isLoading={loadingHoatHinh}
        />
      </div>
    </div>
  );
};
