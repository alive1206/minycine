"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

/**
 * Syncs the current page number with the URL `?page=` query parameter.
 * Returns `[page, setPage]` — a drop-in replacement for `useState(1)`.
 *
 * - On initial load / reload, reads `?page=` from the URL (defaults to 1).
 * - `setPage(n)` updates the URL via `router.replace` (no full reload).
 * - Browser back/forward navigates between page states automatically.
 */
export function usePageParam(): [number, (page: number) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = useMemo(() => {
    const raw = searchParams.get("page");
    const parsed = raw ? parseInt(raw, 10) : 1;
    return isNaN(parsed) || parsed < 1 ? 1 : parsed;
  }, [searchParams]);

  const setPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newPage <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(newPage));
      }
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  return [page, setPage];
}
