import {
  getParentTagImportProgress,
  isParentTagImportHeader,
  isParentTagImportTerminal,
  removeParentTagImportHeaders,
  toParentTagImportSheetRows,
} from "./parentTagImportUtils.js";

test("removes consecutive English and Persian headers before rebuilding xlsx", () => {
  const rows = [
    ["username", "action", "tag1"],
    ["نام کاربری", "تغییرات", "تگ"],
    ["09120000000", "Append", "vip"],
  ];
  expect(removeParentTagImportHeaders(rows)).toEqual([["09120000000", "Append", "vip"]]);
  expect(isParentTagImportHeader(rows[0])).toBe(true);
});

test("rebuilt preview contains exactly one canonical header", () => {
  const sheetRows = toParentTagImportSheetRows(
    [{ username: "09120000000", action: "Append", tag1: "vip" }],
    ["username", "action", "tag1"]
  );
  expect(sheetRows).toEqual([
    ["username", "action", "tag1"],
    ["09120000000", "Append", "vip"],
  ]);
  expect(sheetRows.filter(isParentTagImportHeader)).toHaveLength(1);
});

test("progress includes successful and failed rows", () => {
  expect(getParentTagImportProgress({ totalRows: 20, processedRows: 11, failedRows: 4 })).toBe(75);
  expect(getParentTagImportProgress({ totalRows: 0, processedRows: 1, failedRows: 0 })).toBe(0);
});

test("only success and failed stop polling", () => {
  expect(isParentTagImportTerminal("processing")).toBe(false);
  expect(isParentTagImportTerminal("success")).toBe(true);
  expect(isParentTagImportTerminal("failed")).toBe(true);
});
