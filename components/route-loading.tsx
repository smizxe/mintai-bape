import { LoaderCircle, Menu } from "lucide-react";
import { SiteHeader } from "@/components/site-chrome";

export function StorefrontLoadingScreen() {
  return (
    <>
      <SiteHeader mobileIcon={<Menu size={28} />} />

      <main className="route-loading-shell">
        <div className="route-loading-backdrop" aria-hidden="true">
          <div className="route-loading-halftone bg-halftone" />
          <div className="route-loading-glow" />
        </div>

        <section className="route-loading-card">
          <div className="route-loading-kicker">Đang tải</div>
          <div className="route-loading-headline">
            <span className="route-loading-line route-loading-line-lg shimmer-block" />
            <span className="route-loading-line route-loading-line-md shimmer-block" />
            <span className="route-loading-line route-loading-line-sm shimmer-block" />
          </div>

          <div className="route-loading-status">
            <LoaderCircle size={20} className="route-loading-spinner" />
            <span>Đang chuẩn bị dữ liệu cho bạn...</span>
          </div>

          <div className="route-loading-grid">
            <div className="route-loading-panel shimmer-card" />
            <div className="route-loading-panel shimmer-card" />
            <div className="route-loading-panel shimmer-card" />
          </div>
        </section>
      </main>
    </>
  );
}

export function AdminLoadingScreen() {
  return (
    <main className="admin-shell admin-loading-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand admin-loading-brand">
          <span className="admin-sidebar-kicker">MinTai Bape</span>
          <strong>Admin dashboard</strong>
          <p>Đang tải khu quản trị...</p>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-loading-nav-item shimmer-card" />
          <div className="admin-loading-nav-item shimmer-card" />
          <div className="admin-loading-nav-item shimmer-card" />
          <div className="admin-loading-nav-item shimmer-card" />
        </nav>

        <div className="admin-sidebar-meta admin-loading-meta shimmer-card" />
      </aside>

      <section className="admin-content">
        <div className="admin-loading-main">
          <div className="admin-loading-topbar">
            <div className="admin-loading-title">
              <span className="shimmer-block admin-loading-title-lg" />
              <span className="shimmer-block admin-loading-title-sm" />
            </div>
            <span className="shimmer-block admin-loading-button" />
          </div>

          <div className="admin-loading-panels">
            <div className="admin-loading-panel shimmer-card" />
            <div className="admin-loading-panel shimmer-card" />
            <div className="admin-loading-panel shimmer-card" />
          </div>

          <div className="admin-loading-table shimmer-card">
            <div className="admin-loading-table-head" />
            <div className="admin-loading-row" />
            <div className="admin-loading-row" />
            <div className="admin-loading-row" />
            <div className="admin-loading-row" />
          </div>
        </div>
      </section>
    </main>
  );
}
