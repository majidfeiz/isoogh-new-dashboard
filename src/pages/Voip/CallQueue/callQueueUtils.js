import moment from "moment-jalaali";

export const QUEUE_STATUS = {
  pending: { label: "در صف", color: "warning" },
  retry: { label: "در انتظار تلاش مجدد", color: "info" },
  processing: { label: "در حال پردازش", color: "primary" },
  completed: { label: "ارسال‌شده", color: "success" },
  failed: { label: "ناموفق", color: "danger" },
  cancelled: { label: "لغوشده", color: "secondary" },
};

export const isCallQueueAdminLike = (user) =>
  (user?.roles || []).some((role) => {
    const value = typeof role === "string" ? role : role?.name ?? role?.slug;
    return ["admin", "super_manager"].includes(String(value || "").trim().toLowerCase());
  });

export const parseCallQueueQuery = (params, isAdminLike) => {
  const rawPage = Number(params.get("page"));
  const rawLimit = Number(params.get("limit"));
  const rawSchoolId = Number(params.get("schoolId"));
  const schoolId = Number.isInteger(rawSchoolId) && rawSchoolId > 0 ? rawSchoolId : null;
  const allSchools = isAdminLike && !schoolId && params.get("allSchools") === "true";
  return {
    schoolId,
    allSchools,
    status: QUEUE_STATUS[params.get("status")] ? params.get("status") : "",
    page: Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1,
    limit: [15, 20, 50, 100].includes(rawLimit) ? rawLimit : 20,
  };
};

export const serializeCallQueueQuery = ({ schoolId, allSchools, status, page, limit }) => {
  const params = new URLSearchParams();
  if (schoolId) params.set("schoolId", String(schoolId));
  else if (allSchools === true) params.set("allSchools", "true");
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  if (limit !== 20) params.set("limit", String(limit));
  return params;
};

export const formatQueueDate = (value) => {
  if (!value) return "—";
  const date = moment(value);
  return date.isValid() ? date.format("jYYYY/jMM/jDD HH:mm:ss") : "—";
};

export const formatDuration = (milliseconds) => {
  if (milliseconds == null || !Number.isFinite(Number(milliseconds))) return "—";
  const totalSeconds = Math.max(0, Math.floor(Number(milliseconds) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours ? `${hours.toLocaleString("fa-IR")} ساعت` : "", minutes ? `${minutes.toLocaleString("fa-IR")} دقیقه` : "", `${seconds.toLocaleString("fa-IR")} ثانیه`].filter(Boolean).join(" و ");
};

export const oldestQueueWait = (oldestQueuedAt, now = Date.now()) => {
  const timestamp = new Date(oldestQueuedAt).getTime();
  return Number.isFinite(timestamp) ? formatDuration(Math.max(0, now - timestamp)) : "—";
};

export const shouldPollCallQueue = (hasScope, visibilityState = "visible") =>
  Boolean(hasScope) && visibilityState === "visible";
