export const emptyDefinition = { version: 1, sourceId: "", columns: [], filters: { combinator: "and", children: [] }, groupBy: [], metrics: [], calculatedFields: [], sort: [] };
export const hydrateDefinition = (value = {}) => ({
  ...emptyDefinition,
  ...value,
  columns: Array.isArray(value.columns) ? value.columns : [],
  filters: value.filters?.combinator ? value.filters : { combinator: "and", children: [] },
  groupBy: Array.isArray(value.groupBy) ? value.groupBy : [],
  metrics: Array.isArray(value.metrics) ? value.metrics : [],
  calculatedFields: Array.isArray(value.calculatedFields) ? value.calculatedFields : [],
  sort: Array.isArray(value.sort) ? value.sort : [],
});
export const makeGroup = () => ({ combinator: "and", children: [] });
export const makeCondition = (fieldId = "") => ({ fieldId, operator: "", value: "" });
export const moveItem = (items, from, to) => {
  const next = [...items];
  if (to < 0 || to >= next.length || from === to) return next;
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};
export const updateFilterNode = (root, path, updater) => {
  if (!path.length) return updater(root);
  const [head, ...rest] = path;
  return { ...root, children: root.children.map((child, index) => index === head ? updateFilterNode(child, rest, updater) : child) };
};
export const removeFilterNode = (root, path) => {
  const parentPath = path.slice(0, -1);
  const index = path[path.length - 1];
  return updateFilterNode(root, parentPath, (node) => ({ ...node, children: node.children.filter((_, i) => i !== index) }));
};
const compactFilter = (node) => {
  if (!node || typeof node !== "object") return null;
  if (node.combinator) {
    const children = (Array.isArray(node.children) ? node.children : []).map(compactFilter).filter(Boolean);
    return children.length ? { combinator: node.combinator, children } : null;
  }
  if (!node.fieldId || !node.operator) return null;
  const noValue = ["is_null", "is_not_null", "is_true", "is_false"].includes(node.operator);
  if (!noValue && (node.value === "" || node.value == null || (Array.isArray(node.value) && !node.value.length))) return null;
  return noValue ? { fieldId: node.fieldId, operator: node.operator } : { fieldId: node.fieldId, operator: node.operator, value: node.value };
};
export const normalizeDefinition = (definition) => {
  const clean = JSON.parse(JSON.stringify(definition, (_, value) => value === "" ? undefined : value));
  if (clean.metrics?.length) {
    const grouped = new Set(clean.groupBy || []);
    clean.columns = (clean.columns || []).map((column) => ({
      ...column,
      visible: grouped.has(column.fieldId) ? column.visible !== false : false,
    }));
  }
  const filters = compactFilter(clean.filters);
  if (filters) clean.filters = filters; else delete clean.filters;
  if (!clean.groupBy?.length) delete clean.groupBy;
  if (!clean.metrics?.length) delete clean.metrics;
  if (!clean.calculatedFields?.length) delete clean.calculatedFields;
  if (!clean.sort?.length) delete clean.sort;
  if (!clean.visualization?.type || clean.visualization.type === "table") delete clean.visualization;
  return clean;
};
export const getTableRows = (result) =>
  Array.isArray(result?.displayRows)
    ? result.displayRows
    : Array.isArray(result?.rows)
      ? result.rows
      : [];
export const hasDisplayRows = (result) => Array.isArray(result?.displayRows);
export const getDisplaySummary = (result) =>
  result?.displaySummary ?? result?.summary ?? {};
export const hasDisplaySummary = (result) =>
  result?.displaySummary !== undefined && result?.displaySummary !== null;
export const getExecutionMeta = (result, fallback = {}) => {
  const meta = result?.meta ?? result?.pagination ?? {};
  const limit = Math.min(100, Math.max(1, Number(meta.limit ?? fallback.limit ?? 20)));
  const total = Math.max(0, Number(meta.total ?? 0));
  return {
    page: Math.max(1, Number(meta.page ?? fallback.page ?? 1)),
    limit,
    total,
    lastPage: Math.max(1, Number((meta.lastPage ?? Math.ceil(total / limit)) || 1)),
  };
};
export const formatBackendDisplayValue = (value) => {
  if (value == null) return "—";
  if (typeof value === "boolean") return value ? "بله" : "خیر";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};
export const formatValue = (value, type, options = {}) => {
  if (value == null) return "—";
  if (type === "datetime" || type === "date") return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "medium", ...(type === "datetime" ? { timeStyle: "short", timeZone: "Asia/Tehran" } : {}) }).format(new Date(value));
  if (type === "duration") { const n = Number(value) || 0; return [Math.floor(n / 3600) && `${Math.floor(n / 3600)} ساعت`, Math.floor(n % 3600 / 60) && `${Math.floor(n % 3600 / 60)} دقیقه`, `${n % 60} ثانیه`].filter(Boolean).join(" و "); }
  if (["decimal", "number", "integer", "percentage"].includes(type)) return new Intl.NumberFormat("fa-IR", { maximumFractionDigits: options.maximumFractionDigits ?? 2, style: type === "percentage" ? "percent" : "decimal" }).format(type === "percentage" ? Number(value) / 100 : Number(value));
  if (typeof value === "boolean") return value ? "بله" : "خیر";
  return String(value);
};
