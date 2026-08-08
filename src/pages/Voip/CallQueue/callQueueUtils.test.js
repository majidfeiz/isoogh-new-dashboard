import { oldestQueueWait, QUEUE_STATUS, shouldPollCallQueue } from "./callQueueUtils.js";

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
