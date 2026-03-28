"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";

export function AddToCartButton({
  productId,
  className,
  label = "Mua ngay",
}: {
  productId: string;
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
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

  return (
    <button type="button" className={className} onClick={handleClick} disabled={loading}>
      <ShoppingCart size={16} />
      {loading ? "Đang thêm..." : label}
    </button>
  );
}
