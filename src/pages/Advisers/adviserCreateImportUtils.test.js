import * as XLSX from "xlsx";
import { ADVISER_IMPORT_HEADERS, ADVISER_IMPORT_SAMPLE_ROW, adviserFieldErrors, adviserImportSampleRows, buildAdviserImportFormData } from "./adviserCreateImportUtils.js";

test("creates the exact adviser template contract without forbidden columns", () => {
  expect(ADVISER_IMPORT_HEADERS).toEqual(["name", "phone", "username", "email", "password", "grades"]);
  ["first_name", "last_name", "role", "adviser_type", "parent_phone", "schoolName"].forEach((header) => expect(ADVISER_IMPORT_HEADERS).not.toContain(header));
  expect(ADVISER_IMPORT_SAMPLE_ROW).toEqual(expect.objectContaining({ phone: "09121234567", grades: "دهم|یازدهم" }));
  const sheet = XLSX.utils.aoa_to_sheet(adviserImportSampleRows());
  expect(XLSX.utils.sheet_to_json(sheet, { raw: true })[0].phone).toBe("09121234567");
});

test("builds multipart fields with selected school and optional default password", () => {
  const file = new File(["xlsx"], "advisers.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const formData = buildAdviserImportFormData({ file, schoolId: "94", defaultPassword: "secret12" });
  expect(formData.get("file").name).toBe("advisers.xlsx");
  expect(formData.get("schoolId")).toBe("94");
  expect(formData.get("defaultPassword")).toBe("secret12");
});

test("maps backend field prefixes without exposing unrelated fields", () => {
  expect(adviserFieldErrors({ response: { data: { message: ["[password] رمز لازم است", "[phone] موبایل نامعتبر است"] } } }))
    .toEqual({ password: "رمز لازم است", phone: "موبایل نامعتبر است" });
});
