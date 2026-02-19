import { atom } from "jotai";

// ─── Types ────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: string;
}

// ─── Atoms ────────────────────────────────────────────────────

export const userAtom = atom<AuthUser | null>(null);
export const accessTokenAtom = atom<string | null>(null);
export const authLoadingAtom = atom(true);
