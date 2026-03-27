import Link from "next/link";
import { Menu, ShoppingCart, Ticket, UserRound } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { accountCatalog } from "@/lib/catalog";

export default function UserPage() {
  return (
    <>
      <SiteHeader
        links={[
          { href: "/", label: "Trang chu" },
          { href: "/products", label: "San pham" },
          { href: "/accounts", label: "Account" },
          { href: "/user", label: "User" },
        ]}
        mobileIcon={<Menu size={28} />}
      />

      <main className="dashboard-page">
        <section className="dashboard-hero">
          <div>
            <span className="inventory-eyebrow">User zone</span>
            <h1>Giao dien user sau khi login vao shop.</h1>
            <p>Trang nay gom tom tat gio hang, voucher, acc da xem va loi di tiep sang danh sach san pham.</p>
          </div>
          <Link href="/products" className="dashboard-link">
            Tiep tuc mua acc
          </Link>
        </section>

        <section className="dashboard-stats">
          <article className="dashboard-stat-card">
            <ShoppingCart size={18} />
            <strong>03</strong>
            <span>acc trong gio hang</span>
          </article>
          <article className="dashboard-stat-card">
            <Ticket size={18} />
            <strong>02</strong>
            <span>uu dai kha dung</span>
          </article>
          <article className="dashboard-stat-card">
            <UserRound size={18} />
            <strong>VIP</strong>
            <span>thanh vien uu tien</span>
          </article>
        </section>

        <section className="dashboard-board">
          <div className="dashboard-table-card">
            <div className="dashboard-card-head">
              <h2>Gio hang hien tai</h2>
              <span>Mock flow cho user</span>
            </div>
            <div className="dashboard-table">
              {accountCatalog.slice(0, 3).map((account) => (
                <div key={account.id} className="dashboard-row">
                  <div>
                    <strong>{account.title}</strong>
                    <span>{account.summary}</span>
                  </div>
                  <div>
                    <strong>{account.price}</strong>
                    <span>{account.tier}</span>
                  </div>
                  <div>
                    <Link href="/products">Sua lua chon</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-side-card">
            <div className="dashboard-card-head">
              <h2>Loi di nhanh</h2>
              <span>Flow user can dung tiep</span>
            </div>
            <div className="dashboard-task-list">
              <Link href="/products">Mo tat ca san pham</Link>
              <Link href="/accounts">Xem gallery account</Link>
              <Link href="/login">Dang xuat mock</Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
