import { paymentOperation, paymentStatusMessage, sanitizeAuditData } from "./paymentAuditUtils.js";

test.each([
  ["/billing/invoices/12/payments/request", "شروع پرداخت اینترنتی فاکتور"],
  ["/billing/invoices/12/payments/verify", "تأیید پرداخت اینترنتی فاکتور"],
  ["/billing/wallet/topups/request", "شروع افزایش موجودی کیف پول"],
  ["/billing/wallet/topups/73/verify", "تأیید افزایش موجودی کیف پول"],
  ["/billing/invoices/12/payments/wallet", "پرداخت فاکتور از کیف پول"],
])("maps %s to a readable payment operation", (path, label) => {
  expect(paymentOperation({ http_method: "POST", path }).label).toBe(label);
});

test("explains insufficient wallet balance", () => {
  expect(paymentStatusMessage({ status_code: 409, metadata: { error: { code: "INSUFFICIENT_WALLET_BALANCE" } } })).toBe("موجودی ناکافی");
});

test("redacts payment credentials recursively and preserves existing redaction", () => {
  expect(sanitizeAuditData({ authority: "secret", nested: { Token: "token", note: "[REDACTED]", amount: 5 } })).toEqual({ authority: "[REDACTED]", nested: { Token: "[REDACTED]", note: "[REDACTED]", amount: 5 } });
});

