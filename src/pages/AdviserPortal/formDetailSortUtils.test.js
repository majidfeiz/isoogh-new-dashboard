import {
  getWorkShiftName,
  nextAdviserStudentSort,
  readAdviserStudentQuery,
  readAdviserStudentSort,
  updateAdviserStudentQuery,
} from "./formDetailSortUtils.js";

test("restores work shift sorting from the URL", () => {
  expect(readAdviserStudentSort(new URLSearchParams("sortBy=workShiftId&sortOrder=DESC"))).toEqual({
    by: "workShiftId",
    order: "DESC",
  });
  expect(readAdviserStudentSort(new URLSearchParams("sortBy=unknown"))).toEqual({ by: "id", order: "ASC" });
});

test("restores filters and pagination from the URL", () => {
  expect(readAdviserStudentQuery(new URLSearchParams("page=4&search=صبح&status=1&workShiftId=2&sortBy=workShiftId&sortOrder=DESC"))).toEqual({
    page: 4,
    search: "صبح",
    status: "1",
    workShiftId: "2",
    sort: { by: "workShiftId", order: "DESC" },
  });
});

test("resets page when applying a shift and removes the filter for all shifts", () => {
  const filtered = updateAdviserStudentQuery(new URLSearchParams("page=5&search=علی"), { workShiftId: "2", page: 1 });
  expect(filtered.get("page")).toBeNull();
  expect(filtered.get("workShiftId")).toBe("2");

  const all = updateAdviserStudentQuery(filtered, { workShiftId: "", page: 1 });
  expect(all.get("workShiftId")).toBeNull();
});

test("shows the work shift name and labels null shifts", () => {
  expect(getWorkShiftName({ workShift: { name: "صبح" } })).toBe("صبح");
  expect(getWorkShiftName({ workShift: null })).toBe("بدون شیفت");
});

test("starts work shift sorting ascending and toggles it descending", () => {
  const first = nextAdviserStudentSort({ by: "id", order: "ASC" }, "workShiftId");
  expect(first).toEqual({ by: "workShiftId", order: "ASC" });
  expect(nextAdviserStudentSort(first, "workShiftId")).toEqual({ by: "workShiftId", order: "DESC" });
});
