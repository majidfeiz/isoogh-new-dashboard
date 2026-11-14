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

export const validationFields = (error) => {
  const body = error?.response?.data?.data ?? error?.response?.data ?? {};
  const errors = Array.isArray(body.errors) ? body.errors : [];
  return errors.reduce((result, item) => {
    const field = item.field || item.property || item.path;
    if (field) result[field.replace(/^configuration\./, "")] = item.message;
    return result;
  }, {});
};
