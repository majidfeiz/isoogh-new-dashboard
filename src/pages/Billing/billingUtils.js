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
export const formatTomanDisplay = (value) => value == null ? "—" : `${(Number(value) / 10).toLocaleString("fa-IR")} تومان`;
export const moneyDisplay = (value) => `${formatRial(value)} (${formatTomanDisplay(value)})`;
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
export const billingErrorMessage = (error) => {
  const status = error?.response?.status;
  if (status === 401) return "نشست کاربری معتبر نیست؛ ابتدا دوباره وارد شوید.";
  if (status === 403) return "خارج از دامنه دسترسی";
  if (status === 409) return "برای این دوره یا پرداخت، رکورد تکراری وجود دارد.";
  if (status === 400 || status === 422) return error?.response?.data?.message || "اطلاعات با قواعد کسب‌وکار مطابقت ندارد.";
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
