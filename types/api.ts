// ─── OPhim v1 API Types ───────────────────────────────────────
// Derived from actual JSON samples in docs/api/

// ─── Shared ───────────────────────────────────────────────────

export interface TmdbInfo {
  type: string;
  id: string;
  season: number | null;
  vote_average: number;
  vote_count: number;
}

export interface ImdbInfo {
  id: string;
  vote_average: number;
  vote_count: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export interface CountryItem {
  id: string;
  name: string;
  slug: string;
}

export interface SeoOnPage {
  og_type?: string;
  titleHead: string;
  descriptionHead: string;
  og_image?: string[];
  og_url?: string;
  updated_time?: number;
  seoSchema?: Record<string, unknown>;
}

export interface BreadCrumb {
  name: string;
  slug?: string;
  isCurrent?: boolean;
  position: number;
}

// ─── Movie List Item (from home, danh-sach, search, etc.) ─────

export interface Movie {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  alternative_names?: string[];
  type: string;
  thumb_url: string;
  poster_url?: string;
  sub_docquyen: boolean;
  chieurap: boolean;
  time: string;
  episode_current: string;
  quality: string;
  lang: string;
  lang_key?: string[];
  year: number;
  category: CategoryItem[];
  country: CountryItem[];
  tmdb?: TmdbInfo;
  imdb?: ImdbInfo;
  modified: { time: string };
  last_episodes?: {
    server_name: string;
    is_ai: boolean;
    name: string;
  }[];
}

// ─── Pagination ───────────────────────────────────────────────

export interface Paginate {
  totalItems: number;
  totalItemsPerPage: number;
  currentPage: number;
  totalPages: number;
  /** The API actually returns pageRanges, not totalPages */
  pageRanges?: number;
  // Alias for backwards compat with movie-grid
  total_page?: number;
}

// ─── Movie List Response ──────────────────────────────────────

export interface MovieListResponse {
  status: string;
  message: string;
  data: {
    seoOnPage: SeoOnPage;
    breadCrumb?: BreadCrumb[];
    titlePage?: string;
    items: Movie[];
    params: {
      type_slug?: string;
      slug?: string;
      pagination: Paginate;
    };
    APP_DOMAIN_CDN_IMAGE: string;
  };
}

// ─── Home Response ────────────────────────────────────────────

export interface HomeResponse {
  status: string;
  message: string;
  data: {
    seoOnPage: SeoOnPage;
    items: Movie[];
    APP_DOMAIN_CDN_IMAGE?: string;
  };
}

// ─── Taxonomy (Genre / Country) ───────────────────────────────

export interface TaxonomyItem {
  _id: string;
  name: string;
  slug: string;
}

export interface TaxonomyListResponse {
  status: string;
  message: string;
  data: {
    items: TaxonomyItem[];
  };
}

// ─── Year ─────────────────────────────────────────────────────

export interface YearItem {
  year: number;
}

export interface YearListResponse {
  status: string;
  message: string;
  data: {
    items: YearItem[];
  };
}

// ─── Episode ──────────────────────────────────────────────────

export interface EpisodeItem {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

export interface EpisodeServer {
  server_name: string;
  is_ai?: boolean;
  server_data: EpisodeItem[];
}

// ─── Movie Detail ─────────────────────────────────────────────

export interface MovieDetail {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  alternative_names?: string[];
  content: string;
  type: string;
  status: string;
  thumb_url: string;
  poster_url: string;
  is_copyright: boolean;
  sub_docquyen: boolean;
  chieurap: boolean;
  trailer_url: string;
  time: string;
  episode_current: string;
  episode_total: string;
  quality: string;
  lang: string;
  lang_key?: string[];
  notify: string;
  showtimes: string;
  year: number;
  view: number;
  actor: string[];
  director: string[];
  category: CategoryItem[];
  country: CountryItem[];
  tmdb?: TmdbInfo;
  imdb?: ImdbInfo;
  created: { time: string };
  modified: { time: string };
  episodes: EpisodeServer[];
}

export interface MovieDetailResponse {
  status: string;
  message: string;
  data: {
    seoOnPage: SeoOnPage;
    breadCrumb?: BreadCrumb[];
    params: { slug: string };
    item: MovieDetail;
    APP_DOMAIN_CDN_IMAGE: string;
  };
}

// ─── TMDB Peoples ─────────────────────────────────────────────

export interface PersonItem {
  tmdb_people_id: number;
  adult: boolean;
  gender: number;
  gender_name: string;
  name: string;
  original_name: string;
  character: string;
  known_for_department: string;
  profile_path: string;
  also_known_as: string[] | null;
}

export interface PeoplesResponse {
  success: boolean;
  message: string;
  status_code: number;
  data: {
    tmdb_id: number;
    tmdb_type: string;
    tmdb_season: number | null;
    ophim_id: string;
    slug: string;
    imdb_id: string;
    profile_sizes: Record<string, string>;
    peoples: PersonItem[];
  };
}

// ─── TMDB Images ──────────────────────────────────────────────

export interface ImageItem {
  width: number;
  height: number;
  aspect_ratio: number;
  type: string; // "backdrop" | "poster"
  file_path: string;
  iso_639_1?: string;
}

export interface ImagesResponse {
  success: boolean;
  message: string;
  status_code: number;
  data: {
    tmdb_id: number;
    tmdb_type: string;
    tmdb_season: number | null;
    ophim_id: string;
    slug: string;
    imdb_id: string;
    image_sizes: {
      backdrop: Record<string, string>;
      poster: Record<string, string>;
    };
    images: ImageItem[];
  };
}

// ─── Filter Params ────────────────────────────────────────────

export interface MovieListParams {
  page?: number;
  limit?: number;
  sort_field?: string; // "modified.time" | "year" | "_id"
  sort_type?: string; // "desc" | "asc"
  category?: string; // comma-separated slugs
  country?: string; // comma-separated slugs
  year?: number | string;
}
