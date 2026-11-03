export const PAYMENT_OPERATIONS = [
  { key: "invoice_request", method: "POST", pattern: /^\/billing\/invoices\/[^/]+\/payments\/request\/?$/, search: "payments/request", label: "شروع پرداخت اینترنتی فاکتور" },
  { key: "invoice_verify", method: "POST", pattern: /^\/billing\/invoices\/[^/]+\/payments\/verify\/?$/, search: "payments/verify", label: "تأیید پرداخت اینترنتی فاکتور" },
  { key: "wallet_topup_request", method: "POST", pattern: /^\/billing\/wallet\/topups\/request\/?$/, search: "/billing/wallet/topups/request", label: "شروع افزایش موجودی کیف پول" },
  { key: "wallet_topup_verify", method: "POST", pattern: /^\/billing\/wallet\/topups\/[^/]+\/verify\/?$/, search: "topups/", label: "تأیید افزایش موجودی کیف پول" },
  { key: "invoice_wallet", method: "POST", pattern: /^\/billing\/invoices\/[^/]+\/payments\/wallet\/?$/, search: "payments/wallet", label: "پرداخت فاکتور از کیف پول" },
];

export const auditValue = (item, camel, snake) => item?.[camel] ?? item?.[snake];

export function paymentOperation(item = {}) {
  const method = String(auditValue(item, "httpMethod", "http_method") || "").toUpperCase();
  const rawPath = String(item.path || "");
  const path = rawPath.split("?")[0];
  return PAYMENT_OPERATIONS.find((operation) => operation.method === method && operation.pattern.test(path)) || {
    key: "other",
    label: item.action || "عملیات مالی",
    search: "",
  };
}

export function paymentStatusMessage(item = {}) {
  const statusCode = Number(auditValue(item, "statusCode", "status_code"));
  const errorCode = String(item.metadata?.error?.code || item.metadata?.errorCode || item.metadata?.code || "").toUpperCase();
  if (statusCode === 400) return "callback نامعتبر یا پرداخت لغوشده";
  if (statusCode === 403) return "نبود دسترسی";
  if (statusCode === 404) return "فاکتور یا شارژ پیدا نشد";
  if (statusCode === 409 && errorCode === "INSUFFICIENT_WALLET_BALANCE") return "موجودی ناکافی";
  if (statusCode === 502) return "خطا در ارتباط با درگاه";
  if (statusCode === 503) return "درگاه یا تنظیمات آن در دسترس نیست";
  if ([200, 201].includes(statusCode)) return "عملیات API موفق";
  return item.metadata?.error?.message || item.metadata?.errorMessage || item.metadata?.message || "—";
}

const SENSITIVE_KEY = /(authority|token|card|pan|cvv|credential|password|secret|authorization)/i;

export function sanitizeAuditData(value) {
  if (Array.isArray(value)) return value.map(sanitizeAuditData);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [
    key,
    SENSITIVE_KEY.test(key) ? "[REDACTED]" : sanitizeAuditData(child),
  ]));
}

