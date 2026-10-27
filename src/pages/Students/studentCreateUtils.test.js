import { createdStudentId, createdUserId, findStudentId, isRegistrationPhoneLookupEligible, REGISTRATION_PHONE_DEBOUNCE_MS, REGISTRATION_USERNAME_DEBOUNCE_MS } from "./studentCreateUtils.js";

test("reads user and student ids from supported create/refetch response shapes", () => {
  expect(createdUserId({ user: { id: 10 }, student: { id: 20 } })).toBe(10);
  expect(createdStudentId({ user: { id: 10 }, student: { id: 20 } })).toBe(20);
  expect(findStudentId([{ id: 21, user_id: 11 }, { id: 20, user_id: 10 }], 10)).toBe(20);
});

test.each([
  ["09121234567", true],
  ["0912123456", false],
  ["091212345678", false],
  ["0912abc4567", false],
  ["", false],
])("runs phone availability lookup only for exactly 11 digits: %s", (phone, expected) => {
  expect(isRegistrationPhoneLookupEligible(phone)).toBe(expected);
});

test("uses a longer debounce for username availability checks", () => {
  expect(REGISTRATION_USERNAME_DEBOUNCE_MS).toBe(2000);
  expect(REGISTRATION_USERNAME_DEBOUNCE_MS).toBeGreaterThan(REGISTRATION_PHONE_DEBOUNCE_MS);
});
