"use client";

import { accessTokenAtom } from "@/jotais/auth";
import { appStore } from "@/lib/store";
import { refreshSession } from "@/lib/refresh-session";

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

  // Attempt to refresh via shared singleton (deduplicates with auth-initializer)
  const newToken = await refreshSession();
  if (!newToken) return response; // Refresh failed, return original 401

  // Retry with new token
  return fetch(input, {
    ...init,
    headers: buildHeaders(newToken),
  });
}
