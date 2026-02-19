"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MovieGrid } from "@/components/movie/movie-grid";
import { MovieFilter } from "@/components/movie/movie-filter";
import { useSearchMovies } from "@/hooks/use-movies";
import { useRagSearch } from "@/hooks/use-rag-search";
import { Search, Loader2, Sparkles } from "lucide-react";
import { Switch, Chip } from "@heroui/react";
import type { MovieListParams } from "@/types/api";

const SearchResults = () => {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<MovieListParams>({
    sort_field: "year",
    sort_type: "desc",
  });
  const [ragEnabled, setRagEnabled] = useState(false);

  // Normal search
  const normalSearch = useSearchMovies(keyword, page, filters);
  // RAG-enhanced search
  const ragSearch = useRagSearch(keyword, "search", page, filters, ragEnabled);

  // Choose which result to display
  const activeSearch = ragEnabled ? ragSearch : normalSearch;
  const data = ragEnabled ? ragSearch.data : normalSearch.data;
  const isLoading = activeSearch.isLoading;

  const handleFilterChange = (newFilters: MovieListParams) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="min-h-screen px-4 md:px-10 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Search className="w-8 h-8 text-primary" />
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          Tìm kiếm: <span className="text-primary">{keyword}</span>
        </h1>
      </div>

      {/* RAG toggle + status */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Switch
            size="sm"
            isSelected={ragEnabled}
            onValueChange={setRagEnabled}
            classNames={{
              wrapper: "group-data-[selected=true]:bg-primary",
            }}
          />
          <span className="text-sm text-gray-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Tìm kiếm thông minh (AI)
          </span>
        </div>

        {ragEnabled && ragSearch.isLoading && (
          <span className="text-sm text-amber-400 flex items-center gap-1.5 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Đang phân tích câu hỏi...
          </span>
        )}
      </div>

      {/* AI-expanded keywords */}
      {ragEnabled && ragSearch.data && !ragSearch.data.isFallback && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-gray-500 uppercase tracking-wider">
            AI Keywords:
          </span>
          {ragSearch.data.ragKeywords.map((kw) => (
            <Chip
              key={kw}
              size="sm"
              variant="flat"
              color="warning"
              startContent={<Sparkles className="w-3 h-3" />}
            >
              {kw}
            </Chip>
          ))}
        </div>
      )}

      {/* AI suggestions */}
      {ragEnabled &&
        ragSearch.data?.suggestions &&
        ragSearch.data.suggestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-gray-500">Gợi ý:</span>
            {ragSearch.data.suggestions.map((s) => (
              <Chip
                key={s}
                size="sm"
                variant="bordered"
                className="text-gray-300 border-white/20 cursor-pointer hover:border-primary/50 transition-colors"
                as="a"
                href={`/tim-kiem?keyword=${encodeURIComponent(s)}`}
              >
                {s}
              </Chip>
            ))}
          </div>
        )}

      <p className="text-gray-400 mb-6">
        {data?.paginate?.totalItems
          ? `Tìm thấy ${data.items.length}${ragEnabled && !ragSearch.data?.isFallback ? " (AI-enhanced)" : ""} kết quả cho "${keyword}"`
          : isLoading
            ? "Đang tìm kiếm..."
            : `Không tìm thấy kết quả cho "${keyword}"`}
      </p>

      <MovieFilter filters={filters} onChange={handleFilterChange} />

      <MovieGrid
        movies={data?.items || []}
        paginate={data?.paginate}
        currentPage={page}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
};

const SearchFallback = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );
};

export const SearchPage = () => {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchResults />
    </Suspense>
  );
};
