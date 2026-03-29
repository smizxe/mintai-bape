"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { Product } from "@/lib/products-store";

function getProductLabel(product: Product) {
  return `${product.code} · ${product.title}`;
}

export function FeaturedManagerClient({
  products,
  initialHeroProductId,
  initialWeekProductIds,
}: {
  products: Product[];
  initialHeroProductId: string | null;
  initialWeekProductIds: string[];
}) {
  const [heroProductId, setHeroProductId] = useState<string>(initialHeroProductId ?? "");
  const [weekProductIds, setWeekProductIds] = useState<string[]>([
    initialWeekProductIds[0] ?? "",
    initialWeekProductIds[1] ?? "",
    initialWeekProductIds[2] ?? "",
  ]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const activeProducts = useMemo(
    () => products.filter((product) => !product.status || product.status === "active"),
    [products],
  );

  async function handleSave() {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/featured", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroProductId: heroProductId || null,
          weekProductIds: weekProductIds.filter(Boolean),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Không lưu được acc nổi bật.");
        return;
      }

      setHeroProductId(data.heroProductId ?? "");
      setWeekProductIds([
        data.weekProductIds?.[0] ?? "",
        data.weekProductIds?.[1] ?? "",
        data.weekProductIds?.[2] ?? "",
      ]);
      setMessage("Đã cập nhật khu acc nổi bật.");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setError("Lỗi kết nối. Thử lại.");
    } finally {
      setSaving(false);
    }
  }

  function updateWeekSlot(index: number, value: string) {
    setWeekProductIds((prev) => prev.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  return (
    <div className="admin-products-shell">
      <div className="admin-products-topbar">
        <div className="admin-products-title">
          <Link href="/admin" className="admin-back-link">
            <ArrowLeft size={16} />
            Tổng quan
          </Link>
          <h1>Quản lý acc nổi bật</h1>
          <span className="admin-products-count">{activeProducts.length} sản phẩm đang bán</span>
        </div>
      </div>

      {message && <div className="admin-toast admin-toast-success">{message}</div>}

      <div className="featured-admin-grid">
        <section className="af-panel">
          <div className="af-header">
            <h2>Acc nổi bật nhất</h2>
          </div>

          <div className="af-body">
            <label className="af-field">
              <span>Sản phẩm hero</span>
              <select value={heroProductId} onChange={(event) => setHeroProductId(event.target.value)}>
                <option value="">Chưa chọn acc nổi bật nhất</option>
                {activeProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {getProductLabel(product)}
                  </option>
                ))}
              </select>
            </label>

            <div className="featured-admin-note">
              Acc này sẽ hiện trong hero đầu trang và dùng ảnh thật cùng giá thật từ sản phẩm.
            </div>
          </div>
        </section>

        <section className="af-panel">
          <div className="af-header">
            <h2>Acc nổi bật tuần này</h2>
          </div>

          <div className="af-body">
            {[0, 1, 2].map((index) => (
              <label key={index} className="af-field">
                <span>Slot {index + 1}</span>
                <select
                  value={weekProductIds[index] ?? ""}
                  onChange={(event) => updateWeekSlot(index, event.target.value)}
                >
                  <option value="">Bỏ trống slot</option>
                  {activeProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {getProductLabel(product)}
                    </option>
                  ))}
                </select>
              </label>
            ))}

            <div className="featured-admin-note">
              Chỉ hiển thị 3 card thật trên homepage. Bạn có thể thay đổi thứ tự bằng 3 slot này.
            </div>
          </div>
        </section>
      </div>

      <section className="dashboard-table-card">
        <div className="dashboard-card-head">
          <h2>Xem nhanh các sản phẩm đang bán</h2>
          <span>Chọn từ danh sách này để đưa vào khu nổi bật.</span>
        </div>

        <div className="featured-admin-preview-list">
          {activeProducts.map((product) => (
            <div key={product.id} className="featured-admin-preview-row">
              <div>
                <strong>{product.title}</strong>
                <span>{product.code} · {product.price}</span>
              </div>
              <div className="featured-admin-preview-badges">
                {heroProductId === product.id && <span className="featured-admin-badge">Hero</span>}
                {weekProductIds.includes(product.id) && <span className="featured-admin-badge featured-admin-badge-dark">Tuần này</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {error && <p className="af-error">{error}</p>}

      <div className="af-footer">
        <button type="button" className="admin-btn-primary" onClick={handleSave} disabled={saving}>
          <Sparkles size={16} />
          {saving ? "Đang lưu..." : "Lưu acc nổi bật"}
        </button>
      </div>
    </div>
  );
}
