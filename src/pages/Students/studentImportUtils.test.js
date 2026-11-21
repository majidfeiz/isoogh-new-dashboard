import {
  appendStudentCreateImportFields,
  DEFAULT_USE_USERNAME_AS_PHONE,
  STUDENT_IMPORT_HEADERS,
  STUDENT_IMPORT_SAMPLE_ROW,
  studentImportSampleRows,
} from "./studentImportUtils.js";
import * as XLSX from "xlsx";

test("sample uses the complete canonical header contract without a school-name column", () => {
  expect(STUDENT_IMPORT_HEADERS).toEqual([
    "username", "name", "password", "phone", "ssn", "email", "birthday", "point",
    "phone_2", "phone_3", "shift", "city", "province", "region", "institute_type",
    "institute_name", "grade", "major", "decile", "scholarship_type", "gpa",
    "emergency_phone", "village", "religion", "relationship", "group_id",
    "voip_phone", "work_shift_id", "sexuality",
  ]);
  expect(STUDENT_IMPORT_HEADERS).not.toContain("schoolId");
  expect(STUDENT_IMPORT_HEADERS).not.toContain("school_name");
  expect(STUDENT_IMPORT_HEADERS).not.toContain("اسم مجموعه");
});

test("sample education values preserve the decimal GPA and canonical sexuality", () => {
  expect(STUDENT_IMPORT_SAMPLE_ROW).toEqual(expect.objectContaining({
    grade: "دوازدهم",
    major: "ریاضی فیزیک",
    decile: "4",
    scholarship_type: "نیمه‌بورسیه",
    gpa: "12.37",
    institute_type: "دولتی",
    institute_name: "دبیرستان نمونه",
    sexuality: "female",
  }));
  const rows = studentImportSampleRows();
  expect(rows[1][rows[0].indexOf("gpa")]).toBe("12.37");
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const parsed = XLSX.utils.sheet_to_json(worksheet, { raw: true });
  expect(Object.keys(parsed[0])).toEqual(STUDENT_IMPORT_HEADERS);
  expect(parsed[0].gpa).toBe("12.37");
});

test("username-as-phone is disabled by default and is sent explicitly as false", () => {
  const file = new Blob(["xlsx"]);
  const formData = new FormData();
  formData.append("file", file, "students.xlsx");

  appendStudentCreateImportFields(formData, { schoolId: "7", defaultPassword: "secret1" });

  expect(DEFAULT_USE_USERNAME_AS_PHONE).toBe(false);
  expect(formData.get("useUsernameAsPhone")).toBe("false");
  expect(formData.get("schoolId")).toBe("7");
  expect(formData.get("defaultPassword")).toBe("secret1");
  expect(formData.get("file")).toBeInstanceOf(Blob);
});

test("sends true without changing the existing import fields", () => {
  const formData = new FormData();
  formData.append("file", new Blob(["xlsx"]), "students.xlsx");

  appendStudentCreateImportFields(formData, {
    schoolId: "9",
    defaultPassword: "password9",
    useUsernameAsPhone: true,
  });

  expect(formData.get("useUsernameAsPhone")).toBe("true");
  expect(formData.get("schoolId")).toBe("9");
  expect(formData.get("defaultPassword")).toBe("password9");
  expect(formData.get("file").name).toBe("students.xlsx");
});
