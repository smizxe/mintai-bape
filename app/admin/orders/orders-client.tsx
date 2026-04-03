"use client";

import { useMemo, useState } from "react";
import { Eye, X } from "lucide-react";
import type { AdminOrderView } from "@/lib/commerce-store";
import { getOrderStatusLabel } from "@/lib/order-status";

function formatDate(value: string) {
  return new Date(value).toLocaleString("vi-VN");
}

function formatCodes(order: AdminOrderView) {
  return order.items.map((item) => item.productCode || item.title).join(", ");
}

export function AdminOrdersClient({ initialOrders }: { initialOrders: AdminOrderView[] }) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const selectedOrder = useMemo(
    () => initialOrders.find((order) => order.id === selectedOrderId) ?? null,
    [initialOrders, selectedOrderId],
  );

  return (
    <>
      <section className="dashboard-table-card">
        <div className="dashboard-card-head">
          <h2>Quản lý đơn hàng</h2>
          <span>Chỉ hiển thị những đơn đã bán thành công để bạn kiểm tra khách mua và thông tin giao acc.</span>
        </div>

        <div className="admin-orders-summary">
          <strong>{initialOrders.length} đơn đã bán</strong>
          <span>Tất cả đơn trong bảng này đều đã thanh toán và có thể mở chi tiết để kiểm tra thông tin acc.</span>
        </div>

        <div className="admin-products-table admin-orders-table">
          <div className="admin-table-head admin-orders-head">
            <span>Khách mua</span>
            <span>ID acc</span>
            <span>Giá</span>
            <span>Trạng thái</span>
            <span>Hành động</span>
          </div>

          {initialOrders.length === 0 ? (
            <div className="admin-empty-state">Chưa có đơn hàng nào đã bán.</div>
          ) : (
            initialOrders.map((order) => (
              <div key={order.id} className="admin-table-row admin-orders-row">
                <div className="admin-table-cell-name">
                  <strong>{order.buyerName}</strong>
                  <span>{order.buyerEmail}</span>
                </div>
                <div className="admin-orders-codes">
                  <strong>{formatCodes(order)}</strong>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                <div className="admin-orders-price">
                  <strong>{order.totalLabel}</strong>
                  <span>{order.itemCount} acc</span>
                </div>
                <div>
                  <span className="admin-status admin-status-sold">{getOrderStatusLabel(order.status)}</span>
                </div>
                <div className="admin-row-actions">
                  <button
                    type="button"
                    className="admin-action-btn admin-action-edit"
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <Eye size={16} />
                    <span>Xem</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {selectedOrder ? (
        <div className="admin-order-modal-backdrop" onClick={() => setSelectedOrderId(null)}>
          <div className="admin-order-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-order-modal-head">
              <div>
                <h3>Chi tiết đơn hàng</h3>
                <span>
                  Đơn #{selectedOrder.id.slice(-6).toUpperCase()} • {formatDate(selectedOrder.createdAt)}
                </span>
              </div>

              <button
                type="button"
                className="admin-icon-btn"
                aria-label="Đóng chi tiết đơn"
                onClick={() => setSelectedOrderId(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-order-modal-grid">
              <section className="admin-order-panel">
                <h4>Khách mua</h4>
                <div className="admin-order-kv">
                  <span>Người mua</span>
                  <strong>{selectedOrder.buyerName}</strong>
                </div>
                <div className="admin-order-kv">
                  <span>Email</span>
                  <strong>{selectedOrder.buyerEmail}</strong>
                </div>
                <div className="admin-order-kv">
                  <span>Trạng thái</span>
                  <strong>{getOrderStatusLabel(selectedOrder.status)}</strong>
                </div>
                <div className="admin-order-kv">
                  <span>Tổng chi phí</span>
                  <strong>{selectedOrder.totalLabel}</strong>
                </div>
              </section>

              <section className="admin-order-panel">
                <h4>Thông tin acc</h4>
                {selectedOrder.items.map((item) => (
                  <article key={item.id} className="admin-order-item">
                    <div className="admin-order-item-top">
                      <strong>{item.title}</strong>
                      <span>{item.lineTotalLabel}</span>
                    </div>
                    <div className="admin-order-kv">
                      <span>ID acc</span>
                      <strong>{item.productCode || "Không có"}</strong>
                    </div>
                    <div className="admin-order-kv">
                      <span>Email acc</span>
                      <code>{item.accountLoginEmail || "Chưa có"}</code>
                    </div>
                    <div className="admin-order-kv">
                      <span>Mật khẩu</span>
                      <code>{item.accountLoginPassword || "Chưa có"}</code>
                    </div>
                  </article>
                ))}
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
