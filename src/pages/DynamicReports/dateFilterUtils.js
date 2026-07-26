import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";

const digitMap = {
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};

export const toLatinDigits = (value) =>
  String(value ?? "").replace(/[۰-۹٠-٩]/g, (digit) => digitMap[digit]);

const jalaliParts = (value) => {
  const match = toLatinDigits(value)
    .trim()
    .match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
};

const paddedJalaliDate = ({ year, month, day }) =>
  `${String(year).padStart(4, "0")}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;

const validIsoOrGregorianDate = (value) => {
  const normalized = toLatinDigits(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(normalized)) return null;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const createPersianPickerDate = (value) => {
  const parts = jalaliParts(value);
  if (parts) {
    return new DateObject({
      date: paddedJalaliDate(parts),
      format: "YYYY/MM/DD",
      calendar: persian,
      locale: persianFa,
    });
  }

  const gregorianDate = validIsoOrGregorianDate(value);
  if (gregorianDate) {
    return new DateObject({
      date: gregorianDate,
      calendar: persian,
      locale: persianFa,
    });
  }

  return new DateObject({ calendar: persian, locale: persianFa });
};

export const displayPersianFilterDate = (value) => {
  const parts = jalaliParts(value);
  if (parts) return paddedJalaliDate(parts);

  const gregorianDate = validIsoOrGregorianDate(value);
  if (!gregorianDate) return "";
  return toLatinDigits(
    new DateObject({
      date: gregorianDate,
      calendar: persian,
      locale: persianFa,
    }).format("YYYY/MM/DD")
  );
};

export const serializePersianFilterDate = (selected) => {
  if (!selected) return "";
  const date = selected instanceof DateObject
    ? new DateObject(selected)
    : new DateObject(selected);
  date.convert(persian, persianFa);
  return toLatinDigits(date.format("YYYY/MM/DD"));
};
