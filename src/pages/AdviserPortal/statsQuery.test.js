import { isCurrentJalaliPeriod, parseAdviserStatsQuery, serializeAdviserStatsQuery, shiftJalaliMonth } from "./statsQuery.js";

test("restores a valid Jalali period from URL and serializes English digits", () => {
  const period = parseAdviserStatsQuery(new URLSearchParams("year=1405&month=5"), { year: 1404, month: 1 });
  expect(period).toEqual({ year: 1405, month: 5 });
  expect(serializeAdviserStatsQuery(period).toString()).toBe("year=1405&month=5");
});

test("falls back for invalid URL values", () => {
  expect(parseAdviserStatsQuery(new URLSearchParams("year=x&month=13"), { year: 1405, month: 6 })).toEqual({ year: 1405, month: 6 });
});

test("moves across Jalali year boundaries", () => {
  expect(shiftJalaliMonth({ year: 1405, month: 1 }, -1)).toEqual({ year: 1404, month: 12 });
  expect(shiftJalaliMonth({ year: 1405, month: 12 }, 1)).toEqual({ year: 1406, month: 1 });
  expect(isCurrentJalaliPeriod({ year: 1405, month: 5 }, { year: 1405, month: 5 })).toBe(true);
});
