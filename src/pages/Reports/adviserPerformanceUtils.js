export function parseAdviserPerformanceQuery(params) {
  const page = Number(params.get("page"))
  const limit = Number(params.get("limit"))
  return {
    schoolId: params.get("schoolId") || "",
    formId: params.get("formId") || "",
    studentSearch: params.get("studentSearch") || "",
    adviserSearch: params.get("adviserSearch") || "",
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: Number.isInteger(limit) && limit > 0 && limit <= 100 ? limit : 15,
  }
}

export function serializeAdviserPerformanceQuery(query) {
  const params = new URLSearchParams()
  for (const key of ["schoolId", "formId", "studentSearch", "adviserSearch"]) {
    const value = String(query[key] || "").trim()
    if (value) params.set(key, value)
  }
  if (query.page > 1) params.set("page", String(query.page))
  if (query.limit !== 15) params.set("limit", String(query.limit))
  return params
}

export const displayAdviserPerformanceValue = (value) =>
  value == null || String(value).trim() === "" ? "—" : String(value)

export const sortedAdviserPerformanceQuestions = (questions) =>
  [...(Array.isArray(questions) ? questions : [])].sort((a, b) =>
    Number(a?.order || 0) - Number(b?.order || 0)
  )

export function saveAdviserPerformanceBlob(blob, documentRef = document, urlApi = window.URL) {
  const objectUrl = urlApi.createObjectURL(blob)
  const link = documentRef.createElement("a")
  link.href = objectUrl
  link.download = "adviser-performance.xlsx"
  documentRef.body.appendChild(link)
  link.click()
  link.remove()
  urlApi.revokeObjectURL(objectUrl)
}
