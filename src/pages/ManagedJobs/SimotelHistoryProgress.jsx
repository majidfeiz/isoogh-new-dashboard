import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Badge, Progress, Spinner } from "reactstrap";
import { getManagedJobRun, getManagedJobRuns } from "../../services/managedJobService.jsx";
import { formatElapsedTime, isProgressStale, latestProgressLog, managedJobError, managedJobRunErrorMessage, progressData } from "./managedJobUtils.js";

export const SIMOTEL_HISTORY_JOB_KEY = "sync-simotel-outbound-history";
export const MANAGED_JOB_POLL_INTERVAL = 10000;

const COUNTERS = [
  ["received", "دریافت‌شده"],
  ["added", "افزوده‌شده"],
  ["updated", "به‌روزشده"],
  ["duplicate", "تکراری"],
  ["skipped", "ردشده"],
];

const newestRun = (runs = []) => [...runs].sort((first, second) => {
  const firstDate = new Date(first.started_at || first.startedAt || 0).getTime();
  const secondDate = new Date(second.started_at || second.startedAt || 0).getTime();
  return secondDate - firstDate || Number(second.id || 0) - Number(first.id || 0);
})[0];

const SimotelHistoryProgress = ({ onTerminal }) => {
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const runIdRef = useRef(null);
  const timerRef = useRef(null);
  const controllerRef = useRef(null);
  const terminalRunRef = useRef(null);

  const load = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setError("");
    try {
      if (!runIdRef.current) {
        const currentRuns = await getManagedJobRuns({
          jobKey: SIMOTEL_HISTORY_JOB_KEY,
          status: "running",
          page: 1,
          limit: 20,
        }, controller.signal);
        const currentRun = newestRun(currentRuns.items);
        if (!currentRun) {
          if (!controller.signal.aborted) setRun(null);
          return;
        }
        runIdRef.current = currentRun.id;
      }

      const detail = await getManagedJobRun(runIdRef.current, controller.signal);
      if (controller.signal.aborted) return;
      setRun(detail);
      const status = String(detail.status || "").toLowerCase();
      if (["succeeded", "failed"].includes(status) && terminalRunRef.current !== detail.id) {
        terminalRunRef.current = detail.id;
        onTerminal?.(detail);
      }
    } catch (caught) {
      if (caught?.code !== "ERR_CANCELED" && caught?.name !== "AbortError" && !controller.signal.aborted) {
        setError(managedJobError(caught, "دریافت پیشرفت اجرای جاری انجام نشد."));
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [onTerminal]);

  useEffect(() => {
    load();
    return () => controllerRef.current?.abort();
  }, [load]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const status = String(run?.status || "running").toLowerCase();
    if (!["succeeded", "failed"].includes(status)) timerRef.current = setTimeout(load, MANAGED_JOB_POLL_INTERVAL);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [load, run?.status, run?.updated_at, run?.updatedAt]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const progressLog = latestProgressLog(run?.logs);
  const progress = progressData(progressLog);
  const startedAt = run?.started_at || run?.startedAt;
  const status = String(run?.status || "running").toLowerCase();
  const failed = status === "failed";

  return <div className="border rounded-3 bg-light p-3 p-md-4 my-2" data-testid="simotel-progress-panel">
    <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
      <div><strong className="d-block">پیشرفت همگام‌سازی تاریخچه تماس‌های خروجی</strong><small className="text-muted">زمان سپری‌شده: {formatElapsedTime(startedAt, now)}</small></div>
      <div className="d-flex flex-wrap gap-2"><Badge color={failed ? "danger" : status === "succeeded" ? "success" : "info"}>{failed ? "ناموفق" : status === "succeeded" ? "تکمیل‌شده" : "در حال اجرا"}</Badge>{isProgressStale(progressLog, now) && status === "running" && <Badge color="warning">بدون پیشرفت اخیر</Badge>}</div>
    </div>
    {error && <Alert color="danger" className="py-2">{error}</Alert>}
    {failed && <Alert color="danger" className="py-2">{managedJobRunErrorMessage(run?.error_code || run?.errorCode, run?.error_message || run?.errorMessage)}</Alert>}
    {loading && !run ? <div className="text-muted"><Spinner size="sm" className="ms-2" />در حال دریافت وضعیت اجرا...</div> : !progressLog ? <div className="text-muted">در انتظار دریافت اولین صفحه</div> : <>
      <div className="d-flex justify-content-between mb-2"><span>{progress.processedPages.toLocaleString("fa-IR")} از {progress.totalPages.toLocaleString("fa-IR")} صفحه</span><strong>{progress.percent.toLocaleString("fa-IR")}٪</strong></div>
      <Progress value={progress.percent} color={status === "failed" ? "danger" : "primary"} className="mb-3" aria-label={`پیشرفت ${progress.percent} درصد`} />
      <div className="row g-2">{COUNTERS.map(([key, label]) => <div className="col-6 col-md" key={key}><div className="bg-white border rounded p-2 h-100"><small className="text-muted d-block">{label}</small><strong>{Number(progress.counters[key] || 0).toLocaleString("fa-IR")}</strong></div></div>)}</div>
    </>}
  </div>;
};

export default SimotelHistoryProgress;
