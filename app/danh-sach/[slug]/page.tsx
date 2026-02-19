import type { Metadata } from "next";
import { CategoryPage } from "@/containers/category";

type Props = {
  params: Promise<{ slug: string }>;
};

const categoryNames: Record<string, string> = {
  "phim-le": "Phim Lẻ",
  "phim-bo": "Phim Bộ",
  "tv-shows": "TV Shows",
  "hoat-hinh": "Hoạt Hình",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name =
    categoryNames[slug] ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `${name} — MinyCine`,
    description: `Xem ${name} online chất lượng cao tại MinyCine.`,
  };
}

export default CategoryPage;
