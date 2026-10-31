const PAYMENT_CONTEXT_KEY = "isoogh.billing.pending-payment";
export const PAYMENT_PROVIDERS = ["zarinpal", "sadad"];

export const validatePaymentRequestResult = (value) => {
  const provider = String(value?.provider || "").toLowerCase();
  const authority = typeof value?.authority === "string" ? value.authority.trim() : "";
  const paymentUrl = typeof value?.paymentUrl === "string" ? value.paymentUrl.trim() : "";
  const invoiceNumber = typeof value?.invoiceNumber === "string" ? value.invoiceNumber.trim() : "";
  const amount = Number(value?.amount);
  let parsedUrl;
  try { parsedUrl = new URL(paymentUrl); } catch { parsedUrl = null; }
  if (!PAYMENT_PROVIDERS.includes(provider) || !authority || !invoiceNumber || !Number.isFinite(amount) || amount <= 0 || !parsedUrl || !["https:", "http:"].includes(parsedUrl.protocol)) throw new Error("پاسخ درگاه پرداخت معتبر نیست.");
  return { ...value, provider, authority, paymentUrl: parsedUrl.toString(), amount, invoiceNumber };
};

export const savePendingPayment = ({ invoiceId, schoolId, provider, authority }) => {
  const context = { invoiceId: String(invoiceId), schoolId: Number(schoolId), provider, authority };
  if (!context.invoiceId || !Number.isFinite(context.schoolId) || !PAYMENT_PROVIDERS.includes(provider) || !authority) throw new Error("اطلاعات پرداخت برای ذخیره‌سازی معتبر نیست.");
  sessionStorage.setItem(PAYMENT_CONTEXT_KEY, JSON.stringify(context));
};

export const getPendingPayment = () => {
  try {
    const value = JSON.parse(sessionStorage.getItem(PAYMENT_CONTEXT_KEY) || "null");
    if (!value?.invoiceId || !Number.isFinite(Number(value?.schoolId)) || !PAYMENT_PROVIDERS.includes(value?.provider) || !value?.authority) return null;
    return { ...value, schoolId: Number(value.schoolId) };
  } catch { return null; }
};

export const clearPendingPayment = () => sessionStorage.removeItem(PAYMENT_CONTEXT_KEY);

export const parseProviderCallback = (provider, searchParams) => provider === "zarinpal"
  ? { authority: searchParams.get("Authority") || "", status: searchParams.get("Status") || undefined }
  : provider === "sadad"
    ? { authority: searchParams.get("Token") || "", status: searchParams.get("ResCode") || undefined, orderId: searchParams.get("OrderId") || undefined }
    : { authority: "", status: undefined };

export const isCanceledCallback = (provider, status) => provider === "zarinpal"
  ? String(status || "").toUpperCase() !== "OK"
  : provider === "sadad" ? !["0", "00"].includes(String(status ?? "")) : true;

export const sanitizeCallbackUrl = () => window.history.replaceState({}, document.title, "/billing/payment/callback");
