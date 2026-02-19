import type { Metadata } from "next";
import { WatchPage } from "@/containers/watch";
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
        title: `Xem ${movie.name} — MinyCine`,
        description: `Đang xem ${movie.name} (${movie.origin_name}) online chất lượng cao tại MinyCine.`,
      };
    }
  } catch {
    // fallback
  }

  return {
    title: "Xem Phim — MinyCine",
    description: "Xem phim online chất lượng cao tại MinyCine.",
  };
}

export default WatchPage;
