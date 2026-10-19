import DateObject from "react-date-object";
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";
import moment from "moment";

const TEHRAN_OFFSET = "+03:30";
const latinDigits = (value) => String(value || "")
  .replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
  .replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit));

const gregorianDate = (value) => latinDigits(
  new DateObject(value).convert(gregorian).format("YYYY-MM-DD")
);

const addUtcDays = (date, days) => {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
};

export function salaryRangeParams(range) {
  if (!Array.isArray(range) || range.length !== 2 || !range[0] || !range[1]) return null;
  const fromDate = gregorianDate(range[0]);
  const toDate = gregorianDate(range[1]);
  return {
    from: `${fromDate}T00:00:00.000${TEHRAN_OFFSET}`,
    to: `${addUtcDays(toDate, 1)}T00:00:00.000${TEHRAN_OFFSET}`,
  };
}

export function buildSalaryRequestFilters(filters) {
  const range = salaryRangeParams(filters.dateRange);
  const shared = {
    adviserId: filters.adviserId || "",
    supportFormId: filters.supportFormId || "",
  };
  return range
    ? { ...range, ...shared }
    : { year: Number(filters.year), month: Number(filters.month), ...shared };
}

export function effectiveSalaryRangeLabel(from, to) {
  if (!from || !to) return "";
  const inTehran = (value) => moment.parseZone(value).utcOffset(210).format("YYYY-MM-DD");
  const inclusiveEnd = addUtcDays(inTehran(to), -1);
  const format = (value) => new DateObject({
    date: String(value).slice(0, 10),
    format: "YYYY-MM-DD",
    calendar: gregorian,
  }).convert(persian).setLocale(persianFa).format("YYYY/MM/DD");
  return `${format(inTehran(from))} تا ${format(inclusiveEnd)}`;
}
