import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, PackageCheck, ShoppingBasket, Users } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";
import { getAllProducts } from "@/lib/products-store";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? decodeSession(token) : null;

  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const products = await getAllProducts();
  const activeProducts = products.filter((p) => !p.status || p.status === "active");

  const stats = [
    { label: "Acc đang bán", value: String(activeProducts.length), icon: PackageCheck },
    { label: "Tổng sản phẩm", value: String(products.length), icon: ShoppingBasket },
    { label: "Admin", value: session.name, icon: Users },
    { label: "Panel", value: "Sidebar", icon: LayoutDashboard },
  ];

  return (
    <AdminShell active="overview" sessionName={session.name}>
      <div className="admin-page-stack">
        <section className="admin-overview-hero">
          <div>
            <span className="inventory-eyebrow">Overview</span>
            <h1>Trung tâm quản lý acc PUBG Mobile theo dạng sidebar.</h1>
            <p>
              Màn này là overview mở đầu. Từ sidebar bên trái, bạn có thể đi sang account management để
              xem danh sách sản phẩm hiện tại và thêm, sửa, xóa sản phẩm.
            </p>
          </div>

          <Link href="/admin/products" className="dashboard-link">
            Vào account management
          </Link>
        </section>

        <section className="dashboard-stats">
          {stats.map(({ label, value, icon: Icon }) => (
            <article key={label} className="dashboard-stat-card">
              <Icon size={18} />
              <strong>{value}</strong>
              <span>{label}</span>
            </article>
          ))}
        </section>

        <section className="admin-overview-grid">
          <div className="dashboard-table-card">
            <div className="dashboard-card-head">
              <h2>Account management preview</h2>
              <span>Danh sách sản phẩm hiện tại</span>
            </div>

            <div className="dashboard-table">
              {activeProducts.slice(0, 6).map((product) => (
                <div key={product.id} className="dashboard-row">
                  <div>
                    <strong>{product.title}</strong>
                    <span>{product.code}</span>
                  </div>
                  <div>
                    <strong>{product.tier}</strong>
                    <span>{product.skinXe || product.tag}</span>
                  </div>
                  <div>
                    <strong>{product.price}</strong>
                    <span>{product.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-side-card">
            <div className="dashboard-card-head">
              <h2>Đi nhanh</h2>
              <span>Luồng quản trị chính</span>
            </div>

            <div className="dashboard-task-list">
              <Link href="/admin/products">Quản lý sản phẩm</Link>
              <Link href="/products">Xem trang sản phẩm</Link>
              <Link href="/products/glacier-x-suit-vault">Xem trang chi tiết mẫu</Link>
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
