export const ACCOUNT_TYPES = Object.freeze({
  STUDENT: "student",
  ADVISER: "adviser",
});

export const ACCOUNT_TYPE_OPTIONS = Object.freeze([
  { value: ACCOUNT_TYPES.STUDENT, label: "دانش‌آموز" },
  { value: ACCOUNT_TYPES.ADVISER, label: "مشاور" },
]);

const normalizeDigits = (value) => String(value ?? "")
  .replace(/[\u06F0-\u06F9]/g, (digit) => String(digit.charCodeAt(0) - 1776))
  .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 1632));

const normalizedSchoolIds = (values) => (values || [])
  .map(Number)
  .filter((id) => Number.isInteger(id) && id > 0);

/** @typedef {"student" | "adviser"} AccountType */

export function toStudentCreatePayload(values = {}) {
  const ssn = normalizeDigits(values.ssn).trim();
  const email = String(values.email ?? "").trim();
  return {
    name: String(values.name ?? "").trim(),
    username: String(values.username ?? "").trim(),
    phone: normalizeDigits(values.phone).trim(),
    ...(ssn ? { ssn } : {}),
    ...(email ? { email } : {}),
    password: String(values.password ?? ""),
    accountType: ACCOUNT_TYPES.STUDENT,
    schoolIds: normalizedSchoolIds(values.schoolIds),
  };
}

export function toUserCreatePayload(values = {}, { includeSchoolIds = false } = {}) {
  const accountType = values.accountType;
  const payload = {
    name: String(values.name ?? "").trim(),
    username: String(values.username ?? "").trim(),
    phone: normalizeDigits(values.phone).trim(),
    ...(normalizeDigits(values.ssn).trim() ? { ssn: normalizeDigits(values.ssn).trim() } : {}),
    ...(String(values.email ?? "").trim() ? { email: String(values.email).trim() } : {}),
    password: String(values.password ?? ""),
    accountType,
    ...(includeSchoolIds ? { schoolIds: normalizedSchoolIds(values.schoolIds) } : {}),
  };
  if (accountType === ACCOUNT_TYPES.ADVISER) payload.isSuperAdviser = Boolean(values.isSuperAdviser);
  return payload;
}

export function validateCreateUserPayload(payload = {}, { requireSchoolIds = false } = {}) {
  const errors = {};
  const name = String(payload.name ?? "").trim();
  const username = String(payload.username ?? "").trim();
  const phone = normalizeDigits(payload.phone).trim();
  const password = String(payload.password ?? "");
  const ssn = normalizeDigits(payload.ssn).trim();
  if (name.length < 2 || name.length > 255) errors.name = ["نام باید بین ۲ تا ۲۵۵ کاراکتر باشد"];
  if (!/^[A-Za-z][A-Za-z0-9._]{2,}$/.test(username)) errors.username = ["نام کاربری باید با حرف انگلیسی شروع شود، حداقل ۳ کاراکتر باشد و فقط حروف انگلیسی، عدد، نقطه و زیرخط داشته باشد"];
  if (!phone || phone.length > 20) errors.phone = ["شماره تماس الزامی است و حداکثر می‌تواند ۲۰ کاراکتر باشد"];
  if (password.length < 6) errors.password = ["رمز عبور باید حداقل ۶ کاراکتر باشد"];
  if (ssn && !/^\d{10}$/.test(ssn)) errors.ssn = ["کد ملی باید دقیقاً ۱۰ رقم باشد"];
  if (![ACCOUNT_TYPES.STUDENT, ACCOUNT_TYPES.ADVISER].includes(payload.accountType)) errors.accountType = ["نوع حساب ارسالی نامعتبر است؛ صفحه را تازه‌سازی کنید"];
  if (requireSchoolIds && (!Array.isArray(payload.schoolIds) || payload.schoolIds.length === 0 || payload.schoolIds.some((id) => !Number.isInteger(id) || id < 1))) {
    errors.schoolIds = ["انتخاب حداقل یک مجموعه الزامی است"];
  }
  return errors;
}

export function assertCreateUserPayload(payload, options) {
  const fieldErrors = validateCreateUserPayload(payload, options);
  if (!Object.keys(fieldErrors).length) return payload;
  const error = new Error(Object.values(fieldErrors).flat().join("، "));
  error.name = "CreateUserValidationError";
  error.fieldErrors = fieldErrors;
  throw error;
}

export function createdUserMatchesStudentContract(user = {}, expectedSchoolIds = []) {
  const roleNames = (user.roles || []).map((role) => String(role?.name || role?.role?.name || role));
  const actualSchoolIds = (user.schoolIds || user.schools || []).map((school) => Number(school?.id ?? school?.schoolId ?? school?.school_id ?? school));
  return user.accountType === ACCOUNT_TYPES.STUDENT
    && roleNames.includes(ACCOUNT_TYPES.STUDENT)
    && expectedSchoolIds.every((id) => actualSchoolIds.includes(Number(id)));
}
