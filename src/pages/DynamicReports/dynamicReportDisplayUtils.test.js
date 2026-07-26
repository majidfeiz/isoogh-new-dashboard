import {
  formatBackendDisplayValue,
  getDisplaySummary,
  getTableRows,
  hasDisplayRows,
  hasDisplaySummary,
} from "./utils.js";

test("selects backend display rows without merging or sorting raw rows", () => {
  const rawRows = [
    { "call.started_at": 1783656337 },
    { "call.started_at": 1783656000 },
  ];
  const displayRows = [
    { "call.started_at": "1405/04/19 11:05:37" },
    { "call.started_at": "1405/04/19 11:00:00" },
  ];
  const response = { rows: rawRows, displayRows };

  expect(getTableRows(response)).toBe(displayRows);
  expect(getTableRows(response)).toEqual(displayRows);
  expect(hasDisplayRows(response)).toBe(true);
});

test("falls back to legacy raw rows and raw summary when display data is absent", () => {
  const rows = [{ title: "legacy" }];
  const summary = { total: 12 };
  const response = { rows, summary };

  expect(getTableRows(response)).toBe(rows);
  expect(getDisplaySummary(response)).toBe(summary);
  expect(hasDisplayRows(response)).toBe(false);
  expect(hasDisplaySummary(response)).toBe(false);
});

test("selects displaySummary and preserves final backend datetime text exactly", () => {
  const displaySummary = { lastCall: "1405/04/19 11:05:37" };
  const response = {
    summary: { lastCall: 1783656337 },
    displaySummary,
  };

  expect(getDisplaySummary(response)).toBe(displaySummary);
  expect(hasDisplaySummary(response)).toBe(true);
  expect(formatBackendDisplayValue(displaySummary.lastCall)).toBe(
    "1405/04/19 11:05:37"
  );
});
