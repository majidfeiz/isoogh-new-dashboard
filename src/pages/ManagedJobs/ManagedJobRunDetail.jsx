import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Alert, Badge, Button, Card, CardBody, CardHeader, Collapse, Spinner } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import { getManagedJobRun } from "../../services/managedJobService.jsx";
import { formatJobDate, managedJobError, statusView } from "./managedJobUtils.js";

const KeyValues = ({ value }) => {
  if (!value || typeof value !== "object" || !Object.keys(value).length) return <span className="text-muted">اطلاعاتی ثبت نشده است.</span>;
  return <dl className="row mb-0">{Object.entries(value).map(([key, item]) => <React.Fragment key={key}><dt className="col-md-4 text-muted">{key}</dt><dd className="col-md-8 text-break">{typeof item === "object" ? JSON.stringify(item) : String(item ?? "—")}</dd></React.Fragment>)}</dl>;
};

const ManagedJobRunDetail = () => {
  const { id } = useParams();
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rawOpen, setRawOpen] = useState(false);
  const timerRef = useRef(null);
  const controllerRef = useRef(null);

  const load = useCallback(async (background = false) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    if (!background) setLoading(true);
    setError("");
    try {
      const result = await getManagedJobRun(id, controller.signal);
      if (!controller.signal.aborted) setRun(result);
    } catch (caught) {
      if (caught?.code !== "ERR_CANCELED" && !controller.signal.aborted) setError(managedJobError(caught, "دریافت جزئیات اجرا انجام نشد."));
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    return () => {
      controllerRef.current?.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [load]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (run?.status === "running") timerRef.current = setTimeout(() => load(true), 5000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [load, run?.status, run?.updated_at, run?.finished_at]);

  const appearance = statusView(run?.status);
  const logs = run?.logs || [];
  document.title = "جزئیات اجرای Job | داشبورد آیسوق";

  return <div className="page-content" dir="rtl"><div className="container-fluid">
    <Breadcrumbs title="پردازش‌های زمان‌بندی‌شده" breadcrumbItem={"اجرای " + id} />
    <div className="mb-3"><Button tag={Link} to="/managed-jobs?view=runs" color="light"><i className="bx bx-arrow-back ms-1" />بازگشت به اجراها</Button></div>
    {error && <Alert color="danger">{error}<Button size="sm" outline color="danger" className="me-2" onClick={() => load()}>تلاش مجدد</Button></Alert>}
    {loading ? <div className="text-center py-5"><Spinner color="primary" /></div> : run && <>
      <Card className="mb-4"><CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2"><div><h4 className="mb-1">{run.job_name || run.jobName || run.job_key || run.jobKey}</h4><code>{run.correlation_id || run.correlationId || "—"}</code></div><Badge color={appearance[0]}>{appearance[1]}</Badge></CardHeader><CardBody><div className="row g-3"><div className="col-md-3"><small className="text-muted d-block">Trigger</small>{run.trigger || "—"}</div><div className="col-md-3"><small className="text-muted d-block">Worker</small>{run.worker_id || run.workerId || "—"}</div><div className="col-md-3"><small className="text-muted d-block">شروع</small><span title={run.started_at || ""}>{formatJobDate(run.started_at || run.startedAt)}</span></div><div className="col-md-3"><small className="text-muted d-block">پایان</small><span title={run.finished_at || ""}>{formatJobDate(run.finished_at || run.finishedAt)}</span></div></div>{run.error_message && <Alert color="danger" className="mt-3 mb-0"><strong>{run.error_code || "خطا"}:</strong> {run.error_message}</Alert>}</CardBody></Card>
      <div className="row g-3 mb-4"><div className="col-lg-6"><Card className="h-100"><CardHeader><strong>ورودی اجرا</strong></CardHeader><CardBody><KeyValues value={run.input_summary || run.inputSummary} /></CardBody></Card></div><div className="col-lg-6"><Card className="h-100"><CardHeader><strong>خروجی اجرا</strong></CardHeader><CardBody><KeyValues value={run.output_summary || run.outputSummary} /></CardBody></Card></div></div>
      <Card><CardHeader><strong>Timeline لاگ‌ها</strong></CardHeader><CardBody>{logs.length ? <div className="vstack gap-3">{logs.map((log, index) => { const level = String(log.level || "info").toLowerCase(); const color = level === "error" ? "danger" : level === "warning" ? "warning" : "info"; return <div key={log.id || index} className={"border-start border-4 border-" + color + " rounded bg-light p-3"}><div className="d-flex flex-wrap justify-content-between gap-2"><strong>{log.event || log.message || "رویداد"}</strong><small className="text-muted" title={log.created_at || ""}>{formatJobDate(log.created_at || log.createdAt)}</small></div>{log.event && log.message && <div className="mt-1">{log.message}</div>}{log.data && <details className="mt-2"><summary className="text-muted">داده فنی</summary><pre dir="ltr" className="bg-white border rounded p-2 mt-2 mb-0 text-wrap">{JSON.stringify(log.data, null, 2)}</pre></details>}</div>; })}</div> : <div className="text-center text-muted py-4">لاگی برای این اجرا ثبت نشده است.</div>}
        {(run.error_stack || run.errorStack) && <div className="mt-3"><Button size="sm" outline color="secondary" onClick={() => setRawOpen((open) => !open)}>جزئیات فنی خطا</Button><Collapse isOpen={rawOpen}><pre dir="ltr" className="bg-dark text-light rounded p-3 mt-2 text-wrap">{run.error_stack || run.errorStack}</pre></Collapse></div>}
      </CardBody></Card>
    </>}
  </div></div>;
};

export default ManagedJobRunDetail;
