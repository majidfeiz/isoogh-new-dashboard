import {
  DASHBOARD_CHART_TYPES,
  isDashboardChartEmpty,
  toDashboardChartSeries,
  unwrapDashboardPayload,
} from "./dashboardChartAdapter.js";
import { getWidgetRequestKey } from "./dashboardDateRange.js";

test("unwraps the public API envelope without passing it to charts", () => {
  const payload = { data: [{ label: "دهم", value: 12 }] };
  expect(unwrapDashboardPayload({ success: true, data: payload })).toBe(payload);
  expect(unwrapDashboardPayload({ data: { success: true, data: payload } }, { axiosResponse: true })).toBe(payload);
});

test("maps every manager chart widget to its explicit endpoint type", () => {
  expect(DASHBOARD_CHART_TYPES).toEqual({
    students_by_grade: "students-by-grade",
    students_by_province: "students-by-province",
    students_by_shift: "students-by-shift",
    voip_calls_weekly: "voip-calls-weekly",
    voip_calls_by_disposition: "voip-by-disposition",
    support_forms_by_grade: "support-forms-by-grade",
    import_logs_by_status: "import-logs-by-status",
  });
});

test("normalizes standard chart values including zero", () => {
  const model = toDashboardChartSeries("students_by_grade", {
    data: [{ label: "دهم", value: "12" }, { label: "یازدهم", value: 0 }],
  });
  expect(model).toEqual({ kind: "standard", labels: ["دهم", "یازدهم"], series: [12, 0] });
  expect(isDashboardChartEmpty(model)).toBe(false);
});

test("builds two aligned weekly series", () => {
  const model = toDashboardChartSeries("voip_calls_weekly", {
    data: [{ date: "2026-10-04", count: "8", answered: 0 }],
  });
  expect(model.categories).toEqual(["2026-10-04"]);
  expect(model.series).toEqual([
    { name: "کل تماس‌ها", data: [8] },
    { name: "پاسخ‌داده‌شده", data: [0] },
  ]);
});

test("separates empty all-zero data from invalid payloads", () => {
  expect(isDashboardChartEmpty(toDashboardChartSeries("students_by_shift", {
    data: [{ label: "صبح", value: 0 }],
  }))).toBe(true);
  expect(() => toDashboardChartSeries("students_by_shift", { data: [{ label: "صبح", value: "invalid" }] })).toThrow();
});

test("namespaces request keys by user and exact range", () => {
  const config = { dateRangeFrom: "2026-10-04T00:00:00+03:30", dateRangeTo: "2026-10-05T00:00:00+03:30" };
  expect(getWidgetRequestKey("chart", "students-by-grade", config, "manager-7"))
    .toBe("manager-7|chart|students-by-grade|2026-10-04T00:00:00+03:30|2026-10-05T00:00:00+03:30");
  expect(getWidgetRequestKey("chart", "students-by-grade", config, "manager-8"))
    .not.toBe(getWidgetRequestKey("chart", "students-by-grade", config, "manager-7"));
});
