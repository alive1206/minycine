"use client";

import { Select, SelectItem, Skeleton } from "@heroui/react";
import { Filter } from "lucide-react";
import { useGenreList, useCountryList, useYearList } from "@/hooks/use-movies";
import type { MovieListParams } from "@/types/api";

interface MovieFilterProps {
  filters: MovieListParams;
  onChange: (filters: MovieListParams) => void;
  hideGenre?: boolean;
  hideCountry?: boolean;
  hideYear?: boolean;
}

const sortOptions = [
  { label: "Mới cập nhật", value: "modified.time:desc" },
  { label: "Năm sản xuất", value: "year:desc" },
  { label: "Tên A-Z", value: "_id:asc" },
];

export function MovieFilter({
  filters,
  onChange,
  hideGenre = false,
  hideCountry = false,
  hideYear = false,
}: MovieFilterProps) {
  const { data: genreData, isLoading: loadingGenres } = useGenreList();
  const { data: countryData, isLoading: loadingCountries } = useCountryList();
  const { data: yearData, isLoading: loadingYears } = useYearList();

  const genres = genreData?.data?.items || [];
  const countries = countryData?.data?.items || [];
  const years = (yearData?.data?.items || []).map((item) => ({
    name: `${item.year}`,
    slug: `${item.year}`,
  }));

  const handleChange = (key: string, value: string) => {
    if (key === "sort") {
      if (!value) {
        const cleaned = { ...filters };
        delete (cleaned as Record<string, unknown>).sort_field;
        delete (cleaned as Record<string, unknown>).sort_type;
        onChange(cleaned);
      } else {
        const [sort_field, sort_type] = value.split(":");
        onChange({ ...filters, sort_field, sort_type });
      }
    } else {
      if (!value) {
        const newFilters = { ...filters };
        delete (newFilters as Record<string, unknown>)[key];
        onChange(newFilters);
      } else {
        onChange({ ...filters, [key]: value });
      }
    }
  };

  const currentSort =
    filters.sort_field && filters.sort_type
      ? `${filters.sort_field}:${filters.sort_type}`
      : "";

  const selectClassNames = {
    trigger:
      "bg-[#1A1A1A] border border-white/10 data-[hover=true]:bg-white/5 min-h-10 h-10",
    value: "text-white text-sm",
    label: "text-gray-400 text-xs",
    popoverContent: "bg-[#1A1A1A] border border-white/10",
    listbox: "text-gray-300",
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-[#111111] rounded-xl border border-white/5">
      <div className="flex items-center gap-2 text-gray-400 mr-2">
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">Lọc phim</span>
      </div>

      {/* Genre filter */}
      {!hideGenre &&
        (loadingGenres ? (
          <Skeleton className="rounded-lg">
            <div className="h-10 w-36" />
          </Skeleton>
        ) : (
          <Select
            aria-label="Thể loại"
            placeholder="Thể loại"
            className="w-36"
            size="sm"
            classNames={selectClassNames}
            selectedKeys={filters.category ? [filters.category] : []}
            onChange={(e) => handleChange("category", e.target.value)}
          >
            {genres.map((genre) => (
              <SelectItem
                key={genre.slug}
                classNames={{
                  base: "text-gray-300 data-[hover=true]:text-white data-[hover=true]:bg-white/5",
                }}
              >
                {genre.name}
              </SelectItem>
            ))}
          </Select>
        ))}

      {/* Country filter */}
      {!hideCountry &&
        (loadingCountries ? (
          <Skeleton className="rounded-lg">
            <div className="h-10 w-36" />
          </Skeleton>
        ) : (
          <Select
            aria-label="Quốc gia"
            placeholder="Quốc gia"
            className="w-36"
            size="sm"
            classNames={selectClassNames}
            selectedKeys={filters.country ? [filters.country] : []}
            onChange={(e) => handleChange("country", e.target.value)}
          >
            {countries.map((country) => (
              <SelectItem
                key={country.slug}
                classNames={{
                  base: "text-gray-300 data-[hover=true]:text-white data-[hover=true]:bg-white/5",
                }}
              >
                {country.name}
              </SelectItem>
            ))}
          </Select>
        ))}

      {/* Year filter */}
      {!hideYear &&
        (loadingYears ? (
          <Skeleton className="rounded-lg">
            <div className="h-10 w-32" />
          </Skeleton>
        ) : (
          <Select
            aria-label="Năm"
            placeholder="Năm"
            className="w-32"
            size="sm"
            classNames={selectClassNames}
            selectedKeys={filters.year ? [`${filters.year}`] : []}
            onChange={(e) => handleChange("year", e.target.value)}
          >
            {years.map((year) => (
              <SelectItem
                key={year.slug}
                classNames={{
                  base: "text-gray-300 data-[hover=true]:text-white data-[hover=true]:bg-white/5",
                }}
              >
                {year.name}
              </SelectItem>
            ))}
          </Select>
        ))}

      {/* Sort */}
      <Select
        aria-label="Sắp xếp"
        placeholder="Sắp xếp"
        className="w-40"
        size="sm"
        classNames={selectClassNames}
        selectedKeys={currentSort ? [currentSort] : []}
        onChange={(e) => handleChange("sort", e.target.value)}
      >
        {sortOptions.map((opt) => (
          <SelectItem
            key={opt.value}
            classNames={{
              base: "text-gray-300 data-[hover=true]:text-white data-[hover=true]:bg-white/5",
            }}
          >
            {opt.label}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}
