"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import type { Product } from "@/lib/products-store";

type FilterKey = "skinXe" | "thanhGiap" | "doBAPE";
type SortKey = "newest" | "oldest" | "price-asc" | "price-desc";

type FilterState = {
  skins: FilterKey[];
  accountTypes: string[];
  search: string;
  priceFrom: number | "";
  priceTo: number | "";
  sortBy: SortKey;
};

const SKIN_OPTIONS: Array<{ key: FilterKey; label: string }> = [
  { key: "skinXe", label: "Skin xe" },
  { key: "thanhGiap", label: "Thánh giáp" },
  { key: "doBAPE", label: "Đồ BAPE" },
];

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: "newest", label: "Mới nhất → Cũ nhất" },
  { key: "oldest", label: "Cũ nhất → Mới nhất" },
  { key: "price-asc", label: "Giá thấp tới cao" },
  { key: "price-desc", label: "Giá cao tới thấp" },
];

const EMPTY_FILTER: FilterState = {
  skins: [],
  accountTypes: [],
  search: "",
  priceFrom: "",
  priceTo: "",
  sortBy: "newest",
};

export function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const accountTypeOptions = useMemo(
    () =>
      Array.from(new Set(initialProducts.map((product) => product.tier).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, "vi"),
      ),
    [initialProducts],
  );

  const [draftFilters, setDraftFilters] = useState<FilterState>(EMPTY_FILTER);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(EMPTY_FILTER);

  const filtered = useMemo(() => {
    const query = appliedFilters.search.trim().toLowerCase();

    const matches = initialProducts.filter((product) => {
      const matchesSkin =
        appliedFilters.skins.length === 0 || appliedFilters.skins.every((key) => Boolean(product[key]));

      const matchesType =
        appliedFilters.accountTypes.length === 0 || appliedFilters.accountTypes.includes(product.tier);

      const matchesSearch =
        !query ||
        product.title.toLowerCase().includes(query) ||
        product.summary.toLowerCase().includes(query) ||
        product.code.toLowerCase().includes(query) ||
        product.tier.toLowerCase().includes(query) ||
        product.skinXe?.toLowerCase().includes(query) ||
        product.thanhGiap?.toLowerCase().includes(query) ||
        product.doBAPE?.toLowerCase().includes(query) ||
        product.shortDescription?.toLowerCase().includes(query);

      let matchesPrice = true;
      if (appliedFilters.priceFrom !== "" && product.priceValue < appliedFilters.priceFrom) {
        matchesPrice = false;
      }
      if (appliedFilters.priceTo !== "" && product.priceValue > appliedFilters.priceTo) {
        matchesPrice = false;
      }

      return matchesSkin && matchesType && matchesSearch && matchesPrice;
    });

    return [...matches].sort((a, b) => {
      if (appliedFilters.sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      if (appliedFilters.sortBy === "price-asc") {
        return a.priceValue - b.priceValue;
      }

      if (appliedFilters.sortBy === "price-desc") {
        return b.priceValue - a.priceValue;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [appliedFilters, initialProducts]);

  const hasAppliedFilters =
    appliedFilters.skins.length > 0 ||
    appliedFilters.accountTypes.length > 0 ||
    Boolean(appliedFilters.search.trim()) ||
    appliedFilters.priceFrom !== "" ||
    appliedFilters.priceTo !== "" ||
    appliedFilters.sortBy !== "newest";

  function toggleDraftSkin(key: FilterKey) {
    setDraftFilters((prev) => ({
      ...prev,
      skins: prev.skins.includes(key) ? prev.skins.filter((item) => item !== key) : [...prev.skins, key],
    }));
  }

  function toggleDraftType(type: string) {
    setDraftFilters((prev) => ({
      ...prev,
      accountTypes: prev.accountTypes.includes(type)
        ? prev.accountTypes.filter((item) => item !== type)
        : [...prev.accountTypes, type],
    }));
  }

  function applyFilters() {
    setAppliedFilters({
      skins: [...draftFilters.skins],
      accountTypes: [...draftFilters.accountTypes],
      search: draftFilters.search,
      priceFrom: draftFilters.priceFrom,
      priceTo: draftFilters.priceTo,
      sortBy: draftFilters.sortBy,
    });
  }

  function resetFilters() {
    setDraftFilters(EMPTY_FILTER);
    setAppliedFilters(EMPTY_FILTER);
  }

  return (
    <section className="products-shell">
      <aside className="filter-bar">
        <div className="filter-label">
          <SlidersHorizontal size={18} />
          <span>Bộ lọc acc</span>
        </div>

        <div className="filter-section">
          <span className="filter-section-title">Lọc theo skin</span>
          <div className="filter-chip-row filter-chip-column">
            {SKIN_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                className={`filter-chip ${draftFilters.skins.includes(option.key) ? "filter-chip-active" : ""}`}
                onClick={() => toggleDraftSkin(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <span className="filter-section-title">Lọc theo loại acc</span>
          <div className="filter-chip-row filter-chip-column">
            {accountTypeOptions.map((type) => (
              <button
                key={type}
                type="button"
                className={`filter-chip ${draftFilters.accountTypes.includes(type) ? "filter-chip-active" : ""}`}
                onClick={() => toggleDraftType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <span className="filter-section-title">Sắp xếp</span>
          <div className="filter-chip-row filter-chip-column">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                className={`filter-chip ${draftFilters.sortBy === option.key ? "filter-chip-active" : ""}`}
                onClick={() =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    sortBy: option.key,
                  }))
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <span className="filter-section-title">Khoảng giá</span>
          <div className="filter-price-row">
            <input
              type="number"
              className="filter-search-input filter-price-input"
              placeholder="Từ..."
              value={draftFilters.priceFrom}
              onChange={(event) =>
                setDraftFilters((prev) => ({
                  ...prev,
                  priceFrom: event.target.value ? Number(event.target.value) : "",
                }))
              }
            />
            <input
              type="number"
              className="filter-search-input filter-price-input"
              placeholder="Đến..."
              value={draftFilters.priceTo}
              onChange={(event) =>
                setDraftFilters((prev) => ({
                  ...prev,
                  priceTo: event.target.value ? Number(event.target.value) : "",
                }))
              }
            />
          </div>
        </div>

        <div className="filter-section">
          <span className="filter-section-title">Tìm acc, skin, đồ</span>
          <div className="filter-search-wrap">
            <Search size={15} className="filter-search-icon" />
            <input
              type="text"
              className="filter-search-input"
              placeholder="Tìm acc, skin xe, BAPE..."
              value={draftFilters.search}
              onChange={(event) =>
                setDraftFilters((prev) => ({
                  ...prev,
                  search: event.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="filter-actions">
          <button type="button" className="filter-apply-button" onClick={applyFilters}>
            Lưu bộ lọc
          </button>
          <button type="button" className="filter-reset-button" onClick={resetFilters}>
            Xóa bộ lọc
          </button>
        </div>
      </aside>

      <div className="products-results">
        {hasAppliedFilters && (
          <p className="products-result-count">
            {filtered.length} kết quả
            {appliedFilters.skins.length > 0 && ` · ${appliedFilters.skins.length} bộ lọc skin`}
            {appliedFilters.accountTypes.length > 0 && ` · ${appliedFilters.accountTypes.length} loại acc`}
            {appliedFilters.search.trim() && ` · "${appliedFilters.search.trim()}"`}
            {appliedFilters.sortBy !== "newest" && " · đã sắp xếp"}
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="products-empty">
            <p>Chưa tìm thấy acc phù hợp với lựa chọn hiện tại.</p>
            <button type="button" className="filter-chip" onClick={resetFilters}>
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
                      <AddToCartButton productId={account.id} priceValue={account.priceValue} />
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
      </div>
    </section>
  );
}
