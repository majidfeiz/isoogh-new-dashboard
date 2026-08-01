import DateObject from "react-date-object";
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";

export function parseOutboundCallQuery(params) {
  const page = Number(params.get("page"));
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    type: params.get("type") || "",
    q: params.get("q") || "",
    ssn: params.get("ssn") || "",
    tagId: params.get("tagId") || "",
    disposition: params.get("disposition") || "ALL",
    sortBy: params.get("sort_by") || "",
    sortOrder: params.get("sort_order") || "",
    startDate: params.get("start_date") || "",
    endDate: params.get("end_date") || "",
  };
}

export function serializeOutboundCallQuery(query) {
  const params = new URLSearchParams();
  const values = {
    type: query.type,
    q: query.q?.trim?.(),
    ssn: query.ssn?.trim?.(),
    tagId: query.tagId,
    disposition: query.disposition !== "ALL" ? query.disposition : "",
    sort_by: query.sortBy,
    sort_order: query.sortOrder,
    start_date: query.startDate,
    end_date: query.endDate,
  };
  Object.entries(values).forEach(([key, value]) => {
    if (value) params.set(key, String(value));
  });
  if (query.page > 1) params.set("page", String(query.page));
  return params;
}

export function outboundDateObject(value) {
  if (!value) return null;
  return new DateObject({ date: value, format: "YYYY-MM-DD", calendar: gregorian })
    .convert(persian).setLocale(persianFa);
}

export function mergeOutboundTagOptions(current, incoming) {
  const byId = new Map(current.map((item) => [String(item.id), item]));
  incoming.forEach((item) => byId.set(String(item.id), item));
  return [...byId.values()];
}
