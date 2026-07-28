const WRAPPER_KEYS = ["items", "data", "results", "sources", "operators", "visualizations", "forms", "questions", "fields"];

const isEntity = (value) => value && typeof value === "object" && !Array.isArray(value) && (
  value.id != null || value.fieldId != null || value.sourceId != null ||
  value.operator != null || value.value != null || value.typeId != null ||
  value.key != null || value.code != null || (value.type != null && value.label != null)
);

const normalizeEntity = (value, fallbackId) => {
  if (typeof value === "string") return { id: value, label: value };
  if (!value || typeof value !== "object") return null;
  const id = value.id ?? value.fieldId ?? value.sourceId ?? value.operator ?? value.value ?? value.typeId ?? value.key ?? value.code ?? fallbackId ?? value.type;
  if (id == null) return null;
  return {
    ...value,
    id: String(id),
    label: value.labelFa ?? value.label ?? value.title ?? value.name ?? value.displayName ?? String(id),
  };
};

export const normalizeCatalogList = (value) => {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (Array.isArray(item)) return normalizeCatalogList(item);
      const entity = normalizeEntity(item);
      return entity ? [entity] : normalizeCatalogList(item);
    });
  }
  if (typeof value !== "object") {
    const entity = normalizeEntity(value);
    return entity ? [entity] : [];
  }

  for (const key of WRAPPER_KEYS) {
    if (value[key] != null && value[key] !== value) return normalizeCatalogList(value[key]);
  }
  if (isEntity(value)) return [normalizeEntity(value)];

  return Object.entries(value).flatMap(([key, item]) => {
    if (item == null || typeof item === "boolean" || typeof item === "number") return [];
    if (typeof item === "string") return [{ id: key, label: item }];
    if (Array.isArray(item)) return normalizeCatalogList(item);
    if (isEntity(item) || item.label || item.title || item.name) {
      const entity = normalizeEntity(item, key);
      return entity ? [entity] : [];
    }
    return normalizeCatalogList(item);
  });
};

export const normalizeIdList = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item?.id ?? item?.value ?? item)).filter(Boolean);
  if (value && typeof value === "object") return Object.entries(value).filter(([, enabled]) => enabled !== false && enabled != null).map(([key, item]) => String(item?.id ?? item?.value ?? key));
  return value ? [String(value)] : [];
};

export const normalizeSourceDetail = (value) => {
  if (!value || typeof value !== "object") return { fields: [] };
  const source = value.source && typeof value.source === "object" ? value.source : value;
  const rawFields = value.fields ?? source.fields ?? value.catalog?.fields ?? source.catalog?.fields;
  return {
    ...source,
    ...value,
    label: source.labelFa ?? source.label ?? source.title ?? source.name ?? source.id,
    fields: normalizeCatalogList(rawFields),
  };
};
