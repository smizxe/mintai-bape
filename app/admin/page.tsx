import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, PackageCheck, ShoppingBasket, Sparkles, Tags } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";
import { getAllProducts } from "@/lib/products-store";
import { getAllAccountTypes } from "@/lib/account-types-store";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? decodeSession(token) : null;

  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const [products, accountTypes] = await Promise.all([
    getAllProducts(),
    getAllAccountTypes(),
  ]);

  const activeProducts = products.filter((p) => !p.status || p.status === "active");

  const stats = [
    { label: "Acc đang bán", value: String(activeProducts.length), icon: PackageCheck },
    { label: "Tổng sản phẩm", value: String(products.length), icon: ShoppingBasket },
    { label: "Loại acc", value: String(accountTypes.length), icon: Tags },
    { label: "Khu nổi bật", value: "Hero + 3 card", icon: Sparkles },
    { label: "Bố cục", value: "Sidebar", icon: LayoutDashboard },
  ];

  return (
    <AdminShell active="overview" sessionName={session.name}>
      <div className="admin-page-stack">


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
              <h2>Xem nhanh account</h2>
              <span>Các sản phẩm mới nhất đang có trong kho.</span>
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
              <span>Các khu quản trị chính</span>
            </div>

            <div className="dashboard-task-list">
              <Link href="/admin/products">Quản lý account</Link>
              <Link href="/admin/account-types">Kiểm soát loại acc</Link>
              <Link href="/admin/featured">Quản lý acc nổi bật</Link>
              <Link href="/products">Xem cửa hàng</Link>
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
