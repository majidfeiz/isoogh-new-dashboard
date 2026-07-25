export const USER_ROLE_IMPORT_MAX_SIZE = 5 * 1024 * 1024;
export const USER_ROLE_IMPORT_ACCEPT =
  ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export function validateUserRoleImportFile(file) {
  if (!file) return "انتخاب فایل Excel الزامی است.";

  const hasXlsxExtension = String(file.name || "")
    .toLowerCase()
    .endsWith(".xlsx");
  if (!hasXlsxExtension) return "فقط فایل با پسوند xlsx قابل قبول است.";

  if (Number(file.size || 0) > USER_ROLE_IMPORT_MAX_SIZE) {
    return "حجم فایل نباید بیشتر از ۵ مگابایت باشد.";
  }

  return "";
}

export function formatFileSize(bytes) {
  const size = Number(bytes || 0);
  if (size < 1024) return `${size} بایت`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} کیلوبایت`;
  return `${(size / (1024 * 1024)).toFixed(2)} مگابایت`;
}

export function escapeCsvCell(value) {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@]/.test(text)) {
    text = `'${text}`;
  }
  return `"${text.replace(/"/g, '""')}"`;
}

export function buildUserRoleIssuesCsv(issues = []) {
  const rows = [
    ["شماره سطر", "نام کاربری", "پیام"],
    ...issues.map((issue) => [
      issue?.rowNumber ?? "",
      issue?.username ?? "",
      issue?.message ?? "",
    ]),
  ];
  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
}
