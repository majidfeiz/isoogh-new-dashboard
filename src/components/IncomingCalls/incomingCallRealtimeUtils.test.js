import { incomingCallKey, isSameIncomingCall, mergeIncomingCall, resolveIncomingCallSchool, unwrapRealtimePayload } from "./incomingCallRealtimeUtils.js";

test("unwraps the public HTTP/realtime data wrappers", () => {
  expect(unwrapRealtimePayload({ data: { data: { callId: 481 } } })).toEqual({ callId: 481 });
  expect(unwrapRealtimePayload({ data: { callId: 482 } })).toEqual({ callId: 482 });
});

test("deduplicates by callId or uniqueId", () => {
  expect(incomingCallKey({ callId: 481, uniqueId: "u1" })).toBe("call:481");
  expect(isSameIncomingCall({ callId: 481 }, { callId: "481" })).toBe(true);
  expect(isSameIncomingCall({ uniqueId: "u1" }, { uniqueId: "u1" })).toBe(true);
});

test("merges call updates without losing caller details", () => {
  const current = { callId: 481, status: "routing", caller: { phone: "0912", matched: true } };
  expect(mergeIncomingCall(current, { data: { callId: 481, status: "answered" } })).toEqual({
    callId: 481, status: "answered", caller: { phone: "0912", matched: true },
  });
  expect(mergeIncomingCall(current, { callId: 999, status: "ended" })).toBe(current);
});

test("resolves only an explicit or unambiguous school", () => {
  expect(resolveIncomingCallSchool({ school_id: 146 })).toBe(146);
  expect(resolveIncomingCallSchool({ schools: [{ id: 147 }] })).toBe(147);
  expect(resolveIncomingCallSchool({ schools: [{ id: 1 }, { id: 2 }] })).toBeNull();
});
