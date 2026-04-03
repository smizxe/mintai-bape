"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircleMore, ShoppingCart } from "lucide-react";
import { shouldUseZaloCheckout, ZALO_CONTACT_URL } from "@/lib/shop-config";

export function AddToCartButton({
  productId,
  paymentMode,
  className,
  label,
}: {
  productId: string;
  paymentMode?: string;
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (shouldUseZaloCheckout(paymentMode)) {
      window.open(ZALO_CONTACT_URL, "_blank", "noopener,noreferrer");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (res.status === 401) {
        router.push("/login?next=/cart");
        return;
      }

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        window.alert(data?.error ?? "Chưa thể thêm sản phẩm vào giỏ hàng.");
        return;
      }

      router.push("/cart");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const isZalo = shouldUseZaloCheckout(paymentMode);
  const buttonLabel = label ?? (isZalo ? "Chốt qua Zalo" : "Mua ngay");

  return (
    <button type="button" className={className} onClick={handleClick} disabled={loading}>
      {isZalo ? <MessageCircleMore size={16} /> : <ShoppingCart size={16} />}
      {loading ? "Đang xử lý..." : buttonLabel}
    </button>
  );
}
