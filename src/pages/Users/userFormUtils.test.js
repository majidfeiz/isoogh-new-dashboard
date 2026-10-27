import { buildUserPayload, getUserApiErrors, isAdminUser, userDetailsToForm, validateUserForm, withAccountType } from "./userFormUtils.js";

test("builds a student payload for an admin without adviser fields", () => {
  expect(buildUserPayload({
    name: "سارا هاشم آبادی",
    email: "iderun10111@gmail.com",
    username: "",
    ssn: "",
    phone: "09194826176",
    status: "active",
    confirmPassword: "secret",
    mobile: "09190000000",
    accountType: "student",
    isSuperAdviser: true,
    password: "secret",
    schoolIds: ["12"],
  }, { isAdmin: true })).toEqual({
    name: "سارا هاشم آبادی",
    email: "iderun10111@gmail.com",
    username: "",
    phone: "09194826176",
    password: "secret",
    accountType: "student",
    schoolIds: [12],
  });
});

test("includes password only when the user entered one", () => {
  expect(buildUserPayload({ password: "" })).toHaveProperty("password", "");
  expect(buildUserPayload({ password: "new-secret" })).toHaveProperty("password", "new-secret");
  expect(buildUserPayload({ password: "" }, { isEdit: true })).not.toHaveProperty("password");
});

test.each([[false, false], [true, true]])("maps adviser level %s to isSuperAdviser=%s", (level, expected) => {
  expect(buildUserPayload({ accountType: "adviser", isSuperAdviser: level })).toMatchObject({ accountType: "adviser", isSuperAdviser: expected });
});

test("removes stale adviser level when account type changes to student", () => {
  expect(withAccountType({ accountType: "adviser", isSuperAdviser: true }, "student")).toEqual({ accountType: "student" });
});

test("omits accountType on edit and manager-controlled schoolIds", () => {
  const payload = buildUserPayload({ accountType: "student", schoolIds: [99], password: "" }, { isEdit: true, isAdmin: false });
  expect(payload).not.toHaveProperty("accountType");
  expect(payload).not.toHaveProperty("schoolIds");
  expect(payload).not.toHaveProperty("password");
});

test("validates the create-user contract", () => {
  const form = { name: "", username: "", password: "123", phone: "", ssn: "۱۲۳", email: "bad", accountType: "student", schoolIds: [] };
  expect(validateUserForm(form, { isAdmin: true })).toMatchObject({ name: expect.any(Array), username: expect.any(Array), password: expect.any(Array), phone: expect.any(Array), ssn: expect.any(Array), email: expect.any(Array), schoolIds: expect.any(Array) });
  const valid = validateUserForm({ ...form, name: "علی", username: "ali_12", password: "123456", confirmPassword: "123456", phone: "+9821", ssn: "", email: "" }, { isAdmin: false });
  expect(valid).not.toHaveProperty("username");
  expect(valid).not.toHaveProperty("phone");
  expect(valid).not.toHaveProperty("schoolIds");
});

test("detects admin roles without treating a manager as admin", () => {
  expect(isAdminUser({ roles: [{ name: "admin" }] })).toBe(true);
  expect(isAdminUser({ roles: [{ name: "manager" }] })).toBe(false);
});

test("maps conflict messages to related fields", () => {
  const result = getUserApiErrors({ response: { status: 409, data: { message: "username already exists" } } });
  expect(result.fieldErrors.username[0]).toContain("نام کاربری");
});

test.each([400, 403, 409])("normalizes array validation messages for status %s", (status) => {
  const result = getUserApiErrors({ response: { status, data: { message: ["پیام اول", "پیام دوم"] } } });
  expect(result.message).toBe("پیام اول، پیام دوم");
});

test("shows a friendly account type contract error", () => {
  const result = getUserApiErrors({ response: { status: 400, data: { message: ["accountType must be one of the following values: student, adviser"] } } });
  expect(result.message).toBe("نوع حساب ارسالی نامعتبر است؛ صفحه را تازه‌سازی کنید");
});

test("hydrates edit state only from accountType and isSuperAdviser", () => {
  expect(userDetailsToForm({ accountType: "adviser", isSuperAdviser: true, schoolIds: [12], roles: [{ name: "student" }] })).toMatchObject({ accountType: "adviser", isSuperAdviser: true, schoolIds: ["12"], password: "" });
  expect(userDetailsToForm({ accountType: "student", isSuperAdviser: true, roles: [{ name: "super_adviser" }] }).isSuperAdviser).toBe(false);
});
