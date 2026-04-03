"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import type { OrderSummary, UserProfileView } from "@/lib/commerce-store";
import { getOrderStatusLabel } from "@/lib/order-status";

export function ProfileClient({
  profile,
  orders,
}: {
  profile: UserProfileView;
  orders: OrderSummary[];
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleProfileSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setProfileMessage(data?.error ?? "Chưa thể cập nhật thông tin lúc này.");
        return;
      }

      setDisplayName(data.displayName);
      setProfileMessage("Tên hiển thị đã được cập nhật.");
      router.refresh();
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingPassword(true);
    setPasswordMessage(null);

    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setPasswordMessage(data?.error ?? "Chưa thể đổi mật khẩu lúc này.");
        return;
      }

      setOldPassword("");
      setNewPassword("");
      setPasswordMessage("Mật khẩu đã được đổi thành công.");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <>
      <section className="dashboard-hero account-hero">
        <div>
          <span className="inventory-eyebrow">Hồ sơ của bạn</span>
          <h1>{profile.displayName}</h1>
          <p>Theo dõi đơn hàng, xem lại thông tin acc đã nhận và quản lý tài khoản mua hàng của bạn tại shop.</p>
        </div>
        <Link href="/products" className="dashboard-link">
          Xem kho acc
        </Link>
      </section>

      <section className="dashboard-stats account-stats">
        <article className="dashboard-stat-card">
          <strong>{orders.length}</strong>
          <span>Đơn hàng đã tạo</span>
        </article>
        <article className="dashboard-stat-card">
          <strong>{profile.email}</strong>
          <span>Email đăng nhập</span>
        </article>
        <article className="dashboard-stat-card">
          <strong>{new Date(profile.createdAt).toLocaleDateString("vi-VN")}</strong>
          <span>Ngày tham gia</span>
        </article>
      </section>

      <section className="account-grid">
        <div className="dashboard-table-card account-panel">
          <div className="dashboard-card-head">
            <h2>Lịch sử mua hàng</h2>
            <span>Xem lại chi phí, trạng thái đơn và mở chi tiết để nhận thông tin acc sau khi thanh toán.</span>
          </div>

          {orders.length === 0 ? (
            <div className="account-empty">
              <p>Bạn chưa có đơn hàng nào. Khi chọn được acc ưng ý, lịch sử đơn sẽ hiển thị tại đây.</p>
              <Link href="/products" className="dashboard-link">
                Bắt đầu chọn acc
              </Link>
            </div>
          ) : (
            <div className="dashboard-table account-history-table">
              {orders.map((order) => (
                <div key={order.id} className="dashboard-row account-history-row">
                  <div>
                    <strong>Đơn #{order.id.slice(-6).toUpperCase()}</strong>
                    <span>{new Date(order.createdAt).toLocaleString("vi-VN")}</span>
                  </div>
                  <div>
                    <strong>{order.totalLabel}</strong>
                    <span>
                      {order.itemCount} sản phẩm • {getOrderStatusLabel(order.status)}
                    </span>
                  </div>
                  <div>
                    <Link href={`/user/orders/${order.id}`}>
                      Xem chi tiết
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="account-side-stack">
          <section className="dashboard-side-card account-panel">
            <div className="dashboard-card-head">
              <h2>Thông tin tài khoản</h2>
              <span>Cập nhật tên hiển thị để shop hỗ trợ bạn nhanh hơn khi cần xác minh đơn hàng.</span>
            </div>

            <form className="account-form" onSubmit={handleProfileSave}>
              <label className="account-field">
                <span>Tên hiển thị</span>
                <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
              </label>

              {profileMessage ? <p className="account-form-message">{profileMessage}</p> : null}

              <button type="submit" className="dashboard-link account-submit" disabled={savingProfile}>
                {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </form>
          </section>

          <section className="dashboard-side-card account-panel">
            <div className="dashboard-card-head">
              <h2>Đổi mật khẩu</h2>
              <span>Nhập mật khẩu hiện tại và tạo mật khẩu mới để bảo vệ tài khoản của bạn.</span>
            </div>

            <form className="account-form" onSubmit={handlePasswordSave}>
              <label className="account-field">
                <span>Mật khẩu hiện tại</span>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(event) => setOldPassword(event.target.value)}
                />
              </label>

              <label className="account-field">
                <span>Mật khẩu mới</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </label>

              {passwordMessage ? <p className="account-form-message">{passwordMessage}</p> : null}

              <button type="submit" className="dashboard-link account-submit" disabled={savingPassword}>
                {savingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
              </button>
            </form>
          </section>

          <section className="dashboard-side-card account-panel">
            <div className="dashboard-card-head">
              <h2>Đi nhanh</h2>
              <span>Mở đúng nơi bạn cần chỉ với một lần bấm.</span>
            </div>

            <div className="dashboard-task-list">
              <Link href="/cart">Mở giỏ hàng</Link>
              <Link href="/products">Xem kho acc</Link>
              <LogoutButton className="dashboard-row-link">Đăng xuất</LogoutButton>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
