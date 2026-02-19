"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ImagesResponse } from "@/types/api";

const TMDB_CDN =
  process.env.NEXT_PUBLIC_TMDB_IMAGE_URL || "https://image.tmdb.org/t/p";

export interface MovieImages {
  backdropUrl: string | null;
  posterUrl: string | null;
}

export function useMovieImages(slug: string) {
  return useQuery({
    queryKey: ["movie", "images", slug],
    queryFn: async (): Promise<MovieImages> => {
      const { data } = await api.get<ImagesResponse>(`/phim/${slug}/images`);
      const images = data.data.images || [];
      const sizes = data.data.image_sizes;

      // Find best backdrop (landscape)
      const backdrop = images.find((img) => img.type === "backdrop");
      const backdropBase =
        sizes?.backdrop?.w1280 ||
        sizes?.backdrop?.original ||
        `${TMDB_CDN}/w1280`;
      const backdropUrl = backdrop
        ? `${backdropBase}${backdrop.file_path}`
        : null;

      // Find best poster
      const poster = images.find((img) => img.type === "poster");
      const posterBase =
        sizes?.poster?.w780 || sizes?.poster?.original || `${TMDB_CDN}/w780`;
      const posterUrl = poster ? `${posterBase}${poster.file_path}` : null;

      return { backdropUrl, posterUrl };
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 30, // 30 min — images don't change often
  });
}
