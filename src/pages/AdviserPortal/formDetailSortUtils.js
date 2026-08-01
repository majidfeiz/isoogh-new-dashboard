/** @typedef {"id" | "status" | "workShiftId"} AdviserStudentSortField */

export const ADVISER_STUDENT_SORT_FIELDS = ["id", "status", "workShiftId"];

export function readAdviserStudentSort(searchParams) {
  const requestedField = searchParams.get("sortBy");
  return {
    by: ADVISER_STUDENT_SORT_FIELDS.includes(requestedField) ? requestedField : "id",
    order: searchParams.get("sortOrder") === "DESC" ? "DESC" : "ASC",
  };
}

export function nextAdviserStudentSort(currentSort, field) {
  return {
    by: field,
    order: currentSort.by === field && currentSort.order === "ASC" ? "DESC" : "ASC",
  };
}
