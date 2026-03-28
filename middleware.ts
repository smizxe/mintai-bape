import { NextResponse, type NextRequest } from "next/server";
import { getSessionSecret, SESSION_COOKIE, type SessionUser } from "@/lib/session-shared";

function decodeBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  return atob(normalized + padding);
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function signPayload(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

async function decodeSessionFromCookie(token?: string): Promise<SessionUser | null> {
  if (!token) return null;

  try {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;

    const expected = await signPayload(payload);
    if (signature !== expected) return null;

    const parsed = JSON.parse(decodeBase64Url(payload));
    if (!parsed?.email || !parsed?.role) return null;

    return parsed as SessionUser;
  } catch {
    return null;
  }
}

function redirectToLogin(req: NextRequest) {
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", `${req.nextUrl.pathname}${req.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await decodeSessionFromCookie(token);
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    if (!session) {
      return redirectToLogin(req);
    }

    if (session.role !== "admin") {
      return NextResponse.redirect(new URL("/user", req.url));
    }
  }

  if (pathname.startsWith("/user")) {
    if (!session) {
      return redirectToLogin(req);
    }

    if (session.role === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  if (pathname.startsWith("/cart")) {
    if (!session) {
      return redirectToLogin(req);
    }

    if (session.role === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/cart/:path*"],
};
