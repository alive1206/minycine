"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Chip, Divider, Skeleton } from "@heroui/react";
import {
  ArrowLeft,
  User,
  Film,
  Search as SearchIcon,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useRagSearch } from "@/hooks/use-rag-search";
import { MovieCard } from "@/components/movie/movie-card";

const ActorContent = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const name = searchParams.get("name") || "Diễn viên";
  const originalName = searchParams.get("original_name") || "";
  const profilePath = searchParams.get("profile") || "";
  const character = searchParams.get("character") || "";
  const department = searchParams.get("department") || "";
  const gender = searchParams.get("gender") || "";

  const TMDB_CDN =
    process.env.NEXT_PUBLIC_TMDB_IMAGE_URL || "https://image.tmdb.org/t/p";

  // Build full profile image URL
  const profileUrl = profilePath
    ? profilePath.startsWith("http")
      ? profilePath
      : `${TMDB_CDN}/w500${profilePath}`
    : null;

  // RAG-enhanced search: AI suggests movie names for this actor
  const { data: ragResults, isLoading } = useRagSearch(name, "actor", 1);
  const movies = ragResults?.items || [];

  const genderLabel =
    gender === "1" ? "Nữ" : gender === "2" ? "Nam" : undefined;

  return (
    <div className="min-h-screen px-4 md:px-10 py-8 max-w-7xl mx-auto">
      <Button
        as={Link}
        href="/"
        variant="light"
        className="text-gray-400 mb-6 -ml-3"
        startContent={<ArrowLeft className="w-4 h-4" />}
      >
        Quay lại
      </Button>

      {/* Actor profile section */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        {/* Avatar */}
        <div className="shrink-0">
          <div className="w-48 aspect-2/3 rounded-xl overflow-hidden shadow-2xl border-2 border-white/10 relative bg-[#1A1A1A]">
            {profileUrl ? (
              <Image
                src={profileUrl}
                alt={name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-16 h-16 text-gray-600" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
            {name}
          </h1>
          {originalName && originalName !== name && (
            <p className="text-lg text-gray-400 mb-3">{originalName}</p>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {character && (
              <Chip color="primary" size="sm" variant="flat">
                Vai: {character}
              </Chip>
            )}
            {department && (
              <Chip color="default" size="sm" variant="flat">
                {department}
              </Chip>
            )}
            {genderLabel && (
              <Chip color="default" size="sm" variant="flat">
                {genderLabel}
              </Chip>
            )}
          </div>

          <p className="text-sm text-gray-400">TMDB ID: {id}</p>
        </div>
      </div>

      <Divider className="bg-white/10 mb-8" />

      {/* Filmography - RAG-enhanced search */}
      <div>
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Film className="w-5 h-5 text-primary" />
          Các phim liên quan đến &quot;{name}&quot;
        </h2>

        {/* AI keyword chips */}
        {ragResults && !ragResults.isFallback && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              AI gợi ý:
            </span>
            {ragResults.ragKeywords.slice(0, 8).map((kw) => (
              <Chip
                key={kw}
                size="sm"
                variant="flat"
                color="warning"
                className="text-xs"
              >
                {kw}
              </Chip>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 mb-6">
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
            <span className="text-sm text-amber-400 animate-pulse">
              Đang tìm phim bằng AI...
            </span>
          </div>
        )}

        {isLoading ? (
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
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <MovieCard key={movie.slug} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <SearchIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              Không tìm thấy phim liên quan đến &quot;{name}&quot;
            </p>
          </div>
        )}
      </div>

      <div className="h-16" />
    </div>
  );
};

const ActorFallback = () => {
  return (
    <div className="min-h-screen px-4 md:px-10 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <Skeleton className="rounded-xl">
          <div className="w-48 aspect-2/3" />
        </Skeleton>
        <div className="flex-1 space-y-4">
          <Skeleton className="rounded-lg">
            <div className="h-10 w-1/2" />
          </Skeleton>
          <Skeleton className="rounded-lg">
            <div className="h-6 w-1/3" />
          </Skeleton>
        </div>
      </div>
    </div>
  );
};

export const ActorDetailPage = () => {
  return (
    <Suspense fallback={<ActorFallback />}>
      <ActorContent />
    </Suspense>
  );
};
