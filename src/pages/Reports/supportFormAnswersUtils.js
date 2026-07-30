import moment from "moment-jalaali"

export const SUPPORT_FORM_ANSWER_FILTER_KEYS = [
  "studentName",
  "adviserName",
  "adviserNumber",
  "ssn",
  "studentUsername",
]

export function parseSupportFormAnswersQuery(params) {
  const page = Number(params.get("page"))
  const limit = Number(params.get("limit"))
  return {
    from: params.get("from") || "",
    to: params.get("to") || "",
    ...Object.fromEntries(SUPPORT_FORM_ANSWER_FILTER_KEYS.map((key) => [key, params.get(key) || ""])),
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: Number.isInteger(limit) && limit > 0 && limit <= 100 ? limit : 10,
  }
}

export function serializeSupportFormAnswersQuery(query) {
  const params = new URLSearchParams()
  if (query.from) params.set("from", query.from)
  if (query.to) params.set("to", query.to)
  SUPPORT_FORM_ANSWER_FILTER_KEYS.forEach((key) => {
    const value = String(query[key] || "").trim()
    if (value) params.set(key, value)
  })
  if (query.page > 1) params.set("page", String(query.page))
  if (query.limit !== 10) params.set("limit", String(query.limit))
  return params
}

export function formatSupportFormAnswerDate(value) {
  if (!value) return "—"
  const date = moment(value)
  return date.isValid() ? date.format("jYYYY/jMM/jDD HH:mm") : "—"
}

export function saveSupportFormAnswersBlob(blob, documentRef = document, urlApi = window.URL) {
  const objectUrl = urlApi.createObjectURL(blob)
  const link = documentRef.createElement("a")
  link.href = objectUrl
  link.download = "support-form-answers.xlsx"
  documentRef.body.appendChild(link)
  link.click()
  link.remove()
  urlApi.revokeObjectURL(objectUrl)
}
