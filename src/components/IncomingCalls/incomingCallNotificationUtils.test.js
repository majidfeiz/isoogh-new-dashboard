import { buildLatestSupportFormTarget, incomingCallNotificationTone, incomingNotificationDedupeKey, isIncomingCallNotification, notificationToIncomingCall } from "./incomingCallNotificationUtils.js";

const notification = {
  id: 10,
  type: "incoming_call.missed",
  createdAt: "2026-10-19T08:00:00.000Z",
  data: { event: "missed", callId: 481, schoolId: 146, status: "missed", callerPhone: "09121234567", matched: true, studentId: 920, callerName: "دانش‌آموز" },
};

test("recognizes and styles persistent incoming-call notifications", () => {
  expect(isIncomingCallNotification(notification)).toBe(true);
  expect(incomingCallNotificationTone(notification)).toBe("danger");
  expect(incomingNotificationDedupeKey(notification)).toBe("481:missed");
});

test("maps notification data to the realtime profile shape", () => {
  expect(notificationToIncomingCall(notification)).toEqual(expect.objectContaining({
    callId: 481, schoolId: 146, status: "missed",
    caller: expect.objectContaining({ phone: "09121234567", matched: true, studentId: 920 }),
  }));
});

test("builds the existing adviser form route only from IDs", () => {
  expect(buildLatestSupportFormTarget({ assignmentId: 301, supportFormId: 77, adviserId: 4, studentId: 920, title: "ignored" })).toEqual({
    pathname: "/adviser-calls/forms/77/students/920",
    search: "?assignmentId=301&adviserId=4",
    state: { assignmentId: 301, adviserId: 4, studentId: 920, supportFormId: 77, highlightAssignmentId: 301 },
  });
});
