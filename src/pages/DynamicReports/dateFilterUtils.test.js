import {
  createPersianPickerDate,
  displayPersianFilterDate,
  serializePersianFilterDate,
  toLatinDigits,
} from "./dateFilterUtils.js";
import { normalizeDefinition } from "./utils.js";

test("keeps a Jalali date in YYYY/MM/DD format without browser Date parsing", () => {
  const pickerDate = createPersianPickerDate("1405/04/01");

  expect(serializePersianFilterDate(pickerDate)).toBe("1405/04/01");
  expect(displayPersianFilterDate("1405/04/01")).toBe("1405/04/01");
});

test("normalizes Persian and Arabic digits to Latin digits", () => {
  expect(toLatinDigits("۱۴۰۵/۰۴/۰۱")).toBe("1405/04/01");
  expect(toLatinDigits("١٤٠٥/٠٤/٠١")).toBe("1405/04/01");
  expect(displayPersianFilterDate("۱۴۰۵/۴/۱")).toBe("1405/04/01");
});

test("supports an existing valid Gregorian ISO value through the explicit ISO path", () => {
  expect(displayPersianFilterDate("2026-06-22T00:00:00Z")).toBe(
    "1405/04/01"
  );
});

test("serializes a one-day between filter as two independent date-only values", () => {
  const definition = {
    version: 1,
    sourceId: "voip.calls",
    columns: [{ fieldId: "call.started_at" }],
    filters: {
      combinator: "and",
      children: [
        {
          fieldId: "call.started_at",
          operator: "between",
          value: ["1405/04/01", "1405/04/01"],
        },
      ],
    },
    groupBy: [],
    metrics: [],
    calculatedFields: [],
    sort: [],
  };

  const normalized = normalizeDefinition(definition);
  expect(normalized.filters.children[0].value).toEqual([
    "1405/04/01",
    "1405/04/01",
  ]);
  expect(normalized.filters.children[0].value[0]).not.toContain("T");
  expect(normalized.filters.children[0].value[1]).not.toContain("T");
});
