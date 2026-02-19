"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { MovieGrid } from "@/components/movie/movie-grid";
import { MovieFilter } from "@/components/movie/movie-filter";
import { useMoviesByCategory } from "@/hooks/use-movies";
import type { MovieListParams } from "@/types/api";

const categoryNames: Record<string, string> = {
  "phim-le": "Phim Lẻ",
  "phim-bo": "Phim Bộ",
  "phim-dang-chieu": "Phim Đang Chiếu",
  "tv-shows": "TV Shows",
  "hoat-hinh": "Hoạt Hình",
};

export const CategoryPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<MovieListParams>({
    sort_field: "year",
    sort_type: "desc",
  });
  const { data, isLoading } = useMoviesByCategory(slug, page, filters);

  const title = categoryNames[slug] || data?.titlePage || slug;

  const handleFilterChange = (newFilters: MovieListParams) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="min-h-screen px-4 md:px-10 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
        {title}
      </h1>
      <p className="text-gray-400 mb-6">
        Danh sách {title} mới nhất, cập nhật liên tục
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
