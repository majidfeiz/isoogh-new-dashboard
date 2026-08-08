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

export const USER_ROLE_ISSUE_LABELS = {
  EMPTY_IDENTIFIER: "شناسه خالی",
  DUPLICATE_IDENTIFIER: "شناسه تکراری",
  DUPLICATE_USER_REFERENCE: "ارجاع تکراری به کاربر",
  AMBIGUOUS_IDENTIFIER: "شناسه مبهم",
  USER_NOT_FOUND: "کاربر یافت نشد",
};

export const USER_ROLE_ISSUE_HELP = {
  AMBIGUOUS_IDENTIFIER:
    "این شناسه به بیش از یک کاربر تطبیق داده شده است؛ مقدار را اصلاح کنید.",
  DUPLICATE_USER_REFERENCE:
    "همین کاربر با شناسه دیگری قبلاً در فایل آمده است.",
};

export function getUserRoleIssueIdentifier(issue = {}) {
  return issue.identifier ?? issue.username ?? "";
}

export function getUserRoleImportErrorMessage(error) {
  const value = error?.response?.data?.message;
  if (Array.isArray(value)) return value.filter(Boolean).join("، ");
  if (typeof value === "string" && value.trim()) return value;
  const nested = error?.response?.data?.error;
  if (typeof nested === "string" && nested.trim()) return nested;
  return "اطلاعات فایل یا نقش انتخاب‌شده معتبر نیست.";
}

export function buildUserRoleIssuesCsv(issues = []) {
  const rows = [
    ["شماره سطر", "نام کاربری/موبایل", "کد خطا", "پیام"],
    ...issues.map((issue) => [
      issue?.rowNumber ?? "",
      getUserRoleIssueIdentifier(issue),
      issue?.code ?? "",
      issue?.message ?? "",
    ]),
  ];
  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
}
