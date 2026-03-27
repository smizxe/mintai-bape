"use client";

import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Check,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { RichTextEditor } from "@/components/rich-text-editor";
import type { Product } from "@/lib/products-store";

/* ── constants ─────────────────────────────────────── */

const TIERS = ["Mythic", "Elite", "Rare", "Starter"];
const STATUSES = [
  { value: "active", label: "Đang bán" },
  { value: "draft", label: "Nháp" },
  { value: "sold", label: "Đã bán" },
  { value: "archived", label: "Ẩn" },
];

type FormTab = "card" | "detail";

type FormData = {
  code: string;
  title: string;
  slug: string;
  tag: string;
  tier: string;
  priceValue: string;
  skinXe: string;
  thanhGiap: string;
  doBAPE: string;
  summary: string;
  shortDescription: string;
  descriptionHtml: string;
  images: string[];
  status: string;
};

const EMPTY_FORM: FormData = {
  code: "",
  title: "",
  slug: "",
  tag: "",
  tier: "Elite",
  priceValue: "",
  skinXe: "",
  thanhGiap: "",
  doBAPE: "",
  summary: "",
  shortDescription: "",
  descriptionHtml: "",
  images: [],
  status: "active",
};

/* ── helpers ───────────────────────────────────────── */

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

function formatPriceLabel(value: string) {
  const numeric = Number(value.replace(/\D/g, "")) || 0;
  if (!numeric) {
    return "0đ";
  }

  return `${numeric.toLocaleString("vi-VN")}đ`;
}

function productToForm(product: Product): FormData {
  return {
    code: product.code,
    title: product.title,
    slug: product.slug,
    tag: product.tag,
    tier: product.tier,
    priceValue: String(product.priceValue),
    skinXe: product.skinXe ?? "",
    thanhGiap: product.thanhGiap ?? "",
    doBAPE: product.doBAPE ?? "",
    summary: product.summary,
    shortDescription: product.shortDescription,
    descriptionHtml: product.descriptionHtml,
    images: product.images ?? [],
    status: product.status ?? "active",
  };
}

/* ── Image uploader sub-component ──────────────────── */

function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (imageFiles.length === 0) return;

      setUploading(true);
      const body = new FormData();
      for (const f of imageFiles) body.append("files", f);

      try {
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = await res.json();
        if (res.ok && data.urls) {
          onChange([...images, ...data.urls]);
        } else {
          alert(data.error ?? "Upload thất bại");
        }
      } catch {
        alert("Lỗi kết nối khi upload");
      } finally {
        setUploading(false);
      }
    },
    [images, onChange],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
    },
    [uploadFiles],
  );

  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) uploadFiles(e.target.files);
      e.target.value = "";
    },
    [uploadFiles],
  );

  const removeImage = useCallback(
    (index: number) => {
      onChange(images.filter((_, i) => i !== index));
    },
    [images, onChange],
  );

  return (
    <div className="af-upload-zone">
      <div
        className={`af-dropzone ${dragOver ? "af-dropzone-active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleFileInput}
        />
        {uploading ? (
          <div className="af-dropzone-content">
            <Upload size={28} className="af-spin" />
            <span>Đang upload...</span>
          </div>
        ) : (
          <div className="af-dropzone-content">
            <ImagePlus size={28} />
            <span>Kéo thả ảnh vào đây hoặc click để chọn</span>
            <span className="af-dropzone-hint">PNG, JPG, WebP — tối đa 5MB mỗi ảnh</span>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="af-image-grid">
          {images.map((url, i) => (
            <div key={url + i} className="af-image-thumb">
              <Image
                src={url}
                alt={`Ảnh ${i + 1}`}
                width={120}
                height={120}
                className="af-thumb-img"
              />
              <button
                type="button"
                className="af-thumb-remove"
                onClick={() => removeImage(i)}
                title="Xóa ảnh"
              >
                <X size={14} />
              </button>
              {i === 0 && <span className="af-thumb-main">Ảnh chính</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main component ────────────────────────────────── */

export function AdminProductsClient({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [formTab, setFormTab] = useState<FormTab>("card");
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

  /* ── derived ── */

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

    const matchesStatus =
      statusFilter === "all" || (product.status ?? "active") === statusFilter;
    const matchesTier = tierFilter === "all" || product.tier === tierFilter;

    return matchesSearch && matchesStatus && matchesTier;
  });

  const allVisibleIds = filteredProducts.map((p) => p.id);
  const allVisibleSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => selectedIds.includes(id));

  /* ── actions ── */

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormTab("card");
    setMode("create");
    setError("");
  }

  function openEdit(product: Product) {
    setForm(productToForm(product));
    setEditingId(product.id);
    setFormTab("card");
    setMode("edit");
    setError("");
  }

  function closeForm() {
    setMode("list");
    setEditingId(null);
    setError("");
  }

  function setField(key: keyof FormData, value: string | string[]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setPriceValue(value: string) {
    const digitsOnly = value.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, priceValue: digitsOnly }));
  }

  function toggleProductSelection(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
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
      images: form.images,
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
        setProducts((prev) =>
          prev.map((p) => (p.id === editingId ? data : p)),
        );
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
    if (!window.confirm("Xóa sản phẩm này? Không thể hoàn tác.")) return;
    setDeletingId(id);

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        window.alert("Xóa thất bại. Thử lại.");
        return;
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setSelectedIds((prev) => prev.filter((x) => x !== id));
      setSuccessMsg("Đã xóa sản phẩm.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      window.alert("Lỗi kết nối.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleBulkApply() {
    if (bulkAction === "none" || selectedIds.length === 0) return;
    if (
      bulkAction === "delete" &&
      !window.confirm(`Xóa ${selectedIds.length} sản phẩm đã chọn?`)
    )
      return;

    setBulkBusy(true);
    setError("");

    try {
      if (bulkAction === "delete") {
        const results = await Promise.all(
          selectedIds.map((id) =>
            fetch(`/api/products/${id}`, { method: "DELETE" }),
          ),
        );
        const failed = results.some((r) => !r.ok);
        if (failed) {
          setError("Có sản phẩm chưa xóa được. Thử lại.");
        } else {
          setProducts((prev) =>
            prev.filter((p) => !selectedIds.includes(p.id)),
          );
          setSuccessMsg(`Đã xóa ${selectedIds.length} sản phẩm.`);
          setSelectedIds([]);
        }
      } else {
        const nextStatus = bulkAction;
        const selected = products.filter((p) => selectedIds.includes(p.id));

        const updated = await Promise.all(
          selected.map(async (p) => {
            const res = await fetch(`/api/products/${p.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: nextStatus }),
            });
            if (!res.ok) throw new Error("bulk-update-failed");
            return (await res.json()) as Product;
          }),
        );

        setProducts((prev) =>
          prev.map((p) => updated.find((u) => u.id === p.id) ?? p),
        );
        setSuccessMsg(`Đã cập nhật ${updated.length} sản phẩm.`);
        setSelectedIds([]);
      }

      setBulkAction("none");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("Bulk action thất bại. Kiểm tra rồi thử lại.");
    } finally {
      setBulkBusy(false);
    }
  }

  /* ── badge colors ── */

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

  /* ── render ── */

  return (
    <div className="admin-products-shell">
      {/* Top bar */}
      <div className="admin-products-topbar">
        <div className="admin-products-title">
          <Link href="/admin" className="admin-back-link">
            <ArrowLeft size={16} />
            Dashboard
          </Link>
          <h1>Account management</h1>
          <span className="admin-products-count">
            {products.length} sản phẩm
          </span>
        </div>
        {mode === "list" && (
          <button type="button" className="admin-btn-primary" onClick={openCreate}>
            <Plus size={16} />
            Thêm sản phẩm
          </button>
        )}
      </div>

      {successMsg && (
        <div className="admin-toast admin-toast-success">{successMsg}</div>
      )}

      {/* ────────── FORM PANEL ────────── */}
      {(mode === "create" || mode === "edit") && (
        <div className="af-panel">
          {/* Header */}
          <div className="af-header">
            <h2>
              {mode === "create"
                ? "Thêm sản phẩm mới"
                : `Chỉnh sửa: ${form.title || "..."}`}
            </h2>
            <button type="button" className="af-close" onClick={closeForm}>
              <X size={20} />
            </button>
          </div>

          {/* Tab toggle */}
          <div className="af-tabs">
            <button
              type="button"
              className={`af-tab ${formTab === "card" ? "af-tab-active" : ""}`}
              onClick={() => setFormTab("card")}
            >
              Thông tin Card
            </button>
            <button
              type="button"
              className={`af-tab ${formTab === "detail" ? "af-tab-active" : ""}`}
              onClick={() => setFormTab("detail")}
            >
              Trang chi tiết
            </button>
          </div>

          {/* ── TAB: Card ── */}
          {formTab === "card" && (
            <div className="af-body">
              <div className="af-row-2">
                <label className="af-field">
                  <span>Mã acc</span>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setField("code", e.target.value)}
                    placeholder="RD-1024"
                  />
                </label>
                <label className="af-field">
                  <span>Tier</span>
                  <select
                    value={form.tier}
                    onChange={(e) => setField("tier", e.target.value)}
                  >
                    {TIERS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="af-field">
                <span>Tên sản phẩm</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="Glacier X-Suit Vault"
                />
              </label>

              <div className="af-row-slug">
                <label className="af-field">
                  <span>Slug</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setField("slug", e.target.value)}
                    placeholder="glacier-x-suit-vault"
                  />
                </label>
                <button
                  type="button"
                  className="af-btn-ghost"
                  onClick={() => setField("slug", slugify(form.title))}
                >
                  Tạo từ tên
                </button>
              </div>

              <div className="af-row-2">
                <label className="af-field">
                  <span>Tag</span>
                  <input
                    type="text"
                    value={form.tag}
                    onChange={(e) => setField("tag", e.target.value)}
                    placeholder="Hot drop"
                  />
                </label>
                <label className="af-field">
                  <span>Trạng thái</span>
                  <select
                    value={form.status}
                    onChange={(e) => setField("status", e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="af-row-2">
                <label className="af-field">
                  <span>Giá bán</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.priceValue}
                    onChange={(e) => setPriceValue(e.target.value)}
                    placeholder="6900000"
                  />
                  <small className="af-field-hint">
                    Hiển thị ngoài shop: {formatPriceLabel(form.priceValue)}
                  </small>
                </label>
              </div>

              <label className="af-field">
                <span>Mô tả card</span>
                <textarea
                  value={form.summary}
                  onChange={(e) => setField("summary", e.target.value)}
                  rows={2}
                  placeholder="Mô tả ngắn gọn hiển thị trên card sản phẩm..."
                />
              </label>

              <div className="af-divider" />
              <p className="af-section-label">3 điểm nổi bật</p>

              <label className="af-field af-bullet af-bullet-xe">
                <span>Skin xe</span>
                <input
                  type="text"
                  value={form.skinXe}
                  onChange={(e) => setField("skinXe", e.target.value)}
                  placeholder="3 skin xe Glacier"
                />
              </label>

              <label className="af-field af-bullet af-bullet-giap">
                <span>Thánh giáp</span>
                <input
                  type="text"
                  value={form.thanhGiap}
                  onChange={(e) => setField("thanhGiap", e.target.value)}
                  placeholder="Thánh giáp mùa 16"
                />
              </label>

              <label className="af-field af-bullet af-bullet-bape">
                <span>Đồ BAPE</span>
                <input
                  type="text"
                  value={form.doBAPE}
                  onChange={(e) => setField("doBAPE", e.target.value)}
                  placeholder="Full set BAPE x PUBG"
                />
              </label>
            </div>
          )}

          {/* ── TAB: Detail ── */}
          {formTab === "detail" && (
            <div className="af-body">
              <label className="af-field">
                <span>Mô tả ngắn (hiển thị đầu trang chi tiết)</span>
                <textarea
                  value={form.shortDescription}
                  onChange={(e) =>
                    setField("shortDescription", e.target.value)
                  }
                  rows={3}
                  placeholder="Đoạn mô tả giới thiệu ngắn hiển thị ngay dưới tiêu đề sản phẩm..."
                />
              </label>

              <div className="af-field">
                <span className="af-field-label">Mô tả đầy đủ</span>
                <div className="af-quill-wrap">
                  <RichTextEditor
                    value={form.descriptionHtml}
                    onChange={(val: string) => setField("descriptionHtml", val)}
                  />
                </div>
              </div>

              <div className="af-divider" />

              <div className="af-field">
                <span className="af-field-label">Ảnh sản phẩm</span>
                <ImageUploader
                  images={form.images}
                  onChange={(urls) => setField("images", urls)}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          {error && <p className="af-error">{error}</p>}

          <div className="af-footer">
            <button type="button" className="af-btn-ghost" onClick={closeForm}>
              Hủy
            </button>
            <button
              type="button"
              className="admin-btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              <Check size={16} />
              {saving
                ? "Đang lưu..."
                : mode === "create"
                  ? "Tạo sản phẩm"
                  : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      )}

      {/* ────────── LIST TOOLBAR ────────── */}
      <div className="admin-list-toolbar">
        <div className="admin-search-box">
          <Search size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search theo tên, mã, tag hoặc điểm nổi bật..."
          />
        </div>

        <div className="admin-filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
          >
            <option value="all">Tất cả tier</option>
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-bulk-bar">
          <span>{selectedIds.length} mục đã chọn</span>
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
          >
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
            disabled={
              selectedIds.length === 0 || bulkAction === "none" || bulkBusy
            }
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

      {/* ────────── TABLE ────────── */}
      <div className="admin-products-table">
        <div className="admin-table-head admin-table-head-extended">
          <label className="admin-checkbox-cell">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAllVisible}
              aria-label="Chọn tất cả"
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
                style={{
                  background: tierBadgeColor[product.tier] ?? "#555",
                }}
              >
                {product.tier}
              </span>
            </div>

            <div className="admin-bullets-cell">
              {product.skinXe && (
                <span className="admin-bullet admin-bullet-xe">
                  {product.skinXe}
                </span>
              )}
              {product.thanhGiap && (
                <span className="admin-bullet admin-bullet-giap">
                  {product.thanhGiap}
                </span>
              )}
              {product.doBAPE && (
                <span className="admin-bullet admin-bullet-bape">
                  {product.doBAPE}
                </span>
              )}
              {!product.skinXe && !product.thanhGiap && !product.doBAPE && (
                <span className="admin-bullet-empty">—</span>
              )}
            </div>

            <div>
              <strong className="admin-price">{product.price}</strong>
            </div>

            <div>
              <span
                className={`admin-status-badge admin-status-${product.status ?? "active"}`}
              >
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
