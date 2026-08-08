import moment from "moment-jalaali";

export const QUEUE_STATUS = {
  pending: { label: "در صف", color: "warning" },
  retry: { label: "در انتظار تلاش مجدد", color: "info" },
  processing: { label: "در حال پردازش", color: "primary" },
  completed: { label: "ارسال‌شده", color: "success" },
  failed: { label: "ناموفق", color: "danger" },
  cancelled: { label: "لغوشده", color: "secondary" },
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

export const shouldPollCallQueue = (schoolId, visibilityState = "visible") =>
  Boolean(schoolId) && visibilityState === "visible";
