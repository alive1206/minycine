"use client";

import { Pagination, Skeleton } from "@heroui/react";
import { MovieCard } from "./movie-card";
import type { Movie, Paginate } from "@/types/api";

interface MovieGridProps {
  title?: string;
  movies: Movie[];
  paginate?: Paginate;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

function MovieGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="rounded-lg">
            <div className="aspect-2/3 rounded-lg" />
          </Skeleton>
          <Skeleton className="rounded-lg mt-2">
            <div className="h-4 w-3/4" />
          </Skeleton>
        </div>
      ))}
    </div>
  );
}

export function MovieGrid({
  title,
  movies,
  paginate,
  currentPage = 1,
  onPageChange,
  isLoading,
}: MovieGridProps) {
  return (
    <section>
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
          {title}
        </h2>
      )}

      {isLoading ? (
        <MovieGridSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <MovieCard key={movie.slug} movie={movie} />
            ))}
          </div>

          {/* Pagination */}
          {paginate &&
            (paginate.totalPages ?? paginate.total_page ?? 0) > 1 &&
            onPageChange && (
              <div className="flex justify-center mt-10">
                <Pagination
                  total={paginate.totalPages ?? paginate.total_page ?? 1}
                  page={currentPage}
                  onChange={(page: number) => {
                    onPageChange?.(page);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  color="primary"
                  showControls
                  siblings={1}
                  boundaries={1}
                  classNames={{
                    wrapper: "gap-2",
                    item: "bg-[#1A1A1A] text-white border-none hover:bg-white/10",
                    cursor: "bg-primary text-white font-bold",
                  }}
                />
              </div>
            )}
        </>
      )}
    </section>
  );
}
