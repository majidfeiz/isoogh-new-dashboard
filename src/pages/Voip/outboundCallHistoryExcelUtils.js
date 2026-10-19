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
  try {
    const link = documentRef.createElement("a")
    link.href = objectUrl
    link.download = filename || "outbound-call-histories.xlsx"
    documentRef.body.appendChild(link)
    link.click()
    link.remove()
  } finally {
    urlApi.revokeObjectURL(objectUrl)
  }
}

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

export async function validateOutboundExcelBlob(blob, contentType = "") {
  if (!(blob instanceof Blob) || blob.size === 0) throw new Error("فایل Excel دریافتی خالی است.")
  const mime = String(contentType || blob.type || "").toLowerCase().split(";")[0].trim()
  if (mime === XLSX_MIME || mime === "application/octet-stream" || !mime) return blob

  if (mime.includes("json") || mime.startsWith("text/")) {
    const text = await blob.text()
    let parsed
    try {
      parsed = JSON.parse(text)
    } catch { /* plain-text error response */ }
    const message = Array.isArray(parsed?.message) ? parsed.message.join("، ") : parsed?.message || parsed?.error || text.trim()
    if (message) throw new Error(message)
  }
  throw new Error("پاسخ سرور یک فایل Excel معتبر نیست.")
}
