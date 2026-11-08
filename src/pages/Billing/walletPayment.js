const KEY = "isoogh.billing.pending-wallet-topup";

export const WALLET_TOPUP_PAYMENT_TYPE = "wallet_topup";
export const INVOICE_PAYMENT_TYPE = "invoice_payment";

export const savePendingWalletTopup = (value) => {
  const context = {
    topupId: Number(value?.topupId),
    schoolId: Number(value?.schoolId),
    verifyPath: String(value?.verifyPath || ""),
    authority: String(value?.authority || ""),
    paymentType: String(value?.paymentType || WALLET_TOPUP_PAYMENT_TYPE),
    provider: String(value?.provider || "").toLowerCase(),
    returnTo: String(value?.returnTo || ""),
  };
  if (!Number.isFinite(context.topupId) || !Number.isFinite(context.schoolId) || context.paymentType !== WALLET_TOPUP_PAYMENT_TYPE) throw new Error("اطلاعات شارژ کیف پول معتبر نیست.");
  sessionStorage.setItem(KEY, JSON.stringify(context));
};

export const getPendingWalletTopup = () => {
  try {
    const value = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (!value || value.paymentType !== WALLET_TOPUP_PAYMENT_TYPE || !Number.isFinite(Number(value.topupId)) || !Number.isFinite(Number(value.schoolId))) return null;
    return { ...value, topupId: Number(value.topupId), schoolId: Number(value.schoolId) };
  } catch { return null; }
};

export const clearPendingWalletTopup = () => sessionStorage.removeItem(KEY);

export const callbackPaymentType = (params, storedWallet, storedInvoice) => {
  const queryType = params.get("paymentType") || params.get("PaymentType");
  if (queryType) return queryType;
  if (storedWallet?.paymentType) return storedWallet.paymentType;
  if (storedInvoice?.paymentType) return storedInvoice.paymentType;
  return "";
};

export const parseWalletCallback = (params, stored = {}) => ({
  paymentType: params.get("paymentType") || params.get("PaymentType") || stored.paymentType || "",
  topupId: Number(params.get("topupId") || params.get("TopupId") || stored.topupId || 0),
  schoolId: Number(params.get("schoolId") || params.get("SchoolId") || stored.schoolId || 0),
  authority: params.get("Authority") || params.get("authority") || params.get("Token") || stored.authority || "",
  status: params.get("Status") || params.get("status") || params.get("ResCode") || "",
  provider: params.has("Token") || params.has("ResCode") ? "sadad" : stored.provider || "zarinpal",
});

export const isWalletCallbackCanceled = ({ provider, status }) => {
  if (status == null || status === "") return false;
  if (provider === "sadad") return !["0", "00"].includes(String(status));
  return String(status).toUpperCase() !== "OK";
};

export const walletCallbackIsComplete = (callback) => callback.paymentType === WALLET_TOPUP_PAYMENT_TYPE
  && Number.isFinite(callback.topupId) && callback.topupId > 0
  && Number.isFinite(callback.schoolId) && callback.schoolId > 0
  && Boolean(callback.authority);
