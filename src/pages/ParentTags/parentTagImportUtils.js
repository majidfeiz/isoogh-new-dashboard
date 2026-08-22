export const PARENT_TAG_IMPORT_ACTIONS = ["Append", "Replace", "Remove"];

const normalizedCell = (value) => String(value ?? "").trim().toLowerCase();

export const isParentTagImportHeader = (row) => {
  if (!Array.isArray(row)) return false;
  const username = normalizedCell(row[0]);
  const action = normalizedCell(row[1]);
  return (
    (username === "username" && action === "action") ||
    (username === "نام کاربری" && (action === "تغییرات" || action === "action"))
  );
};

export const removeParentTagImportHeaders = (rows) =>
  (rows || []).filter((row) => !isParentTagImportHeader(row));

export const toParentTagImportSheetRows = (rows, columns) => [
  columns,
  ...(rows || []).map((row) => columns.map((column) => row?.[column] ?? "")),
];

export const getParentTagImportProgress = (job) => {
  const total = Number(job?.totalRows) || 0;
  if (total <= 0) return 0;
  const finished = (Number(job?.processedRows) || 0) + (Number(job?.failedRows) || 0);
  return Math.min(100, Math.max(0, Math.round((finished / total) * 100)));
};

export const isParentTagImportTerminal = (status) =>
  status === "success" || status === "failed";
