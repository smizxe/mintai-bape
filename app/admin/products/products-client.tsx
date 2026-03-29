"use client";

import { useCallback, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import Image from "next/image";
import Link from "next/link";
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
import type { AccountType } from "@/lib/account-types-store";
import type { AdminProduct } from "@/lib/products-store";
import { PAYOS_MAX_AMOUNT } from "@/lib/shop-config";

const STATUSES = [
  { value: "active", label: "Đang bán" },
  { value: "draft", label: "Nháp" },
  { value: "sold", label: "Đã bán" },
  { value: "archived", label: "Ẩn" },
] as const;

type FormTab = "card" | "detail" | "account";

type ProductForm = {
  code: string;
  title: string;
  slug: string;
  tag: string;
  tier: string;
  priceValue: string;
  skinXe: string;
  thanhGiap: string;
  doBAPE: string;
  accountLoginEmail: string;
  accountLoginPassword: string;
  summary: string;
  shortDescription: string;
  descriptionHtml: string;
  images: string[];
  status: string;
};

const EMPTY_FORM: ProductForm = {
  code: "",
  title: "",
  slug: "",
  tag: "",
  tier: "",
  priceValue: "",
  skinXe: "",
  thanhGiap: "",
  doBAPE: "",
  accountLoginEmail: "",
  accountLoginPassword: "",
  summary: "",
  shortDescription: "",
  descriptionHtml: "",
  images: [],
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

function formatPriceLabel(value: string) {
  const numeric = Number(value.replace(/\D/g, "")) || 0;
  if (!numeric) return "0đ";
  return `${numeric.toLocaleString("vi-VN")}đ`;
}

function productToForm(product: AdminProduct): ProductForm {
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
    accountLoginEmail: product.accountLoginEmail ?? "",
    accountLoginPassword: product.accountLoginPassword ?? "",
    summary: product.summary,
    shortDescription: product.shortDescription,
    descriptionHtml: product.descriptionHtml,
    images: product.images ?? [],
    status: product.status ?? "active",
  };
}

function tierBadgeColor(className?: string) {
  const map: Record<string, string> = {
    "tier-mythic": "#d92323",
    "tier-elite": "#4ea6ff",
    "tier-rare": "#8c57ff",
    "tier-starter": "#7dd35c",
  };

  return map[className || "tier-starter"] || "#7dd35c";
}

function requiresAccountInfo(priceValue: string) {
  const numeric = Number(priceValue.replace(/\D/g, "")) || 0;
  return numeric > 0 && numeric <= PAYOS_MAX_AMOUNT;
}

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
      const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
      if (imageFiles.length === 0) return;

      setUploading(true);
      const body = new FormData();
      for (const file of imageFiles) body.append("files", file);

      try {
        const response = await fetch("/api/upload", { method: "POST", body });
        const data = await response.json();

        if (response.ok && Array.isArray(data.urls)) {
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
    (event: DragEvent) => {
      event.preventDefault();
      setDragOver(false);
      if (event.dataTransfer.files.length) {
        uploadFiles(event.dataTransfer.files);
      }
    },
    [uploadFiles],
  );

  const handleFileInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.files?.length) {
        uploadFiles(event.target.files);
      }
      event.target.value = "";
    },
    [uploadFiles],
  );

  const removeImage = useCallback(
    (index: number) => {
      onChange(images.filter((_, itemIndex) => itemIndex !== index));
    },
    [images, onChange],
  );

  return (
    <div className="af-upload-zone">
      <div
        className={`af-dropzone ${dragOver ? "af-dropzone-active" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
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
            <span className="af-dropzone-hint">PNG, JPG, WebP - tối đa 5MB mỗi ảnh</span>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="af-image-grid">
          {images.map((url, index) => (
            <div key={`${url}-${index}`} className="af-image-thumb">
              <Image
                src={url}
                alt={`Ảnh ${index + 1}`}
                width={120}
                height={120}
                className="af-thumb-img"
              />
              <button
                type="button"
                className="af-thumb-remove"
                onClick={() => removeImage(index)}
                title="Xóa ảnh"
              >
                <X size={14} />
              </button>
              {index === 0 && <span className="af-thumb-main">Ảnh chính</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminProductsClient({
  initialProducts,
  initialAccountTypes,
}: {
  initialProducts: AdminProduct[];
  initialAccountTypes: AccountType[];
}) {
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTab, setFormTab] = useState<FormTab>("card");
  const [form, setForm] = useState<ProductForm>({
    ...EMPTY_FORM,
    tier: initialAccountTypes[0]?.name ?? "",
  });
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

  const accountTypeOptions = useMemo(() => {
    const map = new Map<string, AccountType>();

    initialAccountTypes.forEach((item) => {
      map.set(item.name, item);
    });

    products.forEach((product) => {
      if (product.tier && !map.has(product.tier)) {
        map.set(product.tier, {
          id: product.id,
          name: product.tier,
          slug: product.tier,
          className: product.tierClass || "tier-starter",
          sortOrder: 999,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.name.localeCompare(b.name, "vi");
    });
  }, [initialAccountTypes, products]);

  const accountTypeClassMap = useMemo(
    () => Object.fromEntries(accountTypeOptions.map((item) => [item.name, item.className])),
    [accountTypeOptions],
  );

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.title.toLowerCase().includes(query) ||
        product.code.toLowerCase().includes(query) ||
        product.summary.toLowerCase().includes(query) ||
        product.tag.toLowerCase().includes(query) ||
        product.tier.toLowerCase().includes(query) ||
        product.skinXe?.toLowerCase().includes(query) ||
        product.thanhGiap?.toLowerCase().includes(query) ||
        product.doBAPE?.toLowerCase().includes(query);

      const matchesStatus = statusFilter === "all" || (product.status ?? "active") === statusFilter;
      const matchesType = tierFilter === "all" || product.tier === tierFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [products, searchTerm, statusFilter, tierFilter]);

  const allVisibleIds = filteredProducts.map((product) => product.id);
  const allVisibleSelected =
    allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));

  const statusLabel: Record<string, string> = {
    active: "Đang bán",
    draft: "Nháp",
    sold: "Đã bán",
    archived: "Ẩn",
  };

  function setField<Key extends keyof ProductForm>(key: Key, value: ProductForm[Key]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setPriceValue(value: string) {
    setForm((prev) => ({ ...prev, priceValue: value.replace(/\D/g, "") }));
  }

  function openCreate() {
    setForm({
      ...EMPTY_FORM,
      tier: accountTypeOptions[0]?.name ?? "",
    });
    setEditingId(null);
    setFormTab("card");
    setMode("create");
    setError("");
  }

  function openEdit(product: AdminProduct) {
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

  function toggleProductSelection(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id],
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
    setSaving(true);
    setError("");

    if (!form.code.trim() || !form.title.trim() || !form.slug.trim()) {
      setError("Bạn cần nhập mã acc, tên sản phẩm và slug.");
      setSaving(false);
      return;
    }

    if (
      requiresAccountInfo(form.priceValue) &&
      (!form.accountLoginEmail.trim() || !form.accountLoginPassword.trim())
    ) {
      setError("Acc dưới 30 triệu cần có email và mật khẩu để giao tự động sau khi khách thanh toán.");
      setSaving(false);
      setFormTab("account");
      return;
    }

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
        setError(data.error ?? "Lưu sản phẩm thất bại.");
        return;
      }

      if (mode === "create") {
        setProducts((prev) => [data, ...prev]);
        setSuccessMsg("Tạo sản phẩm thành công.");
      } else {
        setProducts((prev) => prev.map((product) => (product.id === editingId ? data : product)));
        setSuccessMsg("Cập nhật sản phẩm thành công.");
      }

      closeForm();
      setTimeout(() => setSuccessMsg(""), 3000);
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
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!response.ok) {
        window.alert("Xóa thất bại. Thử lại.");
        return;
      }

      setProducts((prev) => prev.filter((product) => product.id !== id));
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
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
          setSelectedIds([]);
          setSuccessMsg(`Đã xóa ${results.length} sản phẩm.`);
        }
      } else {
        const selectedProducts = products.filter((product) => selectedIds.includes(product.id));
        const updated = await Promise.all(
          selectedProducts.map(async (product) => {
            const response = await fetch(`/api/products/${product.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: bulkAction }),
            });

            if (!response.ok) throw new Error("bulk-update-failed");
            return (await response.json()) as AdminProduct;
          }),
        );

        setProducts((prev) => prev.map((product) => updated.find((item) => item.id === product.id) ?? product));
        setSelectedIds([]);
        setSuccessMsg(`Đã cập nhật ${updated.length} sản phẩm.`);
      }

      setBulkAction("none");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("Hành động hàng loạt thất bại. Kiểm tra rồi thử lại.");
    } finally {
      setBulkBusy(false);
    }
  }

  return (
    <div className="admin-products-shell">
      <div className="admin-products-topbar">
        <div className="admin-products-title">
          <Link href="/admin" className="admin-back-link">
            <ArrowLeft size={16} />
            Tổng quan
          </Link>
          <h1>Quản lý account</h1>
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
        <div className="af-panel">
          <div className="af-header">
            <h2>{mode === "create" ? "Thêm sản phẩm mới" : `Chỉnh sửa: ${form.title || "..."}`}</h2>
            <button type="button" className="af-close" onClick={closeForm}>
              <X size={20} />
            </button>
          </div>

          <div className="af-tabs">
            <button
              type="button"
              className={`af-tab ${formTab === "card" ? "af-tab-active" : ""}`}
              onClick={() => setFormTab("card")}
            >
              Thông tin card
            </button>
            <button
              type="button"
              className={`af-tab ${formTab === "detail" ? "af-tab-active" : ""}`}
              onClick={() => setFormTab("detail")}
            >
              Trang chi tiết
            </button>
            <button
              type="button"
              className={`af-tab ${formTab === "account" ? "af-tab-active" : ""}`}
              onClick={() => setFormTab("account")}
            >
              Thông tin tài khoản
            </button>
          </div>

          {formTab === "card" && (
            <div className="af-body">
              <div className="af-row-2">
                <label className="af-field">
                  <span>Mã acc</span>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(event) => setField("code", event.target.value)}
                    placeholder="RD-1024"
                  />
                </label>

                <label className="af-field">
                  <span>Loại acc</span>
                  <input
                    list="account-type-options"
                    type="text"
                    value={form.tier}
                    onChange={(event) => setField("tier", event.target.value)}
                    placeholder="Acc xịn"
                  />
                  <datalist id="account-type-options">
                    {accountTypeOptions.map((item) => (
                      <option key={item.id} value={item.name} />
                    ))}
                  </datalist>
                </label>
              </div>

              <label className="af-field">
                <span>Tên sản phẩm</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => setField("title", event.target.value)}
                  placeholder="Glacier X-Suit Vault"
                />
              </label>

              <div className="af-row-slug">
                <label className="af-field">
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
                    onChange={(event) => setField("tag", event.target.value)}
                    placeholder="Hot drop"
                  />
                </label>

                <label className="af-field">
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

              <label className="af-field">
                <span>Giá bán</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.priceValue}
                  onChange={(event) => setPriceValue(event.target.value)}
                  placeholder="6900000"
                />
                <small className="af-field-hint">Hiển thị ngoài shop: {formatPriceLabel(form.priceValue)}</small>
              </label>

              <label className="af-field">
                <span>Mô tả card</span>
                <textarea
                  value={form.summary}
                  onChange={(event) => setField("summary", event.target.value)}
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
                  onChange={(event) => setField("skinXe", event.target.value)}
                  placeholder="3 skin xe Glacier"
                />
              </label>

              <label className="af-field af-bullet af-bullet-giap">
                <span>Thánh giáp</span>
                <input
                  type="text"
                  value={form.thanhGiap}
                  onChange={(event) => setField("thanhGiap", event.target.value)}
                  placeholder="Thánh giáp mùa 16"
                />
              </label>

              <label className="af-field af-bullet af-bullet-bape">
                <span>Đồ BAPE</span>
                <input
                  type="text"
                  value={form.doBAPE}
                  onChange={(event) => setField("doBAPE", event.target.value)}
                  placeholder="Full set BAPE x PUBG"
                />
              </label>
            </div>
          )}

          {formTab === "detail" && (
            <div className="af-body">
              <label className="af-field">
                <span>Mô tả ngắn</span>
                <textarea
                  value={form.shortDescription}
                  onChange={(event) => setField("shortDescription", event.target.value)}
                  rows={3}
                  placeholder="Đoạn mô tả ngắn hiển thị ở đầu trang chi tiết..."
                />
              </label>

              <div className="af-field">
                <span className="af-field-label">Mô tả đầy đủ</span>
                <div className="af-quill-wrap">
                  <RichTextEditor
                    value={form.descriptionHtml}
                    onChange={(value: string) => setField("descriptionHtml", value)}
                  />
                </div>
              </div>

              <div className="af-divider" />

              <div className="af-field">
                <span className="af-field-label">Ảnh sản phẩm</span>
                <ImageUploader images={form.images} onChange={(urls) => setField("images", urls)} />
              </div>
            </div>
          )}

          {formTab === "account" && (
            <div className="af-body">
              <div className="af-field af-note-block">
                <span className="af-field-label">Thông tin đăng nhập giao cho khách</span>
                <small className="af-field-hint">
                  {requiresAccountInfo(form.priceValue)
                    ? "Acc dưới 30 triệu bắt buộc có email và mật khẩu để hệ thống gửi tự động sau khi thanh toán."
                    : "Acc trên 30 triệu có thể để trống vì khách sẽ được chuyển sang Zalo để chốt trực tiếp."}
                </small>
              </div>

              <label className="af-field">
                <span>Email tài khoản</span>
                <input
                  type="text"
                  value={form.accountLoginEmail}
                  onChange={(event) => setField("accountLoginEmail", event.target.value)}
                  placeholder="accpubg@example.com"
                />
              </label>

              <label className="af-field">
                <span>Mật khẩu tài khoản</span>
                <input
                  type="text"
                  value={form.accountLoginPassword}
                  onChange={(event) => setField("accountLoginPassword", event.target.value)}
                  placeholder="Nhập mật khẩu bàn giao cho khách"
                />
              </label>
            </div>
          )}

          {error && <p className="af-error">{error}</p>}

          <div className="af-footer">
            <button type="button" className="af-btn-ghost" onClick={closeForm}>
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
            placeholder="Tìm theo tên, mã, loại acc hoặc điểm nổi bật..."
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
            <option value="all">Tất cả loại acc</option>
            {accountTypeOptions.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-bulk-bar">
          <span>{selectedIds.length} mục đã chọn</span>
          <select value={bulkAction} onChange={(event) => setBulkAction(event.target.value)}>
            <option value="none">Hành động hàng loạt</option>
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
            {bulkBusy ? "Đang áp dụng..." : "Áp dụng"}
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
            <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAllVisible} />
          </label>
          <span>Hành động</span>
          <span>Mã / Tên</span>
          <span>Loại acc</span>
          <span>3 điểm nổi bật</span>
          <span>Giá</span>
          <span>Trạng thái</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="admin-empty-state">Không có sản phẩm nào khớp với bộ lọc hiện tại.</div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="admin-table-row admin-table-row-extended">
              <label className="admin-checkbox-cell">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(product.id)}
                  onChange={() => toggleProductSelection(product.id)}
                />
              </label>

              <div className="admin-row-actions">
                <button type="button" className="admin-icon-btn" onClick={() => openEdit(product)}>
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  className="admin-icon-btn"
                  onClick={() => handleDelete(product.id)}
                  disabled={deletingId === product.id}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div>
                <span className="admin-code">{product.code}</span>
                <strong>{product.title}</strong>
              </div>

              <div>
                <span
                  className="admin-tier-badge"
                  style={{ background: tierBadgeColor(accountTypeClassMap[product.tier] || product.tierClass) }}
                >
                  {product.tier}
                </span>
              </div>

              <div className="admin-highlights">
                {product.skinXe && <span>{product.skinXe}</span>}
                {product.thanhGiap && <span>{product.thanhGiap}</span>}
                {product.doBAPE && <span>{product.doBAPE}</span>}
              </div>

              <div className="admin-price">{product.price}</div>

              <div>
                <span className={`admin-status admin-status-${product.status || "active"}`}>
                  {statusLabel[product.status || "active"]}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
