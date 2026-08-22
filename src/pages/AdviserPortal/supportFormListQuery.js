export function parseAdviserSupportFormQuery(params) {
  const page = Number(params.get("page"));
  const sortOrder = params.get("sortOrder");
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    search: params.get("search") || "",
    gradeId: params.get("gradeId") || "",
    sortOrder: sortOrder === "ASC" ? "ASC" : "DESC",
  };
}

export function serializeAdviserSupportFormQuery(query) {
  const params = new URLSearchParams();
  const search = String(query.search || "").trim();
  const gradeId = String(query.gradeId || "").trim();
  if (search) params.set("search", search);
  if (gradeId) params.set("gradeId", gradeId);
  if (query.sortOrder === "ASC") params.set("sortOrder", "ASC");
  if (Number(query.page) > 1) params.set("page", String(query.page));
  return params;
}
