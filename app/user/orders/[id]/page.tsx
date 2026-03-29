import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Menu } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getOrderDetailByUserId, getUserProfileByEmail } from "@/lib/commerce-store";
import { getOrderStatusLabel } from "@/lib/order-status";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? decodeSession(token) : null;

  if (!session) {
    redirect("/login");
  }

  if (session.role === "admin") {
    redirect("/admin");
  }

  const user = await getUserProfileByEmail(session.email);
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const order = await getOrderDetailByUserId(user.id, id);

  if (!order) {
    notFound();
  }

  return (
    <>
      <SiteHeader mobileIcon={<Menu size={28} />} />

      <main className="dashboard-page">
        <section className="order-detail-shell">
          <div className="product-detail-back">
            <Link href="/user">
              <ArrowLeft size={16} />
              Quay lại hồ sơ
            </Link>
          </div>

          <section className="dashboard-table-card order-detail-card">
            <div className="dashboard-card-head">
              <h1>Chi tiết đơn hàng</h1>
              <span>
                Đơn #{order.id.slice(-6).toUpperCase()} • {new Date(order.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>

            <div className="order-detail-topline">
              <div>
                <strong>{order.totalLabel}</strong>
                <span>{order.itemCount} sản phẩm</span>
              </div>
              <span className="admin-status order-status">{getOrderStatusLabel(order.status)}</span>
            </div>

            <div className="order-detail-items">
              {order.items.map((item) => (
                <article key={item.id} className="order-detail-item">
                  <div>
                    <strong>{item.title}</strong>
                    <span>
                      {item.quantity} x {item.priceLabel}
                    </span>
                  </div>
                  <div className="order-detail-item-meta">
                    <strong>{item.lineTotalLabel}</strong>
                    {item.productSlug ? <Link href={`/products/${encodeURIComponent(item.productSlug)}`}>Xem lại sản phẩm</Link> : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

