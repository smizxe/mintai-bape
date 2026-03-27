"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import type { Product } from "@/lib/products-store";

const TIERS = ["Mythic", "Elite", "Rare", "Starter"];
const STATUSES = [
  { value: "active", label: "Đang bán" },
  { value: "draft", label: "Nháp" },
  { value: "sold", label: "Đã bán" },
  { value: "archived", label: "Ẩn" },
];

type FormData = {
  code: string;
  title: string;
  slug: string;
  tag: string;
  tier: string;
  price: string;
  priceValue: string;
  skinXe: string;
  thanhGiap: string;
  doBAPE: string;
  summary: string;
  shortDescription: string;
  descriptionHtml: string;
  images: string;
  status: string;
};

const EMPTY_FORM: FormData = {
  code: "",
  title: "",
  slug: "",
  tag: "",
  tier: "Elite",
  price: "",
  priceValue: "",
  skinXe: "",
  thanhGiap: "",
  doBAPE: "",
  summary: "",
  shortDescription: "",
  descriptionHtml: "",
  images: "",
  status: "active",
};

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function productToForm(product: Product): FormData {
  return {
    code: product.code,
    title: product.title,
    slug: product.slug,
    tag: product.tag,
    tier: product.tier,
    price: product.price,
    priceValue: String(product.priceValue),
    skinXe: product.skinXe ?? "",
    thanhGiap: product.thanhGiap ?? "",
    doBAPE: product.doBAPE ?? "",
    summary: product.summary,
    shortDescription: product.shortDescription,
    descriptionHtml: product.descriptionHtml,
    images: (product.images ?? []).join("\n"),
    status: product.status ?? "active",
  };
}

export function AdminProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("none");
  const [bulkBusy, setBulkBusy] = useState(false);

  const filteredProducts = products.filter((product) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !query ||
      product.title.toLowerCase().includes(query) ||
      product.code.toLowerCase().includes(query) ||
      product.summary.toLowerCase().includes(query) ||
      product.tag.toLowerCase().includes(query) ||
      product.skinXe?.toLowerCase().includes(query) ||
      product.thanhGiap?.toLowerCase().includes(query) ||
      product.doBAPE?.toLowerCase().includes(query);

    const matchesStatus = statusFilter === "all" || (product.status ?? "active") === statusFilter;
    const matchesTier = tierFilter === "all" || product.tier === tierFilter;

    return matchesSearch && matchesStatus && matchesTier;
  });

  const allVisibleIds = filteredProducts.map((product) => product.id);
  const allVisibleSelected =
    allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setMode("create");
    setError("");
  }

  function openEdit(product: Product) {
    setForm(productToForm(product));
    setEditingId(product.id);
    setMode("edit");
    setError("");
  }

  function closeForm() {
    setMode("list");
    setEditingId(null);
    setError("");
  }

  function setField(key: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleProductSelection(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function toggleSelectAllVisible() {
    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        return prev.filter((id) => !allVisibleIds.includes(id));
      }

      return Array.from(new Set([...prev, ...allVisibleIds]));
    });
  }

  async function handleSave() {
    setError("");
    setSaving(true);

    const payload = {
      ...form,
      priceValue: Number(form.priceValue) || 0,
      images: form.images
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    try {
      const response =
        mode === "create"
          ? await fetch("/api/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/products/${editingId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Lỗi khi lưu sản phẩm");
        return;
      }

      if (mode === "create") {
        setProducts((prev) => [...prev, data]);
        setSuccessMsg("Tạo sản phẩm thành công.");
      } else {
        setProducts((prev) => prev.map((product) => (product.id === editingId ? data : product)));
        setSuccessMsg("Cập nhật sản phẩm thành công.");
      }

      setTimeout(() => setSuccessMsg(""), 3000);
      closeForm();
    } catch {
      setError("Lỗi kết nối. Thử lại.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Xóa sản phẩm này? Không thể hoàn tác.")) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" });

      if (!response.ok) {
        window.alert("Xóa thất bại. Thử lại.");
        return;
      }

      setProducts((prev) => prev.filter((product) => product.id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      setSuccessMsg("Đã xóa sản phẩm.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      window.alert("Lỗi kết nối.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleBulkApply() {
    if (bulkAction === "none" || selectedIds.length === 0) {
      return;
    }

    if (bulkAction === "delete" && !window.confirm(`Xóa ${selectedIds.length} sản phẩm đã chọn?`)) {
      return;
    }

    setBulkBusy(true);
    setError("");

    try {
      if (bulkAction === "delete") {
        const results = await Promise.all(
          selectedIds.map((id) => fetch(`/api/products/${id}`, { method: "DELETE" })),
        );

        const failed = results.some((response) => !response.ok);
        if (failed) {
          setError("Có sản phẩm chưa xóa được. Thử lại.");
        } else {
          setProducts((prev) => prev.filter((product) => !selectedIds.includes(product.id)));
          setSuccessMsg(`Đã xóa ${selectedIds.length} sản phẩm.`);
          setSelectedIds([]);
        }
      } else {
        const nextStatus = bulkAction;
        const selectedProducts = products.filter((product) => selectedIds.includes(product.id));

        const updatedProducts = await Promise.all(
          selectedProducts.map(async (product) => {
            const response = await fetch(`/api/products/${product.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: nextStatus }),
            });

            if (!response.ok) {
              throw new Error("bulk-update-failed");
            }

            return (await response.json()) as Product;
          }),
        );

        setProducts((prev) =>
          prev.map((product) => updatedProducts.find((item) => item.id === product.id) ?? product),
        );
        setSuccessMsg(`Đã cập nhật ${updatedProducts.length} sản phẩm.`);
        setSelectedIds([]);
      }

      setBulkAction("none");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("Bulk action thất bại. Kiểm tra dữ liệu rồi thử lại.");
    } finally {
      setBulkBusy(false);
    }
  }

  const tierBadgeColor: Record<string, string> = {
    Mythic: "#d92323",
    Elite: "#4ea6ff",
    Rare: "#8c57ff",
    Starter: "#7dd35c",
  };

  const statusLabel: Record<string, string> = {
    active: "Đang bán",
    draft: "Nháp",
    sold: "Đã bán",
    archived: "Ẩn",
  };

  return (
    <div className="admin-products-shell">
      <div className="admin-products-topbar">
        <div className="admin-products-title">
          <Link href="/admin" className="admin-back-link">
            <ArrowLeft size={16} />
            Dashboard
          </Link>
          <h1>Account management</h1>
          <span className="admin-products-count">{products.length} sản phẩm</span>
        </div>

        {mode === "list" && (
          <button type="button" className="admin-btn-primary" onClick={openCreate}>
            <Plus size={16} />
            Thêm sản phẩm
          </button>
        )}
      </div>

      {successMsg && <div className="admin-toast admin-toast-success">{successMsg}</div>}

      {(mode === "create" || mode === "edit") && (
        <div className="admin-form-panel">
          <div className="admin-form-head">
            <h2>{mode === "create" ? "Thêm sản phẩm mới" : `Chỉnh sửa: ${form.title}`}</h2>
            <button type="button" className="admin-form-close" onClick={closeForm}>
              <X size={20} />
            </button>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-section">
              <p className="admin-form-section-label">Thông tin card</p>

              <div className="admin-field-row">
                <label className="admin-field">
                  <span>Mã acc</span>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(event) => setField("code", event.target.value)}
                    placeholder="RD-1024"
                  />
                </label>
                <label className="admin-field">
                  <span>Tier</span>
                  <select value={form.tier} onChange={(event) => setField("tier", event.target.value)}>
                    {TIERS.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="admin-field">
                <span>Tên sản phẩm</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => setField("title", event.target.value)}
                  placeholder="Glacier X-Suit Vault"
                />
              </label>

              <div className="admin-field-row">
                <label className="admin-field">
                  <span>Slug</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(event) => setField("slug", event.target.value)}
                    placeholder="glacier-x-suit-vault"
                  />
                </label>
                <button
                  type="button"
                  className="admin-btn-secondary admin-slug-btn"
                  onClick={() => setField("slug", slugify(form.title))}
                >
                  Tạo từ tên
                </button>
              </div>

              <div className="admin-field-row">
                <label className="admin-field">
                  <span>Tag</span>
                  <input
                    type="text"
                    value={form.tag}
                    onChange={(event) => setField("tag", event.target.value)}
                    placeholder="Hot drop"
                  />
                </label>
                <label className="admin-field">
                  <span>Trạng thái</span>
                  <select
                    value={form.status}
                    onChange={(event) => setField("status", event.target.value)}
                  >
                    {STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="admin-field-row">
                <label className="admin-field">
                  <span>Giá hiển thị</span>
                  <input
                    type="text"
                    value={form.price}
                    onChange={(event) => setField("price", event.target.value)}
                    placeholder="6.900.000đ"
                  />
                </label>
                <label className="admin-field">
                  <span>Giá số</span>
                  <input
                    type="number"
                    value={form.priceValue}
                    onChange={(event) => setField("priceValue", event.target.value)}
                    placeholder="6900000"
                  />
                </label>
              </div>

              <label className="admin-field">
                <span>Mô tả card</span>
                <textarea
                  value={form.summary}
                  onChange={(event) => setField("summary", event.target.value)}
                  rows={2}
                  placeholder="Kho đồ nâng cấp, glacier, lobby đẹp..."
                />
              </label>
            </div>

            <div className="admin-form-section">
              <p className="admin-form-section-label">3 điểm nổi bật</p>

              <label className="admin-field admin-field-bullet admin-field-bullet-xe">
                <span>Skin xe</span>
                <input
                  type="text"
                  value={form.skinXe}
                  onChange={(event) => setField("skinXe", event.target.value)}
                  placeholder="3 skin xe Glacier"
                />
              </label>

              <label className="admin-field admin-field-bullet admin-field-bullet-giap">
                <span>Thánh giáp</span>
                <input
                  type="text"
                  value={form.thanhGiap}
                  onChange={(event) => setField("thanhGiap", event.target.value)}
                  placeholder="Thánh giáp mùa 16"
                />
              </label>

              <label className="admin-field admin-field-bullet admin-field-bullet-bape">
                <span>Đồ BAPE</span>
                <input
                  type="text"
                  value={form.doBAPE}
                  onChange={(event) => setField("doBAPE", event.target.value)}
                  placeholder="Full set BAPE x PUBG"
                />
              </label>

              <div className="admin-form-divider" />

              <p className="admin-form-section-label">Trang chi tiết</p>

              <label className="admin-field">
                <span>Mô tả ngắn</span>
                <textarea
                  value={form.shortDescription}
                  onChange={(event) => setField("shortDescription", event.target.value)}
                  rows={2}
                  placeholder="Tài khoản dành cho người mua thích skin hiếm..."
                />
              </label>

              <label className="admin-field">
                <span>Mô tả đầy đủ (HTML)</span>
                <textarea
                  value={form.descriptionHtml}
                  onChange={(event) => setField("descriptionHtml", event.target.value)}
                  rows={5}
                  placeholder="<h2>Tên acc</h2><p>Mô tả...</p>"
                  className="admin-field-mono"
                />
              </label>

              <label className="admin-field">
                <span>Ảnh (mỗi URL một dòng)</span>
                <textarea
                  value={form.images}
                  onChange={(event) => setField("images", event.target.value)}
                  rows={3}
                  placeholder={"/accounts/acc-01.svg\n/accounts/acc-02.svg"}
                  className="admin-field-mono"
                />
              </label>
            </div>
          </div>

          {error && <p className="admin-form-error">{error}</p>}

          <div className="admin-form-actions">
            <button type="button" className="admin-btn-secondary" onClick={closeForm}>
              Hủy
            </button>
            <button type="button" className="admin-btn-primary" onClick={handleSave} disabled={saving}>
              <Check size={16} />
              {saving ? "Đang lưu..." : mode === "create" ? "Tạo sản phẩm" : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      )}

      <div className="admin-list-toolbar">
        <div className="admin-search-box">
          <Search size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search theo tên, mã, tag hoặc điểm nổi bật..."
          />
        </div>

        <div className="admin-filter-group">
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            {STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <select value={tierFilter} onChange={(event) => setTierFilter(event.target.value)}>
            <option value="all">Tất cả tier</option>
            {TIERS.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-bulk-bar">
          <span>{selectedIds.length} mục đã chọn</span>
          <select value={bulkAction} onChange={(event) => setBulkAction(event.target.value)}>
            <option value="none">Bulk action</option>
            <option value="active">Chuyển sang Đang bán</option>
            <option value="draft">Chuyển sang Nháp</option>
            <option value="sold">Đánh dấu Đã bán</option>
            <option value="archived">Ẩn sản phẩm</option>
            <option value="delete">Xóa sản phẩm</option>
          </select>
          <button
            type="button"
            className="admin-btn-secondary"
            disabled={selectedIds.length === 0 || bulkAction === "none" || bulkBusy}
            onClick={handleBulkApply}
          >
            {bulkBusy ? "Đang áp dụng..." : "Apply"}
          </button>
        </div>
      </div>

      <div className="admin-list-summary">
        <span>Hiển thị {filteredProducts.length} sản phẩm</span>
        {(searchTerm || statusFilter !== "all" || tierFilter !== "all") && (
          <button
            type="button"
            className="admin-clear-filters"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setTierFilter("all");
            }}
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {error && mode === "list" && <p className="admin-form-error">{error}</p>}

      <div className="admin-products-table">
        <div className="admin-table-head admin-table-head-extended">
          <label className="admin-checkbox-cell">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAllVisible}
              aria-label="Chọn tất cả sản phẩm đang hiển thị"
            />
          </label>
          <span>Mã / Tên</span>
          <span>Tier</span>
          <span>3 điểm nổi bật</span>
          <span>Giá</span>
          <span>Trạng thái</span>
          <span>Hành động</span>
        </div>

        {filteredProducts.length === 0 && (
          <div className="admin-table-empty">
            Không có sản phẩm nào khớp với bộ lọc hiện tại.
          </div>
        )}

        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`admin-table-row admin-table-row-extended ${editingId === product.id ? "admin-table-row-active" : ""}`}
          >
            <label className="admin-checkbox-cell">
              <input
                type="checkbox"
                checked={selectedIds.includes(product.id)}
                onChange={() => toggleProductSelection(product.id)}
                aria-label={`Chọn ${product.title}`}
              />
            </label>

            <div className="admin-table-cell-name">
              <span className="admin-product-code">{product.code}</span>
              <strong>{product.title}</strong>
            </div>

            <div>
              <span
                className="admin-tier-badge"
                style={{ background: tierBadgeColor[product.tier] ?? "#555" }}
              >
                {product.tier}
              </span>
            </div>

            <div className="admin-bullets-cell">
              {product.skinXe && <span className="admin-bullet admin-bullet-xe">{product.skinXe}</span>}
              {product.thanhGiap && (
                <span className="admin-bullet admin-bullet-giap">{product.thanhGiap}</span>
              )}
              {product.doBAPE && <span className="admin-bullet admin-bullet-bape">{product.doBAPE}</span>}
              {!product.skinXe && !product.thanhGiap && !product.doBAPE && (
                <span className="admin-bullet-empty">—</span>
              )}
            </div>

            <div>
              <strong className="admin-price">{product.price}</strong>
            </div>

            <div>
              <span className={`admin-status-badge admin-status-${product.status ?? "active"}`}>
                {statusLabel[product.status ?? "active"] ?? product.status}
              </span>
            </div>

            <div className="admin-table-actions">
              <button
                type="button"
                className="admin-action-btn admin-action-edit"
                onClick={() => openEdit(product)}
                title="Chỉnh sửa"
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                className="admin-action-btn admin-action-delete"
                onClick={() => handleDelete(product.id)}
                disabled={deletingId === product.id}
                title="Xóa"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
