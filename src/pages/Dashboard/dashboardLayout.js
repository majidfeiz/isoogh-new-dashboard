const numberOr = (value, fallback) => Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : fallback;
const clamp = (value, min, max) => Math.min(max, Math.max(min, numberOr(value, min)));
const BREAKPOINT_COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

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

export const toDashboardLayoutPayload = (widgets = []) => widgets.map((widget, index) => {
  const width = clamp(widget.w, 1, 12);
  const userConfig = { ...(widget.userConfig ?? {}) };
  if (userConfig.responsiveLayouts) {
    userConfig.responsiveLayouts = Object.fromEntries(
      Object.entries(userConfig.responsiveLayouts)
        .filter(([breakpoint]) => BREAKPOINT_COLS[breakpoint])
        .map(([breakpoint, layout]) => {
          const columns = BREAKPOINT_COLS[breakpoint];
          const responsiveWidth = clamp(layout?.w, 1, columns);
          return [breakpoint, {
            posX: clamp(layout?.posX, 0, columns - responsiveWidth),
            posY: clamp(layout?.posY, 0, 65535),
            w: responsiveWidth,
            h: clamp(layout?.h, 1, 20),
          }];
        })
    );
  }
  return {
    widgetId: Number(widget.widgetId ?? widget.widget?.id),
    posX: clamp(widget.posX, 0, 12 - width),
    posY: clamp(widget.posY, 0, 65535),
    w: width,
    h: clamp(widget.h, 1, 20),
    sortOrder: clamp(widget.sortOrder ?? index, 0, 65535),
    isVisible: widget.isVisible !== false,
    userConfig,
  };
});
