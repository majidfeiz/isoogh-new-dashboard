const USER_WRITABLE_FIELDS = ["name", "email", "username", "ssn", "phone"];

export function normalizeDigits(value) {
  return String(value ?? "").replace(/[\u06F0-\u06F9]/g, (digit) => String(digit.charCodeAt(0) - 1776)).replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 1632));
}

export function isAdminUser(user) {
  return (user?.roles || []).some((role) => {
    const name = String(role?.name || role?.slug || role?.label || "").toLowerCase();
    return ["admin", "super_admin", "super-admin", "super admin"].includes(name);
  });
}

export function buildUserPayload(form = {}, { isEdit = false, isAdmin = false } = {}) {
  const payload = USER_WRITABLE_FIELDS.reduce((result, field) => {
    const value = field === "phone" || field === "ssn" ? normalizeDigits(form[field]).trim() : String(form[field] ?? "").trim();
    result[field] = value || null;
    return result;
  }, {});
  if (form.password?.trim()) payload.password = form.password.trim();
  if (!isEdit) payload.accountType = form.accountType;
  if (form.accountType === "adviser") payload.isSuperAdviser = Boolean(form.isSuperAdviser);
  if (isAdmin) payload.schoolIds = (form.schoolIds || []).map(Number).filter((id) => Number.isInteger(id) && id > 0);
  return payload;
}

export function userDetailsToForm(user = {}) {
  return {
    name: user.name || "",
    email: user.email || "",
    username: user.username || "",
    ssn: user.ssn || "",
    phone: user.phone || "",
    password: "",
    confirmPassword: "",
    accountType: user.accountType || "",
    isSuperAdviser: user.accountType === "adviser" && Boolean(user.isSuperAdviser),
    schoolIds: (user.schoolIds || []).map(String),
  };
}

export function validateUserForm(form = {}, { isEdit = false, isAdmin = false } = {}) {
  const errors = {};
  const username = String(form.username ?? "").trim();
  const password = String(form.password ?? "");
  const phone = normalizeDigits(form.phone).trim();
  const ssn = normalizeDigits(form.ssn).trim();
  const email = String(form.email ?? "").trim();
  if (!String(form.name ?? "").trim()) errors.name = ["نام الزامی است"];
  if (!username) errors.username = ["نام کاربری الزامی است"];
  if ((!isEdit || password) && password.trim().length < 6) errors.password = ["رمز عبور باید حداقل ۶ کاراکتر باشد"];
  if (password && password !== String(form.confirmPassword ?? "")) errors.confirmPassword = ["تکرار رمز عبور با رمز عبور مطابقت ندارد"];
  if (!phone) errors.phone = ["شماره موبایل الزامی است"];
  if (ssn && !/^\d{10}$/.test(ssn)) errors.ssn = ["کد ملی باید دقیقاً ۱۰ رقم باشد"];
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = ["ایمیل معتبر وارد کنید"];
  if (!["student", "adviser"].includes(form.accountType)) errors.accountType = ["نوع کاربر را انتخاب کنید"];
  if (isAdmin && !(form.schoolIds || []).length) errors.schoolIds = ["انتخاب حداقل یک مجموعه الزامی است"];
  return errors;
}

export function getUserApiErrors(error) {
  const body = error?.response?.data?.data || error?.response?.data || {};
  const fieldErrors = {};
  if (body.errors && !Array.isArray(body.errors) && typeof body.errors === "object") {
    Object.entries(body.errors).forEach(([field, messages]) => { fieldErrors[field] = Array.isArray(messages) ? messages : [String(messages)]; });
  }
  const rawMessage = Array.isArray(body.message) ? body.message.join("، ") : body.message;
  const message = String(rawMessage || "");
  const lower = message.toLowerCase();
  if (!fieldErrors.username && lower.includes("username")) fieldErrors.username = ["این نام کاربری قبلاً ثبت شده است"];
  if (!fieldErrors.phone && lower.includes("phone")) fieldErrors.phone = ["این شماره موبایل قبلاً ثبت شده است"];
  if (!fieldErrors.schoolIds && (lower.includes("school") || message.includes("مدرسه"))) fieldErrors.schoolIds = [message || "مجموعه انتخاب‌شده معتبر نیست"];
  if (!fieldErrors.accountType && lower.includes("accounttype")) fieldErrors.accountType = ["نوع کاربر بعد از ساخت قابل تغییر نیست"];
  const statusMessages = { 400: "اطلاعات فرم معتبر نیست.", 403: "شما مجوز انجام این عملیات را ندارید.", 404: "کاربر یا مجموعه موردنظر یافت نشد.", 409: "اطلاعات واردشده با یک رکورد موجود تداخل دارد." };
  return { fieldErrors, message: message || statusMessages[error?.response?.status] || "ذخیره اطلاعات کاربر انجام نشد. لطفاً دوباره تلاش کنید." };
}
