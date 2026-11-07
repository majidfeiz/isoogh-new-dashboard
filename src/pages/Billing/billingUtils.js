export const BILLING_ROLES = ["admin", "super_manager", "manager"];
export const BILLING_ADMIN_ROLES = ["admin", "super_manager"];

export const getRoleNames = (user) => (user?.roles || [])
  .map((role) => typeof role === "string" ? role : role?.name)
  .filter(Boolean);

export const hasBillingRole = (user, allowed = BILLING_ROLES) =>
  getRoleNames(user).some((role) => allowed.includes(role));

export const isBillingManager = (user) => getRoleNames(user).includes("manager");
export const getUserSchoolId = (user) => user?.schoolId ?? user?.school_id ?? user?.school?.id ??
  (Array.isArray(user?.schools) && user.schools.length === 1 ? user.schools[0]?.id : "");

export const formatRial = (value) => value == null ? "—" : `${Number(value).toLocaleString("fa-IR")} ریال`;
export const normalizePositiveIntegerInput = (input) => String(input ?? "")
  .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
  .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
  .replace(/[^0-9]/g, "")
  .replace(/^0+(?=\d)/, "");
export const formatIntegerInput = (input) => {
  const normalized = normalizePositiveIntegerInput(input);
  return normalized ? Number(normalized).toLocaleString("fa-IR") : "";
};
const PERSIAN_ONES = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه", "ده", "یازده", "دوازده", "سیزده", "چهارده", "پانزده", "شانزده", "هفده", "هجده", "نوزده"];
const PERSIAN_TENS = ["", "", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"];
const PERSIAN_HUNDREDS = ["", "صد", "دویست", "سیصد", "چهارصد", "پانصد", "ششصد", "هفتصد", "هشتصد", "نهصد"];
const PERSIAN_SCALES = ["", "هزار", "میلیون", "میلیارد", "تریلیون"];
const threeDigitsToWords = (value) => {
  const parts = [];
  const hundreds = Math.floor(value / 100);
  const rest = value % 100;
  if (hundreds) parts.push(PERSIAN_HUNDREDS[hundreds]);
  if (rest) parts.push(rest < 20 ? PERSIAN_ONES[rest] : [PERSIAN_TENS[Math.floor(rest / 10)], PERSIAN_ONES[rest % 10]].filter(Boolean).join(" و "));
  return parts.join(" و ");
};
export const numberToPersianWords = (input) => {
  const value = Number(String(input ?? "").replace(/[٬,]/g, ""));
  if (!Number.isSafeInteger(value) || value < 0) return "";
  if (value === 0) return "صفر";
  const parts = [];
  let remaining = value;
  let scale = 0;
  while (remaining > 0 && scale < PERSIAN_SCALES.length) {
    const chunk = remaining % 1000;
    if (chunk) parts.unshift(`${threeDigitsToWords(chunk)}${PERSIAN_SCALES[scale] ? ` ${PERSIAN_SCALES[scale]}` : ""}`);
    remaining = Math.floor(remaining / 1000);
    scale += 1;
  }
  return remaining > 0 ? "" : parts.join(" و ");
};
export const formatTomanDisplay = (value) => value == null ? "—" : `${(Number(value) / 10).toLocaleString("fa-IR")} تومان`;
export const moneyDisplay = (value) => `${formatRial(value)} (${formatTomanDisplay(value)})`;
export const walletPaymentSummary = (balanceValue, invoiceAmountValue) => {
  const balance = Number(balanceValue) || 0;
  const invoiceAmount = Math.max(0, Number(invoiceAmountValue) || 0);
  const shortfall = Math.max(0, invoiceAmount - balance);
  return { balance, invoiceAmount, shortfall, canPay: balance >= invoiceAmount && balance >= 0, balanceAfter: balance >= invoiceAmount ? balance - invoiceAmount : null };
};
export const insufficientWalletBalance = (error) => {
  const responseData = error?.response?.data;
  const data = responseData?.data?.code ? responseData.data : responseData;
  if (error?.response?.status !== 409 || data?.code !== "INSUFFICIENT_WALLET_BALANCE") return null;
  return { balance: Number(data.balance) || 0, requiredAmount: Number(data.requiredAmount) || 0, shortfall: Math.max(0, Number(data.shortfall) || 0), invoiceId: data.invoiceId ?? data.invoice?.id ?? null, message: data.message || "موجودی کیف پول کافی نیست." };
};
export const tomanToRial = (value) => Math.round(Number(String(value || "").replace(/,/g, "")) * 10);
export const calculateCapacitySteps = (target, includedStudents, capacityStepPercent) => {
  const base = Number(includedStudents);
  const stepSize = base * Number(capacityStepPercent) / 100;
  if (!Number.isFinite(base) || !Number.isFinite(stepSize) || stepSize <= 0 || Number(target) <= base) return 0;
  return Math.ceil((Number(target) - base) / stepSize);
};

export const validateInvoiceAdjustment = ({ subtotal, discountAmount, hasManualAmount, adjustmentNote }) => {
  const discount = Number(discountAmount) || 0;
  const discountValid = Number.isInteger(discount) && discount >= 0 && (discount === 0 || discount < Number(subtotal));
  const reasonRequired = Boolean(hasManualAmount || discount > 0);
  return { discountValid, reasonRequired, reasonValid: !reasonRequired || String(adjustmentNote || "").trim().length >= 3 };
};

export const invalidateCapacityReport = () => window.dispatchEvent(new CustomEvent("adviser-form-capacity:refresh"));

export const formatJalali = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).format(date);
};

export const STATUS_LABELS = { unpaid: "پرداخت‌نشده", paid: "پرداخت‌شده", expired: "منقضی" };
export const INVOICE_TYPE_LABELS = { adviser_subscription: "اشتراک مشاور", custom: "سفارشی", capacity_topup: "افزایش ظرفیت" };
const backendErrorMessage = (error) => {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message.filter(Boolean).join("، ");
  if (typeof message === "string" && message.trim()) return message;
  const code = error?.response?.data?.code;
  return typeof code === "string" && code.trim() ? code : "";
};
export const billingErrorMessage = (error) => {
  const status = error?.response?.status;
  if (status === 401) return "نشست کاربری معتبر نیست؛ ابتدا دوباره وارد شوید.";
  if (status === 403) return "خارج از دامنه دسترسی";
  if (status === 409) return backendErrorMessage(error) || "عملیات به‌دلیل تعارض با وضعیت فعلی انجام نشد.";
  if (status === 400 || status === 422) return backendErrorMessage(error) || "اطلاعات با قواعد کسب‌وکار مطابقت ندارد.";
  if (status === 502) return "ارتباط با درگاه پرداخت موقتاً برقرار نشد؛ دوباره تلاش کنید.";
  return "دریافت اطلاعات با خطا روبه‌رو شد.";
};

let billingRevision = 0;
const listeners = new Set();
export const invalidateBillingCache = () => {
  billingRevision += 1;
  listeners.forEach((listener) => listener(billingRevision));
};
export const subscribeBillingCache = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const getBillingRevision = () => billingRevision;
