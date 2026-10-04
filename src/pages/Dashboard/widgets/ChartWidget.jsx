// src/pages/Dashboard/widgets/ChartWidget.jsx
import React from "react";
import { Card, CardBody, CardHeader, Spinner } from "reactstrap";
import ReactApexChart from "react-apexcharts";

const toJalali = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("fa-IR", { month: "2-digit", day: "2-digit" });
  } catch {
    return dateStr;
  }
};

const DISPOSITION_COLORS = {
  ANSWERED: "#34c38f",
  "NO ANSWER": "#f46a6a",
  BUSY: "#f1b44c",
  FAILED: "#adb5bd",
};

// Super adviser disposition uses different color conventions from backend
const SA_DISPOSITION_COLORS = {
  ANSWERED: "#10b981",
  NOANSWER: "#f59e0b",
  "NO ANSWER": "#f59e0b",
  BUSY: "#ef4444",
};

const LOG_STATUS_COLORS = {
  "موفق": "#34c38f",
  "ناموفق": "#f46a6a",
  "در انتظار": "#adb5bd",
  "در حال پردازش": "#556ee6",
};

// ─────────────────────────────────────────────
// Chart config factory per widget key
// ─────────────────────────────────────────────
const buildChart = (key, data, stats) => {
  // ─── Donut helpers ────────────────────────
  const makeDonut = (labels, series, colors) => ({
    type: "donut",
    options: {
      chart: { type: "donut", fontFamily: "inherit" },
      labels,
      colors: colors || ["#556ee6", "#34c38f", "#f1b44c", "#f46a6a", "#adb5bd"],
      legend: { position: "bottom", fontSize: "12px" },
      dataLabels: {
        enabled: true,
        formatter: (v) => Number(v.toFixed(0)).toLocaleString("fa-IR") + "٪",
      },
      tooltip: {
        y: { formatter: (v) => Number(v).toLocaleString("fa-IR") },
      },
      plotOptions: {
        pie: {
          donut: {
            size: "65%",
            labels: {
              show: true,
              value: {
                show: true,
                fontSize: "22px",
                fontWeight: 600,
                color: "#495057",
                formatter: (v) => Number(v).toLocaleString("fa-IR"),
              },
              total: {
                show: true,
                label: "مجموع",
                fontSize: "13px",
                color: "#f46a6a",
                formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString("fa-IR"),
              },
            },
          },
        },
      },
    },
    series,
  });

  // ─── Bar helpers ─────────────────────────
  const makeBar = (categories, series, horizontal = false) => ({
    type: "bar",
    options: {
      chart: { toolbar: { show: false }, type: "bar" },
      plotOptions: {
        bar: {
          borderRadius: horizontal ? 4 : 6,
          columnWidth: horizontal ? undefined : "45%",
          horizontal,
        },
      },
      dataLabels: { enabled: false },
      colors: ["#556ee6"],
      xaxis: { categories, labels: { style: { fontSize: "11px" } } },
      yaxis: { labels: { formatter: (v) => Number(v).toLocaleString("fa-IR") } },
      tooltip: { y: { formatter: (v) => Number(v).toLocaleString("fa-IR") } },
      grid: { borderColor: "#f1f1f1" },
    },
    series,
  });

  if (!data && key !== "support_forms_by_status") return null;

  switch (key) {
    // ─── Standard ChartDataDto widgets ──────
    case "students_by_grade":
    case "support_forms_by_grade": {
      const cats = data.data?.map((d) => d.label) ?? [];
      const vals = data.data?.map((d) => d.value) ?? [];
      return makeBar(cats, [{ name: "تعداد", data: vals }]);
    }

    case "students_by_province": {
      const items = (data.data ?? []).slice(0, 12);
      const cats = items.map((d) => d.label);
      const vals = items.map((d) => d.value);
      return makeBar(cats, [{ name: "دانش‌آموزان", data: vals }], true);
    }

    case "students_by_shift": {
      const labels = data.data?.map((d) => d.label) ?? [];
      const series = data.data?.map((d) => d.value) ?? [];
      return makeDonut(labels, series);
    }

    case "voip_calls_by_disposition": {
      const labels = data.data?.map((d) => d.label) ?? [];
      const series = data.data?.map((d) => d.value) ?? [];
      const colors = labels.map((l) => DISPOSITION_COLORS[l] || "#adb5bd");
      return makeDonut(labels, series, colors);
    }

    case "import_logs_by_status": {
      const labels = data.data?.map((d) => d.label) ?? [];
      const series = data.data?.map((d) => d.value) ?? [];
      const colors = labels.map((l) => LOG_STATUS_COLORS[l] || "#adb5bd");
      return makeDonut(labels, series, colors);
    }

    // ─── WeeklyCallsDto — two series ────────
    case "voip_calls_weekly": {
      const items = data.data ?? [];
      const cats = items.map((d) => toJalali(d.date));
      const countSeries = items.map((d) => d.count);
      const answeredSeries = items.map((d) => d.answered);
      return {
        type: "line",
        options: {
          chart: { toolbar: { show: false }, type: "line", zoom: { enabled: false } },
          dataLabels: { enabled: false },
          stroke: { curve: "smooth", width: [3, 2] },
          colors: ["#556ee6", "#34c38f"],
          markers: { size: 3 },
          xaxis: { categories: cats, labels: { style: { fontSize: "11px" } } },
          yaxis: { labels: { formatter: (v) => Number(v).toLocaleString("fa-IR") } },
          tooltip: { y: { formatter: (v) => Number(v).toLocaleString("fa-IR") } },
          legend: { position: "top" },
          fill: {
            type: "gradient",
            gradient: { shadeIntensity: 1, inverseColors: false, opacityFrom: 0.35, opacityTo: 0.05, stops: [20, 100] },
          },
          grid: { borderColor: "#f1f1f1" },
        },
        series: [
          { name: "کل تماس‌ها", data: countSeries },
          { name: "پاسخ‌داده‌شده", data: answeredSeries },
        ],
      };
    }

    // ─── Super Adviser charts ─────────────────
    case "sa_calls_weekly": {
      const items = data.data ?? [];
      const cats = items.map((d) => toJalali(d.date));
      const countSeries = items.map((d) => d.count);
      const answeredSeries = items.map((d) => d.answered);
      return {
        type: "line",
        options: {
          chart: { toolbar: { show: false }, type: "line", zoom: { enabled: false } },
          dataLabels: { enabled: false },
          stroke: { curve: "smooth", width: [3, 2] },
          colors: ["#556ee6", "#34c38f"],
          markers: { size: 3 },
          xaxis: { categories: cats, labels: { style: { fontSize: "11px" } } },
          yaxis: { labels: { formatter: (v) => Number(v).toLocaleString("fa-IR") } },
          tooltip: { y: { formatter: (v) => Number(v).toLocaleString("fa-IR") } },
          legend: { position: "top" },
          fill: {
            type: "gradient",
            gradient: { shadeIntensity: 1, inverseColors: false, opacityFrom: 0.35, opacityTo: 0.05, stops: [20, 100] },
          },
          grid: { borderColor: "#f1f1f1" },
        },
        series: [
          { name: "کل تماس", data: countSeries },
          { name: "پاسخ داده‌شده", data: answeredSeries },
        ],
      };
    }

    case "sa_adviser_activity": {
      const items = (data.data ?? []).slice().sort((a, b) => b.value - a.value);
      const cats = items.map((d) => d.label);
      const vals = items.map((d) => d.value);
      return makeBar(cats, [{ name: "تعداد تماس", data: vals }], true);
    }

    case "sa_calls_by_disposition": {
      const labels = data.data?.map((d) => d.label) ?? [];
      const series = data.data?.map((d) => d.value) ?? [];
      const colors = labels.map((l) => SA_DISPOSITION_COLORS[l] || "#6b7280");
      return makeDonut(labels, series, colors);
    }

    // ─── Uses stats data (no chart endpoint) ─
    case "support_forms_by_status": {
      if (!stats?.supportForms) return null;
      const { active = 0, pendingAssignments = 0, total = 0 } = stats.supportForms;
      const other = Math.max(0, total - active - pendingAssignments);
      return makeDonut(
        ["در حال اجرا", "تخصیص نیافته", "سایر"],
        [active, pendingAssignments, other],
        ["#34c38f", "#f46a6a", "#adb5bd"]
      );
    }

    default:
      return null;
  }
};

const CHART_ICONS = {
  students_by_grade: "bx-bar-chart",
  support_forms_by_grade: "bx-bar-chart",
  students_by_province: "bx-bar-chart-alt-2",
  students_by_shift: "bx-pie-chart",
  voip_calls_by_disposition: "bx-pie-chart",
  import_logs_by_status: "bx-pie-chart",
  voip_calls_weekly: "bx-line-chart",
  support_forms_by_status: "bx-pie-chart",
  // Super Adviser
  sa_calls_weekly: "bx-line-chart",
  sa_adviser_activity: "bx-bar-chart-alt-2",
  sa_calls_by_disposition: "bx-pie-chart",
};

const ChartWidget = ({ widgetKey, widgetName, chartData, stats, loading: externalLoading }) => {
  const cfg = buildChart(widgetKey, chartData, stats);

  const isDataReady = widgetKey === "support_forms_by_status"
    ? stats !== undefined
    : chartData !== undefined;

  const icon = CHART_ICONS[widgetKey] || "bx-line-chart";

  const showError = isDataReady && !cfg;

  return (
    <Card className="h-100 mb-0">
      <CardHeader className="bg-transparent border-bottom-0 pb-0 d-flex align-items-center gap-2">
        <i className={`bx ${icon} text-primary font-size-18`} />
        <h6 className="mb-0 fw-semibold">{widgetName}</h6>
      </CardHeader>
      <CardBody className="pt-2">
        {!isDataReady || externalLoading ? (
          <div className="d-flex align-items-center justify-content-center" style={{ height: 220 }}>
            <Spinner color="primary" />
          </div>
        ) : showError ? (
          <div className="d-flex flex-column align-items-center justify-content-center text-muted" style={{ height: 220 }}>
            <i className="bx bx-error-circle font-size-32 d-block mb-2 text-warning" />
            <p className="font-size-13 mb-0">داده‌ای دریافت نشد</p>
          </div>
        ) : (
          <ReactApexChart
            options={cfg.options}
            series={cfg.series}
            type={cfg.type}
            height={220}
          />
        )}
      </CardBody>
    </Card>
  );
};

export default ChartWidget;
