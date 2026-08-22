import { errorState, formatData, mergeQuery, paramsToObject, progressPercent } from "./importLogUtils.js";

describe("import log utilities", () => {
  test("syncs allowlisted filters from URL and keeps latin API values", () => {
    const params = new URLSearchParams("status=failed&page=3&rowNumber=۱۲&ignored=x");
    expect(paramsToObject(params, ["status", "page"])).toEqual({ status: "failed", page: "3" });
  });

  test("changing a filter resets page while pagination preserves it", () => {
    expect(mergeQuery("page=4&status=success", { status: "failed" }).get("page")).toBeNull();
    expect(mergeQuery("page=4", { page: 5 }, false).get("page")).toBe("5");
  });

  test("guards progress division by zero", () => {
    expect(progressPercent(4, 0)).toBe(0);
    expect(progressPercent(5, 10)).toBe(50);
  });

  test("renders JSON, legacy text, scalar and null safely", () => {
    expect(formatData({ html: "<b>x</b>" })).toContain('"html": "<b>x</b>"');
    expect(formatData("legacy text")).toBe("legacy text");
    expect(formatData(12)).toBe("12");
    expect(formatData(null)).toBe("null");
  });

  test("has independent 403 and scoped 404 states", () => {
    expect(errorState({ response: { status: 403 } }).status).toBe(403);
    expect(errorState({ response: { status: 404 } }, true).message).toBe("رکورد یافت نشد یا دسترسی ندارید.");
  });
});
