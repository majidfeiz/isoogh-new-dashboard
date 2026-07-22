import moment from "moment-jalaali";

export const EMPTY_FILTERS = {
  schoolId: "",
  supportFormId: "",
  studentSearch: "",
  adviserSearch: "",
  dateFrom: "",
  dateTo: "",
};

export const normalizeLatinDigits = (value) => String(value ?? "")
  .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
  .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));

export function parseAnswerSheetQuery(searchParams) {
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.max(1, Number(searchParams.get("limit")) || 10);
  return {
    page,
    limit,
    schoolId: searchParams.get("school_id") || "",
    supportFormId: searchParams.get("support_form_id") || "",
    studentSearch: searchParams.get("student_search") || "",
    adviserSearch: searchParams.get("adviser_search") || "",
    dateFrom: normalizeLatinDigits(searchParams.get("date_from") || ""),
    dateTo: normalizeLatinDigits(searchParams.get("date_to") || ""),
  };
}

export function serializeAnswerSheetQuery(query) {
  const params = new URLSearchParams();
  if (query.page > 1) params.set("page", String(query.page));
  if (query.limit !== 10) params.set("limit", String(query.limit));
  if (query.schoolId) params.set("school_id", query.schoolId);
  if (query.supportFormId) params.set("support_form_id", query.supportFormId);
  if (query.studentSearch) params.set("student_search", query.studentSearch.trim());
  if (query.adviserSearch) params.set("adviser_search", query.adviserSearch.trim());
  if (query.dateFrom) params.set("date_from", normalizeLatinDigits(query.dateFrom));
  if (query.dateTo) params.set("date_to", normalizeLatinDigits(query.dateTo));
  return params;
}

export const formatJalaliDateTime = (value) => {
  if (!value) return "—";
  const date = moment(value);
  return date.isValid() ? date.format("jYYYY/jMM/jDD HH:mm") : "—";
};

export const formatDuration = (value) => {
  if (value == null || value === "") return "—";
  const seconds = Number(value);
  if (!Number.isFinite(seconds)) return String(value);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = Math.floor(seconds % 60);
  return [hours, minutes, rest].map((part) => String(part).padStart(2, "0")).join(":");
};

export function parseFilename(value, fallback) {
  const utf8 = String(value || "").match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8?.[1]) {
    try { return decodeURIComponent(utf8[1].replace(/^"|"$/g, "")); } catch { return utf8[1]; }
  }
  const normal = String(value || "").match(/filename="?([^";]+)"?/i);
  return normal?.[1] || fallback;
}

export function getErrorMessage(error, context = "اطلاعات") {
  const status = error?.response?.status;
  if (status === 403) return "شما اجازه مشاهده این مجموعه یا اطلاعات آن را ندارید.";
  if (status === 404) return `${context} مورد نظر یافت نشد.`;
  if (status === 400 || status === 422) {
    const message = error?.response?.data?.message;
    return Array.isArray(message) ? message.join("، ") : message || "فیلترهای واردشده معتبر نیستند.";
  }
  return `دریافت ${context} با خطا مواجه شد. لطفاً دوباره تلاش کنید.`;
}
