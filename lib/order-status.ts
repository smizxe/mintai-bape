export function getOrderStatusLabel(status: string) {
  if (status === "paid") return "Đã thanh toán";
  if (status === "cancelled") return "Đã hủy";
  if (status === "pending") return "Chờ thanh toán";
  return "Đang xử lý";
}
