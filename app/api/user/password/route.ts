import { NextRequest, NextResponse } from "next/server";
import { changeUserPassword, getUserProfileByEmail } from "@/lib/commerce-store";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? decodeSession(token) : null;

  if (!session || session.role !== "user") {
    return NextResponse.json({ error: "Bạn cần đăng nhập để đổi mật khẩu." }, { status: 401 });
  }

  const user = await getUserProfileByEmail(session.email);
  if (!user) {
    return NextResponse.json({ error: "Không tìm thấy tài khoản." }, { status: 404 });
  }

  const body = await req.json();
  const oldPassword = String(body.oldPassword ?? "");
  const newPassword = String(body.newPassword ?? "");

  if (!oldPassword || !newPassword) {
    return NextResponse.json({ error: "Vui lòng nhập đủ mật khẩu hiện tại và mật khẩu mới." }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: "Mật khẩu mới cần có ít nhất 6 ký tự." }, { status: 400 });
  }

  const result = await changeUserPassword(session.email, oldPassword, newPassword);
  if (!result.ok) {
    return NextResponse.json({ error: "Mật khẩu hiện tại chưa đúng hoặc chưa thể cập nhật lúc này." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
