"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  MovieDetailResponse,
  MovieDetail,
  EpisodeServer,
} from "@/types/api";

export interface NormalizedMovieDetail {
  movie: MovieDetail;
  episodes: EpisodeServer[];
  cdnImageUrl: string;
}

export function useMovieDetail(slug: string) {
  return useQuery({
    queryKey: ["movie", "detail", slug],
    queryFn: async () => {
      const { data } = await api.get<MovieDetailResponse>(`/phim/${slug}`);
      const item = data.data.item;
      return {
        movie: item,
        episodes: item.episodes || [],
        cdnImageUrl: data.data.APP_DOMAIN_CDN_IMAGE,
      } as NormalizedMovieDetail;
    },
    enabled: !!slug,
  });
}
