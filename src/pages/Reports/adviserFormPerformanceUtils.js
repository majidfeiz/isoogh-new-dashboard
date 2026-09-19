export const EMPTY_META = { page: 1, limit: 15, total: 0, lastPage: 1 }

export const sortQuestions = (questions = []) => [...questions].sort((a, b) =>
  Number(a?.order ?? 0) - Number(b?.order ?? 0) || Number(a?.id ?? 0) - Number(b?.id ?? 0)
)

export const displayValue = (value) => value == null ? "—" : String(value)

export function filenameFromContentDisposition(header, fallback = "adviser-form-performance-report.xlsx") {
  if (!header) return fallback
  const encoded = header.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)?.[1]
  if (encoded) {
    try { return decodeURIComponent(encoded.replace(/^['"]|['"]$/g, "")) } catch { return fallback }
  }
  return header.match(/filename\s*=\s*"([^"]+)"/i)?.[1]
    || header.match(/filename\s*=\s*([^;]+)/i)?.[1]?.trim()
    || fallback
}

export function downloadBlob(blob, filename, documentRef = document, urlApi = window.URL) {
  const url = urlApi.createObjectURL(blob)
  const link = documentRef.createElement("a")
  link.href = url
  link.download = filename
  documentRef.body.appendChild(link)
  link.click()
  link.remove()
  urlApi.revokeObjectURL(url)
}
