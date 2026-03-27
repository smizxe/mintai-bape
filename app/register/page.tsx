import Link from "next/link";
import { ArrowRight, Mail, Menu, ShieldCheck, User, UserPlus } from "lucide-react";
import { MockSessionLink } from "@/components/mock-session-link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function RegisterPage() {
  return (
    <>
      <SiteHeader mobileIcon={<Menu size={28} />} />

      <main className="auth-page">
        <section className="auth-layout">
          <div className="auth-copy">
            <span className="inventory-eyebrow">Đăng ký</span>
            <h1>Tạo tài khoản mới theo vai trò phù hợp.</h1>
            <p>
              Phần này là skeleton cho flow auth thật. Khi đã nối Supabase Auth hoặc auth riêng,
              mình có thể thay form demo bằng flow thật mà không cần đổi layout.
            </p>
          </div>

          <div className="auth-panel">
            <div className="auth-switch">
              <Link href="/login">Đăng nhập</Link>
              <span className="auth-switch-active">Đăng ký</span>
            </div>

            <form className="auth-form">
              <label>
                <span>Tên hiển thị</span>
                <div className="auth-input">
                  <UserPlus size={16} />
                  <input type="text" placeholder="MinTai Bape Member" />
                </div>
              </label>
              <label>
                <span>Email</span>
                <div className="auth-input">
                  <Mail size={16} />
                  <input type="email" placeholder="user@mintaibape.vn" />
                </div>
              </label>
            </form>

            <div className="auth-actions-grid">
              <MockSessionLink className="auth-action-card auth-action-admin" href="/admin" role="admin">
                <ShieldCheck size={18} />
                <strong>Tạo admin demo</strong>
                <span>Dùng cho luồng quản trị và demo dashboard.</span>
              </MockSessionLink>
              <MockSessionLink className="auth-action-card auth-action-user" href="/user" role="user">
                <User size={18} />
                <strong>Tạo user demo</strong>
                <span>Dùng cho luồng khách mua hàng và giỏ hàng.</span>
              </MockSessionLink>
            </div>

            <MockSessionLink className="auth-primary-link" href="/user" role="user">
              Hoàn tất đăng ký
              <ArrowRight size={18} />
            </MockSessionLink>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
