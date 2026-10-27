import {
  ACCOUNT_TYPES,
  createdUserMatchesStudentContract,
  toStudentCreatePayload,
  toUserCreatePayload,
  validateCreateUserPayload,
} from "./userCreateContract.js";

const values = {
  name: "  علی محمدی  ",
  username: " ali.mohammadi ",
  phone: " 09121234567 ",
  ssn: "۰۰۱۲۳۴۵۶۷۸",
  email: " ali@example.com ",
  password: "secret123",
  schoolIds: ["12"],
  isSuperAdviser: true,
};

test("student mapper always sends the student account type without adviser fields", () => {
  const payload = toStudentCreatePayload({ ...values, accountType: "دانش‌آموز" });
  expect(payload).toEqual({
    name: "علی محمدی",
    username: "ali.mohammadi",
    phone: "09121234567",
    ssn: "0012345678",
    email: "ali@example.com",
    password: "secret123",
    accountType: ACCOUNT_TYPES.STUDENT,
    schoolIds: [12],
  });
  expect(payload).not.toHaveProperty("isSuperAdviser");
});

test.each([[false, false], [true, true]])("normal and super advisers use adviser accountType with level %s", (isSuperAdviser, expected) => {
  expect(toUserCreatePayload({ ...values, accountType: "adviser", isSuperAdviser })).toMatchObject({
    accountType: ACCOUNT_TYPES.ADVISER,
    isSuperAdviser: expected,
  });
});

test("student from the general user form never carries a stale adviser level", () => {
  const payload = toUserCreatePayload({ ...values, accountType: "student", isSuperAdviser: true });
  expect(payload.accountType).toBe("student");
  expect(payload).not.toHaveProperty("isSuperAdviser");
});

test.each(["دانش‌آموز", "Student", "super_adviser", "", undefined])("rejects invalid accountType %s", (accountType) => {
  expect(validateCreateUserPayload({ ...toStudentCreatePayload(values), accountType })).toHaveProperty("accountType");
});

test("accepts a non-mobile phone string up to 20 characters", () => {
  expect(validateCreateUserPayload({ ...toStudentCreatePayload(values), phone: "+98-21-12345678" })).not.toHaveProperty("phone");
});

test("verifies the role and requested school after student creation", () => {
  expect(createdUserMatchesStudentContract({ accountType: "student", roles: [{ name: "student" }], schools: [{ id: 12 }] }, [12])).toBe(true);
  expect(createdUserMatchesStudentContract({ accountType: "student", roles: [], schoolIds: [12] }, [12])).toBe(false);
});
