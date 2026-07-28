import React, { useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, CardBody, CardHeader, Progress, Spinner } from "reactstrap";
import { useParams } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { executeDynamicReport, exportDynamicReport, getDynamicReport, getVisualizations } from "../../services/dynamicReportService.jsx";
import GenericResultTable from "./GenericResultTable.jsx";
import VisualizationRenderer from "./VisualizationRenderer.jsx";
import { getDisplaySummary, hasDisplaySummary } from "./utils.js";
import useDynamicReportPagination from "./useDynamicReportPagination.js";
const filenameFrom = (headers, fallback) => { const raw = headers?.["content-disposition"] || ""; const utf = raw.match(/filename\*=UTF-8''([^;]+)/i); const plain = raw.match(/filename="?([^";]+)"?/i); return decodeURIComponent(utf?.[1] || plain?.[1] || fallback); };
const DynamicReportView = () => {
  const { id } = useParams(); const { hasPermission } = useAuth(); const [report, setReport] = useState(null); const [allowed, setAllowed] = useState([]); const [loadingReport, setLoadingReport] = useState(true); const [error, setError] = useState(""); const [executionEnabled, setExecutionEnabled] = useState(false); const [progress, setProgress] = useState(0);
  useEffect(() => { Promise.all([getDynamicReport(id), getVisualizations()]).then(([r, v]) => { setReport(r); setAllowed(v?.items || v || []); }).catch((e) => setError(e?.response?.status === 404 ? "گزارش یافت نشد." : e?.response?.status === 403 ? "اجازه مشاهده این گزارش را ندارید." : "دریافت گزارش ناموفق بود.")).finally(() => setLoadingReport(false)); }, [id]);
  const requestExecution = useCallback((query, signal) => executeDynamicReport(id, {
    page: query.page,
    limit: query.limit,
    search: query.search,
  }, signal), [id]);
  const pagination = useDynamicReportPagination({
    mode: "execute",
    reportId: id,
    request: requestExecution,
    enabled: executionEnabled,
    initialLimit: 20,
  });
  const execute = () => {
    setError("");
    if (executionEnabled) pagination.refresh();
    else setExecutionEnabled(true);
  };
  const exportExcel = async () => { setProgress(1); try { const res = await exportDynamicReport(id, { search: pagination.search || undefined }, (e) => e.total && setProgress(Math.min(99, Math.round(e.loaded / e.total * 100)))); const url = URL.createObjectURL(res.data); const link = document.createElement("a"); link.href = url; link.download = filenameFrom(res.headers, `report-${id}.xlsx`); document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); setProgress(100); } catch (e) { setError(e?.response?.data?.message || "دریافت فایل Excel ناموفق بود."); } finally { setTimeout(() => setProgress(0), 1000); } };
  if (!report && loadingReport) return <div className="page-content text-center py-5"><Spinner /></div>;
  const executionError = pagination.error ? (pagination.error?.response?.data?.data?.message || pagination.error?.response?.data?.message || "اجرای گزارش ناموفق بود.") : "";
  return <div className="page-content"><div className="container-fluid"><Breadcrumbs title="گزارش‌ساز پویا" breadcrumbItem={report?.name || "گزارش"} />{error && <Alert color="danger">{error}</Alert>}<Card><CardHeader className="d-flex justify-content-between align-items-center"><div><h4 className="mb-1">{report?.name}</h4><div className="text-muted">{report?.description}</div></div><div>{hasPermission("dynamic-reports.execute") && <Button color="primary" className="ms-2" onClick={execute}>اجرای گزارش</Button>}{hasPermission("dynamic-reports.export") && pagination.result && <Button color="success" onClick={exportExcel}>دانلود Excel</Button>}</div></CardHeader><CardBody>{progress > 0 && <Progress value={progress} className="mb-3">{progress}%</Progress>}{pagination.result?.warnings?.map((w, i) => <Alert color="warning" key={i}>{w}</Alert>)}<VisualizationRenderer visualization={pagination.result?.visualization} allowed={allowed} summary={getDisplaySummary(pagination.result)} summaryIsDisplay={hasDisplaySummary(pagination.result)} />{(executionEnabled || pagination.result) && <GenericResultTable result={pagination.result} loading={pagination.loading} error={executionError} search={pagination.search} onSearch={pagination.setSearch} onPage={pagination.setPage} onLimit={pagination.setLimit} />}{pagination.result?.execution?.truncated && <Alert color="warning" className="mt-3">نتیجه به دلیل محدودیت حجم کوتاه شده است.</Alert>}</CardBody></Card></div></div>;
};
export default DynamicReportView;
