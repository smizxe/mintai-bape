import { NextRequest, NextResponse } from "next/server";
import { decodeSession, encodeSession, ROLE_COOKIE, SESSION_COOKIE } from "@/lib/session";
import { getUserProfileByEmail, updateUserDisplayName } from "@/lib/commerce-store";

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? decodeSession(token) : null;

  if (!session || session.role !== "user") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserProfileByEmail(session.email);
  if (!user) {
    return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 });
  }

  const body = await req.json();
  const updated = await updateUserDisplayName(session.email, String(body.displayName ?? ""));

  const response = NextResponse.json(updated);
  const maxAge = 60 * 60 * 24 * 7;

  response.cookies.set(
    SESSION_COOKIE,
    encodeSession({
      email: session.email,
      role: session.role,
      name: updated.displayName,
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      maxAge,
      path: "/",
    },
  );

  response.cookies.set(ROLE_COOKIE, session.role, {
    httpOnly: false,
    sameSite: "lax",
    maxAge,
    path: "/",
  });

  return response;
}
