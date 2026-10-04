const numberOr = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;

const byDefaultOrder = (a, b) =>
  numberOr(a?.sortOrder, Number.MAX_SAFE_INTEGER) - numberOr(b?.sortOrder, Number.MAX_SAFE_INTEGER)
  || numberOr(a?.id, Number.MAX_SAFE_INTEGER) - numberOr(b?.id, Number.MAX_SAFE_INTEGER);

const byPersonalOrder = (a, b) =>
  numberOr(a?.sortOrder, Number.MAX_SAFE_INTEGER) - numberOr(b?.sortOrder, Number.MAX_SAFE_INTEGER)
  || numberOr(a?.posY, 0) - numberOr(b?.posY, 0)
  || numberOr(a?.posX, 0) - numberOr(b?.posX, 0)
  || numberOr(a?.id, Number.MAX_SAFE_INTEGER) - numberOr(b?.id, Number.MAX_SAFE_INTEGER);

export const buildDefaultDashboardLayout = (widgets = [], gridCols = 12) => {
  let cursorX = 0;
  let cursorY = 0;
  let rowHeight = 0;

  return [...widgets].sort(byDefaultOrder).map((widget, index) => {
    const width = Math.max(1, Math.min(numberOr(widget.defaultW, 3), gridCols));
    const height = Math.max(1, numberOr(widget.defaultH, 2));
    if (cursorX + width > gridCols) {
      cursorX = 0;
      cursorY += rowHeight;
      rowHeight = 0;
    }
    const entry = {
      id: `default-${widget.id}`,
      widgetId: widget.id,
      posX: cursorX,
      posY: cursorY,
      w: width,
      h: height,
      sortOrder: numberOr(widget.sortOrder, index),
      isVisible: true,
      userConfig: null,
      widget,
    };
    cursorX += width;
    rowHeight = Math.max(rowHeight, height);
    return entry;
  });
};

export const selectDashboardLayout = ({ personalWidgets, defaultDashboard }) => {
  if (!Array.isArray(personalWidgets)) throw new Error("Invalid personal dashboard payload");
  if (personalWidgets.length > 0) {
    return { widgets: [...personalWidgets].sort(byPersonalOrder), isDefaultView: false };
  }
  return {
    widgets: buildDefaultDashboardLayout(defaultDashboard?.widgets, defaultDashboard?.gridCols ?? 12),
    isDefaultView: true,
  };
};
