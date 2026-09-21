export function outboundExcelFilename(contentDisposition, fallback = "outbound-call-histories.xlsx") {
  if (!contentDisposition) return fallback
  const encoded = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)?.[1]
  if (encoded) {
    try { return decodeURIComponent(encoded.replace(/^['"]|['"]$/g, "")) } catch { return fallback }
  }
  return contentDisposition.match(/filename\s*=\s*"([^"]+)"/i)?.[1]
    || contentDisposition.match(/filename\s*=\s*([^;]+)/i)?.[1]?.trim()
    || fallback
}

export function downloadOutboundExcel(blob, filename, documentRef = document, urlApi = window.URL) {
  const objectUrl = urlApi.createObjectURL(blob)
  const link = documentRef.createElement("a")
  link.href = objectUrl
  link.download = filename || "outbound-call-histories.xlsx"
  documentRef.body.appendChild(link)
  link.click()
  link.remove()
  urlApi.revokeObjectURL(objectUrl)
}
