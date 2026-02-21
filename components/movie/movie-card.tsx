"use client";

import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import type { Movie } from "@/types/api";

interface MovieCardProps {
  movie: Movie;
}

/**
 * Builds a usable image URL from the API response.
 * The API returns relative filenames like "movie-thumb.jpg".
 * We prepend the CDN base URL from APP_DOMAIN_CDN_IMAGE.
 */
const getImageUrl = (url: string | undefined): string => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${process.env.NEXT_PUBLIC_IMG_URL}/${url}`;
};

export const MovieCard = ({ movie }: MovieCardProps) => {
  // Use same image source as detail page: thumb_url || poster_url
  const imageUrl =
    getImageUrl(movie.thumb_url) ||
    getImageUrl(movie.poster_url) ||
    "/placeholder-poster.jpg";

  return (
    <Link
      href={`/phim/${movie.slug}`}
      className="movie-card group relative block cursor-pointer"
    >
      <div className="aspect-2/3 rounded-lg overflow-hidden relative shadow-lg bg-[#1A1A1A]">
        <Image
          src={imageUrl}
          alt={movie.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover"
          unoptimized
        />

        {/* Quality badge */}
        {movie.quality && (
          <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase">
            {movie.quality}
          </span>
        )}

        {/* Episode badge */}
        {movie.episode_current && (
          <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/10">
            {movie.episode_current}
          </span>
        )}

        {/* Hover overlay */}
        <div className="card-overlay absolute inset-0 bg-black/50 flex items-center justify-center">
          <Play className="w-12 h-12 text-white drop-shadow-lg fill-white" />
        </div>
      </div>

      {/* Info — single line truncated, no time */}
      <div className="mt-2">
        <h3 className="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">
          {movie.name}
        </h3>
        {movie.origin_name && (
          <p className="text-xs text-[#A3A3A3] truncate mt-0.5">
            {movie.origin_name}
          </p>
        )}
      </div>
    </Link>
  );
};
