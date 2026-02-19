import type { Metadata } from "next";
import { ActorDetailPage } from "@/containers/actor-detail";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { name } = await searchParams;

  if (name) {
    return {
      title: `${decodeURIComponent(name)} — Diễn Viên — MinyCine`,
      description: `Xem thông tin và phim của diễn viên ${decodeURIComponent(name)} tại MinyCine.`,
    };
  }

  return {
    title: "Diễn Viên — MinyCine",
    description: "Xem thông tin diễn viên tại MinyCine.",
  };
}

export default ActorDetailPage;
