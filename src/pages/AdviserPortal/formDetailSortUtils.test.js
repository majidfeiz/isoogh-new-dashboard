import {
  nextAdviserStudentSort,
  readAdviserStudentSort,
} from "./formDetailSortUtils.js";

test("restores work shift sorting from the URL", () => {
  expect(readAdviserStudentSort(new URLSearchParams("sortBy=workShiftId&sortOrder=DESC"))).toEqual({
    by: "workShiftId",
    order: "DESC",
  });
  expect(readAdviserStudentSort(new URLSearchParams("sortBy=unknown"))).toEqual({ by: "id", order: "ASC" });
});

test("starts work shift sorting ascending and toggles it descending", () => {
  const first = nextAdviserStudentSort({ by: "id", order: "ASC" }, "workShiftId");
  expect(first).toEqual({ by: "workShiftId", order: "ASC" });
  expect(nextAdviserStudentSort(first, "workShiftId")).toEqual({ by: "workShiftId", order: "DESC" });
});
