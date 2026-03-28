import type { ReactNode } from "react";
import Link from "next/link";
import {
  BarChart3,
  ExternalLink,
  LayoutDashboard,
  Package2,
  Tags,
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

type AdminShellProps = {
  active: "overview" | "products" | "account-types";
  sessionName: string;
  children: ReactNode;
};

export function AdminShell({ active, sessionName, children }: AdminShellProps) {
  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-kicker">MinTai Bape</span>
          <strong>Admin dashboard</strong>
          <p>Quan ly tong quan, account va loai acc tu mot sidebar co dinh.</p>
        </div>

        <nav className="admin-sidebar-nav">
          <Link
            href="/admin"
            className={`admin-sidebar-link ${active === "overview" ? "admin-sidebar-link-active" : ""}`}
          >
            <LayoutDashboard size={18} />
            <span>Tổng quan</span>
          </Link>

          <Link
            href="/admin/products"
            className={`admin-sidebar-link ${active === "products" ? "admin-sidebar-link-active" : ""}`}
          >
            <Package2 size={18} />
            <span>Quản lý account</span>
          </Link>

          <Link
            href="/admin/account-types"
            className={`admin-sidebar-link ${active === "account-types" ? "admin-sidebar-link-active" : ""}`}
          >
            <Tags size={18} />
            <span>Kiểm soát loại acc</span>
          </Link>

          <Link href="/products" className="admin-sidebar-link">
            <ExternalLink size={18} />
            <span>Xem cửa hàng</span>
          </Link>
        </nav>

        <div className="admin-sidebar-meta">
          <div className="admin-sidebar-user">
            <BarChart3 size={18} />
            <div>
              <strong>{sessionName}</strong>
              <span>Quyền quản trị</span>
            </div>
          </div>

          <LogoutButton className="admin-sidebar-logout">Đăng xuất</LogoutButton>
        </div>
      </aside>

      <section className="admin-content">{children}</section>
    </main>
  );
}
