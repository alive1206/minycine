"use client";

import { accessTokenAtom, userAtom } from "@/jotais/auth";
import { appStore } from "@/lib/store";

const REFRESH_TOKEN_KEY = "minycine_refresh_token";

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Attempt to refresh the access token using the stored refresh token.
 * Uses a singleton promise to prevent concurrent refresh requests.
 */
async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
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
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Auth-aware `fetch` wrapper. Automatically attaches the current access token
 * and retries once on 401 after refreshing the token.
 *
 * Usage:
 *   const res = await authFetch("/api/auth/update-profile", {
 *     method: "PUT",
 *     body: JSON.stringify({ name }),
 *   });
 */
export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const store = appStore;
  const token = store.get(accessTokenAtom);

  // Build headers with authorization
  const buildHeaders = (accessToken: string | null): HeadersInit => {
    const headers = new Headers(init?.headers);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    return headers;
  };

  // First attempt
  const response = await fetch(input, {
    ...init,
    headers: buildHeaders(token),
  });

  // If not 401, return as-is
  if (response.status !== 401) return response;

  // Attempt to refresh
  const newToken = await refreshAccessToken();
  if (!newToken) return response; // Refresh failed, return original 401

  // Retry with new token
  return fetch(input, {
    ...init,
    headers: buildHeaders(newToken),
  });
}
