export const GATEWAY_STATUS = {
  started: { label: "شروع‌شده", color: "warning" },
  succeeded: { label: "موفق", color: "success" },
  failed: { label: "ناموفق", color: "danger" },
};

export const INTENT_LABELS = { invoice_payment: "پرداخت فاکتور", wallet_topup: "افزایش موجودی کیف پول" };
export const OPERATION_LABELS = { request: "شروع پرداخت", verify: "تأیید پرداخت" };
const SENSITIVE_KEY = /(authority|token|signature|merchant|secret|card|pan|cvv|credential|authorization)/i;

export function gatewayValue(item, camel, snake) {
  return item?.[camel] ?? item?.[snake];
}

export function sanitizeGatewayData(value) {
  if (Array.isArray(value)) return value.map(sanitizeGatewayData);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, SENSITIVE_KEY.test(key) ? "[REDACTED]" : sanitizeGatewayData(child)]));
}

