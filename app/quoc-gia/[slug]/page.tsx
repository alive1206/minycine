import type { Metadata } from "next";
import { CountryPage } from "@/containers/country";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `Phim ${name} — MinyCine`,
    description: `Xem phim ${name} online chất lượng cao tại MinyCine.`,
  };
}

export default CountryPage;
