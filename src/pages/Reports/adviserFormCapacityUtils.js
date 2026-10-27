const CAPACITY_SORT_FIELDS = ["schoolName", "formTitle", "activeStudents", "remainingCapacity"]

const positiveInt = (value, fallback) => { const number = Number(value); return Number.isInteger(number) && number > 0 ? number : fallback }
export const parseCapacityQuery = (params) => ({
  schoolId: params.get("schoolId") || "", formId: params.get("formId") || "", adviserId: params.get("adviserId") || "",
  search: params.get("search") || "", page: positiveInt(params.get("page"), 1),
  limit: [10, 20, 50, 100].includes(Number(params.get("limit"))) ? Number(params.get("limit")) : 20,
  sortBy: CAPACITY_SORT_FIELDS.includes(params.get("sortBy")) ? params.get("sortBy") : "remainingCapacity",
  sortOrder: params.get("sortOrder") === "DESC" ? "DESC" : "ASC",
})
export const serializeCapacityQuery = (query) => { const params = new URLSearchParams(); Object.entries(query).forEach(([key, value]) => { if (value !== "" && value != null && !(key === "page" && Number(value) === 1)) params.set(key, String(value)) }); return params }
export const capacityView = (item) => {
  const capacity = Math.max(0, Number(item.capacity) || 0)
  const remaining = Math.max(0, Number(item.remainingCapacity) || 0)
  if (!item.adviserFormActive) return { color: "secondary", label: "اتصال غیرفعال", percent: 0, remaining: 0 }
  if (item.overCapacity || remaining === 0) return { color: "danger", label: item.overCapacity ? "بیش از ظرفیت" : "ظرفیت تکمیل", percent: 100, remaining: 0 }
  const usedPercent = capacity > 0 ? Math.min(100, Math.round((Math.max(0, Number(item.activeStudents) || 0) / capacity) * 100)) : 100
  return { color: remaining <= capacity * 0.2 ? "warning" : "success", label: `${remaining.toLocaleString("fa-IR")} باقی‌مانده`, percent: usedPercent, remaining }
}
