"use client";

import { useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button, Chip, Skeleton, Divider, addToast } from "@heroui/react";
import {
  Play,
  ArrowLeft,
  Calendar,
  Clock,
  Globe,
  Film,
  User,
  Sparkles,
  Heart,
} from "lucide-react";
import { useMovieDetail } from "@/hooks/use-movie-detail";
import { useMoviePeoples } from "@/hooks/use-movie-peoples";
import { useMovieImages } from "@/hooks/use-movie-images";
import { useMoviesByGenre } from "@/hooks/use-movies";
import { useFavorites } from "@/hooks/use-favorites";
import { useWatchHistory } from "@/hooks/use-watch-history";
import { useAuth } from "@/hooks/use-auth";
import { MovieCarousel } from "@/components/movie/movie-carousel";

const getImageUrl = (url: string | undefined): string => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${process.env.NEXT_PUBLIC_IMG_URL}/${url}`;
};

const DetailSkeleton = () => {
  return (
    <div className="min-h-screen">
      <div className="relative h-[50vh]">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-10 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="rounded-xl">
            <div className="w-50 h-72.5" />
          </Skeleton>
          <div className="flex-1 space-y-4">
            <Skeleton className="rounded-lg">
              <div className="h-10 w-3/4" />
            </Skeleton>
            <Skeleton className="rounded-lg">
              <div className="h-6 w-1/2" />
            </Skeleton>
            <Skeleton className="rounded-lg">
              <div className="h-20 w-full" />
            </Skeleton>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MovieDetailPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const { data, isLoading } = useMovieDetail(slug);
  const { data: peoplesData } = useMoviePeoples(slug);
  const { data: tmdbImages } = useMovieImages(slug);
  const { toggle, isFavorite } = useFavorites();
  const { items: watchHistory } = useWatchHistory();
  const { user } = useAuth();
  const isFav = isFavorite(slug);

  // Check if movie has saved watch progress (only for logged-in users)
  const resumeEntry = useMemo(
    () => (user ? watchHistory.find((h) => h.movieSlug === slug) : undefined),
    [user, watchHistory, slug],
  );

  const TMDB_CDN =
    process.env.NEXT_PUBLIC_TMDB_IMAGE_URL || "https://image.tmdb.org/t/p";

  const movie = data?.movie;
  const firstGenreSlug = movie?.category?.[0]?.slug || "";

  const { data: similarMovies, isLoading: loadingSimilar } = useMoviesByGenre(
    firstGenreSlug,
    1,
  );

  // Filter out the current movie from similar movies
  const filteredSimilar = useMemo(
    () => similarMovies?.items?.filter((m) => m.slug !== slug) || [],
    [similarMovies, slug],
  );

  // Check if movie has valid playable episodes
  const hasValidEpisodes = useMemo(() => {
    if (!data?.episodes) return false;
    return data.episodes.some((server) =>
      server.server_data.some((ep) => ep.slug || ep.link_m3u8 || ep.link_embed),
    );
  }, [data]);

  const handleWatch = useCallback(() => {
    if (!hasValidEpisodes) {
      addToast({
        title: "Phim chưa có tập để xem",
        description:
          "Phim này chưa cập nhật nguồn phát, vui lòng quay lại sau.",
        color: "warning",
        timeout: 3000,
      });
    }
  }, [hasValidEpisodes]);

  if (isLoading) return <DetailSkeleton />;

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Không tìm thấy phim
          </h1>
          <Button
            as={Link}
            href="/"
            color="primary"
            startContent={<ArrowLeft className="w-4 h-4" />}
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  const posterUrl = getImageUrl(movie.poster_url);
  const thumbUrl = getImageUrl(movie.thumb_url);

  // Peoples data
  const peoples = peoplesData?.data?.peoples || [];
  const profileSizes = peoplesData?.data?.profile_sizes;

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="relative h-[50vh] overflow-hidden">
        {(tmdbImages?.backdropUrl || posterUrl) && (
          <Image
            src={tmdbImages?.backdropUrl || posterUrl}
            alt={movie.name}
            fill
            className="object-cover"
            unoptimized
            priority
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-[#0D0D0D] via-[#0D0D0D]/60 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-[#0D0D0D] via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="shrink-0">
            <div className="w-50 aspect-2/3 rounded-xl overflow-hidden shadow-2xl border-2 border-white/10 relative">
              <Image
                src={thumbUrl || posterUrl}
                alt={movie.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <Button
              as={Link}
              href="/"
              variant="light"
              className="text-gray-400 mb-4 -ml-3"
              startContent={<ArrowLeft className="w-4 h-4" />}
            >
              Trang chủ
            </Button>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
              {movie.name}
            </h1>
            <p className="text-lg text-gray-400 mb-4">{movie.origin_name}</p>

            {/* Meta badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.quality && (
                <Chip color="primary" size="sm" variant="flat">
                  {movie.quality}
                </Chip>
              )}
              {movie.lang && (
                <Chip color="default" size="sm" variant="flat">
                  {movie.lang}
                </Chip>
              )}
              {movie.episode_current && (
                <Chip color="warning" size="sm" variant="flat">
                  {movie.episode_current}
                </Chip>
              )}
            </div>

            {/* Meta details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-sm text-gray-300">
              {movie.year > 0 && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Năm: {movie.year}</span>
                </div>
              )}
              {movie.time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Thời lượng: {movie.time}</span>
                </div>
              )}
              {movie.country?.length > 0 && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  <span>
                    Quốc gia: {movie.country.map((c) => c.name).join(", ")}
                  </span>
                </div>
              )}
              {movie.episode_total && (
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-primary" />
                  <span>Tổng tập: {movie.episode_total}</span>
                </div>
              )}
            </div>

            {/* Categories */}
            {movie.category?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.category.map((cat) => (
                  <Chip
                    key={cat.slug}
                    as={Link}
                    href={`/the-loai/${cat.slug}`}
                    variant="bordered"
                    size="sm"
                    className="cursor-pointer hover:bg-white/10 transition-colors border-white/20 text-gray-300"
                  >
                    {cat.name}
                  </Chip>
                ))}
              </div>
            )}

            {/* Director & Actors text */}
            {movie.director?.length > 0 && movie.director[0] && (
              <p className="text-sm text-gray-400 mb-1">
                <span className="text-gray-300 font-medium">Đạo diễn:</span>{" "}
                {movie.director.join(", ")}
              </p>
            )}
            {movie.actor?.length > 0 && movie.actor[0] && (
              <div className="text-sm text-gray-400 mb-4 max-h-[2.8em] overflow-y-auto thin-scrollbar">
                <p>
                  <span className="text-gray-300 font-medium">Diễn viên:</span>{" "}
                  {movie.actor.join(", ")}
                </p>
              </div>
            )}

            {/* Watch + Favorite buttons */}
            <div className="flex items-center gap-3 mt-2">
              <Button
                {...(hasValidEpisodes
                  ? {
                      as: Link,
                      href: resumeEntry
                        ? `/xem/${movie.slug}?tap=${resumeEntry.episodeSlug}`
                        : `/xem/${movie.slug}`,
                    }
                  : { onPress: handleWatch })}
                color="primary"
                size="lg"
                className="font-bold shadow-lg shadow-red-900/20 hover:scale-105 transition-transform"
                startContent={<Play className="w-5 h-5 fill-white" />}
              >
                {resumeEntry ? "Xem Tiếp" : "Xem Phim"}
              </Button>

              <Button
                isIconOnly
                size="lg"
                variant="bordered"
                className={`border-white/20 hover:border-primary transition-colors ${
                  isFav ? "text-red-500 border-red-500/50" : "text-gray-400"
                }`}
                onPress={() => {
                  if (!user) {
                    addToast({
                      title: "Cần đăng nhập",
                      description:
                        "Vui lòng đăng nhập để sử dụng tính năng yêu thích.",
                      color: "warning",
                      timeout: 3000,
                    });
                    return;
                  }
                  toggle(movie);
                }}
              >
                <Heart className={`w-5 h-5 ${isFav ? "fill-red-500" : ""}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Synopsis */}
        {movie.content && (
          <>
            <Divider className="my-8 bg-white/10" />
            <div className="max-w-4xl">
              <h2 className="text-xl font-bold text-white mb-3">
                Nội dung phim
              </h2>
              <div
                className="text-gray-300 leading-relaxed text-sm"
                dangerouslySetInnerHTML={{ __html: movie.content }}
              />
            </div>
          </>
        )}

        {/* Cast & Crew (from peoples API) */}
        {peoples.length > 0 && (
          <>
            <Divider className="my-8 bg-white/10" />
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Diễn viên / Đoàn phim
              </h2>
              <div className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar pb-2">
                {peoples.map((person) => {
                  const profileUrl = person.profile_path
                    ? `${profileSizes?.w185 || `${TMDB_CDN}/w185`}${person.profile_path}`
                    : null;

                  const actorHref = `/dien-vien/${person.tmdb_people_id}?name=${encodeURIComponent(person.name)}&original_name=${encodeURIComponent(person.original_name || "")}&profile=${encodeURIComponent(person.profile_path || "")}&character=${encodeURIComponent(person.character || "")}&department=${encodeURIComponent(person.known_for_department || "")}&gender=${person.gender}`;

                  return (
                    <Link
                      key={person.tmdb_people_id}
                      href={actorHref}
                      className="group text-center cursor-pointer shrink-0 w-24 md:w-28"
                    >
                      <div className="aspect-2/3 rounded-lg overflow-hidden bg-[#1A1A1A] relative mb-2 shadow-md ring-0 ring-primary/0 group-hover:ring-2 group-hover:ring-primary/50 transition-all duration-300">
                        {profileUrl ? (
                          <Image
                            src={profileUrl}
                            alt={person.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#1A1A1A]">
                            <User className="w-8 h-8 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium text-white truncate group-hover:text-primary transition-colors">
                        {person.name}
                      </p>
                      {person.character && (
                        <p className="text-[10px] text-gray-500 truncate">
                          {person.character}
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Trailer */}
        {movie.trailer_url && (
          <>
            <Divider className="my-8 bg-white/10" />
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Trailer</h2>
              <div className="aspect-video max-w-2xl rounded-xl overflow-hidden">
                <iframe
                  src={movie.trailer_url.replace("watch?v=", "embed/")}
                  title="Trailer"
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            </div>
          </>
        )}

        {/* Episodes (if series) */}
        {(() => {
          const validEpisodes = data?.episodes
            ?.map((server) => ({
              ...server,
              server_data: server.server_data.filter(
                (ep) => ep.slug || ep.link_m3u8 || ep.link_embed,
              ),
            }))
            .filter((server) => server.server_data.length > 0);

          return validEpisodes && validEpisodes.length > 0 ? (
            <>
              <Divider className="my-8 bg-white/10" />
              <div>
                <h2 className="text-xl font-bold text-white mb-4">
                  Danh sách tập
                </h2>
                {validEpisodes.map((server) => (
                  <div key={server.server_name} className="mb-6">
                    <p className="text-sm text-gray-400 mb-3 font-medium">
                      {server.server_name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {server.server_data.map((ep) => (
                        <Button
                          key={ep.slug}
                          as={Link}
                          href={`/xem/${movie.slug}?tap=${ep.slug}`}
                          size="sm"
                          variant="flat"
                          className="bg-[#1A1A1A] text-white hover:bg-primary/20 border border-white/10 min-w-14"
                        >
                          {ep.name || ep.slug}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null;
        })()}

        {/* Similar movies */}
        {filteredSimilar.length > 0 && (
          <>
            <Divider className="my-8 bg-white/10" />
            <MovieCarousel
              title="Phim Tương Tự"
              icon={<Sparkles className="w-6 h-6" />}
              movies={filteredSimilar}
              href={`/the-loai/${firstGenreSlug}`}
              isLoading={loadingSimilar}
            />
          </>
        )}

        <div className="h-16" />
      </div>
    </div>
  );
};
