import DateObject from "react-date-object";
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";

const latinDigits = (value) => String(value || "")
  .replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
  .replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit));

export function monitoringDateObject(value) {
  if (!value) return null;
  return new DateObject({
    date: value,
    format: "YYYY-MM-DD",
    calendar: gregorian,
  }).convert(persian).setLocale(persianFa);
}

export function monitoringApiDate(value) {
  if (!value) return "";
  return latinDigits(new DateObject(value).convert(gregorian).format("YYYY-MM-DD"));
}

export function formatMonitoringDate(value) {
  const date = monitoringDateObject(value);
  return date?.isValid ? date.format("YYYY/MM/DD") : "—";
}
