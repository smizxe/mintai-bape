import { NextRequest, NextResponse } from "next/server";
import {
  attachPaymentLinkToOrder,
  cancelOrderById,
  createPendingOrderFromCart,
  getCartByUserId,
  getUserProfileByEmail,
} from "@/lib/commerce-store";
import {
  buildAbsoluteUrl,
  buildPayOSDescription,
  buildPayOSOrderCode,
  getPayOSClient,
  getPayOSErrorMessage,
} from "@/lib/payos";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";
import { shouldUseZaloCheckout, ZALO_CONTACT_URL } from "@/lib/shop-config";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? decodeSession(token) : null;

  if (!session || session.role !== "user") {
    return NextResponse.json({ error: "Bạn cần đăng nhập để thanh toán." }, { status: 401 });
  }

  const user = await getUserProfileByEmail(session.email);
  if (!user) {
    return NextResponse.json({ error: "Không tìm thấy tài khoản." }, { status: 404 });
  }

  const cart = await getCartByUserId(user.id);
  if (cart.items.length === 0) {
    return NextResponse.json({ error: "Giỏ hàng của bạn đang trống." }, { status: 400 });
  }

  if (cart.items.some((item) => shouldUseZaloCheckout(item.paymentMode))) {
    return NextResponse.json({
      ok: true,
      mode: "zalo",
      externalUrl: ZALO_CONTACT_URL,
    });
  }

  let payOS;
  try {
    payOS = getPayOSClient();
  } catch (error) {
    return NextResponse.json({ error: getPayOSErrorMessage(error) }, { status: 500 });
  }

  const orderCode = buildPayOSOrderCode();
  let pendingOrder;

  try {
    pendingOrder = await createPendingOrderFromCart({
      userId: user.id,
      orderCode,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Chưa thể tạo đơn thanh toán." },
      { status: 400 },
    );
  }

  if (!pendingOrder) {
    return NextResponse.json({ error: "Chưa thể tạo đơn thanh toán." }, { status: 400 });
  }

  try {
    const origin = req.nextUrl.origin;
    const returnUrl = buildAbsoluteUrl(origin, "/checkout/result");
    const cancelUrl = buildAbsoluteUrl(origin, "/checkout/result");

    const paymentLink = await payOS.paymentRequests.create({
      orderCode,
      amount: cart.subtotalValue,
      description: buildPayOSDescription(orderCode),
      returnUrl,
      cancelUrl,
      buyerEmail: user.email,
      buyerName: user.displayName,
      items: cart.items.map((item) => ({
        name: item.title.slice(0, 25),
        quantity: 1,
        price: item.priceValue,
      })),
    });

    await attachPaymentLinkToOrder(pendingOrder.id, {
      checkoutUrl: paymentLink.checkoutUrl,
      paymentLinkId: paymentLink.paymentLinkId,
    });

    return NextResponse.json({
      ok: true,
      orderId: pendingOrder.id,
      checkoutUrl: paymentLink.checkoutUrl,
    });
  } catch (error) {
    await cancelOrderById(pendingOrder.id);
    return NextResponse.json({ error: getPayOSErrorMessage(error) }, { status: 500 });
  }
}
