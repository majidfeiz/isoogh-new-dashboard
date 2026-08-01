export function superAdviserStudentsFilename(contentDisposition, fallback = "super-adviser-students.xlsx") {
  const raw = String(contentDisposition || "");
  const utf8 = raw.match(/filename\*=UTF-8''([^;]+)/i);
  const plain = raw.match(/filename="?([^";]+)"?/i);
  const encoded = utf8?.[1] || plain?.[1];
  if (!encoded) return fallback;
  try {
    return decodeURIComponent(encoded.trim());
  } catch {
    return encoded.trim() || fallback;
  }
}

export function saveSuperAdviserStudentsBlob(
  blob,
  contentDisposition = "",
  documentRef = document,
  urlApi = window.URL
) {
  const filename = superAdviserStudentsFilename(contentDisposition);
  const objectUrl = urlApi.createObjectURL(blob);
  const link = documentRef.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  documentRef.body.appendChild(link);
  link.click();
  link.remove();
  urlApi.revokeObjectURL(objectUrl);
  return filename;
}
