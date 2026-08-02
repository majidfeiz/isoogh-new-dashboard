import { applyBaleTheme, baleQueryKey, createBaleAdapter, createIdempotencyKey, normalizeBootstrap, sanitizeBaleTelemetry, visibleBaleNavigation } from "./baleAdapter.js";

describe("Bale WebApp adapter", () => {
  it("uses raw initData and never initDataUnsafe", () => {
    const adapter = createBaleAdapter({ Bale: { WebApp: { initData: "signed-raw", initDataUnsafe: { user: { id: 123 } }, ready() {} } } });
    expect(adapter.initData).toBe("signed-raw");
    expect(adapter).not.toHaveProperty("initDataUnsafe");
  });

  it("maps supported theme params to CSS variables", () => {
    const style = { setProperty: jest.fn() };
    applyBaleTheme({ bg_color: "#111", text_color: "#eee", unknown: "x" }, { style });
    expect(style.setProperty).toHaveBeenCalledWith("--bale-bg", "#111");
    expect(style.setProperty).toHaveBeenCalledWith("--bale-text", "#eee");
    expect(style.setProperty).toHaveBeenCalledTimes(2);
  });

  it("creates stable-shaped unique keys", () => {
    expect(createIdempotencyKey()).toEqual(expect.any(String));
    expect(baleQueryKey({ role: "adviser", schoolId: 12, resource: "forms", params: { page: 1 } })).toEqual(["bale-mini", "adviser", "12", "forms", "{\"page\":1}"]);
  });

  it("normalizes a manager school and selects the only school", () => {
    expect(normalizeBootstrap({ activeRole: "manager", schools: [{ schoolId: 12, schoolName: "سرآمد" }] })).toMatchObject({
      activeRole: "manager",
      activeSchoolId: 12,
      schools: [{ id: 12, name: "سرآمد", schoolId: 12, schoolName: "سرآمد" }],
    });
  });

  it("preserves capability objects and keeps hidden routes addressable", () => {
    const result = normalizeBootstrap({
      capabilities: { canCall: true, canSubmitAnswers: false },
      navigation: [
        { key: "forms", path: "/forms", visible: true },
        { key: "students", path: "/students", visible: false },
        { key: "broken", label: "بدون مسیر" },
      ],
    });
    expect(result.capabilities).toEqual({ canCall: true, canSubmitAnswers: false });
    expect(result.navigation.map((item) => item.path)).toEqual(["/forms", "/students"]);
    expect(visibleBaleNavigation(result.navigation).map((item) => item.path)).toEqual(["/forms"]);
  });

  it("removes sensitive and complex values from telemetry", () => {
    expect(sanitizeBaleTelemetry({ stage: "bootstrap", route: "/", token: "secret", initData: "raw", phone: "0912", response: { data: true }, status: 500 })).toEqual({ stage: "bootstrap", route: "/", status: 500 });
  });
});
