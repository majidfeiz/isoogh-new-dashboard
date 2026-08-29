const numericId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export function getStudentSchoolOptions(student = {}) {
  const source = student || {};
  const candidates = [
    ...(Array.isArray(source.schools) ? source.schools : []),
    source.school,
    (source.schoolId ?? source.school_id) ? {
      id: source.schoolId ?? source.school_id,
      name: source.schoolName ?? source.school_name,
    } : null,
  ].filter(Boolean);
  const unique = new Map();
  candidates.forEach((school) => {
    const id = numericId(school?.id ?? school?.schoolId ?? school?.school_id);
    if (!id || unique.has(id)) return;
    unique.set(id, { id, name: school?.name ?? school?.title ?? `مجموعه ${id}` });
  });
  return [...unique.values()];
}

export function resolveStudentTagSchoolId(student, activeSchoolId) {
  const filteredId = numericId(activeSchoolId);
  if (filteredId) return filteredId;
  const schools = getStudentSchoolOptions(student);
  return schools.length === 1 ? schools[0].id : null;
}

export function buildTagForest(tags = []) {
  const normalized = tags.map((tag) => ({
    ...tag,
    id: numericId(tag.id),
    parentId: Number(tag.parent_id ?? tag.parentId ?? 0),
    children: [],
  })).filter((tag) => tag.id);
  const byId = new Map(normalized.map((tag) => [tag.id, tag]));
  const roots = [];
  const others = [];

  normalized.forEach((tag) => {
    if (tag.parentId === 0) roots.push(tag);
    else if (byId.has(tag.parentId)) byId.get(tag.parentId).children.push(tag);
    else others.push(tag);
  });
  return { roots, others };
}

export function getVisibleTagIds(tags = [], search = "") {
  const query = search.trim().toLocaleLowerCase("fa");
  if (!query) return new Set(tags.map((tag) => Number(tag.id)));
  const byId = new Map(tags.map((tag) => [Number(tag.id), tag]));
  const visible = new Set();
  tags.forEach((tag) => {
    if (!String(tag.name || "").toLocaleLowerCase("fa").includes(query)) return;
    let current = tag;
    while (current) {
      visible.add(Number(current.id));
      const parentId = Number(current.parent_id ?? current.parentId ?? 0);
      current = parentId ? byId.get(parentId) : null;
    }
  });
  return visible;
}
