import type { Metadata } from "next";
import { YearPage } from "@/containers/year";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `Phim Năm ${slug} — MinyCine`,
    description: `Xem phim phát hành năm ${slug} online chất lượng cao tại MinyCine.`,
  };
}

export default YearPage;
