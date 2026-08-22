export const STATUS_CONFIG = {
  pending: { label: "در انتظار", color: "secondary" },
  processing: { label: "در حال پردازش", color: "info" },
  success: { label: "موفق", color: "success" },
  failed: { label: "ناموفق", color: "danger" },
};

export const FILTER_KEYS = ["search", "status", "importType", "schoolId", "createdBy", "from", "to", "sortBy", "sortOrder", "page", "limit"];
export const ROW_FILTER_KEYS = ["search", "status", "action", "rowNumber", "schoolId", "sortBy", "sortOrder", "page", "limit"];

export const paramsToObject = (params, keys) => Object.fromEntries(keys.map((key) => [key, params.get(key)]).filter(([, value]) => value));
export const mergeQuery = (current, changes, resetPage = true) => {
  const next = new URLSearchParams(current);
  Object.entries(changes).forEach(([key, value]) => value ? next.set(key, String(value)) : next.delete(key));
  if (resetPage) next.delete("page");
  return next;
};
export const progressPercent = (processed, total) => Number(total) > 0 ? Math.min(100, Math.round((Number(processed || 0) / Number(total)) * 100)) : 0;
export const isActiveStatus = (status) => status === "pending" || status === "processing";
export const formatData = (value) => {
  if (value == null) return "null";
  if (typeof value === "string") {
    try { return JSON.stringify(JSON.parse(value), null, 2); } catch { return value; }
  }
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
};

export const errorState = (error, detail = false) => {
  const status = error?.response?.status;
  if (status === 401) return { status, message: "نشست شما منقضی شده است؛ دوباره وارد شوید." };
  if (status === 403) return { status, message: "اجازه دسترسی به این بخش را ندارید." };
  if (detail && status === 404) return { status, message: "رکورد یافت نشد یا دسترسی ندارید." };
  return { status, message: error?.response?.data?.message || "دریافت اطلاعات با خطا مواجه شد." };
};
