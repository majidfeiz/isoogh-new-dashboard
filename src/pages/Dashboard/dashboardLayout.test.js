import { buildDefaultDashboardLayout, selectDashboardLayout } from "./dashboardLayout.js";

test("keeps a non-empty personal layout and sorts it deterministically", () => {
  const personalWidgets = [
    { id: 20, widgetId: 2, sortOrder: 2, posY: 1, posX: 0, isVisible: false },
    { id: 10, widgetId: 1, sortOrder: 1, posY: 0, posX: 3, isVisible: true },
  ];
  const result = selectDashboardLayout({ personalWidgets, defaultDashboard: { widgets: [{ id: 99 }] } });
  expect(result.isDefaultView).toBe(false);
  expect(result.widgets.map((item) => item.widgetId)).toEqual([1, 2]);
  expect(result.widgets[1].isVisible).toBe(false);
});

test("does not replace an all-hidden personal dashboard with defaults", () => {
  const result = selectDashboardLayout({
    personalWidgets: [{ id: 1, widgetId: 7, isVisible: false }],
    defaultDashboard: { widgets: [{ id: 99 }] },
  });
  expect(result.isDefaultView).toBe(false);
  expect(result.widgets).toHaveLength(1);
  expect(result.widgets[0].widgetId).toBe(7);
});

test("uses defaults only for a successful empty personal response", () => {
  const result = selectDashboardLayout({
    personalWidgets: [],
    defaultDashboard: { widgets: [{ id: 2, sortOrder: 2 }, { id: 1, sortOrder: 1 }], gridCols: 12 },
  });
  expect(result.isDefaultView).toBe(true);
  expect(result.widgets.map((item) => item.widgetId)).toEqual([1, 2]);
});

test("builds a non-overlapping twelve-column default layout", () => {
  const layout = buildDefaultDashboardLayout([
    { id: 1, defaultW: 8, defaultH: 2 },
    { id: 2, defaultW: 6, defaultH: 3 },
  ]);
  expect(layout[0]).toMatchObject({ posX: 0, posY: 0, w: 8, h: 2 });
  expect(layout[1]).toMatchObject({ posX: 0, posY: 2, w: 6, h: 3 });
});

test("rejects an invalid personal response instead of falling back", () => {
  expect(() => selectDashboardLayout({ personalWidgets: null, defaultDashboard: { widgets: [] } })).toThrow();
});
