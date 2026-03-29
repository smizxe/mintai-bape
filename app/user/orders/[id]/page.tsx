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
              Quay láº¡i há»“ sÆ¡
            </Link>
          </div>

          <section className="dashboard-table-card order-detail-card">
            <div className="dashboard-card-head">
              <h1>Chi tiáº¿t Ä‘Æ¡n hÃ ng</h1>
              <span>
                ÄÆ¡n #{order.id.slice(-6).toUpperCase()} â€¢ {new Date(order.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>

            <div className="order-detail-topline">
              <div>
                <strong>{order.totalLabel}</strong>
                <span>{order.itemCount} sáº£n pháº©m</span>
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
                    {item.productSlug ? <Link href={`/products/${encodeURIComponent(item.productSlug)}`}>Xem láº¡i sáº£n pháº©m</Link> : null}
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

