"use client";

import { accessTokenAtom, userAtom } from "@/jotais/auth";
import { appStore } from "@/lib/store";

const REFRESH_TOKEN_KEY = "minycine_refresh_token";

let refreshPromise: Promise<string | null> | null = null;

/**
 * Singleton session refresh. Guarantees only ONE /api/auth/refresh request
 * is in flight at any time. Both `auth-fetch` and `auth-initializer` must
 * funnel through this function.
 *
 * Returns the new access token on success, or null on failure.
 */
export async function refreshSession(): Promise<string | null> {
  // If a refresh is already in progress, piggyback on it
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;

    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        // Refresh failed — clear auth state
        const store = appStore;
        store.set(accessTokenAtom, null);
        store.set(userAtom, null);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        return null;
      }

      const data = await res.json();
      const store = appStore;
      store.set(accessTokenAtom, data.accessToken);
      store.set(userAtom, data.user);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      return data.accessToken as string;
    } catch {
      const store = appStore;
      store.set(accessTokenAtom, null);
      store.set(userAtom, null);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export { REFRESH_TOKEN_KEY };
