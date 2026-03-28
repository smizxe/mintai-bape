import { NextRequest, NextResponse } from "next/server";
import { getUserProfileByEmail, removeCartItem } from "@/lib/commerce-store";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? decodeSession(token) : null;

  if (!session || session.role !== "user") {
    return NextResponse.json({ error: "Bạn cần đăng nhập để chỉnh sửa giỏ hàng." }, { status: 401 });
  }

  const user = await getUserProfileByEmail(session.email);
  if (!user) {
    return NextResponse.json({ error: "Không tìm thấy tài khoản." }, { status: 404 });
  }

  const { id } = await params;
  const cart = await removeCartItem(user.id, id);
  return NextResponse.json({ ok: true, cart });
}
