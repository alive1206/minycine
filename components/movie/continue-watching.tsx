"use client";

import Link from "next/link";
import Image from "next/image";
import { Play, X, Clock } from "lucide-react";
import { useWatchHistory } from "@/hooks/use-watch-history";
import { useAuth } from "@/hooks/use-auth";

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

export const ContinueWatching = () => {
  const { items, removeItem } = useWatchHistory();
  const { user } = useAuth();

  if (!user || !items.length) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-white">Tiếp tục xem</h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {items.slice(0, 10).map((item) => {
          const progress =
            item.duration > 0
              ? Math.min((item.currentTime / item.duration) * 100, 100)
              : 0;

          return (
            <div
              key={`${item.movieSlug}-${item.episodeSlug}`}
              className="movie-card shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.33%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(16.66%-14px)] group relative"
            >
              {/* Remove button */}
              <button
                onClick={() => removeItem(item.movieSlug)}
                className="absolute -top-1.5 -right-1.5 z-20 w-6 h-6 rounded-full bg-black/80 border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
              >
                <X className="w-3 h-3 text-white" />
              </button>

              <Link
                href={`/xem/${item.movieSlug}?tap=${item.episodeSlug}`}
                className="block"
              >
                {/* Poster — same aspect ratio as MovieCard */}
                <div className="aspect-2/3 rounded-lg overflow-hidden relative shadow-lg bg-[#1A1A1A]">
                  {item.posterUrl && (
                    <Image
                      src={item.posterUrl}
                      alt={item.movieName}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      className="object-cover"
                      unoptimized
                    />
                  )}

                  {/* Time badge — top right */}
                  <span className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/10 font-mono">
                    {formatTime(item.currentTime)} / {formatTime(item.duration)}
                  </span>

                  {/* Play overlay on hover */}
                  <div className="card-overlay absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white drop-shadow-lg fill-white" />
                  </div>

                  {/* Progress bar at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Info — matches MovieCard layout */}
                <div className="mt-2">
                  <h3 className="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">
                    {item.movieName}
                  </h3>
                  <p className="text-xs text-[#A3A3A3] truncate mt-0.5">
                    Tập {item.episodeName}
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
