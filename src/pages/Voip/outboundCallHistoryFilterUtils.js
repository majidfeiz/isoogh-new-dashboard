import { jalaliDateObject, normalizeJalaliDateOnly } from "../../helpers/jalaliDateOnly.js";

export function parseOutboundCallQuery(params) {
  const page = Number(params.get("page"));
  const formId = params.get("support_form_id") || "";
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    type: params.get("type") || "",
    q: params.get("q") || "",
    ssn: params.get("ssn") || "",
    username: params.get("username") || "",
    schoolId: params.get("schoolId") || "",
    tagId: params.get("tagId") || "",
    supportFormId: /^[1-9]\d*$/.test(formId) || formId === "ALL" ? formId : "",
    adviserId: params.get("adviser_id") || "",
    superAdviserId: params.get("super_adviser_id") || "",
    disposition: params.get("disposition") || "ALL",
    sortBy: params.get("sort_by") || "",
    sortOrder: params.get("sort_order") || "",
    startDate: normalizeJalaliDateOnly(params.get("start_date")),
    endDate: normalizeJalaliDateOnly(params.get("end_date")),
  };
}

export function serializeOutboundCallQuery(query) {
  const params = new URLSearchParams();
  const values = {
    type: query.type,
    q: query.q?.trim?.(),
    ssn: query.ssn?.trim?.(),
    username: query.username?.trim?.(),
    schoolId: query.schoolId,
    tagId: query.tagId,
    support_form_id: /^[1-9]\d*$/.test(String(query.supportFormId || "")) || query.supportFormId === "ALL" ? query.supportFormId : "",
    adviser_id: query.adviserId,
    super_adviser_id: query.superAdviserId,
    disposition: query.disposition !== "ALL" ? query.disposition : "",
    sort_by: query.sortBy,
    sort_order: query.sortOrder,
    start_date: normalizeJalaliDateOnly(query.startDate),
    end_date: normalizeJalaliDateOnly(query.endDate),
  };
  Object.entries(values).forEach(([key, value]) => {
    if (value) params.set(key, String(value));
  });
  if (query.page > 1) params.set("page", String(query.page));
  return params;
}

export function outboundDateObject(value) {
  return jalaliDateObject(value);
}

export const resetOutboundPage = (state = {}) => ({ ...state, page: 1 });

export const outboundStudentSsn = (value) => value == null || value === "" ? "—" : String(value);

export function buildOutboundSocketPayload(filters = {}) {
  const q = filters.q?.trim?.() || "";
  const payload = {
    page: Number(filters.page) || 1,
    per_page: Number(filters.per_page) || 15,
    sort_by: filters.sort_by || "id",
    sort_order: filters.sort_order || "DESC",
  };
  if (q) {
    payload.q = q;
    if (filters.type) payload.type = filters.type;
  }
  if (filters.disposition && filters.disposition !== "ALL") payload.disposition = filters.disposition;
  const startDate = normalizeJalaliDateOnly(filters.start_date);
  const endDate = normalizeJalaliDateOnly(filters.end_date);
  if (startDate) payload.start_date = startDate;
  if (endDate) payload.end_date = endDate;
  if (filters.ssn?.trim?.()) payload.ssn = filters.ssn.trim();
  if (filters.username?.trim?.()) payload.username = filters.username.trim();
  if (filters.schoolId) payload.schoolId = filters.schoolId;
  if (filters.tagId) payload.tagId = filters.tagId;
  if (/^[1-9]\d*$/.test(String(filters.support_form_id || "")) || filters.support_form_id === "ALL") payload.support_form_id = filters.support_form_id;
  if (filters.adviser_id) payload.adviser_id = filters.adviser_id;
  if (filters.super_adviser_id) payload.super_adviser_id = filters.super_adviser_id;
  return payload;
}

export function buildOutboundExportParams(filters = {}) {
  const payload = buildOutboundSocketPayload({ ...filters, page: 1, per_page: 15 });
  delete payload.page;
  delete payload.per_page;
  return new URLSearchParams(Object.entries(payload).map(([key, value]) => [key, String(value)]));
}

export function mergeOutboundTagOptions(current, incoming) {
  const byId = new Map(current.map((item) => [String(item.id), item]));
  incoming.forEach((item) => byId.set(String(item.id), item));
  return [...byId.values()];
}

export function isOutboundCallAdmin(user) {
  return (user?.roles || []).some((role) => {
    const name = String(typeof role === "string" ? role : role?.name || role?.slug || role?.label || "").toLowerCase();
    return ["admin", "super_admin", "super-admin", "super admin"].includes(name);
  });
}
