import { getStatsWidgetValue } from "./StatsWidget.jsx";

test("adviser stats take precedence over the compatibility superAdviser alias", () => {
  const stats = {
    adviser: { onlineToday: 1, totalCallsToday: 7, successfulCallsToday: 4, monthlyDurationSeconds: 120 },
    superAdviser: { onlineToday: 99, totalCallsToday: 99, successfulCallsToday: 99, monthlyDurationSeconds: 99 },
  };
  expect(getStatsWidgetValue("sa_online_today", stats)).toBe(1);
  expect(getStatsWidgetValue("sa_total_calls_today", stats)).toBe(7);
  expect(getStatsWidgetValue("sa_successful_calls_today", stats)).toBe(4);
  expect(getStatsWidgetValue("sa_monthly_duration", stats)).toBe(120);
});

test("super adviser stats are used when adviser stats are absent", () => {
  const stats = {
    superAdviser: { onlineToday: 2, totalCallsToday: 12, successfulCallsToday: 8, monthlyDurationSeconds: 3600 },
    students: { total: 15 },
    supportForms: { active: 3 },
    advisers: { total: 2 },
  };
  expect(getStatsWidgetValue("sa_online_today", stats)).toBe(2);
  expect(getStatsWidgetValue("sa_total_calls_today", stats)).toBe(12);
  expect(getStatsWidgetValue("sa_students_total", stats)).toBe(15);
  expect(getStatsWidgetValue("sa_support_forms_count", stats)).toBe(3);
  expect(getStatsWidgetValue("sa_connected_advisers", stats)).toBe(2);
});

test("zero is preserved and unavailable duration remains distinct", () => {
  expect(getStatsWidgetValue("sa_total_calls_today", { adviser: { totalCallsToday: 0 } })).toBe(0);
  expect(getStatsWidgetValue("sa_monthly_duration", { adviser: { monthlyDurationSeconds: null } })).toBeNull();
});
