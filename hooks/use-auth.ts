"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import {
  userAtom,
  accessTokenAtom,
  authLoadingAtom,
  type AuthUser,
} from "@/jotais/auth";

const REFRESH_TOKEN_KEY = "minycine_refresh_token";

export function useAuth() {
  const user = useAtomValue(userAtom);
  const accessToken = useAtomValue(accessTokenAtom);
  const isLoading = useAtomValue(authLoadingAtom);
  const setUser = useSetAtom(userAtom);
  const setAccessToken = useSetAtom(accessTokenAtom);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Đăng nhập thất bại");

      setAccessToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    },
    [setAccessToken, setUser],
  );

  const register = useCallback(
    async (email: string, name: string, password: string) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Đăng ký thất bại");

      setAccessToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    },
    [setAccessToken, setUser],
  );

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Ignore
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }, [setAccessToken, setUser]);

  return { user, accessToken, isLoading, login, register, logout };
}

export { REFRESH_TOKEN_KEY };
export type { AuthUser };
