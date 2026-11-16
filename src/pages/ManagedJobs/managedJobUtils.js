export const JOB_STATUS = {
  never: ["secondary", "اجرا نشده"],
  running: ["info", "در حال اجرا"],
  succeeded: ["success", "موفق"],
  failed: ["danger", "ناموفق"],
  skipped: ["warning", "رد شده"],
};

export const statusView = (status) => JOB_STATUS[String(status || "never").toLowerCase()] || ["secondary", status || "نامشخص"];

export const formatJobDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tehran" }).format(date);
};

export const intervalLabel = (seconds) => {
  const value = Number(seconds || 0);
  if (value >= 3600 && value % 3600 === 0) return `${(value / 3600).toLocaleString("fa-IR")} ساعت`;
  if (value >= 60 && value % 60 === 0) return `${(value / 60).toLocaleString("fa-IR")} دقیقه`;
  return `${value.toLocaleString("fa-IR")} ثانیه`;
};

export const buildConfiguration = (guide = {}, values = {}) => Object.fromEntries(
  Object.entries(guide || {}).map(([key, field]) => {
    const raw = values[key] ?? field.default;
    return [key, field.type === "integer" ? Number(raw) : raw];
  }),
);

export const validateJobForm = ({ intervalSeconds, configuration = {} }, guide = {}) => {
  const errors = {};
  const interval = Number(intervalSeconds);
  if (!Number.isInteger(interval) || interval < 30 || interval > 86400) errors.intervalSeconds = "فاصله اجرا باید عددی صحیح بین ۳۰ تا ۸۶۴۰۰ ثانیه باشد.";
  Object.entries(guide || {}).forEach(([key, field]) => {
    const value = configuration[key] ?? field.default;
    if (field.type === "integer") {
      const number = Number(value);
      if (!Number.isInteger(number)) errors[key] = "یک عدد صحیح وارد کنید.";
      else if (field.minimum != null && number < Number(field.minimum)) errors[key] = `حداقل مقدار ${Number(field.minimum).toLocaleString("fa-IR")} است.`;
      else if (field.maximum != null && number > Number(field.maximum)) errors[key] = `حداکثر مقدار ${Number(field.maximum).toLocaleString("fa-IR")} است.`;
    }
    if (field.type === "enum" && !field.values?.includes(value)) errors[key] = "یکی از مقادیر مجاز را انتخاب کنید.";
  });
  return errors;
};

export const managedJobError = (error, fallback = "انجام عملیات ناموفق بود.") => {
  const body = error?.response?.data?.data ?? error?.response?.data ?? {};
  const code = body.code;
  if (error?.response?.status === 409 && code === "MANAGED_JOBS_ENV_DISABLED") return "پردازش‌های زمان‌بندی‌شده در تنظیمات سرور غیرفعال هستند.";
  if (error?.response?.status === 409 && code === "MANAGED_JOB_DISABLED") return "این Job غیرفعال است؛ ابتدا آن را فعال کنید.";
  if (error?.response?.status === 409) return body.message || "این Job هم‌اکنون در حال اجرا است؛ پس از پایان دوباره تلاش کنید.";
  return Array.isArray(body.message) ? body.message.join("، ") : body.message || fallback;
};

export const managedJobRunErrorMessage = (code, fallback = "اجرای Job ناموفق بود.") => {
  const messages = {
    SIMOTEL_CONFIGURATION_MISSING: "تنظیمات اتصال Simotel ناقص است.",
    SIMOTEL_HISTORY_JOB_TIMEOUT: "اجرای همگام‌سازی از سقف زمان مجاز عبور کرد.",
  };
  return messages[code] || fallback;
};

const logDate = (log = {}) => log.created_at || log.createdAt || log.timestamp;

export const latestProgressLog = (logs = []) => (Array.isArray(logs) ? logs : [])
  .filter((log) => String(log?.event || "").toLowerCase() === "progress")
  .reduce((latest, log) => {
    if (!latest) return log;
    const currentTime = new Date(logDate(log) || 0).getTime();
    const latestTime = new Date(logDate(latest) || 0).getTime();
    if (currentTime !== latestTime) return currentTime > latestTime ? log : latest;
    return Number(log.id || 0) >= Number(latest.id || 0) ? log : latest;
  }, null);

export const progressData = (log) => {
  const data = log?.data && typeof log.data === "object" ? log.data : {};
  const percent = Math.min(100, Math.max(0, Number(data.percent) || 0));
  return {
    percent,
    processedPages: Math.max(0, Number(data.processedPages) || 0),
    totalPages: Math.max(0, Number(data.totalPages) || 0),
    counters: data.counters && typeof data.counters === "object" ? data.counters : {},
  };
};

export const isProgressStale = (log, now = Date.now(), thresholdMs = 120000) => {
  if (!log) return false;
  const updatedAt = new Date(logDate(log)).getTime();
  return Number.isFinite(updatedAt) && now - updatedAt > thresholdMs;
};

export const formatElapsedTime = (startedAt, now = Date.now()) => {
  const started = new Date(startedAt).getTime();
  if (!Number.isFinite(started)) return "—";
  const seconds = Math.max(0, Math.floor((now - started) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const parts = [];
  if (hours) parts.push(`${hours.toLocaleString("fa-IR")} ساعت`);
  if (minutes || hours) parts.push(`${minutes.toLocaleString("fa-IR")} دقیقه`);
  if (!hours) parts.push(`${remainingSeconds.toLocaleString("fa-IR")} ثانیه`);
  return parts.join(" و ");
};

const SENSITIVE_JOB_FIELD = /^(authorization|credential|credentials|password|secret|token|api[_-]?key|payload|raw[_-]?payload|simotel[_-]?payload)$/i;

export const sanitizeManagedJobData = (value) => {
  if (Array.isArray(value)) return value.map(sanitizeManagedJobData);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [
    key,
    SENSITIVE_JOB_FIELD.test(key) ? "[REDACTED]" : sanitizeManagedJobData(item),
  ]));
};

export const validationFields = (error) => {
  const body = error?.response?.data?.data ?? error?.response?.data ?? {};
  const errors = Array.isArray(body.errors) ? body.errors : [];
  return errors.reduce((result, item) => {
    const field = item.field || item.property || item.path;
    if (field) result[field.replace(/^configuration\./, "")] = item.message;
    return result;
  }, {});
};
