import {
  isCallQueueAdminLike,
  oldestQueueWait,
  parseCallQueueQuery,
  QUEUE_STATUS,
  serializeCallQueueQuery,
  shouldPollCallQueue,
} from "./callQueueUtils.js";

test("polling requires a selected school and visible tab", () => {
  expect(shouldPollCallQueue("7", "visible")).toBe(true);
  expect(shouldPollCallQueue("7", "hidden")).toBe(false);
  expect(shouldPollCallQueue("", "visible")).toBe(false);
});

test("queue statuses are Persian and queue completion only means sent", () => {
  expect(QUEUE_STATUS.completed.label).toBe("ارسال‌شده");
  expect(QUEUE_STATUS.completed.label).not.toMatch(/پاسخ|وصل/);
});

test("oldest queued time is rendered as a duration", () => {
  expect(oldestQueueWait("2026-08-04T10:00:00.000Z", Date.parse("2026-08-04T10:01:05.000Z"))).toBe("۱ دقیقه و ۵ ثانیه");
});

test("admin-like roles include admin and super_manager object or string roles", () => {
  expect(isCallQueueAdminLike({ roles: [{ name: "admin" }] })).toBe(true);
  expect(isCallQueueAdminLike({ roles: ["super_manager"] })).toBe(true);
  expect(isCallQueueAdminLike({ roles: [{ name: "manager" }] })).toBe(false);
});

test("allSchools is true only for the exact string true and admin-like users", () => {
  expect(parseCallQueueQuery(new URLSearchParams("allSchools=true"), true).allSchools).toBe(true);
  expect(parseCallQueueQuery(new URLSearchParams("allSchools=false"), true).allSchools).toBe(false);
  expect(parseCallQueueQuery(new URLSearchParams("allSchools=true"), false).allSchools).toBe(false);
});

test("school scope wins serialization and query state keeps server pagination", () => {
  const serialized = serializeCallQueueQuery({ schoolId: 12, allSchools: true, status: "pending", page: 3, limit: 50 });
  expect(serialized.toString()).toBe("schoolId=12&status=pending&page=3&limit=50");
  expect(parseCallQueueQuery(serialized, true)).toEqual({ schoolId: 12, allSchools: false, status: "pending", page: 3, limit: 50 });
});
