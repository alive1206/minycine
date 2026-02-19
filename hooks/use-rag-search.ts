"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { MovieListResponse, MovieListParams, Movie } from "@/types/api";
import type { NormalizedMovieList } from "./use-movies";

// ─── Types ────────────────────────────────────────────────────

interface ExpandKeywordsResponse {
  keywords: string[];
  suggestions: string[];
  fallback: boolean;
  error?: string;
}

export interface RagSearchResult extends NormalizedMovieList {
  ragKeywords: string[];
  isFallback: boolean;
  suggestions: string[];
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

// ─── Step 1: Expand keywords via AI ───────────────────────────

async function expandKeywords(
  query: string,
  context: "search" | "actor",
): Promise<ExpandKeywordsResponse> {
  try {
    const res = await fetch("/api/ai/expand-keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, context }),
    });

    if (!res.ok) {
      return { keywords: [query], suggestions: [], fallback: true };
    }

    return res.json();
  } catch {
    return { keywords: [query], suggestions: [], fallback: true };
  }
}

// ─── Step 2: Search OPhim by keyword ──────────────────────────

async function searchOPhim(
  keyword: string,
  page: number,
  filters?: MovieListParams,
): Promise<{ movies: Movie[]; totalItems: number }> {
  try {
    const res = await api.get<MovieListResponse>(`/tim-kiem`, {
      params: { ...cleanParams(filters), keyword, page },
    });
    return {
      movies: res.data.data.items || [],
      totalItems: res.data.data.params?.pagination?.totalItems || 0,
    };
  } catch {
    return { movies: [], totalItems: 0 };
  }
}

// ─── Deduplicate movies by slug ───────────────────────────────

function deduplicateMovies(allMovies: Movie[]): Movie[] {
  const seen = new Set<string>();
  const unique: Movie[] = [];
  for (const movie of allMovies) {
    if (!seen.has(movie.slug)) {
      seen.add(movie.slug);
      unique.push(movie);
    }
  }
  return unique;
}

// ─── RAG Search Hook ─────────────────────────────────────────

export function useRagSearch(
  query: string,
  context: "search" | "actor",
  page: number = 1,
  filters?: MovieListParams,
  enabled: boolean = true,
) {
  return useQuery<RagSearchResult>({
    queryKey: ["rag-search", context, query, page, filters],
    queryFn: async () => {
      if (context === "actor") {
        return actorSearch(query, page, filters);
      }
      return generalSearch(query, page, filters);
    },
    enabled: enabled && query.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Actor search: direct name search FIRST, AI as supplement ─

async function actorSearch(
  actorName: string,
  page: number,
  filters?: MovieListParams,
): Promise<RagSearchResult> {
  // Run BOTH in parallel: direct name search + AI keyword expansion
  const [directResult, expanded] = await Promise.all([
    searchOPhim(actorName, page, filters),
    expandKeywords(actorName, "actor"),
  ]);

  // Direct results go first (most relevant — OPhim matches actor names in metadata)
  const allMovies = [...directResult.movies];
  let totalItems = directResult.totalItems;

  // If AI provided keywords, search those too (but only as supplement)
  if (!expanded.fallback && expanded.keywords.length > 0) {
    const aiResults = await Promise.allSettled(
      expanded.keywords.slice(0, 5).map((kw) => searchOPhim(kw, 1, filters)),
    );

    for (const result of aiResults) {
      if (result.status === "fulfilled") {
        allMovies.push(...result.value.movies);
        totalItems = Math.max(totalItems, result.value.totalItems);
      }
    }
  }

  const movies = deduplicateMovies(allMovies);

  return {
    items: movies,
    paginate: {
      totalItems: Math.max(totalItems, movies.length),
      totalItemsPerPage: 24,
      currentPage: page,
      totalPages: Math.ceil(totalItems / 24) || 1,
    },
    ragKeywords: expanded.fallback ? [actorName] : expanded.keywords,
    isFallback: expanded.fallback,
    suggestions: expanded.suggestions || [],
  };
}

// ─── General search: AI keywords + original query ─────────────

async function generalSearch(
  query: string,
  page: number,
  filters?: MovieListParams,
): Promise<RagSearchResult> {
  // Step 1: AI keyword expansion
  const expanded = await expandKeywords(query, "search");
  const keywords = expanded.keywords.length > 0 ? expanded.keywords : [query];

  // Always include original query too
  const allKeywords = [...new Set([query, ...keywords])];

  // Step 2: Search with all keywords in parallel
  const results = await Promise.allSettled(
    allKeywords.map((kw) => searchOPhim(kw, page, filters)),
  );

  const allMovies: Movie[] = [];
  let totalItems = 0;

  for (const result of results) {
    if (result.status === "fulfilled") {
      allMovies.push(...result.value.movies);
      totalItems = Math.max(totalItems, result.value.totalItems);
    }
  }

  const movies = deduplicateMovies(allMovies);

  return {
    items: movies,
    paginate: {
      totalItems,
      totalItemsPerPage: 24,
      currentPage: page,
      totalPages: Math.ceil(totalItems / 24) || 1,
    },
    ragKeywords: keywords,
    isFallback: expanded.fallback,
    suggestions: expanded.suggestions || [],
  };
}
