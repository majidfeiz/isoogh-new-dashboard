import moment from "moment-jalaali";

export const FINAL_TRACE_STATUSES = new Set(["completed", "failed"]);
export const ACTIVE_TRACE_STATUSES = new Set(["in_progress", "waiting_for_cdr"]);

export const TRACE_STATUS = {
  in_progress: { label: "در حال اجرا", color: "primary" },
  waiting_for_cdr: { label: "در انتظار گزارش نهایی", color: "warning" },
  completed: { label: "تکمیل‌شده", color: "success" },
  failed: { label: "ناموفق", color: "danger" },
};

export const EVENT_LEVEL = {
  info: { label: "اطلاع", color: "info" },
  success: { label: "موفق", color: "success" },
  warning: { label: "هشدار", color: "warning" },
  error: { label: "خطا", color: "danger" },
};

export const STEP_LABELS = {
  request_received: "دریافت درخواست تماس",
  voip_call_created: "ثبت تماس",
  simotel_request_sent: "ارسال درخواست به سیموتل",
  simotel_response_received: "دریافت پاسخ سیموتل",
  call_group_id_saved: "ذخیره شناسه تماس",
  simotel_unreachable: "عدم دسترسی به سیموتل",
  simotel_failed: "پاسخ نامعتبر سیموتل",
  cdr_received: "دریافت CDR و تکمیل",
};

export const readableStep = (step) => {
  if (!step) return "—";
  return STEP_LABELS[step] || String(step).replace(/[_-]+/g, " ").trim();
};

export const parseCallTraceQuery = (params) => {
  const page = Number(params.get("page"));
  const limit = Number(params.get("limit"));
  const status = params.get("status") || "";
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: Number.isInteger(limit) && limit > 0 && limit <= 100 ? limit : 15,
    search: params.get("search") || "",
    status: TRACE_STATUS[status] ? status : "",
    adviserId: params.get("adviserId") || "",
    studentId: params.get("studentId") || "",
    supportFormId: params.get("supportFormId") || "",
    from: params.get("from") || "",
    to: params.get("to") || "",
    traceId: params.get("traceId") || "",
  };
};

export const serializeCallTraceQuery = (query) => {
  const params = new URLSearchParams();
  ["search", "status", "adviserId", "studentId", "supportFormId", "from", "to", "traceId"].forEach((key) => {
    const value = String(query[key] || "").trim();
    if (value) params.set(key, value);
  });
  if (query.page > 1) params.set("page", String(query.page));
  if (query.limit !== 15) params.set("limit", String(query.limit));
  return params;
};

export const shouldPollList = (items, visibilityState = "visible") =>
  visibilityState === "visible" && items.some((item) => ACTIVE_TRACE_STATUSES.has(item.status));

export const shouldPollDetail = (trace, visibilityState = "visible") =>
  visibilityState === "visible" && Boolean(trace) && !FINAL_TRACE_STATUSES.has(trace.status);

export const formatTraceDate = (value, includeSeconds = false) => {
  if (!value) return "—";
  const date = moment(value);
  if (!date.isValid()) return "—";
  return date.format(includeSeconds ? "jYYYY/jMM/jDD HH:mm:ss" : "jYYYY/jMM/jDD HH:mm");
};

export const clampProgress = (value) => Math.min(100, Math.max(0, Number(value) || 0));

export const getTraceListState = ({ loading, error, items }) => {
  if (loading) return "loading";
  if (error) return "error";
  if (!items.length) return "empty";
  return "ready";
};
