import {
  buildUserRoleIssuesCsv,
  escapeCsvCell,
  getUserRoleIssueIdentifier,
  USER_ROLE_IMPORT_MAX_SIZE,
  validateUserRoleImportFile,
} from "./userRoleImportUtils.js";

test("validates xlsx extension and five megabyte size", () => {
  expect(validateUserRoleImportFile(null)).toBe("انتخاب فایل Excel الزامی است.");
  expect(validateUserRoleImportFile({ name: "users.csv", size: 10 })).toContain(
    "xlsx"
  );
  expect(
    validateUserRoleImportFile({
      name: "users.xlsx",
      size: USER_ROLE_IMPORT_MAX_SIZE + 1,
    })
  ).toContain("۵ مگابایت");
  expect(
    validateUserRoleImportFile({ name: "USERS.XLSX", size: 1024 })
  ).toBe("");
});

test("escapes CSV formulas, quotes and Persian issue rows", () => {
  expect(escapeCsvCell("=HYPERLINK(\"x\")")).toBe(
    "\"'=HYPERLINK(\"\"x\"\")\""
  );
  expect(escapeCsvCell("+1")).toBe("\"'+1\"");
  expect(escapeCsvCell("-1")).toBe("\"'-1\"");
  expect(escapeCsvCell("@cmd")).toBe("\"'@cmd\"");

  const csv = buildUserRoleIssuesCsv([
    { rowNumber: 4, username: "legacy", identifier: "=danger", code: "USER_NOT_FOUND", message: "کاربر یافت نشد" },
  ]);
  expect(csv).toContain('"شماره سطر","نام کاربری/موبایل","کد خطا","پیام"');
  expect(csv).toContain('"\'=danger"');
  expect(csv).toContain('"USER_NOT_FOUND"');
  expect(csv).toContain('"کاربر یافت نشد"');
});

test("prefers identifier while preserving the legacy username fallback", () => {
  expect(getUserRoleIssueIdentifier({ identifier: "0912", username: "old" })).toBe("0912");
  expect(getUserRoleIssueIdentifier({ username: "legacy.user" })).toBe("legacy.user");
});
