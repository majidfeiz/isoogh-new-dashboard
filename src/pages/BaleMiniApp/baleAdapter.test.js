import { applyBaleTheme, baleQueryKey, createBaleAdapter, createIdempotencyKey } from "./baleAdapter.js";

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
});
