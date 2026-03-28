"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Plus, Trash2, X } from "lucide-react";
import type { AccountType } from "@/lib/account-types-store";
import { ACCOUNT_TYPE_CLASS_OPTIONS } from "@/lib/account-types-store";

type FormState = {
  name: string;
  className: string;
  sortOrder: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  className: "tier-starter",
  sortOrder: "0",
};

export function AccountTypesClient({
  initialAccountTypes,
}: {
  initialAccountTypes: AccountType[];
}) {
  const [items, setItems] = useState(initialAccountTypes);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.name.localeCompare(b.name, "vi");
      }),
    [items],
  );

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
  }

  function openEdit(item: AccountType) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      className: item.className,
      sortOrder: String(item.sortOrder),
    });
    setError("");
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    try {
      const payload = {
        name: form.name.trim(),
        className: form.className,
        sortOrder: Number(form.sortOrder) || 0,
      };

      if (!payload.name) {
        setError("Bạn cần nhập tên loại acc.");
        return;
      }

      const response = editingId
        ? await fetch(`/api/account-types/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/account-types", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Không lưu được loại acc.");
        return;
      }

      if (editingId) {
        setItems((prev) => prev.map((item) => (item.id === editingId ? data : item)));
        setSuccess("Đã cập nhật loại acc.");
      } else {
        setItems((prev) => [...prev, data]);
        setSuccess("Đã thêm loại acc mới.");
      }

      resetForm();
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Lỗi kết nối. Thử lại.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Xóa loại acc này?")) return;

    const response = await fetch(`/api/account-types/${id}`, { method: "DELETE" });
    if (!response.ok) {
      window.alert("Không xóa được loại acc.");
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
  }

  return (
    <div className="admin-products-shell">
      <div className="admin-products-topbar">
        <div className="admin-products-title">
          <Link href="/admin" className="admin-back-link">
            <ArrowLeft size={16} />
            Tổng quan
          </Link>
          <h1>Kiểm soát loại acc</h1>
          <span className="admin-products-count">{items.length} loại acc</span>
        </div>
      </div>

      {success && <div className="admin-toast admin-toast-success">{success}</div>}

      <div className="type-manager-grid">
        <section className="af-panel">
          <div className="af-header">
            <h2>{editingId ? "Chỉnh sửa loại acc" : "Thêm loại acc mới"}</h2>
            {editingId && (
              <button type="button" className="af-close" onClick={resetForm}>
                <X size={20} />
              </button>
            )}
          </div>

          <div className="af-body">
            <label className="af-field">
              <span>Tên loại acc</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Acc xịn"
              />
            </label>

            <div className="af-row-2">
              <label className="af-field">
                <span>Màu badge</span>
                <select
                  value={form.className}
                  onChange={(e) => setForm((prev) => ({ ...prev, className: e.target.value }))}
                >
                  {ACCOUNT_TYPE_CLASS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="af-field">
                <span>Thứ tự</span>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
                  placeholder="0"
                />
              </label>
            </div>

            <div className="type-preview-row">
              <span>Xem trước</span>
              <span className={`tier-badge ${form.className}`}>{form.name || "Loai acc"}</span>
            </div>
          </div>

          {error && <p className="af-error">{error}</p>}

          <div className="af-footer">
            <button type="button" className="af-btn-ghost" onClick={resetForm}>
              Hủy
            </button>
            <button type="button" className="admin-btn-primary" onClick={handleSave} disabled={saving}>
              <Plus size={16} />
              {saving ? "Đang lưu..." : editingId ? "Lưu loại acc" : "Thêm loại acc"}
            </button>
          </div>
        </section>

        <section className="dashboard-table-card">
          <div className="dashboard-card-head">
            <h2>Danh sách loại acc</h2>
            <span>Dùng các loại này trong form tạo sản phẩm.</span>
          </div>

          <div className="type-list">
            {sortedItems.map((item) => (
              <div key={item.id} className="type-row">
                <div className="type-row-main">
                  <span className={`tier-badge ${item.className}`}>{item.name}</span>
                  <span className="type-row-meta">Thu tu {item.sortOrder}</span>
                </div>

                <div className="type-row-actions">
                  <button type="button" className="admin-icon-btn" onClick={() => openEdit(item)}>
                    <Pencil size={15} />
                  </button>
                  <button type="button" className="admin-icon-btn" onClick={() => handleDelete(item.id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}

            {sortedItems.length === 0 && (
              <div className="admin-empty-state">
                Chưa có loại acc nào. Hãy tạo loại đầu tiên để dùng trong quản lý sản phẩm.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
