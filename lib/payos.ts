import { PayOS } from "@payos/node";

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

export function getPayOSClient() {
  return new PayOS({
    clientId: getRequiredEnv("PAYOS_CLIENT_ID"),
    apiKey: getRequiredEnv("PAYOS_API_KEY"),
    checksumKey: getRequiredEnv("PAYOS_CHECKSUM_KEY"),
  });
}

export function buildAbsoluteUrl(baseUrl: string, path: string) {
  return new URL(path, baseUrl).toString();
}

export function buildPayOSDescription(orderCode: number) {
  return `MTB${String(orderCode).slice(-6)}`;
}

export function buildPayOSOrderCode() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return Number(`${timestamp}${random.toString().padStart(3, "0")}`.slice(0, 15));
}

export function getPayOSErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.startsWith("Missing ")) {
    return "Thanh toán chưa sẵn sàng. Vui lòng cấu hình khóa PayOS trước khi mở checkout.";
  }

  if (error && typeof error === "object") {
    const payload = error as { message?: string; data?: { desc?: string; message?: string } };
    return payload.data?.desc || payload.data?.message || payload.message || "Không thể tạo liên kết thanh toán lúc này.";
  }

  return "Không thể tạo liên kết thanh toán lúc này.";
}
