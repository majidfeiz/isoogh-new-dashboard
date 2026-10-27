import { createdStudentId, createdUserId, findStudentId } from "./studentCreateUtils.js";

test("reads user and student ids from supported create/refetch response shapes", () => {
  expect(createdUserId({ user: { id: 10 }, student: { id: 20 } })).toBe(10);
  expect(createdStudentId({ user: { id: 10 }, student: { id: 20 } })).toBe(20);
  expect(findStudentId([{ id: 21, user_id: 11 }, { id: 20, user_id: 10 }], 10)).toBe(20);
});
