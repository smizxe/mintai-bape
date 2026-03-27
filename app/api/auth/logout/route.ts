import { NextResponse } from "next/server";
import { SESSION_COOKIE, ROLE_COOKIE } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(ROLE_COOKIE);
  return response;
}
