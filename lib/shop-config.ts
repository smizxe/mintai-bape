export const ZALO_CONTACT_URL = "https://zalo.me/84339877621";

export function normalizePaymentMode(mode?: string | null) {
  return mode?.toLowerCase() === "zalo" ? "zalo" : "automatic";
}

export function shouldUseZaloCheckout(mode?: string | null) {
  return normalizePaymentMode(mode) === "zalo";
}
