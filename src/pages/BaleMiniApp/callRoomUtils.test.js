import { baleCallErrorText, isCallReady, shouldRotateCallKey, validateCallPayload } from "./callRoomUtils.js";

describe("Bale call-room contracts", () => {
  it("requires explicit readiness and required scoped identifiers", () => {
    expect(isCallReady(undefined)).toBe(false);
    expect(isCallReady({ ready: false })).toBe(false);
    expect(isCallReady({ ready: true })).toBe(true);
    expect(validateCallPayload({ schoolId: 94, supportFormId: 12, studentId: null, voipLineId: 30 })).toEqual(["studentId"]);
  });

  it("extracts both backend error wrappers and validation arrays", () => {
    expect(baleCallErrorText({ response: { data: { message: ["schoolId الزامی است", "studentId الزامی است"] } } }, "fallback").text).toBe("schoolId الزامی است، studentId الزامی است");
    expect(baleCallErrorText({ response: { data: { data: { message: "سیموتل پاسخ نداد", traceId: "trace-1", correlationId: "corr-1" } } } }, "fallback")).toEqual({ text: "سیموتل پاسخ نداد", traceId: "trace-1", correlationId: "corr-1" });
  });

  it("rotates the idempotency key only for a definitive 502 failure", () => {
    expect(shouldRotateCallKey({ response: { status: 502 } })).toBe(true);
    expect(shouldRotateCallKey({ code: "ECONNABORTED" })).toBe(false);
    expect(shouldRotateCallKey({ response: { status: 503 } })).toBe(false);
  });
});
