const INCOMING_CALL_STATUSES = ["routing", "answered", "missed", "voice", "ended"]
const INCOMING_CALL_SORT_FIELDS = ["startedAt", "endedAt", "durationSeconds", "status"]

const positiveInt = (value, fallback) => { const number = Number(value); return Number.isInteger(number) && number > 0 ? number : fallback }
export const parseIncomingCallQuery = (params) => ({
  schoolId: params.get("schoolId") || "", page: positiveInt(params.get("page"), 1),
  limit: [10, 20, 50, 100].includes(Number(params.get("limit"))) ? Number(params.get("limit")) : 20,
  search: params.get("search") || "", status: INCOMING_CALL_STATUSES.includes(params.get("status")) ? params.get("status") : "",
  ssn: params.get("ssn") || "", username: params.get("username") || "", formId: params.get("formId") || "",
  from: params.get("from") || "", to: params.get("to") || "",
  sortBy: INCOMING_CALL_SORT_FIELDS.includes(params.get("sortBy")) ? params.get("sortBy") : "startedAt",
  sortOrder: params.get("sortOrder") === "ASC" ? "ASC" : "DESC",
})
export const serializeIncomingCallQuery = (query) => { const result = new URLSearchParams(); Object.entries(query).forEach(([key, value]) => { if (value !== "" && value != null && !(key === "page" && Number(value) === 1)) result.set(key, String(value)) }); return result }
export const incomingCallRangeError = ({ from, to }) => Boolean(from) !== Boolean(to) ? "تاریخ شروع و پایان باید با هم انتخاب شوند." : from && to && from > to ? "تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد." : ""
export const statusView = (status) => ({ routing: ["در حال مسیریابی", "info"], answered: ["پاسخ داده‌شده", "success"], missed: ["از دست‌رفته", "danger"], voice: ["پیام صوتی", "warning"], ended: ["پایان‌یافته", "secondary"] }[status] || [status || "نامشخص", "secondary"])
