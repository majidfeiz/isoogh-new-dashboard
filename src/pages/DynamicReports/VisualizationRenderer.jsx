import React, { Suspense, lazy, useMemo } from "react";
import { Alert, Card, CardBody, Col, Row, Spinner } from "reactstrap";
import { formatBackendDisplayValue, formatValue } from "./utils.js";
const ReactApexChart = lazy(() => import("react-apexcharts"));

export const buildChartModel = (visualization) => {
  const type = visualization?.type;
  const data = visualization?.data || [];
  const keys = [...new Set(data.flatMap((point) => Object.keys(point.values || {})))];
  const categories = data.map((point) => point.dimension);
  const map = { kpi: "radialBar", bar: "bar", horizontal_bar: "bar", line: "line", area: "area", pie: "pie", doughnut: "donut", stacked_bar: "bar", heatmap: "heatmap", histogram: "bar", scatter: "scatter", funnel: "bar", gauge: "radialBar" };
  let series;
  if (["pie", "doughnut"].includes(type)) series = data.map((x) => Number(Object.values(x.values || {})[0] || 0));
  else if (type === "gauge") series = [Number(Object.values(data[0]?.values || {})[0] || 0)];
  else if (type === "scatter") series = keys.map((key) => ({ name: key, data: data.map((x) => [Number(x.dimension), Number(x.values?.[key] || 0)]) }));
  else if (type === "heatmap") series = keys.map((key) => ({ name: key, data: data.map((x) => ({ x: String(x.dimension ?? "—"), y: Number(x.values?.[key] || 0) })) }));
  else series = keys.map((key) => ({ name: key, data: data.map((x) => Number(x.values?.[key] || 0)) }));
  return { type: map[type], keys, categories, series, data };
};

export const getKpiEntries = (chart, summary) => {
  const summaryEntries = Object.entries(summary || {});
  if (summaryEntries.length) return summaryEntries;
  return chart.keys.map((key) => [key, chart.data[0]?.values?.[key]]);
};

const VisualizationRenderer = ({
  visualization,
  allowed = [],
  summary = {},
  summaryIsDisplay = false,
}) => {
  const type = visualization?.type;
  const permitted = allowed.map((item) => typeof item === "string" ? item : item.id || item.type).includes(type);
  const chart = useMemo(() => buildChartModel(visualization), [visualization]);
  if (!visualization) return null;
  if (!permitted) return <Alert color="warning">نوع نمایش «{type}» در catalog مجاز نیست.</Alert>;
  if (type === "kpi") return <Row className="g-3 mb-3">{getKpiEntries(chart, summary).map(([key, value]) => <Col md={4} key={key}><Card className="border"><CardBody><div className="text-muted">{key}</div><div className="display-6">{summaryIsDisplay ? formatBackendDisplayValue(value) : formatValue(value, "decimal")}</div></CardBody></Card></Col>)}</Row>;
  if (!chart.type) return <Alert color="warning">renderer این نوع نمایش در دسترس نیست.</Alert>;
  return <Suspense fallback={<Spinner />}><ReactApexChart type={chart.type} series={chart.series} height={360} options={{ chart: { stacked: type === "stacked_bar", toolbar: { show: true } }, labels: chart.categories, xaxis: type === "scatter" ? { type: "numeric" } : { categories: chart.categories }, plotOptions: { bar: { horizontal: type === "horizontal_bar" || type === "funnel" }, radialBar: { dataLabels: { value: { formatter: (value) => new Intl.NumberFormat("fa-IR").format(value) } } } }, title: { text: visualization.title || "" }, noData: { text: "داده‌ای وجود ندارد" } }} /></Suspense>;
};
export default VisualizationRenderer;
