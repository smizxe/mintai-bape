import Link from "next/link";
import { Menu } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import {
  getOrderByPaymentCode,
  markOrderCancelledByPaymentCode,
  markOrderPaidByPaymentCode,
} from "@/lib/commerce-store";
import { getOrderStatusLabel } from "@/lib/order-status";

export default async function CheckoutResultPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const orderCode = typeof params.orderCode === "string" ? params.orderCode : "";
  const status = typeof params.status === "string" ? params.status : "";
  const cancel = typeof params.cancel === "string" ? params.cancel : "";

  if (orderCode) {
    if (status === "PAID") {
      await markOrderPaidByPaymentCode(orderCode);
    } else if (cancel === "true" || status === "CANCELLED") {
      await markOrderCancelledByPaymentCode(orderCode);
    }
  }

  const order = orderCode ? await getOrderByPaymentCode(orderCode) : null;
  const isPaid = order?.status === "paid" || status === "PAID";
  const isCancelled = order?.status === "cancelled" || cancel === "true" || status === "CANCELLED";

  return (
    <>
      <SiteHeader mobileIcon={<Menu size={28} />} />

      <main className="dashboard-page">
        <section className="order-detail-shell">
          <section className="dashboard-table-card order-detail-card">
            <div className="dashboard-card-head">
              <h1>{isPaid ? "Thanh toán thành công" : isCancelled ? "Đơn hàng đã hủy" : "Đang chờ xác nhận"}</h1>
              <span>
                {isPaid
                  ? "PayOS đã ghi nhận thanh toán của bạn."
                  : isCancelled
                    ? "Bạn có thể quay lại giỏ hàng để chọn lại acc phù hợp."
                    : "Hệ thống đang đồng bộ trạng thái thanh toán của đơn hàng."}
              </span>
            </div>

            {order ? (
              <div className="order-detail-topline">
              <div>
                <strong>{order.totalLabel}</strong>
                <span>{order.itemCount} sản phẩm</span>
              </div>
              <span className="admin-status order-status">{getOrderStatusLabel(order.status)}</span>
            </div>
            ) : null}

            <div className="dashboard-task-list">
              <Link href={isPaid ? "/user" : "/cart"}>{isPaid ? "Xem lịch sử mua hàng" : "Quay lại giỏ hàng"}</Link>
              <Link href="/products">Xem thêm acc</Link>
            </div>
          </section>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
