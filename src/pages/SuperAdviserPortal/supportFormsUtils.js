export function parseSuperAdviserSupportFormsQuery(params) {
  const page = Number(params.get("page"));
  return {
    search: params.get("search") || "",
    adviserId: params.get("adviserId") || "",
    schoolId: params.get("schoolId") || "",
    gradeId: params.get("gradeId") || "",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function serializeSuperAdviserSupportFormsQuery(query) {
  const params = new URLSearchParams();
  for (const key of ["search", "adviserId", "schoolId", "gradeId"]) {
    const value = String(query[key] || "").trim();
    if (value) params.set(key, value);
  }
  if (query.page > 1) params.set("page", String(query.page));
  return params;
}

export function isValidSuperAdviserGradeId(gradeId, grades) {
  if (!gradeId) return true;
  return grades.some((grade) => String(grade.id) === String(gradeId));
}
