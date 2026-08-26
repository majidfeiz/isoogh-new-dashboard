import {
  getParentTagImportProgress,
  getParentTagImportSchoolMode,
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

test("auto-selects a manager's only school and requires selection for admins or multi-school managers", () => {
  const school = { id: 7, name: "امید" };
  expect(getParentTagImportSchoolMode({ isAdminLike: false, schools: [school] })).toEqual({
    managerAutoSchool: school,
    needsSchoolSelect: false,
  });
  expect(getParentTagImportSchoolMode({ isAdminLike: false, schools: [school, { id: 8 }] }).needsSchoolSelect).toBe(true);
  expect(getParentTagImportSchoolMode({ isAdminLike: true, schools: [school] }).needsSchoolSelect).toBe(true);
});
