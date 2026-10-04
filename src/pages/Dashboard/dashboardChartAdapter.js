export const DASHBOARD_CHART_TYPES = Object.freeze({
  students_by_grade: "students-by-grade",
  students_by_province: "students-by-province",
  students_by_shift: "students-by-shift",
  voip_calls_weekly: "voip-calls-weekly",
  voip_calls_by_disposition: "voip-by-disposition",
  support_forms_by_grade: "support-forms-by-grade",
  import_logs_by_status: "import-logs-by-status",
});

const EXTRA_CHART_KEYS = new Set(["sa_calls_weekly", "sa_adviser_activity", "sa_calls_by_disposition"]);

export const unwrapDashboardPayload = (input, { axiosResponse = false } = {}) => {
  let value = axiosResponse ? input?.data : input;
  if (value && typeof value === "object" && typeof value.success === "boolean" && "data" in value) {
    value = value.data;
  }
  return value;
};

const finiteNumber = (value, field) => {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`Invalid dashboard chart ${field}`);
  return number;
};

const nonEmptyText = (value, field) => {
  if (typeof value !== "string" || !value.trim()) throw new Error(`Invalid dashboard chart ${field}`);
  return value;
};

export const toDashboardChartSeries = (widgetKey, payload) => {
  if (widgetKey === "support_forms_by_status") {
    const supportForms = payload?.supportForms;
    if (!supportForms || typeof supportForms !== "object") throw new Error("Invalid support form stats");
    const total = finiteNumber(supportForms.total, "total");
    const active = finiteNumber(supportForms.active, "active");
    const pending = finiteNumber(supportForms.pendingAssignments, "pendingAssignments");
    return {
      kind: "donut",
      labels: ["در حال اجرا", "تخصیص نیافته", "سایر"],
      series: [active, pending, Math.max(0, total - active - pending)],
    };
  }

  if (!DASHBOARD_CHART_TYPES[widgetKey] && !EXTRA_CHART_KEYS.has(widgetKey)) {
    throw new Error(`Unknown dashboard chart: ${widgetKey}`);
  }
  if (!payload || !Array.isArray(payload.data)) throw new Error("Invalid dashboard chart payload");

  if (widgetKey === "voip_calls_weekly" || widgetKey === "sa_calls_weekly") {
    const rows = payload.data.map((row) => ({
      date: nonEmptyText(row?.date, "date"),
      count: finiteNumber(row?.count, "count"),
      answered: finiteNumber(row?.answered, "answered"),
    }));
    return {
      kind: "weekly",
      categories: rows.map((row) => row.date),
      series: [
        { name: "کل تماس‌ها", data: rows.map((row) => row.count) },
        { name: "پاسخ‌داده‌شده", data: rows.map((row) => row.answered) },
      ],
    };
  }

  const rows = payload.data.map((row) => ({
    label: nonEmptyText(row?.label, "label"),
    value: finiteNumber(row?.value, "value"),
  }));
  return {
    kind: "standard",
    labels: rows.map((row) => row.label),
    series: rows.map((row) => row.value),
  };
};

export const isDashboardChartEmpty = (model) => {
  const values = model?.kind === "weekly"
    ? model.series.flatMap((item) => item.data)
    : model?.series;
  return !Array.isArray(values) || values.length === 0 || values.every((value) => value === 0);
};
