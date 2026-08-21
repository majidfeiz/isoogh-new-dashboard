export function salaryExportFilename(contentDisposition, year, month) {
  const fallback = `super-adviser-salary-${year}-${String(month).padStart(2, "0")}.xlsx`;
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

export function saveSalaryExportBlob(blob, contentDisposition, year, month, documentRef = document, urlApi = window.URL) {
  const filename = salaryExportFilename(contentDisposition, year, month);
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

export async function salaryExportErrorMessage(error) {
  let data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      const text = typeof data.text === "function"
        ? await data.text()
        : await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsText(data);
          });
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  const message = data?.message;
  if (Array.isArray(message)) return message.filter(Boolean).join("، ");
  return message || data?.error || "دریافت فایل Excel انجام نشد.";
}
