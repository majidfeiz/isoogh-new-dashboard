import {
  appendStudentCreateImportFields,
  DEFAULT_USE_USERNAME_AS_PHONE,
} from "./studentImportUtils.js";

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
