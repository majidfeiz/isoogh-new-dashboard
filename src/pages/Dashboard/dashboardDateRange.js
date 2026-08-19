const DATE_FROM_KEY = "dateRangeFrom";
const DATE_TO_KEY = "dateRangeTo";

export const hasDateRangeSchema = (schema = []) => {
  const keys = new Set(schema.map((field) => field.key));
  return keys.has(DATE_FROM_KEY) && keys.has(DATE_TO_KEY);
};

export const getWidgetDateRange = (userConfig = {}) => {
  const from = userConfig?.[DATE_FROM_KEY];
  const to = userConfig?.[DATE_TO_KEY];
  return from && to ? { from, to } : {};
};

export const getDateRangeKey = (userConfig = {}) => {
  const { from = "", to = "" } = getWidgetDateRange(userConfig);
  return `${from}|${to}`;
};

export const getWidgetRequestKey = (endpoint, type, userConfig = {}) => {
  const { from = "", to = "" } = getWidgetDateRange(userConfig);
  return `${endpoint}|${type || ""}|${from}|${to}`;
};

const pad = (value) => String(value).padStart(2, "0");

export const toTehranStartOfDay = (dateObject, addDays = 0) => {
  if (!dateObject) return "";
  const date = dateObject.toDate();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + addDays);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T00:00:00+03:30`;
};
