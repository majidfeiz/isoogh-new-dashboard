import {
  parseCallTraceQuery,
  getTraceListState,
  readableStep,
  serializeCallTraceQuery,
  shouldPollDetail,
  shouldPollList,
  TRACE_STATUS,
} from "./callTraceUtils.js";

describe("call trace status and step mapping", () => {
  test("maps statuses and known Simotel errors", () => {
    expect(TRACE_STATUS.failed).toEqual({ label: "ناموفق", color: "danger" });
    expect(readableStep("simotel_unreachable")).toBe("عدم دسترسی به سیموتل");
    expect(readableStep("new_backend_step")).toBe("new backend step");
  });
});

describe("call trace polling", () => {
  test("polls only active rows in a visible tab", () => {
    expect(shouldPollList([{ status: "in_progress" }], "visible")).toBe(true);
    expect(shouldPollList([{ status: "waiting_for_cdr" }], "hidden")).toBe(false);
    expect(shouldPollList([{ status: "completed" }, { status: "failed" }], "visible")).toBe(false);
  });

  test("stops detail polling for final statuses", () => {
    expect(shouldPollDetail({ status: "in_progress" }, "visible")).toBe(true);
    expect(shouldPollDetail({ status: "failed" }, "visible")).toBe(false);
    expect(shouldPollDetail({ status: "completed" }, "visible")).toBe(false);
  });
});

describe("call trace URL filters", () => {
  test("round-trips all API filter keys and resets invalid pagination", () => {
    const query = {
      page: 3,
      limit: 50,
      search: "corr-42",
      status: "failed",
      adviserId: "1",
      studentId: "2",
      supportFormId: "3",
      from: "2026-07-01",
      to: "2026-07-30",
      traceId: "42",
    };
    expect(parseCallTraceQuery(serializeCallTraceQuery(query))).toEqual(query);
    expect(parseCallTraceQuery(new URLSearchParams("page=0&limit=101")).page).toBe(1);
    expect(parseCallTraceQuery(new URLSearchParams("page=0&limit=101")).limit).toBe(15);
  });
});

describe("call trace list states", () => {
  test("keeps loading, error, empty and ready states independent", () => {
    expect(getTraceListState({ loading: true, error: "", items: [] })).toBe("loading");
    expect(getTraceListState({ loading: false, error: "network", items: [] })).toBe("error");
    expect(getTraceListState({ loading: false, error: "", items: [] })).toBe("empty");
    expect(getTraceListState({ loading: false, error: "", items: [{ id: 1 }] })).toBe("ready");
  });
});
