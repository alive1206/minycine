"use client";

import { useSetAtom } from "jotai";
import { useEffect, useRef, useCallback } from "react";
import { userAtom, accessTokenAtom, authLoadingAtom } from "@/jotais/auth";

const REFRESH_TOKEN_KEY = "minycine_refresh_token";
const ACCESS_TOKEN_REFRESH_BUFFER = 60 * 1000;
const ACCESS_TOKEN_LIFETIME = 15 * 60 * 1000;

export const AuthInitializer = () => {
  const setUser = useSetAtom(userAtom);
  const setAccessToken = useSetAtom(accessTokenAtom);
  const setLoading = useSetAtom(authLoadingAtom);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

    refreshTimerRef.current = setTimeout(async () => {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) return;

      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (res.ok) {
          const data = await res.json();
          setAccessToken(data.accessToken);
          setUser(data.user);
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
          scheduleRefresh();
        } else {
          setAccessToken(null);
          setUser(null);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
      } catch {
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    }, ACCESS_TOKEN_LIFETIME - ACCESS_TOKEN_REFRESH_BUFFER);
  }, [setAccessToken, setUser]);

  useEffect(() => {
    const init = async () => {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (res.ok) {
          const data = await res.json();
          setAccessToken(data.accessToken);
          setUser(data.user);
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
          scheduleRefresh();
        } else {
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
      } catch {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    };

    init();
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [scheduleRefresh, setAccessToken, setUser, setLoading]);

  return null;
};
