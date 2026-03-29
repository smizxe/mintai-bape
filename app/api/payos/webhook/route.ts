import { NextRequest, NextResponse } from "next/server";
import { markOrderPaidByPaymentCode } from "@/lib/commerce-store";
import { sendOrderDeliveryEmailByPaymentCode } from "@/lib/order-delivery";
import { getPayOSClient } from "@/lib/payos";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const payOS = getPayOSClient();
    const verified = await payOS.webhooks.verify(payload);

    if (verified.code === "00") {
      await markOrderPaidByPaymentCode(String(verified.orderCode));
      try {
        await sendOrderDeliveryEmailByPaymentCode(String(verified.orderCode));
      } catch (error) {
        console.error("Failed to send delivery email", error);
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Webhook không hợp lệ." }, { status: 400 });
  }
}
