import {
  buildOutboundSocketPayload,
  buildOutboundExportParams,
  mergeOutboundTagOptions,
  isOutboundCallAdmin,
  parseOutboundCallQuery,
  resetOutboundPage,
  serializeOutboundCallQuery,
} from "./outboundCallHistoryFilterUtils.js";
import { isJalaliDateRangeValid, jalaliDateObject, normalizeJalaliDateOnly } from "../../helpers/jalaliDateOnly.js";

test("shows raw duration only to admin roles", () => {
  expect(isOutboundCallAdmin({ roles: [{ name: "admin" }] })).toBe(true);
  expect(isOutboundCallAdmin({ roles: [{ slug: "super_admin" }] })).toBe(true);
  expect(isOutboundCallAdmin({ roles: [{ name: "manager" }] })).toBe(false);
  expect(isOutboundCallAdmin({ roles: [] })).toBe(false);
});

test("preserves independent SSN and tag filters in the URL", () => {
  const query = parseOutboundCallQuery(new URLSearchParams(
    "page=3&type=StudentName&q=علی&ssn=001&tagId=12&disposition=ANSWERED&sort_by=id&sort_order=DESC&start_date=2026-08-01"
  ));
  expect(query).toEqual(expect.objectContaining({ page: 3, ssn: "001", tagId: "12", disposition: "ANSWERED" }));
  const params = serializeOutboundCallQuery(query);
  expect(params.get("ssn")).toBe("001");
  expect(params.get("tagId")).toBe("12");
  expect(params.get("page")).toBe("3");
});

test("trims SSN, removes cleared tag and deduplicates appended tags", () => {
  const params = serializeOutboundCallQuery({
    page: 1, type: "", q: "", ssn: " 001 ", tagId: "", disposition: "ALL",
    sortBy: "", sortOrder: "", startDate: "", endDate: "",
  });
  expect(params.get("ssn")).toBe("001");
  expect(params.has("tagId")).toBe(false);
  expect(mergeOutboundTagOptions([{ id: 1, name: "قدیم" }], [
    { id: 1, name: "جدید" }, { id: 2, name: "دوم" },
  ])).toEqual([{ id: 1, name: "جدید" }, { id: 2, name: "دوم" }]);
});

test.each([
  ["1405/06/10", "1405/06/10"],
  ["1405/06/01", "1405/06/10"],
  ["1405/06/31", "1405/07/01"],
  ["۱۴۰۴/۱۲/۲۹", "1405/01/01"],
])("keeps Jalali date-only ranges unchanged without timezone conversion (%s to %s)", (start, end) => {
  const normalizedStart = normalizeJalaliDateOnly(start);
  const normalizedEnd = normalizeJalaliDateOnly(end);
  expect(normalizedStart).toMatch(/^14\d{2}\/\d{2}\/\d{2}$/);
  expect(normalizedEnd).toMatch(/^14\d{2}\/\d{2}\/\d{2}$/);
  expect(normalizedStart).not.toMatch(/T|Z|:|\+/);
  expect(normalizedEnd).not.toMatch(/T|Z|:|\+/);
  expect(isJalaliDateRangeValid(start, end)).toBe(true);
});

test("serializes a single Jalali day exactly and restores it for the picker", () => {
  const params = serializeOutboundCallQuery({
    page: 1, type: "", q: "", ssn: "", tagId: "", disposition: "ALL",
    sortBy: "", sortOrder: "", startDate: "۱۴۰۵/۰۶/۱۰", endDate: "۱۴۰۵/۰۶/۱۰",
  });
  expect(params.toString()).toBe("start_date=1405%2F06%2F10&end_date=1405%2F06%2F10");
  expect(jalaliDateObject(params.get("start_date")).format("YYYY/MM/DD")).toBe("۱۴۰۵/۰۶/۱۰");
});

test("preserves date range and all active filters in websocket list/subscribe/refresh payloads", () => {
  const payload = buildOutboundSocketPayload({
    page: 3, per_page: 50, type: "StudentName", q: " علی ", ssn: " 001 ", tagId: 12,
    disposition: "ANSWERED", support_form_id: 4, adviser_id: 5,
    start_date: "۱۴۰۵/۰۶/۰۱", end_date: "1405-06-10", sort_by: "id", sort_order: "DESC",
  });
  expect(payload).toEqual({
    page: 3, per_page: 50, type: "StudentName", q: "علی", ssn: "001", tagId: 12,
    disposition: "ANSWERED", support_form_id: 4, adviser_id: 5,
    start_date: "1405/06/01", end_date: "1405/06/10", sort_by: "id", sort_order: "DESC",
  });
});

test("resets pagination to page one when either date changes", () => {
  expect(resetOutboundPage({ page: 7, limit: 15, total: 200 })).toEqual({ page: 1, limit: 15, total: 200 });
});

test("CSV uses the table date range and filters but excludes pagination", () => {
  const params = buildOutboundExportParams({
    page: 8, per_page: 100, type: "StudentName", q: " علی ", ssn: "001", tagId: 12,
    disposition: "ANSWERED", start_date: "1405/06/01", end_date: "1405/06/10",
    sort_by: "id", sort_order: "DESC",
  });
  expect(Object.fromEntries(params)).toEqual({
    sort_by: "id", sort_order: "DESC", q: "علی", type: "StudentName", disposition: "ANSWERED",
    start_date: "1405/06/01", end_date: "1405/06/10", ssn: "001", tagId: "12",
  });
  expect(params.has("page")).toBe(false);
  expect(params.has("per_page")).toBe(false);
});
