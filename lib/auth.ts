import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// ─── Password Hashing (PBKDF2 via Web Crypto) ────────────────

const ITERATIONS = 100_000;
const KEY_LENGTH = 64;
const DIGEST = "SHA-512";

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: ITERATIONS,
      hash: DIGEST,
    },
    keyMaterial,
    KEY_LENGTH * 8,
  );

  return `${bufferToHex(salt.buffer as ArrayBuffer)}:${bufferToHex(derivedBits)}`;
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  const [saltHex, keyHex] = hash.split(":");
  const salt = hexToBuffer(saltHex);
  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: ITERATIONS,
      hash: DIGEST,
    },
    keyMaterial,
    KEY_LENGTH * 8,
  );

  const derivedHex = bufferToHex(derivedBits);
  return derivedHex === keyHex;
}

// ─── JWT ──────────────────────────────────────────────────────

export interface TokenPayload extends JWTPayload {
  userId: number;
  email: string;
}

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || "access-fallback-secret",
);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || "refresh-fallback-secret",
);

const ACCESS_EXPIRY = "15m";
const REFRESH_EXPIRY = "7d";

export async function signAccessToken(payload: {
  userId: number;
  email: string;
}): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_EXPIRY)
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(payload: {
  userId: number;
  email: string;
}): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_EXPIRY)
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(
  token: string,
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(
  token: string,
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

// ─── Cookie Helpers ───────────────────────────────────────────

export const REFRESH_COOKIE_NAME = "minycine_refresh_token";
export const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export function createRefreshCookieHeader(token: string): string {
  return `${REFRESH_COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${REFRESH_COOKIE_MAX_AGE}`;
}

export function clearRefreshCookieHeader(): string {
  return `${REFRESH_COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
}

// ─── Request Helpers ──────────────────────────────────────────

export function getAccessTokenFromHeader(request: Request): string | null {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

export function getRefreshTokenFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    },
    {} as Record<string, string>,
  );

  return cookies[REFRESH_COOKIE_NAME] || null;
}

// ─── User Sanitizer ──────────────────────────────────────────

export function sanitizeUser(user: {
  id: number;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };
}
