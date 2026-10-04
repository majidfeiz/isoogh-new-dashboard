// src/pages/Dashboard/widgets/ChartWidget.jsx
import React from "react";
import { Button, Card, CardBody, CardHeader, Spinner } from "reactstrap";
import ReactApexChart from "react-apexcharts";
import { isDashboardChartEmpty, toDashboardChartSeries } from "../dashboardChartAdapter.js";

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
export const buildChart = (key, data, stats) => {
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

  const model = toDashboardChartSeries(key, key === "support_forms_by_status" ? stats : data);

  switch (key) {
    // ─── Standard ChartDataDto widgets ──────
    case "students_by_grade":
    case "support_forms_by_grade": {
      return makeBar(model.labels, [{ name: "تعداد", data: model.series }]);
    }

    case "students_by_province": {
      const cats = model.labels.slice(0, 12);
      const vals = model.series.slice(0, 12);
      return makeBar(cats, [{ name: "دانش‌آموزان", data: vals }], true);
    }

    case "students_by_shift": {
      return makeDonut(model.labels, model.series);
    }

    case "voip_calls_by_disposition": {
      const colors = model.labels.map((label) => DISPOSITION_COLORS[label] || "#adb5bd");
      return makeDonut(model.labels, model.series, colors);
    }

    case "import_logs_by_status": {
      const colors = model.labels.map((label) => LOG_STATUS_COLORS[label] || "#adb5bd");
      return makeDonut(model.labels, model.series, colors);
    }

    // ─── WeeklyCallsDto — two series ────────
    case "voip_calls_weekly": {
      const cats = model.categories.map(toJalali);
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
          ...model.series,
        ],
      };
    }

    // ─── Super Adviser charts ─────────────────
    case "sa_calls_weekly": {
      const cats = model.categories.map(toJalali);
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
          { name: "کل تماس", data: model.series[0].data },
          { name: "پاسخ داده‌شده", data: model.series[1].data },
        ],
      };
    }

    case "sa_adviser_activity": {
      const items = model.labels.map((label, index) => ({ label, value: model.series[index] }))
        .sort((a, b) => b.value - a.value);
      const cats = items.map((item) => item.label);
      const vals = items.map((item) => item.value);
      return makeBar(cats, [{ name: "تعداد تماس", data: vals }], true);
    }

    case "sa_calls_by_disposition": {
      const colors = model.labels.map((label) => SA_DISPOSITION_COLORS[label] || "#6b7280");
      return makeDonut(model.labels, model.series, colors);
    }

    // ─── Uses stats data (no chart endpoint) ─
    case "support_forms_by_status": {
      return makeDonut(
        model.labels,
        model.series,
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

const ChartWidget = ({ widgetKey, widgetName, chartData, stats, loading: externalLoading, onRetry }) => {
  let cfg = null;
  let model = null;
  let transformError = false;

  const isDataReady = widgetKey === "support_forms_by_status"
    ? stats !== undefined
    : chartData !== undefined;

  if (isDataReady && !externalLoading) {
    try {
      model = toDashboardChartSeries(widgetKey, widgetKey === "support_forms_by_status" ? stats : chartData);
      cfg = buildChart(widgetKey, chartData, stats);
    } catch {
      transformError = true;
    }
  }

  const icon = CHART_ICONS[widgetKey] || "bx-line-chart";

  const showEmpty = isDataReady && !transformError && isDashboardChartEmpty(model);

  return (
    <Card className="h-100 mb-0 dashboard-widget-card">
      <CardHeader className="bg-transparent border-bottom-0 pb-0 d-flex align-items-center gap-2">
        <i className={`bx ${icon} text-primary font-size-18`} />
        <h6 className="mb-0 fw-semibold">{widgetName}</h6>
      </CardHeader>
      <CardBody className="pt-2">
        {!isDataReady || externalLoading ? (
          <div className="d-flex align-items-center justify-content-center" style={{ height: 220 }}>
            <Spinner color="primary" />
          </div>
        ) : transformError ? (
          <div className="d-flex flex-column align-items-center justify-content-center text-muted" style={{ height: 220 }}>
            <i className="bx bx-error-circle font-size-32 d-block mb-2 text-danger" />
            <p className="font-size-13 mb-2">خطا در پردازش داده نمودار</p>
            {onRetry && <Button size="sm" color="primary" outline onClick={onRetry}>تلاش دوباره</Button>}
          </div>
        ) : showEmpty ? (
          <div className="d-flex flex-column align-items-center justify-content-center text-muted" style={{ height: 220 }}>
            <i className="bx bx-bar-chart-alt-2 font-size-32 d-block mb-2" />
            <p className="font-size-13 mb-0">داده‌ای برای نمایش وجود ندارد</p>
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
