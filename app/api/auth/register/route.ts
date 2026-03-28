import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { encodeSession, registerUser, ROLE_COOKIE, SESSION_COOKIE } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { displayName, email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email và mật khẩu không được để trống" }, { status: 400 });
  }

  if (String(password).length < 6) {
    return NextResponse.json({ error: "Mật khẩu phải có ít nhất 6 ký tự" }, { status: 400 });
  }

  try {
    const user = await registerUser({
      email: String(email),
      password: String(password),
      displayName: typeof displayName === "string" ? displayName : "",
    });

    const response = NextResponse.json({ role: user.role, name: user.name });
    const maxAge = 60 * 60 * 24 * 7;

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
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "Email này đã được đăng ký" }, { status: 409 });
    }

    return NextResponse.json({ error: "Không thể tạo tài khoản lúc này" }, { status: 500 });
  }
}
