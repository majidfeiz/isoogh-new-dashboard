import { todayExclusiveRange } from "./ExternalApiDocs.jsx";

test("external audit today example uses exclusive next-day ISO boundaries", () => {
  const range = todayExclusiveRange(new Date(2026, 7, 2, 14, 20));
  expect(new Date(range.from).getHours()).toBe(0);
  expect(new Date(range.to).getHours()).toBe(0);
  expect(new Date(range.to).getTime() - new Date(range.from).getTime()).toBe(86400000);
});
