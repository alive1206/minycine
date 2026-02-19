"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Card, CardBody } from "@heroui/react";
import {
  Clock,
  X,
  Play,
  ArrowLeft,
  Film,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useWatchHistory } from "@/hooks/use-watch-history";

const ITEMS_PER_PAGE = 18;

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

export const WatchHistoryPage = () => {
  const { items, removeItem, clearAll } = useWatchHistory();
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paged = items.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-10 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button
            as={Link}
            href="/ho-so"
            isIconOnly
            variant="light"
            className="text-gray-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Clock className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-white">
            Xem Tiếp ({items.length})
          </h1>
        </div>
        {items.length > 0 && (
          <Button
            size="sm"
            variant="bordered"
            color="primary"
            onPress={clearAll}
            startContent={<Trash2 className="w-3 h-3" />}
          >
            Xóa tất cả
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Card className="border border-white/10 bg-content1/80 backdrop-blur-xl">
          <CardBody className="flex flex-col items-center justify-center py-20 gap-4">
            <Film className="w-16 h-16 text-gray-600" />
            <p className="text-gray-400 text-center">
              Chưa có phim nào đang xem dở.
            </p>
            <Button as={Link} href="/" color="primary" variant="flat">
              Khám phá phim
            </Button>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {paged.map((item) => {
              const progress =
                item.duration > 0
                  ? Math.min((item.currentTime / item.duration) * 100, 100)
                  : 0;

              return (
                <div
                  key={`${item.movieSlug}-${item.episodeSlug}`}
                  className="movie-card group relative"
                >
                  <Link
                    href={`/xem/${item.movieSlug}?tap=${item.episodeSlug}`}
                    className="block"
                  >
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
                      <span className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/10 font-mono">
                        {formatTime(item.currentTime)} /{" "}
                        {formatTime(item.duration)}
                      </span>
                      <div className="card-overlay absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white drop-shadow-lg fill-white" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">
                        {item.movieName}
                      </h3>
                      <p className="text-xs text-[#A3A3A3] truncate mt-0.5">
                        Tập {item.episodeName}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() => removeItem(item.movieSlug)}
                    className="absolute -top-1.5 -right-1.5 z-20 w-6 h-6 rounded-full bg-black/80 border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                isIconOnly
                size="sm"
                variant="bordered"
                className="border-white/10"
                isDisabled={page <= 1}
                onPress={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={p === page ? "solid" : "bordered"}
                  color={p === page ? "primary" : "default"}
                  className={p !== page ? "border-white/10" : ""}
                  onPress={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                isIconOnly
                size="sm"
                variant="bordered"
                className="border-white/10"
                isDisabled={page >= totalPages}
                onPress={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
