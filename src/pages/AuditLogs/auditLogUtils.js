import moment from "moment-jalaali";

export const ACTION_TYPES = {
  create: { label: "ایجاد", color: "success" },
  update: { label: "ویرایش", color: "warning" },
  delete: { label: "حذف", color: "danger" },
  restore: { label: "بازیابی", color: "info" },
  import: { label: "ورود فایل", color: "primary" },
  export: { label: "خروجی", color: "secondary" },
  download: { label: "دانلود", color: "dark" },
  view: { label: "مشاهده", color: "info" },
  login: { label: "احراز هویت", color: "primary" },
  logout: { label: "احراز هویت", color: "secondary" },
  auth: { label: "احراز هویت", color: "primary" },
  call: { label: "تماس", color: "success" },
  webhook: { label: "وب‌هوک", color: "warning" },
  execute: { label: "اجرا", color: "dark" },
  other: { label: "سایر", color: "secondary" },
};

const startOfLocalDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

export function datePreset(key, now = new Date()) {
  const today = startOfLocalDay(now);
  if (key === "today") return { from: today.toISOString(), to: addDays(today, 1).toISOString() };
  if (key === "yesterday") return { from: addDays(today, -1).toISOString(), to: today.toISOString() };
  if (key === "7days") return { from: addDays(today, -6).toISOString(), to: addDays(today, 1).toISOString() };
  if (key === "30days") return { from: addDays(today, -29).toISOString(), to: addDays(today, 1).toISOString() };
  if (key === "jalaliMonth") {
    const monthStart = moment(now).startOf("jMonth").toDate();
    const nextMonth = moment(monthStart).add(1, "jMonth").toDate();
    return { from: startOfLocalDay(monthStart).toISOString(), to: startOfLocalDay(nextMonth).toISOString() };
  }
  return { from: "", to: "" };
}

export function customDateRange(fromDate, toDate) {
  if (!fromDate || !toDate) return { error: "لطفاً ابتدا و انتهای بازه را انتخاب کنید" };
  const from = startOfLocalDay(fromDate.toDate ? fromDate.toDate() : fromDate);
  const to = addDays(startOfLocalDay(toDate.toDate ? toDate.toDate() : toDate), 1);
  if (from.getTime() >= to.getTime()) return { error: "ابتدای بازه باید قبل از انتهای بازه باشد" };
  return { from: from.toISOString(), to: to.toISOString() };
}

export function validIsoRange(from, to) {
  if (!from && !to) return true;
  const fromMs = Date.parse(from);
  const toMs = Date.parse(to);
  return Number.isFinite(fromMs) && Number.isFinite(toMs) && fromMs < toMs;
}

export function statsChartData(stats = {}) {
  const map = (items) => (Array.isArray(items) ? items : []).map((item) => ({ ...item, count: Number(item.count || 0) }));
  return {
    timeline: map(stats.timeline),
    modules: map(stats.byModule),
    actions: map(stats.byAction).map((item) => ({ ...item, label: ACTION_TYPES[item.key]?.label || item.key })),
    users: map(stats.byUser),
  };
}

export function isAdminUser(user) {
  return (user?.roles || []).some((role) =>
    ["admin", "super_manager"].includes(String(typeof role === "string" ? role : role?.name).toLowerCase())
  );
}
