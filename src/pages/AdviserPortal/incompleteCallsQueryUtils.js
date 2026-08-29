export const INCOMPLETE_CALL_SORT_FIELDS = [
  "id",
  "created_at",
  "updated_at",
  "student_id",
  "form_title",
];

export function readIncompleteCallsQuery(searchParams) {
  const requestedSort = searchParams.get("sortBy");
  return {
    page: Math.max(1, Number(searchParams.get("page")) || 1),
    search: searchParams.get("search") || "",
    sort: {
      by: INCOMPLETE_CALL_SORT_FIELDS.includes(requestedSort) ? requestedSort : "id",
      order: searchParams.get("sortOrder") === "ASC" ? "ASC" : "DESC",
    },
  };
}

export function updateIncompleteCallsQuery(searchParams, changes) {
  const next = new URLSearchParams(searchParams);
  Object.entries(changes).forEach(([key, value]) => {
    const shouldDelete = value === "" || value === null || value === undefined
      || (key === "page" && Number(value) <= 1)
      || (key === "sortBy" && value === "id")
      || (key === "sortOrder" && value === "DESC");
    if (shouldDelete) next.delete(key);
    else next.set(key, String(value));
  });
  return next;
}
