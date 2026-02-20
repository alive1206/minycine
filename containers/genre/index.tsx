"use client";

import { Suspense, useState } from "react";
import { useParams } from "next/navigation";
import { MovieGrid } from "@/components/movie/movie-grid";
import { MovieFilter } from "@/components/movie/movie-filter";
import { useMoviesByGenre } from "@/hooks/use-movies";
import { usePageParam } from "@/hooks/use-page-param";
import type { MovieListParams } from "@/types/api";
import { Skeleton } from "@heroui/react";

const GenreContent = () => {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = usePageParam();
  const [filters, setFilters] = useState<MovieListParams>({
    sort_field: "year",
    sort_type: "desc",
  });
  const { data, isLoading } = useMoviesByGenre(slug, page, filters);

  const title = data?.titlePage || slug;

  const handleFilterChange = (newFilters: MovieListParams) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="min-h-screen px-4 md:px-10 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
        Phim Thể Loại: <span className="text-white">{title}</span>
      </h1>
      <p className="text-gray-400 mb-6">
        Tổng hợp phim {title} hay nhất, mới nhất
      </p>

      <MovieFilter filters={filters} onChange={handleFilterChange} hideGenre />

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

export const GenrePage = () => (
  <Suspense fallback={<PageFallback />}>
    <GenreContent />
  </Suspense>
);
