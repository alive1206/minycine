"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  MovieListResponse,
  HomeResponse,
  TaxonomyListResponse,
  YearListResponse,
  MovieListParams,
  Movie,
  Paginate,
} from "@/types/api";

// ─── Normalized return shape for list hooks ───────────────────
export interface NormalizedMovieList {
  items: Movie[];
  paginate?: Paginate;
  titlePage?: string;
  cdnImageUrl?: string;
}

// ─── Helper: clean filter params ──────────────────────────────
function cleanParams(
  params: MovieListParams = {},
): Record<string, string | number> {
  const cleaned: Record<string, string | number> = {};
  if (params.page) cleaned.page = params.page;
  if (params.limit) cleaned.limit = params.limit;
  if (params.sort_field) cleaned.sort_field = params.sort_field;
  if (params.sort_type) cleaned.sort_type = params.sort_type;
  if (params.category) cleaned.category = params.category;
  if (params.country) cleaned.country = params.country;
  if (params.year) cleaned.year = params.year;
  return cleaned;
}

// ─── Helper: normalize list response ──────────────────────────
function normalizeList(res: MovieListResponse): NormalizedMovieList {
  const pagination = res.data.params?.pagination;

  // The API returns pageRanges instead of totalPages.
  // Compute totalPages from totalItems / totalItemsPerPage.
  const paginate: Paginate | undefined = pagination
    ? {
        ...pagination,
        totalPages:
          pagination.totalPages ??
          (pagination.totalItems && pagination.totalItemsPerPage
            ? Math.ceil(pagination.totalItems / pagination.totalItemsPerPage)
            : 1),
      }
    : undefined;

  return {
    items: res.data.items,
    paginate,
    titlePage: res.data.titlePage,
    cdnImageUrl: res.data.APP_DOMAIN_CDN_IMAGE,
  };
}

// ─── Home ─────────────────────────────────────────────────────
export function useHome() {
  return useQuery({
    queryKey: ["movies", "home"],
    queryFn: async () => {
      const { data } = await api.get<HomeResponse>(`/home`);
      return {
        items: data.data.items,
        cdnImageUrl: data.data.APP_DOMAIN_CDN_IMAGE,
      };
    },
  });
}

// ─── Latest movies ────────────────────────────────────────────
export function useLatestMovies(page: number = 1, filters?: MovieListParams) {
  return useQuery({
    queryKey: ["movies", "latest", page, filters],
    queryFn: async () => {
      const { data } = await api.get<MovieListResponse>(
        `/danh-sach/phim-moi-cap-nhat`,
        { params: { ...cleanParams(filters), page } },
      );
      return normalizeList(data);
    },
  });
}

// ─── Movies by category slug ──────────────────────────────────
export function useMoviesByCategory(
  slug: string,
  page: number = 1,
  filters?: MovieListParams,
) {
  return useQuery({
    queryKey: ["movies", "category", slug, page, filters],
    queryFn: async () => {
      const { data } = await api.get<MovieListResponse>(`/danh-sach/${slug}`, {
        params: { ...cleanParams(filters), page },
      });
      return normalizeList(data);
    },
    enabled: !!slug,
  });
}

// ─── Movies by genre ──────────────────────────────────────────
export function useMoviesByGenre(
  slug: string,
  page: number = 1,
  filters?: MovieListParams,
) {
  return useQuery({
    queryKey: ["movies", "genre", slug, page, filters],
    queryFn: async () => {
      const { data } = await api.get<MovieListResponse>(`/the-loai/${slug}`, {
        params: { ...cleanParams(filters), page },
      });
      return normalizeList(data);
    },
    enabled: !!slug,
  });
}

// ─── Movies by country ───────────────────────────────────────
export function useMoviesByCountry(
  slug: string,
  page: number = 1,
  filters?: MovieListParams,
) {
  return useQuery({
    queryKey: ["movies", "country", slug, page, filters],
    queryFn: async () => {
      const { data } = await api.get<MovieListResponse>(`/quoc-gia/${slug}`, {
        params: { ...cleanParams(filters), page },
      });
      return normalizeList(data);
    },
    enabled: !!slug,
  });
}

// ─── Movies by year ──────────────────────────────────────────
export function useMoviesByYear(
  year: string,
  page: number = 1,
  filters?: MovieListParams,
) {
  return useQuery({
    queryKey: ["movies", "year", year, page, filters],
    queryFn: async () => {
      const { data } = await api.get<MovieListResponse>(
        `/nam-phat-hanh/${year}`,
        { params: { ...cleanParams(filters), page } },
      );
      return normalizeList(data);
    },
    enabled: !!year,
  });
}

// ─── Search movies ───────────────────────────────────────────
export function useSearchMovies(
  keyword: string,
  page: number = 1,
  filters?: MovieListParams,
) {
  return useQuery({
    queryKey: ["movies", "search", keyword, page, filters],
    queryFn: async () => {
      const { data } = await api.get<MovieListResponse>(`/tim-kiem`, {
        params: { ...cleanParams(filters), keyword, page },
      });
      return normalizeList(data);
    },
    enabled: keyword.length >= 2,
  });
}

// ─── Taxonomy lists (for navbar / filters) ────────────────────
export function useGenreList() {
  return useQuery({
    queryKey: ["taxonomy", "genres"],
    queryFn: async () => {
      const { data } = await api.get<TaxonomyListResponse>(`/the-loai`);
      return data;
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useCountryList() {
  return useQuery({
    queryKey: ["taxonomy", "countries"],
    queryFn: async () => {
      const { data } = await api.get<TaxonomyListResponse>(`/quoc-gia`);
      return data;
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useYearList() {
  return useQuery({
    queryKey: ["taxonomy", "years"],
    queryFn: async () => {
      const { data } = await api.get<YearListResponse>(`/nam-phat-hanh`);
      return data;
    },
    staleTime: 1000 * 60 * 60,
  });
}
