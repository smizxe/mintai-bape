export const PAYOS_MAX_AMOUNT = 30_000_000;
export const ZALO_CONTACT_URL = "https://zalo.me/84339877621";

export function shouldUseZaloCheckout(amount: number) {
  return amount > PAYOS_MAX_AMOUNT;
}
