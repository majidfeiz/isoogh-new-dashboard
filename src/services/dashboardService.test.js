import { apiGet, apiPut } from "../helpers/httpClient.jsx";
import { getDashboardChart, getDashboardRecent, getDashboardStats, getMyDashboard, saveDashboardLayout } from "./dashboardService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiPatch: jest.fn(),
  apiDelete: jest.fn(),
}));

beforeEach(() => {
  apiGet.mockReset();
  apiPut.mockReset();
});

test.each([
  { data: [{ widgetId: 1 }] },
  { data: { data: [{ widgetId: 1 }] } },
  { data: { widgets: [{ widgetId: 1 }] } },
  { data: { data: { widgets: [{ widgetId: 1 }] } } },
])("normalizes supported personal dashboard response shapes", async (response) => {
  apiGet.mockResolvedValue(response);

  await expect(getMyDashboard()).resolves.toEqual([{ widgetId: 1 }]);
});

test("saves the complete layout snapshot and normalizes the response", async () => {
  const widgets = [{ widgetId: 7, posX: 4, posY: 3, w: 2, h: 2 }];
  apiPut.mockResolvedValue({ data: { data: { widgets } } });

  await expect(saveDashboardLayout(widgets)).resolves.toEqual(widgets);
  expect(apiPut).toHaveBeenCalledWith(expect.stringContaining("/dashboard/my/layout"), { widgets });
});

test("unwraps chart payload and safely encodes a complete timezone range", async () => {
  const payload = { data: [{ label: "تهران", value: 4 }] };
  apiGet.mockResolvedValue({ data: { success: true, data: payload } });

  await expect(getDashboardChart("students-by-province", {
    from: "2026-10-04T00:00:00+03:30",
    to: "2026-10-05T00:00:00+03:30",
  })).resolves.toBe(payload);

  const params = apiGet.mock.calls[0][1].params;
  expect(params).toBeInstanceOf(URLSearchParams);
  expect(params.toString()).toContain("%2B03%3A30");
  expect(params.get("from")).toBe("2026-10-04T00:00:00+03:30");
});

test("omits both date params when the range is incomplete", async () => {
  apiGet.mockResolvedValue({ data: { success: true, data: { supportForms: {} } } });
  await getDashboardStats({ from: "2026-10-04T00:00:00+03:30" });
  expect(apiGet.mock.calls[0][1].params.toString()).toBe("");
});

test("recent requests contain only limit and a complete encoded range", async () => {
  apiGet.mockResolvedValue({ data: { success: true, data: { items: [] } } });
  await getDashboardRecent("students", 7, {
    from: "2026-10-04T00:00:00+03:30",
    to: "2026-10-05T00:00:00+03:30",
  });
  const params = apiGet.mock.calls[0][1].params;
  expect(Object.fromEntries(params)).toEqual({
    limit: "7",
    from: "2026-10-04T00:00:00+03:30",
    to: "2026-10-05T00:00:00+03:30",
  });
  expect(params.toString()).not.toMatch(/userId|managerId|schoolId|adviserId/);
});

test("invalid personal dashboard payload rejects instead of falling back to defaults", async () => {
  apiGet.mockResolvedValue({ data: { success: true, data: { unexpected: true } } });
  await expect(getMyDashboard()).rejects.toThrow("Invalid personal dashboard response");
});
