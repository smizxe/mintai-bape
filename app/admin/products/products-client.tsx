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
  { value: "active", label: "Äang bÃ¡n" },
  { value: "draft", label: "NhÃ¡p" },
  { value: "sold", label: "ÄÃ£ bÃ¡n" },
  { value: "archived", label: "áº¨n" },
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

function formatPriceLabel(value: string) {
  const numeric = Number(value.replace(/\D/g, "")) || 0;
  if (!numeric) return "0Ä‘";
  return `${numeric.toLocaleString("vi-VN")}Ä‘`;
}

function validateProductCodeInput(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "Bạn cần nhập ID acc.";
  }

  if (!/^[A-Za-z0-9-]+$/.test(trimmed)) {
    return "ID acc chỉ được gồm chữ, số và dấu gạch ngang (-), không dùng khoảng trắng hay ký tự đặc biệt.";
  }

  return null;
}

function productToForm(product: AdminProduct): ProductForm {
  return {
    code: product.code,
    title: product.title,
    slug: product.code,
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
          alert(data.error ?? "Upload tháº¥t báº¡i");
        }
      } catch {
        alert("Lá»—i káº¿t ná»‘i khi upload");
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
            <span>Äang upload...</span>
          </div>
        ) : (
          <div className="af-dropzone-content">
            <ImagePlus size={28} />
            <span>KÃ©o tháº£ áº£nh vÃ o Ä‘Ã¢y hoáº·c click Ä‘á»ƒ chá»n</span>
            <span className="af-dropzone-hint">PNG, JPG, WebP - tá»‘i Ä‘a 5MB má»—i áº£nh</span>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="af-image-grid">
          {images.map((url, index) => (
            <div key={`${url}-${index}`} className="af-image-thumb">
              <Image
                src={url}
                alt={`áº¢nh ${index + 1}`}
                width={120}
                height={120}
                className="af-thumb-img"
              />
              <button
                type="button"
                className="af-thumb-remove"
                onClick={() => removeImage(index)}
                title="XÃ³a áº£nh"
              >
                <X size={14} />
              </button>
              {index === 0 && <span className="af-thumb-main">áº¢nh chÃ­nh</span>}
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
          slug: product.id,
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
    active: "Äang bÃ¡n",
    draft: "NhÃ¡p",
    sold: "ÄÃ£ bÃ¡n",
    archived: "áº¨n",
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

    const codeError = validateProductCodeInput(form.code);
    if (codeError) {
      setError(codeError);
      setSaving(false);
      return;
    }

    if (!form.title.trim()) {
      setError("Bạn cần nhập tên sản phẩm.");
      setSaving(false);
      return;
    }

    if (
      requiresAccountInfo(form.priceValue) &&
      (!form.accountLoginEmail.trim() || !form.accountLoginPassword.trim())
    ) {
      setError("Acc dÆ°á»›i 30 triá»‡u cáº§n cÃ³ email vÃ  máº­t kháº©u Ä‘á»ƒ giao tá»± Ä‘á»™ng sau khi khÃ¡ch thanh toÃ¡n.");
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
        setError(data.error ?? "LÆ°u sáº£n pháº©m tháº¥t báº¡i.");
        return;
      }

      if (mode === "create") {
        setProducts((prev) => [data, ...prev]);
        setSuccessMsg("Táº¡o sáº£n pháº©m thÃ nh cÃ´ng.");
      } else {
        setProducts((prev) => prev.map((product) => (product.id === editingId ? data : product)));
        setSuccessMsg("Cáº­p nháº­t sáº£n pháº©m thÃ nh cÃ´ng.");
      }

      closeForm();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("Lá»—i káº¿t ná»‘i. Thá»­ láº¡i.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("XÃ³a sáº£n pháº©m nÃ y? KhÃ´ng thá»ƒ hoÃ n tÃ¡c.")) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!response.ok) {
        window.alert("XÃ³a tháº¥t báº¡i. Thá»­ láº¡i.");
        return;
      }

      setProducts((prev) => prev.filter((product) => product.id !== id));
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
      setSuccessMsg("ÄÃ£ xÃ³a sáº£n pháº©m.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      window.alert("Lá»—i káº¿t ná»‘i.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleBulkApply() {
    if (bulkAction === "none" || selectedIds.length === 0) return;
    if (bulkAction === "delete" && !window.confirm(`XÃ³a ${selectedIds.length} sáº£n pháº©m Ä‘Ã£ chá»n?`)) {
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
          setError("CÃ³ sáº£n pháº©m chÆ°a xÃ³a Ä‘Æ°á»£c. Thá»­ láº¡i.");
        } else {
          setProducts((prev) => prev.filter((product) => !selectedIds.includes(product.id)));
          setSelectedIds([]);
          setSuccessMsg(`ÄÃ£ xÃ³a ${results.length} sáº£n pháº©m.`);
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
        setSuccessMsg(`ÄÃ£ cáº­p nháº­t ${updated.length} sáº£n pháº©m.`);
      }

      setBulkAction("none");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("HÃ nh Ä‘á»™ng hÃ ng loáº¡t tháº¥t báº¡i. Kiá»ƒm tra rá»“i thá»­ láº¡i.");
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
            Tá»•ng quan
          </Link>
          <h1>Quáº£n lÃ½ account</h1>
          <span className="admin-products-count">{products.length} sáº£n pháº©m</span>
        </div>

        {mode === "list" && (
          <button type="button" className="admin-btn-primary" onClick={openCreate}>
            <Plus size={16} />
            ThÃªm sáº£n pháº©m
          </button>
        )}
      </div>

      {successMsg && <div className="admin-toast admin-toast-success">{successMsg}</div>}

      {(mode === "create" || mode === "edit") && (
        <div className="af-panel">
          <div className="af-header">
            <h2>{mode === "create" ? "ThÃªm sáº£n pháº©m má»›i" : `Chá»‰nh sá»­a: ${form.title || "..."}`}</h2>
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
              ThÃ´ng tin card
            </button>
            <button
              type="button"
              className={`af-tab ${formTab === "detail" ? "af-tab-active" : ""}`}
              onClick={() => setFormTab("detail")}
            >
              Trang chi tiáº¿t
            </button>
            <button
              type="button"
              className={`af-tab ${formTab === "account" ? "af-tab-active" : ""}`}
              onClick={() => setFormTab("account")}
            >
              ThÃ´ng tin tÃ i khoáº£n
            </button>
          </div>

          {formTab === "card" && (
            <div className="af-body">
              <div className="af-row-2">
                <label className="af-field">
                  <span>ID acc</span>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(event) => {
                      const nextCode = event.target.value;
                      setField("code", nextCode);
                      setField("slug", nextCode);
                    }}
                    placeholder="BST-82"
                  />
                  <small className="af-field-hint">Chỉ dùng chữ, số và dấu gạch ngang (-).</small>
                </label>

                <label className="af-field">
                  <span>Loáº¡i acc</span>
                  <input
                    list="account-type-options"
                    type="text"
                    value={form.tier}
                    onChange={(event) => setField("tier", event.target.value)}
                    placeholder="Acc xá»‹n"
                  />
                  <datalist id="account-type-options">
                    {accountTypeOptions.map((item) => (
                      <option key={item.id} value={item.name} />
                    ))}
                  </datalist>
                </label>
              </div>

              <label className="af-field">
                <span>TÃªn sáº£n pháº©m</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => setField("title", event.target.value)}
                  placeholder="Glacier X-Suit Vault"
                />
              </label>

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
                  <span>Tráº¡ng thÃ¡i</span>
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
                <span>GiÃ¡ bÃ¡n</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.priceValue}
                  onChange={(event) => setPriceValue(event.target.value)}
                  placeholder="6900000"
                />
                <small className="af-field-hint">Hiá»ƒn thá»‹ ngoÃ i shop: {formatPriceLabel(form.priceValue)}</small>
              </label>

              <label className="af-field">
                <span>MÃ´ táº£ card</span>
                <textarea
                  value={form.summary}
                  onChange={(event) => setField("summary", event.target.value)}
                  rows={2}
                  placeholder="MÃ´ táº£ ngáº¯n gá»n hiá»ƒn thá»‹ trÃªn card sáº£n pháº©m..."
                />
              </label>

              <div className="af-divider" />
              <p className="af-section-label">3 Ä‘iá»ƒm ná»•i báº­t</p>

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
                <span>ThÃ¡nh giÃ¡p</span>
                <input
                  type="text"
                  value={form.thanhGiap}
                  onChange={(event) => setField("thanhGiap", event.target.value)}
                  placeholder="ThÃ¡nh giÃ¡p mÃ¹a 16"
                />
              </label>

              <label className="af-field af-bullet af-bullet-bape">
                <span>Äá»“ BAPE</span>
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
                <span>MÃ´ táº£ ngáº¯n</span>
                <textarea
                  value={form.shortDescription}
                  onChange={(event) => setField("shortDescription", event.target.value)}
                  rows={3}
                  placeholder="Äoáº¡n mÃ´ táº£ ngáº¯n hiá»ƒn thá»‹ á»Ÿ Ä‘áº§u trang chi tiáº¿t..."
                />
              </label>

              <div className="af-field">
                <span className="af-field-label">MÃ´ táº£ Ä‘áº§y Ä‘á»§</span>
                <div className="af-quill-wrap">
                  <RichTextEditor
                    value={form.descriptionHtml}
                    onChange={(value: string) => setField("descriptionHtml", value)}
                  />
                </div>
              </div>

              <div className="af-divider" />

              <div className="af-field">
                <span className="af-field-label">áº¢nh sáº£n pháº©m</span>
                <ImageUploader images={form.images} onChange={(urls) => setField("images", urls)} />
              </div>
            </div>
          )}

          {formTab === "account" && (
            <div className="af-body">
              <div className="af-field af-note-block">
                <span className="af-field-label">ThÃ´ng tin Ä‘Äƒng nháº­p giao cho khÃ¡ch</span>
                <small className="af-field-hint">
                  {requiresAccountInfo(form.priceValue)
                    ? "Acc dÆ°á»›i 30 triá»‡u báº¯t buá»™c cÃ³ email vÃ  máº­t kháº©u Ä‘á»ƒ há»‡ thá»‘ng gá»­i tá»± Ä‘á»™ng sau khi thanh toÃ¡n."
                    : "Acc trÃªn 30 triá»‡u cÃ³ thá»ƒ Ä‘á»ƒ trá»‘ng vÃ¬ khÃ¡ch sáº½ Ä‘Æ°á»£c chuyá»ƒn sang Zalo Ä‘á»ƒ chá»‘t trá»±c tiáº¿p."}
                </small>
              </div>

              <label className="af-field">
                <span>Email tÃ i khoáº£n</span>
                <input
                  type="text"
                  value={form.accountLoginEmail}
                  onChange={(event) => setField("accountLoginEmail", event.target.value)}
                  placeholder="accpubg@example.com"
                />
              </label>

              <label className="af-field">
                <span>Máº­t kháº©u tÃ i khoáº£n</span>
                <input
                  type="text"
                  value={form.accountLoginPassword}
                  onChange={(event) => setField("accountLoginPassword", event.target.value)}
                  placeholder="Nháº­p máº­t kháº©u bÃ n giao cho khÃ¡ch"
                />
              </label>
            </div>
          )}

          {error && <p className="af-error">{error}</p>}

          <div className="af-footer">
            <button type="button" className="af-btn-ghost" onClick={closeForm}>
              Há»§y
            </button>
            <button type="button" className="admin-btn-primary" onClick={handleSave} disabled={saving}>
              <Check size={16} />
              {saving ? "Äang lÆ°u..." : mode === "create" ? "Táº¡o sáº£n pháº©m" : "LÆ°u thay Ä‘á»•i"}
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
            placeholder="TÃ¬m theo tÃªn, mÃ£, loáº¡i acc hoáº·c Ä‘iá»ƒm ná»•i báº­t..."
          />
        </div>

        <div className="admin-filter-group">
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">Táº¥t cáº£ tráº¡ng thÃ¡i</option>
            {STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <select value={tierFilter} onChange={(event) => setTierFilter(event.target.value)}>
            <option value="all">Táº¥t cáº£ loáº¡i acc</option>
            {accountTypeOptions.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-bulk-bar">
          <span>{selectedIds.length} má»¥c Ä‘Ã£ chá»n</span>
          <select value={bulkAction} onChange={(event) => setBulkAction(event.target.value)}>
            <option value="none">HÃ nh Ä‘á»™ng hÃ ng loáº¡t</option>
            <option value="active">Chuyá»ƒn sang Äang bÃ¡n</option>
            <option value="draft">Chuyá»ƒn sang NhÃ¡p</option>
            <option value="sold">ÄÃ¡nh dáº¥u ÄÃ£ bÃ¡n</option>
            <option value="archived">áº¨n sáº£n pháº©m</option>
            <option value="delete">XÃ³a sáº£n pháº©m</option>
          </select>

          <button
            type="button"
            className="admin-btn-secondary"
            disabled={selectedIds.length === 0 || bulkAction === "none" || bulkBusy}
            onClick={handleBulkApply}
          >
            {bulkBusy ? "Äang Ã¡p dá»¥ng..." : "Ãp dá»¥ng"}
          </button>
        </div>
      </div>

      <div className="admin-list-summary">
        <span>Hiá»ƒn thá»‹ {filteredProducts.length} sáº£n pháº©m</span>
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
            XÃ³a bá»™ lá»c
          </button>
        )}
      </div>

      {error && mode === "list" && <p className="admin-form-error">{error}</p>}

      <div className="admin-products-table">
        <div className="admin-table-head admin-table-head-extended">
          <label className="admin-checkbox-cell">
            <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAllVisible} />
          </label>
          <span>HÃ nh Ä‘á»™ng</span>
          <span>MÃ£ / TÃªn</span>
          <span>Loáº¡i acc</span>
          <span>3 Ä‘iá»ƒm ná»•i báº­t</span>
          <span>GiÃ¡</span>
          <span>Tráº¡ng thÃ¡i</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="admin-empty-state">KhÃ´ng cÃ³ sáº£n pháº©m nÃ o khá»›p vá»›i bá»™ lá»c hiá»‡n táº¡i.</div>
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


