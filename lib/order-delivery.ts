import {
  getDeliverableOrderByPaymentCode,
  lockOrderDeliveryEmail,
  markOrderDeliveryEmailSent,
  releaseOrderDeliveryEmailLock,
} from "@/lib/commerce-store";
import { getMailFrom, getMailTransport } from "@/lib/mailer";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildOrderItemsHtml(
  items: Array<{
    title: string;
    quantity: number;
    accountLoginEmail: string | null;
    accountLoginPassword: string | null;
  }>,
) {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px;border:1px solid #d9d2c3;font-weight:700;">${escapeHtml(item.title)}</td>
          <td style="padding:12px;border:1px solid #d9d2c3;">${item.quantity}</td>
          <td style="padding:12px;border:1px solid #d9d2c3;">${escapeHtml(item.accountLoginEmail ?? "")}</td>
          <td style="padding:12px;border:1px solid #d9d2c3;">${escapeHtml(item.accountLoginPassword ?? "")}</td>
        </tr>
      `,
    )
    .join("");
}

function buildOrderItemsText(
  items: Array<{
    title: string;
    quantity: number;
    accountLoginEmail: string | null;
    accountLoginPassword: string | null;
  }>,
) {
  return items
    .map(
      (item, index) =>
        `${index + 1}. ${item.title}\nSố lượng: ${item.quantity}\nEmail đăng nhập: ${item.accountLoginEmail ?? ""}\nMật khẩu: ${item.accountLoginPassword ?? ""}`,
    )
    .join("\n\n");
}

export async function sendOrderDeliveryEmailByPaymentCode(paymentOrderCode: string) {
  const order = await getDeliverableOrderByPaymentCode(paymentOrderCode);
  if (!order || order.deliveryEmailSentAt) {
    return;
  }

  const deliverableItems = order.items.filter((item) => item.accountLoginEmail && item.accountLoginPassword);
  if (deliverableItems.length === 0) {
    return;
  }

  const claimed = await lockOrderDeliveryEmail(order.id);
  if (!claimed) {
    return;
  }

  try {
    const transporter = getMailTransport();
    const customerName = order.customerName || "bạn";

    await transporter.sendMail({
      from: getMailFrom(),
      to: order.customerEmail,
      subject: "MinTai Bape | Thông tin acc của bạn",
      text: `Chào ${customerName},

Cảm ơn bạn đã mua acc tại MinTai Bape.
Đơn hàng của bạn đã được thanh toán thành công với tổng giá trị ${order.totalLabel}.

Thông tin tài khoản:
${buildOrderItemsText(deliverableItems)}

Nếu cần hỗ trợ thêm, bạn có thể nhắn shop ngay để được xử lý nhanh nhất.

MinTai Bape`,
      html: `
        <div style="font-family:Arial,sans-serif;background:#111111;padding:32px;color:#f7f1e3;">
          <div style="max-width:680px;margin:0 auto;background:#1a1a1a;border:4px solid #ef2b2d;box-shadow:8px 8px 0 #000;">
            <div style="padding:28px 28px 20px;border-bottom:1px solid rgba(255,255,255,.08);">
              <div style="display:inline-block;background:#ef2b2d;color:#fff;padding:8px 12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;">MinTai Bape</div>
              <h1 style="margin:18px 0 10px;font-size:30px;line-height:1.1;color:#fff;">Cảm ơn bạn đã mua hàng</h1>
              <p style="margin:0;color:#d8cfbf;font-size:16px;line-height:1.7;">
                Đơn hàng của bạn đã được thanh toán thành công. Shop gửi thông tin đăng nhập bên dưới để bạn vào game ngay.
              </p>
            </div>
            <div style="padding:24px 28px;">
              <div style="margin-bottom:18px;font-size:15px;color:#f7f1e3;">
                <strong>Tổng thanh toán:</strong> ${escapeHtml(order.totalLabel)}
              </div>
              <table style="width:100%;border-collapse:collapse;background:#fff;color:#111;">
                <thead>
                  <tr>
                    <th style="padding:12px;border:1px solid #d9d2c3;text-align:left;background:#f3ecdf;">Sản phẩm</th>
                    <th style="padding:12px;border:1px solid #d9d2c3;text-align:left;background:#f3ecdf;">SL</th>
                    <th style="padding:12px;border:1px solid #d9d2c3;text-align:left;background:#f3ecdf;">Email đăng nhập</th>
                    <th style="padding:12px;border:1px solid #d9d2c3;text-align:left;background:#f3ecdf;">Mật khẩu</th>
                  </tr>
                </thead>
                <tbody>
                  ${buildOrderItemsHtml(deliverableItems)}
                </tbody>
              </table>
              <p style="margin:18px 0 0;color:#d8cfbf;font-size:14px;line-height:1.7;">
                Nếu cần hỗ trợ đổi thông tin hoặc gặp vấn đề khi đăng nhập, hãy nhắn shop để được xử lý nhanh nhất.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    await markOrderDeliveryEmailSent(order.id);
  } catch (error) {
    await releaseOrderDeliveryEmailLock(order.id);
    throw error;
  }
}
