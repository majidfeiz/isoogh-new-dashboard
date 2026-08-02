import { customDateRange, datePreset, isAdminUser, statsChartData, validIsoRange } from "./auditLogUtils.js";

describe("audit log date ranges", () => {
  test("today preset uses an exclusive next-day boundary", () => {
    const result = datePreset("today", new Date(2026, 7, 2, 15, 30));
    expect(new Date(result.from).getHours()).toBe(0);
    expect(new Date(result.to).getHours()).toBe(0);
    expect(new Date(result.to).getTime() - new Date(result.from).getTime()).toBe(86400000);
  });

  test("custom range includes the selected last day and rejects reversed dates", () => {
    const valid = customDateRange(new Date(2026, 7, 1), new Date(2026, 7, 2));
    expect(validIsoRange(valid.from, valid.to)).toBe(true);
    expect(new Date(valid.to).getDate()).toBe(3);
    expect(customDateRange(new Date(2026, 7, 3), new Date(2026, 7, 1)).error).toMatch(/قبل/);
    expect(validIsoRange("2026-08-03T00:00:00Z", "2026-08-02T00:00:00Z")).toBe(false);
  });
});

test("chart payload counts are mapped to numbers and action labels", () => {
  const result = statsChartData({
    timeline: [{ date: "2026-08-02", count: "4" }],
    byModule: [{ key: "users", count: "3" }],
    byAction: [{ key: "create", count: "2" }],
    byUser: [{ userId: "1", count: "5" }],
  });
  expect(result.timeline[0].count).toBe(4);
  expect(result.actions[0]).toEqual(expect.objectContaining({ label: "ایجاد", count: 2 }));
  expect(result.users[0].count).toBe(5);
});

test("school filter is restricted to admin roles", () => {
  expect(isAdminUser({ roles: [{ name: "admin" }] })).toBe(true);
  expect(isAdminUser({ roles: [{ name: "manager" }] })).toBe(false);
});
