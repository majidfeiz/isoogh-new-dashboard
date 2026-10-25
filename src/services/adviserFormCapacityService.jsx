import { apiGet } from "../helpers/httpClient.jsx"
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx"

export const CAPACITY_SORT_FIELDS = ["schoolName", "formTitle", "activeStudents", "remainingCapacity"]

export function buildAdviserFormCapacityParams(params = {}) {
  return {
    schoolId: params.schoolId ? Number(params.schoolId) : undefined,
    formId: params.formId ? Number(params.formId) : undefined,
    adviserId: params.adviserId ? Number(params.adviserId) : undefined,
    search: params.search?.trim() || undefined,
    page: Number(params.page) || 1,
    limit: Number(params.limit) || 20,
    sortBy: CAPACITY_SORT_FIELDS.includes(params.sortBy) ? params.sortBy : "remainingCapacity",
    sortOrder: params.sortOrder === "DESC" ? "DESC" : "ASC",
  }
}

const normalizeItem = (item = {}) => {
  const adviserFormActive = item.adviserFormActive === true || Number(item.adviser_form_active) === 1
  const capacity = Math.max(0, Number(item.capacity) || 0)
  const reportedActive = Math.max(0, Number(item.activeStudents ?? item.active_students) || 0)
  const activeStudents = adviserFormActive ? reportedActive : 0
  const overCapacity = adviserFormActive && (item.overCapacity === true || Number(item.over_capacity) === 1 || activeStudents > capacity)
  return {
    ...item,
    schoolId: Number(item.schoolId ?? item.school_id), formId: Number(item.formId ?? item.form_id), adviserId: Number(item.adviserId ?? item.adviser_id),
    adviserFormActive, activeStudents, capacity, remainingCapacity: adviserFormActive ? Math.max(0, Number(item.remainingCapacity ?? item.remaining_capacity) || 0) : 0, overCapacity,
  }
}

export async function getAdviserFormCapacity(params = {}, signal) {
  const requestParams = buildAdviserFormCapacityParams(params)
  const response = await apiGet(getApiUrl(API_ROUTES.reports.adviserFormCapacity), { params: requestParams, signal, silent: true })
  const data = response?.data?.data || {}
  const items = (data.items || data.data || []).map(normalizeItem)
  const meta = data.meta || data.pagination || {}
  return { items, pagination: { page: Number(meta.page ?? requestParams.page), limit: Number(meta.limit ?? requestParams.limit), total: Number(meta.total ?? items.length), lastPage: Number(meta.lastPage ?? Math.max(1, Math.ceil(Number(meta.total || items.length) / Number(meta.limit || requestParams.limit)))) } }
}
