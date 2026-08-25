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

export function readAdviserStudentQuery(searchParams) {
  return {
    page: Math.max(1, Number(searchParams.get("page")) || 1),
    search: searchParams.get("search") || "",
    status: searchParams.get("status") ?? "",
    workShiftId: searchParams.get("workShiftId") ?? "",
    sort: readAdviserStudentSort(searchParams),
  };
}

export function updateAdviserStudentQuery(searchParams, changes) {
  const next = new URLSearchParams(searchParams);
  Object.entries(changes).forEach(([key, value]) => {
    const isDefaultSort = key === "sortBy" && value === "id";
    const isDefaultOrder = key === "sortOrder" && value === "ASC" && (changes.sortBy ?? next.get("sortBy") ?? "id") === "id";
    if (value === "" || value === undefined || value === null || (key === "page" && Number(value) <= 1) || isDefaultSort || isDefaultOrder) {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
  });
  if ((changes.sortBy ?? next.get("sortBy") ?? "id") === "id") next.delete("sortOrder");
  return next;
}

export function getWorkShiftName(student) {
  return student?.workShift?.name || "بدون شیفت";
}
