import type { Metadata } from "next";
import { GenrePage } from "@/containers/genre";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `Thể Loại: ${name} — MinyCine`,
    description: `Xem phim thể loại ${name} online chất lượng cao tại MinyCine.`,
  };
}

export default GenrePage;
