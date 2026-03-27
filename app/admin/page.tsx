import Link from "next/link";
import { LayoutDashboard, Menu, PackageCheck, ShoppingBasket, Users } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { accountCatalog } from "@/lib/catalog";

const stats = [
  { label: "Acc dang ban", value: "128", icon: PackageCheck },
  { label: "Don dang cho", value: "19", icon: ShoppingBasket },
  { label: "User moi", value: "42", icon: Users },
  { label: "Panel", value: "Admin", icon: LayoutDashboard },
];

export default function AdminPage() {
  return (
    <>
      <SiteHeader
        links={[
          { href: "/", label: "Store" },
          { href: "/products", label: "San pham" },
          { href: "/admin", label: "Dashboard" },
          { href: "/login", label: "Thoat" },
        ]}
        mobileIcon={<Menu size={28} />}
      />

      <main className="dashboard-page">
        <section className="dashboard-hero">
          <div>
            <span className="inventory-eyebrow">Admin dashboard</span>
            <h1>Quan ly kho acc PUBG Mobile theo cung style cua storefront.</h1>
            <p>Khong dung light theme mem. Dashboard nay giu den, do, trang va cac panel cat cheo de dong bo voi web ban hang.</p>
          </div>
          <Link href="/products" className="dashboard-link">
            Xem trang san pham
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

        <section className="dashboard-board">
          <div className="dashboard-table-card">
            <div className="dashboard-card-head">
              <h2>Kho acc dang noi bat</h2>
              <span>Sync voi trang chu va trang san pham</span>
            </div>
            <div className="dashboard-table">
              {accountCatalog.slice(0, 5).map((account) => (
                <div key={account.id} className="dashboard-row">
                  <div>
                    <strong>{account.title}</strong>
                    <span>{account.code}</span>
                  </div>
                  <div>
                    <strong>{account.tier}</strong>
                    <span>{account.stats[0]}</span>
                  </div>
                  <div>
                    <strong>{account.price}</strong>
                    <span>{account.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-side-card">
            <div className="dashboard-card-head">
              <h2>Cong viec nhanh</h2>
              <span>Skeleton de gan action that sau</span>
            </div>
            <div className="dashboard-task-list">
              <Link href="/accounts">Cap nhat bo anh account</Link>
              <Link href="/products">Sua card gia va badge san pham</Link>
              <Link href="/register">Tao them tai khoan admin / user</Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
