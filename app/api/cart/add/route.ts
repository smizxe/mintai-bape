import { NextRequest, NextResponse } from "next/server";
import { addProductToCart, getUserProfileByEmail } from "@/lib/commerce-store";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? decodeSession(token) : null;

  if (!session || session.role !== "user") {
    return NextResponse.json({ error: "Bạn cần đăng nhập để thêm vào giỏ hàng." }, { status: 401 });
  }

  const body = await req.json();
  if (!body?.productId) {
    return NextResponse.json({ error: "Thiếu sản phẩm cần thêm." }, { status: 400 });
  }

  const user = await getUserProfileByEmail(session.email);
  if (!user) {
    return NextResponse.json({ error: "Không tìm thấy tài khoản." }, { status: 404 });
  }

  try {
    const cart = await addProductToCart(user.id, String(body.productId));
    return NextResponse.json({ ok: true, cart });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Chưa thể thêm acc vào giỏ hàng." },
      { status: 400 },
    );
  }
}
