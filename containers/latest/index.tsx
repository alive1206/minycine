"use client";

import { Suspense, useState } from "react";
import { MovieGrid } from "@/components/movie/movie-grid";
import { MovieFilter } from "@/components/movie/movie-filter";
import { useLatestMovies } from "@/hooks/use-movies";
import { usePageParam } from "@/hooks/use-page-param";
import type { MovieListParams } from "@/types/api";
import { Skeleton } from "@heroui/react";

const LatestContent = () => {
  const [page, setPage] = usePageParam();
  const [filters, setFilters] = useState<MovieListParams>({
    sort_field: "year",
    sort_type: "desc",
  });
  const { data, isLoading } = useLatestMovies(page, filters);

  const handleFilterChange = (newFilters: MovieListParams) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="min-h-screen px-4 md:px-10 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
        Phim Mới Cập Nhật
      </h1>
      <p className="text-gray-400 mb-6">
        Danh sách phim mới nhất được cập nhật liên tục
      </p>

      <MovieFilter filters={filters} onChange={handleFilterChange} />

      <MovieGrid
        movies={data?.items || []}
        paginate={data?.paginate}
        currentPage={page}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
};

const PageFallback = () => (
  <div className="min-h-screen px-4 md:px-10 py-8">
    <Skeleton className="rounded-lg mb-2">
      <div className="h-10 w-64" />
    </Skeleton>
    <Skeleton className="rounded-lg mb-6">
      <div className="h-5 w-48" />
    </Skeleton>
  </div>
);

export const LatestMoviesPage = () => (
  <Suspense fallback={<PageFallback />}>
    <LatestContent />
  </Suspense>
);
