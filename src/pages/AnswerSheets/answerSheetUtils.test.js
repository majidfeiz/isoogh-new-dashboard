import {
  formatJalaliDateTime,
  normalizeLatinDigits,
  parseAnswerSheetQuery,
  parseFilename,
  serializeAnswerSheetQuery,
} from "./answerSheetUtils.js";

test("keeps one table row per answer-sheet session in query-independent data", () => {
  const sessions = [{ sessionId: "a", voipCallId: 12 }, { sessionId: "b", voipCallId: 12 }];
  expect(sessions).toHaveLength(2);
  expect(new Set(sessions.map((item) => item.sessionId)).size).toBe(2);
});

test("parses pagination and serializes all API filters", () => {
  const query = parseAnswerSheetQuery(new URLSearchParams("page=3&school_id=2&support_form_id=10&student_search=ali"));
  expect(query).toMatchObject({ page: 3, schoolId: "2", supportFormId: "10", studentSearch: "ali" });
  expect(serializeAnswerSheetQuery(query).get("support_form_id")).toBe("10");
});

test("formats submitted date in Jalali and reads UTF-8 filenames", () => {
  expect(formatJalaliDateTime("2026-07-21T10:30:00.000Z")).toMatch(/^1405\/04\//);
  expect(parseFilename("attachment; filename*=UTF-8''answers%20fa.xlsx", "fallback.xlsx")).toBe("answers fa.xlsx");
});

test("normalizes Persian and Arabic date digits before sending ISO filters", () => {
  expect(normalizeLatinDigits("۲۰۲۶-۰۷-۲۱")).toBe("2026-07-21");
  expect(normalizeLatinDigits("٢٠٢٦-٠٧-٢١")).toBe("2026-07-21");
  const parsed = parseAnswerSheetQuery(new URLSearchParams("date_from=۲۰۲۶-۰۷-۰۱&date_to=۲۰۲۶-۰۷-۲۱"));
  expect(parsed).toMatchObject({ dateFrom: "2026-07-01", dateTo: "2026-07-21" });
  expect(serializeAnswerSheetQuery(parsed).get("date_from")).toBe("2026-07-01");
});
