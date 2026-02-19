import type { Metadata } from "next";
import { MovieDetailPage } from "@/containers/movie-detail";
import api from "@/lib/api";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const { data } = await api.get(`/phim/${slug}`);
    const movie = data?.data?.item;

    if (movie) {
      return {
        title: `${movie.name} (${movie.origin_name}) — MinyCine`,
        description:
          movie.content?.replace(/<[^>]+>/g, "").slice(0, 160) ||
          `Xem phim ${movie.name} online chất lượng cao tại MinyCine.`,
      };
    }
  } catch {
    // fallback
  }

  return {
    title: "Chi Tiết Phim — MinyCine",
    description: "Xem chi tiết phim tại MinyCine.",
  };
}

export default MovieDetailPage;
