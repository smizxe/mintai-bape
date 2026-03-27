import Link from "next/link";
import { Menu, ShoppingCart, Ticket, UserRound } from "lucide-react";
import { MockSessionLink } from "@/components/mock-session-link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { accountCatalog } from "@/lib/catalog";

export default function UserPage() {
  return (
    <>
      <SiteHeader mobileIcon={<Menu size={28} />} />

      <main className="dashboard-page">
        <section className="dashboard-hero">
          <div>
            <span className="inventory-eyebrow">User zone</span>
            <h1>Giao diện user sau khi login vào shop.</h1>
            <p>Trang này gồm tóm tắt giỏ hàng, voucher và lối đi tiếp sang danh sách sản phẩm.</p>
          </div>
          <Link href="/products" className="dashboard-link">
            Tiếp tục mua acc
          </Link>
        </section>

        <section className="dashboard-stats">
          <article className="dashboard-stat-card">
            <ShoppingCart size={18} />
            <strong>03</strong>
            <span>acc trong giỏ hàng</span>
          </article>
          <article className="dashboard-stat-card">
            <Ticket size={18} />
            <strong>02</strong>
            <span>ưu đãi khả dụng</span>
          </article>
          <article className="dashboard-stat-card">
            <UserRound size={18} />
            <strong>VIP</strong>
            <span>thành viên ưu tiên</span>
          </article>
        </section>

        <section className="dashboard-board">
          <div className="dashboard-table-card">
            <div className="dashboard-card-head">
              <h2>Giỏ hàng hiện tại</h2>
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
                    <Link href="/products">Sửa lựa chọn</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-side-card">
            <div className="dashboard-card-head">
              <h2>Lối đi nhanh</h2>
              <span>Flow user cần dùng tiếp</span>
            </div>
            <div className="dashboard-task-list">
              <Link href="/products">Mở tất cả sản phẩm</Link>
              <Link href="/products/glacier-x-suit-vault">Xem chi tiết mẫu</Link>
              <MockSessionLink href="/login" clearSession>
                Đăng xuất mock
              </MockSessionLink>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
