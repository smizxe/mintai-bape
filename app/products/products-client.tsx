"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search, SlidersHorizontal, X } from "lucide-react";
import type { Product } from "@/lib/products-store";

const FILTER_CHIPS = [
  { key: "skinXe", label: "Skin xe" },
  { key: "thanhGiap", label: "Thánh giáp" },
  { key: "doBAPE", label: "Đồ BAPE" },
  { key: "mythic", label: "Mythic" },
  { key: "elite", label: "Elite" },
  { key: "cheap", label: "Dưới 3 triệu" },
];

export function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = initialProducts;

    if (activeFilter === "skinXe") list = list.filter((p) => p.skinXe);
    if (activeFilter === "thanhGiap") list = list.filter((p) => p.thanhGiap);
    if (activeFilter === "doBAPE") list = list.filter((p) => p.doBAPE);
    if (activeFilter === "mythic") list = list.filter((p) => p.tier === "Mythic");
    if (activeFilter === "elite") list = list.filter((p) => p.tier === "Elite");
    if (activeFilter === "cheap") list = list.filter((p) => p.priceValue < 3000000);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.skinXe?.toLowerCase().includes(q) ||
          p.thanhGiap?.toLowerCase().includes(q) ||
          p.doBAPE?.toLowerCase().includes(q) ||
          p.shortDescription?.toLowerCase().includes(q),
      );
    }

    return list;
  }, [initialProducts, activeFilter, search]);

  function toggleFilter(key: string) {
    setActiveFilter((prev) => (prev === key ? null : key));
  }

  return (
    <section className="products-shell">
      {/* Filter + Search bar */}
      <div className="filter-bar">
        <div className="filter-label">
          <SlidersHorizontal size={18} />
          <span>Bộ lọc nhanh</span>
        </div>
        <div className="filter-chip-row">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.key}
              type="button"
              className={`filter-chip ${activeFilter === chip.key ? "filter-chip-active" : ""}`}
              onClick={() => toggleFilter(chip.key)}
            >
              {chip.label}
              {activeFilter === chip.key && <X size={12} style={{ marginLeft: 4 }} />}
            </button>
          ))}
        </div>
        <div className="filter-search-wrap">
          <Search size={15} className="filter-search-icon" />
          <input
            type="text"
            className="filter-search-input"
            placeholder="Tìm acc, skin xe, BAPE..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="filter-search-clear"
              onClick={() => setSearch("")}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      {(search || activeFilter) && (
        <p className="products-result-count">
          {filtered.length} kết quả{" "}
          {activeFilter && `· ${FILTER_CHIPS.find((c) => c.key === activeFilter)?.label}`}
          {search && ` · "${search}"`}
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="products-empty">
          <p>Không tìm thấy sản phẩm phù hợp.</p>
          <button
            type="button"
            className="filter-chip"
            onClick={() => {
              setSearch("");
              setActiveFilter(null);
            }}
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {filtered.map((account) => (
            <article key={account.id} className="product-card">
              <div className="product-card-media">
                <Image
                  src={account.images[0] ?? "/accounts/acc-01.svg"}
                  alt={account.title}
                  fill
                  sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
                />
                <span className="product-card-badge">{account.code}</span>
              </div>
              <div className="product-card-body">
                <div className="gallery-topline">
                  <span className={`tier-badge ${account.tierClass}`}>{account.tier}</span>
                  <span className="tag-dark">{account.tag}</span>
                </div>
                <h3>{account.title}</h3>
                <p>{account.summary}</p>

                {/* Three bullet fields */}
                <div className="product-bullets">
                  {account.skinXe && (
                    <span className="product-bullet product-bullet-xe">
                      <span className="bullet-label">Skin xe</span>
                      {account.skinXe}
                    </span>
                  )}
                  {account.thanhGiap && (
                    <span className="product-bullet product-bullet-giap">
                      <span className="bullet-label">Thánh giáp</span>
                      {account.thanhGiap}
                    </span>
                  )}
                  {account.doBAPE && (
                    <span className="product-bullet product-bullet-bape">
                      <span className="bullet-label">BAPE</span>
                      {account.doBAPE}
                    </span>
                  )}
                </div>

                <div className="product-card-bottom">
                  <strong>{account.price}</strong>
                  <div className="product-card-actions">
                    <Link href="/user">Mua ngay</Link>
                    <Link href={`/products/${account.slug}`}>
                      Xem chi tiết
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
