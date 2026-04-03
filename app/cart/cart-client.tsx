"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircleMore, Trash2 } from "lucide-react";
import type { CartView } from "@/lib/commerce-store";
import { shouldUseZaloCheckout } from "@/lib/shop-config";

export function CartClient({ initialCart }: { initialCart: CartView }) {
  const router = useRouter();
  const [cart, setCart] = useState(initialCart);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  async function removeItem(itemId: string) {
    setLoadingId(itemId);

    try {
      const res = await fetch(`/api/cart/item/${itemId}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        window.alert(data?.error ?? "Chưa thể xóa sản phẩm khỏi giỏ hàng.");
        return;
      }

      setCart(data.cart);
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  async function checkout() {
    setCheckingOut(true);

    try {
      const res = await fetch("/api/cart/checkout", { method: "POST" });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        window.alert(data?.error ?? "Chưa thể hoàn tất đơn hàng lúc này.");
        return;
      }

      if (data?.mode === "zalo" && data?.externalUrl) {
        window.open(data.externalUrl, "_blank", "noopener,noreferrer");
        return;
      }

      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      window.alert("Chưa lấy được liên kết thanh toán.");
    } finally {
      setCheckingOut(false);
    }
  }

  const useZalo = cart.items.some((item) => shouldUseZaloCheckout(item.paymentMode));

  return (
    <div className="cart-shell">
      <section className="cart-header-card">
        <div>
          <span className="inventory-eyebrow">Giỏ hàng</span>
          <h1>Những acc bạn đang cân nhắc</h1>
          <p>Xem lại lựa chọn, bỏ bớt sản phẩm hoặc chốt đơn ngay khi đã sẵn sàng.</p>
        </div>
        <div className="cart-summary">
          <strong>{cart.subtotalLabel}</strong>
          <span>{cart.itemCount} sản phẩm</span>
        </div>
      </section>

      {cart.items.length === 0 ? (
        <section className="cart-empty-card">
          <h2>Giỏ hàng của bạn đang trống</h2>
          <p>Khám phá kho acc để thêm những tài khoản phù hợp và quay lại chốt đơn bất cứ lúc nào.</p>
          <Link href="/products" className="dashboard-link">
            Xem kho acc
          </Link>
        </section>
      ) : (
        <section className="cart-grid">
          <div className="cart-items-panel">
            {cart.items.map((item) => (
              <article key={item.id} className="cart-item-card">
                <div className="cart-item-media">
                  <Image src={item.imageUrl} alt={item.title} fill sizes="120px" />
                </div>

                <div className="cart-item-copy">
                  <h3>{item.title}</h3>
                  <p>{item.priceLabel} / acc</p>
                  <span>Số lượng: {item.quantity}</span>
                </div>

                <div className="cart-item-meta">
                  <strong>{item.lineTotalLabel}</strong>
                  <button type="button" onClick={() => removeItem(item.id)} disabled={loadingId === item.id}>
                    <Trash2 size={16} />
                    {loadingId === item.id ? "Đang xóa..." : "Xóa"}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="cart-checkout-box">
            <span className="inventory-eyebrow">Tổng đơn</span>
            <strong>{cart.subtotalLabel}</strong>
            <p>
              {useZalo
                ? "Đơn này sẽ được shop hỗ trợ trực tiếp qua Zalo để chốt nhanh và an toàn hơn."
                : `${cart.itemCount} sản phẩm đã sẵn sàng để thanh toán ngay.`}
            </p>

            <button type="button" className="hero-cta cart-checkout-cta" onClick={checkout} disabled={checkingOut}>
              <div className="hero-cta-shadow" />
              <div className="hero-cta-front">
                <span>
                  {checkingOut
                    ? "Đang xử lý..."
                    : useZalo
                      ? "Liên hệ Zalo để chốt"
                      : "Thanh toán với PayOS"}
                  {useZalo ? <MessageCircleMore size={18} /> : <ArrowRight size={18} />}
                </span>
              </div>
            </button>

            <Link href="/products" className="cart-back-link">
              Tiếp tục xem acc
            </Link>
          </aside>
        </section>
      )}
    </div>
  );
}
