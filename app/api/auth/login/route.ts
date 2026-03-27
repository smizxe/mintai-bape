import { NextRequest, NextResponse } from "next/server";
import { validateCredentials, encodeSession, SESSION_COOKIE, ROLE_COOKIE } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email và mật khẩu không được để trống" }, { status: 400 });
  }

  const user = validateCredentials(email, password);

  if (!user) {
    return NextResponse.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 });
  }

  const response = NextResponse.json({ role: user.role, name: user.name });

  const maxAge = 60 * 60 * 24 * 7; // 7 days

  response.cookies.set(SESSION_COOKIE, encodeSession(user), {
    httpOnly: true,
    sameSite: "lax",
    maxAge,
    path: "/",
  });

  response.cookies.set(ROLE_COOKIE, user.role, {
    httpOnly: false,
    sameSite: "lax",
    maxAge,
    path: "/",
  });

  return response;
}
