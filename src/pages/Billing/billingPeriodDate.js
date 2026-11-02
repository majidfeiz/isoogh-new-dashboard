import { toJalaali } from "jalaali-js";

const fa = (value, width = 2) => String(value).padStart(width, "0").replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

export const parseBillingDateOnly = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
};

export const formatBillingDateOnly = (value, endOfDay = false) => {
  const parsed = parseBillingDateOnly(value);
  if (!parsed) return "—";
  const jalali = toJalaali(parsed.year, parsed.month, parsed.day);
  return `${fa(jalali.jy, 4)}/${fa(jalali.jm)}/${fa(jalali.jd)} ${endOfDay ? "۲۳:۵۹" : "۰۰:۰۰"}`;
};

export const formatBillingDateOnlyLabel = (value) => {
  const parsed = parseBillingDateOnly(value);
  if (!parsed) return "—";
  const jalali = toJalaali(parsed.year, parsed.month, parsed.day);
  return `${fa(jalali.jy, 4)}/${fa(jalali.jm)}/${fa(jalali.jd)}`;
};

export const formatBillingPeriodRange = (start, end) => `${formatBillingDateOnly(start)} تا ${formatBillingDateOnly(end, true)}`;
