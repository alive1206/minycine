"use client";

import Link from "next/link";
import { Skeleton } from "@heroui/react";
import { ChevronRight } from "lucide-react";
import { MovieCard } from "./movie-card";
import type { Movie } from "@/types/api";
import type { ReactNode } from "react";

interface MovieCarouselProps {
  title: string;
  icon?: ReactNode;
  movies: Movie[];
  href?: string;
  isLoading?: boolean;
}

function MovieCardSkeleton() {
  return (
    <div className="shrink-0 w-40 md:w-48">
      <Skeleton className="rounded-lg">
        <div className="aspect-2/3 rounded-lg" />
      </Skeleton>
      <Skeleton className="rounded-lg mt-2">
        <div className="h-4 w-3/4" />
      </Skeleton>
    </div>
  );
}

export function MovieCarousel({
  title,
  icon,
  movies,
  href,
  isLoading,
}: MovieCarouselProps) {
  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          {icon && <span className="text-primary">{icon}</span>}
          {title}
          {href && (
            <Link href={href}>
              <ChevronRight className="w-6 h-6 text-primary" />
            </Link>
          )}
        </h2>
        {href && (
          <Link
            href={href}
            className="text-sm font-medium text-primary hover:text-white transition-colors"
          >
            Xem thêm
          </Link>
        )}
      </div>

      {/* Scrollable row */}
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar pb-2">
          {movies.slice(0, 12).map((movie) => (
            <div key={movie.slug} className="shrink-0 w-40 md:w-48">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
