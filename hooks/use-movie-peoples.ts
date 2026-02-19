"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { PeoplesResponse } from "@/types/api";

export function useMoviePeoples(slug: string) {
  return useQuery({
    queryKey: ["movie", "peoples", slug],
    queryFn: async () => {
      const { data } = await api.get<PeoplesResponse>(`/phim/${slug}/peoples`);
      return data;
    },
    enabled: !!slug,
  });
}
