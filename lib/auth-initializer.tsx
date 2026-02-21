"use client";

import { useSetAtom } from "jotai";
import { useEffect, useRef, useCallback } from "react";
import { authLoadingAtom } from "@/jotais/auth";
import { refreshSession, REFRESH_TOKEN_KEY } from "@/lib/refresh-session";

const ACCESS_TOKEN_REFRESH_BUFFER = 60 * 1000; // 1 minute before expiry
const ACCESS_TOKEN_LIFETIME = 15 * 60 * 1000; // 15 minutes

export const AuthInitializer = () => {
  // const setAccessToken = useSetAtom(accessTokenAtom);
  const setLoading = useSetAtom(authLoadingAtom);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastRefreshRef = useRef<number>(0);

  const doRefresh = useCallback(async (): Promise<boolean> => {
    const newToken = await refreshSession();
    if (newToken) {
      lastRefreshRef.current = Date.now();
      return true;
    }
    return false;
  }, []);

  const scheduleRefreshRef = useRef<() => void>(() => {});

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

    refreshTimerRef.current = setTimeout(async () => {
      const success = await doRefresh();
      if (success) scheduleRefreshRef.current();
    }, ACCESS_TOKEN_LIFETIME - ACCESS_TOKEN_REFRESH_BUFFER);
  }, [doRefresh]);

  // Keep ref in sync
  useEffect(() => {
    scheduleRefreshRef.current = scheduleRefresh;
  }, [scheduleRefresh]);

  // Handle tab visibility change — refresh token when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== "visible") return;

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) return;

      // Check if enough time has passed that the access token might be expired
      const elapsed = Date.now() - lastRefreshRef.current;
      if (elapsed >= ACCESS_TOKEN_LIFETIME - ACCESS_TOKEN_REFRESH_BUFFER) {
        const success = await doRefresh();
        if (success) scheduleRefresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [doRefresh, scheduleRefresh]);

  // Initial auth on mount
  useEffect(() => {
    const init = async () => {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        setLoading(false);
        return;
      }

      const success = await doRefresh();
      if (success) {
        scheduleRefresh();
      } else {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
      setLoading(false);
    };

    init();
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [doRefresh, scheduleRefresh, setLoading]);

  return null;
};
