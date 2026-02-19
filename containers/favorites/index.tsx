"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Card, CardBody } from "@heroui/react";
import {
  Heart,
  X,
  ArrowLeft,
  Film,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";

const ITEMS_PER_PAGE = 18;

const getImageUrl = (url: string): string => {
  if (!url) return "/placeholder-poster.jpg";
  if (url.startsWith("http")) return url;
  return `${process.env.NEXT_PUBLIC_IMG_URL}/${url}`;
};

export const FavoritesPage = () => {
  const { items, removeItem } = useFavorites();
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paged = items.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-10 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Button
          as={Link}
          href="/ho-so"
          isIconOnly
          variant="light"
          className="text-gray-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Heart className="w-6 h-6 text-red-500" />
        <h1 className="text-2xl font-bold text-white">
          Phim Yêu Thích ({items.length})
        </h1>
      </div>

      {items.length === 0 ? (
        <Card className="border border-white/10 bg-content1/80 backdrop-blur-xl">
          <CardBody className="flex flex-col items-center justify-center py-20 gap-4">
            <Film className="w-16 h-16 text-gray-600" />
            <p className="text-gray-400 text-center">
              Bạn chưa thêm phim yêu thích nào.
            </p>
            <Button as={Link} href="/" color="primary" variant="flat">
              Khám phá phim
            </Button>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {paged.map((fav) => (
              <div key={fav.slug} className="movie-card group relative">
                <Link href={`/phim/${fav.slug}`} className="block">
                  <div className="aspect-2/3 rounded-lg overflow-hidden relative shadow-lg bg-[#1A1A1A]">
                    <Image
                      src={getImageUrl(fav.posterUrl || fav.thumbUrl)}
                      alt={fav.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      className="object-cover"
                      unoptimized
                    />
                    {fav.quality && (
                      <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase">
                        {fav.quality}
                      </span>
                    )}
                    {fav.episode_current && (
                      <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/10">
                        {fav.episode_current.toLowerCase().includes("undefined")
                          ? "? tập"
                          : fav.episode_current}
                      </span>
                    )}
                    <div className="card-overlay absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-primary/80 flex items-center justify-center">
                        <Heart className="w-6 h-6 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <h3 className="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">
                      {fav.name}
                    </h3>
                    <p className="text-xs text-[#A3A3A3] truncate mt-0.5">
                      {fav.origin_name} • {fav.year}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => removeItem(fav.slug)}
                  className="absolute -top-1.5 -right-1.5 z-20 w-6 h-6 rounded-full bg-black/80 border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
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
