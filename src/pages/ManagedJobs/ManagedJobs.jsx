import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Badge, Button, Card, CardBody, CardHeader, Col, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Nav, NavItem, NavLink, Row, Spinner, Table } from "reactstrap";
import { toast } from "react-toastify";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import Paginations from "../../components/Common/Paginations.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { executeManagedJob, getManagedJobs, getManagedJobRuns, updateManagedJob } from "../../services/managedJobService.jsx";
import { buildConfiguration, formatJobDate, intervalLabel, managedJobError, managedJobRunErrorMessage, statusView, validateJobForm, validationFields } from "./managedJobUtils.js";
import SimotelHistoryProgress, { SIMOTEL_HISTORY_JOB_KEY } from "./SimotelHistoryProgress.jsx";

const StatusBadge = ({ status }) => {
  const view = statusView(status);
  return <Badge color={view[0]}>{view[1]}</Badge>;
};

const Loading = () => <div className="placeholder-glow p-3">{[1, 2, 3, 4, 5].map((id) => <span key={id} className="placeholder col-12 d-block mb-3" style={{ height: 40 }} />)}</div>;

const ManagedJobs = () => {
  document.title = "مدیریت پردازش‌های زمان‌بندی‌شده | داشبورد آیسوق";
  const { hasPermission } = useAuth();
  const canUpdate = hasPermission("managed-jobs.update");
  const canExecute = hasPermission("managed-jobs.execute");
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const view = params.get("view") === "runs" ? "runs" : "jobs";
  const [search, setSearch] = useState(params.get("search") || "");
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [editJob, setEditJob] = useState(null);
  const [editForm, setEditForm] = useState({ intervalSeconds: 30, configuration: {} });
  const [fieldErrors, setFieldErrors] = useState({});
  const [toggleJob, setToggleJob] = useState(null);
  const [executeJob, setExecuteJob] = useState(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [togglingKey, setTogglingKey] = useState("");
  const [terminalNotice, setTerminalNotice] = useState(null);
  const requestRef = useRef(null);

  const page = Math.max(1, Number(params.get("page") || 1));
  const limit = Math.max(1, Number(params.get("limit") || 20));
  const setQuery = (key, value, resetPage = true) => setParams((old) => {
    const next = new URLSearchParams(old);
    value ? next.set(key, value) : next.delete(key);
    if (resetPage) next.set("page", "1");
    return next;
  });

  const load = useCallback(async (background = false) => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    background ? setRefreshing(true) : setLoading(true);
    setError("");
    const query = {
      page,
      limit,
      search: params.get("search") || "",
      ...(view === "jobs"
        ? { enabled: params.get("enabled") || "" }
        : { jobKey: params.get("jobKey") || "", status: params.get("status") || "" }),
    };
    try {
      const result = view === "jobs"
        ? await getManagedJobs(query, controller.signal)
        : await getManagedJobRuns(query, controller.signal);
      if (!controller.signal.aborted) {
        setItems(result.items);
        setMeta(result.meta);
      }
    } catch (caught) {
      if (caught?.code !== "ERR_CANCELED" && !controller.signal.aborted) {
        setItems([]);
        setError(managedJobError(caught, "دریافت اطلاعات انجام نشد."));
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [limit, page, params, view]);

  useEffect(() => {
    load();
    return () => requestRef.current?.abort();
  }, [load]);

  const handleRunTerminal = useCallback((run) => {
    setTerminalNotice(run);
    load(true);
    getManagedJobRuns({ jobKey: SIMOTEL_HISTORY_JOB_KEY, page: 1, limit: 20 }).catch(() => {});
  }, [load]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (params.get("search") || "")) setQuery("search", search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, params]);

  const environmentDisabled = view === "jobs" && items.some((item) => item.environmentEnabled === false);
  const openEdit = (job) => {
    setEditJob(job);
    setFieldErrors({});
    setActionError("");
    setEditForm({
      intervalSeconds: job.intervalSeconds,
      configuration: buildConfiguration(job.configurationGuide, job.configuration),
    });
  };

  const saveEdit = async () => {
    const errors = validateJobForm(editForm, editJob.configurationGuide);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    setBusy(true);
    setActionError("");
    try {
      const updated = await updateManagedJob(editJob.key, {
        intervalSeconds: Number(editForm.intervalSeconds),
        configuration: buildConfiguration(editJob.configurationGuide, editForm.configuration),
      });
      setItems((current) => current.map((item) => item.key === updated.key ? updated : item));
      setEditJob(null);
      toast.success("تنظیمات Job ذخیره شد.");
    } catch (caught) {
      setFieldErrors((current) => ({ ...current, ...validationFields(caught) }));
      setActionError(managedJobError(caught));
    } finally {
      setBusy(false);
    }
  };

  const openToggle = (job) => {
    if (togglingKey) return;
    setActionError("");
    setToggleJob({ job, nextEnabled: !job.enabled });
  };

  const closeToggle = () => {
    if (busy || togglingKey) return;
    setToggleJob(null);
    setActionError("");
  };

  const confirmToggle = async () => {
    if (!toggleJob?.job || busy || togglingKey) return;
    const { job, nextEnabled } = toggleJob;
    setBusy(true);
    setTogglingKey(job.key);
    setActionError("");
    try {
      const updated = await updateManagedJob(job.key, { enabled: nextEnabled });
      const canonical = {
        ...job,
        ...updated,
        key: updated.key || job.key,
        enabled: typeof updated.enabled === "boolean" ? updated.enabled : nextEnabled,
      };
      setItems((current) => current.map((item) => item.key === job.key ? canonical : item));
      setToggleJob(null);
      toast.success(nextEnabled ? "Job با موفقیت فعال شد." : "Job با موفقیت غیرفعال شد.");
      await load(true);
    } catch (caught) {
      setActionError(managedJobError(caught));
    } finally {
      setBusy(false);
      setTogglingKey("");
    }
  };

  const execute = async () => {
    const cleanReason = reason.trim();
    if (!cleanReason) return setActionError("دلیل اجرای دستی الزامی است.");
    if (cleanReason.length > 500) return setActionError("دلیل اجرا حداکثر ۵۰۰ کاراکتر است.");
    setBusy(true);
    setActionError("");
    try {
      const result = await executeManagedJob(executeJob.key, cleanReason);
      const correlation = result.correlationId || result.correlation_id;
      toast.success("اجرای دستی ایجاد شد" + (correlation ? "؛ شناسه: " + correlation : ""));
      setExecuteJob(null);
      setReason("");
      await load(true);
      const id = result.id ?? result.runId ?? result.run_id;
      if (id) navigate("/managed-jobs/runs/" + id);
    } catch (caught) {
      setActionError(managedJobError(caught, "اجرای دستی Job انجام نشد."));
    } finally {
      setBusy(false);
    }
  };

  return <div className="page-content" dir="rtl"><div className="container-fluid">
    <Breadcrumbs title="مدیریت سیستم" breadcrumbItem="پردازش‌های زمان‌بندی‌شده" />
    <Card className="mb-4"><CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-3">
      <div><h4 className="mb-1">مدیریت پردازش‌های زمان‌بندی‌شده</h4><div className="text-muted">کنترل تنظیمات و تاریخچه اجرای Jobهای سامانه</div></div>
      <Button outline color="secondary" onClick={() => load(true)} disabled={refreshing}>{refreshing ? <Spinner size="sm" /> : <i className="bx bx-refresh" />} به‌روزرسانی</Button>
    </CardHeader></Card>
    {environmentDisabled && <Alert color="warning"><i className="bx bx-server ms-2" />سیستم اجرای Jobها در container غیرفعال است و وضعیت مؤثر همه Jobها غیرفعال خواهد بود.</Alert>}
    {terminalNotice && <Alert color={terminalNotice.status === "failed" ? "danger" : "success"} toggle={() => setTerminalNotice(null)}>{terminalNotice.status === "failed" ? managedJobRunErrorMessage(terminalNotice.error_code || terminalNotice.errorCode, terminalNotice.error_message || terminalNotice.errorMessage || "اجرای همگام‌سازی تاریخچه تماس‌ها ناموفق بود.") : "همگام‌سازی تاریخچه تماس‌ها با موفقیت پایان یافت."}</Alert>}
    {actionError && !toggleJob && <Alert color="danger">{actionError}</Alert>}
    <Nav tabs className="mb-3">
      <NavItem><NavLink href="#" active={view === "jobs"} onClick={(event) => { event.preventDefault(); setParams({ view: "jobs", page: "1", limit: String(limit) }); }}>Jobها</NavLink></NavItem>
      <NavItem><NavLink href="#" active={view === "runs"} onClick={(event) => { event.preventDefault(); setParams({ view: "runs", page: "1", limit: String(limit) }); }}>تاریخچه اجراها</NavLink></NavItem>
    </Nav>
    <Card><CardHeader><Row className="g-2">
      <Col md="5"><Input aria-label="جستجو" placeholder="جستجو..." value={search} onChange={(event) => setSearch(event.target.value)} /></Col>
      {view === "jobs" ? <Col md="3"><Input aria-label="وضعیت فعال بودن" type="select" value={params.get("enabled") || ""} onChange={(event) => setQuery("enabled", event.target.value)}><option value="">همه وضعیت‌ها</option><option value="true">فعال</option><option value="false">غیرفعال</option></Input></Col> : <>
        <Col md="3"><Input aria-label="فیلتر Job" placeholder="کلید Job" value={params.get("jobKey") || ""} onChange={(event) => setQuery("jobKey", event.target.value)} /></Col>
        <Col md="3"><Input aria-label="وضعیت اجرا" type="select" value={params.get("status") || ""} onChange={(event) => setQuery("status", event.target.value)}><option value="">همه وضعیت‌ها</option><option value="running">در حال اجرا</option><option value="succeeded">موفق</option><option value="failed">ناموفق</option><option value="skipped">رد شده</option></Input></Col>
      </>}
    </Row></CardHeader><CardBody className="p-0">
      {loading ? <Loading /> : error ? <Alert color="danger" className="m-3">{error}<Button size="sm" outline color="danger" className="me-2" onClick={() => load()}>تلاش مجدد</Button></Alert> : !items.length ? <div className="text-center text-muted py-5"><i className="bx bx-data fs-1 d-block" />موردی یافت نشد.</div> : view === "jobs" ? <div className="table-responsive"><Table hover className="align-middle mb-0"><thead><tr><th>Job</th><th>وضعیت</th><th>آخرین نتیجه</th><th>آخرین / اجرای بعدی</th><th>فاصله</th><th>عملیات</th></tr></thead><tbody>
        {items.map((job) => {
          const executeDisabled = !job.environmentEnabled || !job.effectiveEnabled || job.running;
          const executeHint = job.running ? "این Job در حال اجراست؛ پس از پایان می‌توانید دوباره آن را اجرا کنید." : !job.environmentEnabled ? "اجرای Jobها در تنظیمات سرور غیرفعال است." : !job.effectiveEnabled ? "ابتدا Job را فعال کنید." : "";
          return <React.Fragment key={job.key}><tr><td><strong>{job.name}</strong><code dir="ltr" className="d-block">{job.key}</code><small className="text-muted">{job.description}</small></td><td><div className="d-flex flex-wrap gap-1"><Badge color={job.enabled ? "success" : "secondary"}>{job.enabled ? "فعال در پنل" : "غیرفعال در پنل"}</Badge><Badge color={job.effectiveEnabled ? "success" : "danger"}>{job.effectiveEnabled ? "فعال مؤثر" : "غیرفعال مؤثر"}</Badge>{job.running && <Badge color="info">در حال اجرا</Badge>}</div></td><td><StatusBadge status={job.lastStatus} /></td><td><div title={job.lastStartedAt || ""}>{formatJobDate(job.lastStartedAt)}</div><small title={job.nextRunAt || ""} className="text-muted">بعدی: {formatJobDate(job.nextRunAt)}</small></td><td>{intervalLabel(job.intervalSeconds)}</td><td><div className="d-flex flex-wrap align-items-center gap-2">{canUpdate && <><Button size="sm" outline color="primary" onClick={() => openEdit(job)} disabled={togglingKey === job.key}>ویرایش</Button><button type="button" className={`btn btn-sm d-inline-flex align-items-center gap-2 rounded-pill ${job.enabled ? "btn-soft-success" : "btn-soft-secondary"}`} onClick={() => openToggle(job)} disabled={Boolean(togglingKey)} aria-label={`${job.enabled ? "غیرفعال‌کردن" : "فعال‌کردن"} ${job.name}`} aria-pressed={job.enabled}><span className={`position-relative rounded-pill ${job.enabled ? "bg-success" : "bg-secondary"}`} style={{ width: 34, height: 18 }} aria-hidden="true"><span className="position-absolute bg-white rounded-circle shadow-sm" style={{ width: 14, height: 14, top: 2, transition: "inset-inline-start .2s", insetInlineStart: job.enabled ? 18 : 2 }} /></span><span>{togglingKey === job.key ? <Spinner size="sm" /> : job.enabled ? "فعال" : "غیرفعال"}</span></button></>}{canExecute && <span className="d-inline-block" title={executeHint}><Button size="sm" color="primary" disabled={executeDisabled} style={executeDisabled ? { pointerEvents: "none" } : undefined} onClick={() => { setExecuteJob(job); setReason(""); setActionError(""); }}>اجرای دستی</Button></span>}</div></td></tr>{job.key === SIMOTEL_HISTORY_JOB_KEY && job.running && <tr><td colSpan="6" className="p-2"><SimotelHistoryProgress onTerminal={handleRunTerminal} /></td></tr>}</React.Fragment>;
        })}
      </tbody></Table></div> : <div className="table-responsive"><Table hover className="align-middle mb-0"><thead><tr><th>شناسه</th><th>Job</th><th>Trigger</th><th>وضعیت</th><th>درخواست‌دهنده</th><th>مدت</th><th>شروع</th><th /></tr></thead><tbody>
        {items.map((run) => <tr key={run.id}><td>{run.id}</td><td><code>{run.job_key || run.jobKey}</code></td><td>{run.trigger || "—"}</td><td><StatusBadge status={run.status} /></td><td>{run.requested_by || run.requestedBy || "سیستم"}</td><td>{run.duration_ms == null ? "—" : Number(run.duration_ms).toLocaleString("fa-IR") + " ms"}</td><td title={run.started_at || ""}>{formatJobDate(run.started_at || run.startedAt)}</td><td><Button tag={Link} to={"/managed-jobs/runs/" + run.id} size="sm" outline color="primary">جزئیات</Button></td></tr>)}
      </tbody></Table></div>}
    </CardBody></Card>
    {!loading && !error && meta.total > 0 && <div className="mt-3"><Paginations perPageData={meta.limit} data={items} totalRecords={meta.total} currentPage={meta.page} setCurrentPage={(next) => setQuery("page", String(next), false)} isShowingPageLength paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" /></div>}

    <Modal isOpen={Boolean(toggleJob)} toggle={closeToggle} centered labelledBy="managed-job-toggle-title"><ModalHeader toggle={closeToggle}><span id="managed-job-toggle-title">تأیید تغییر وضعیت Job</span></ModalHeader><ModalBody>{actionError && <Alert color="danger" role="alert">{actionError}</Alert>}<div className="border rounded p-3 bg-light mb-3"><strong className="d-block mb-1">{toggleJob?.job?.name}</strong><code dir="ltr">{toggleJob?.job?.key}</code></div>{toggleJob?.nextEnabled ? <Alert color="info" className="mb-0">این Job فعال می‌شود و در صورت فعال‌بودن تنظیمات container، اجرای زمان‌بندی‌شده بعدی انجام خواهد شد.</Alert> : <Alert color="warning" className="mb-0">اجرای جاری قطع نمی‌شود، اما اجرای زمان‌بندی‌شده بعدی انجام نخواهد شد.</Alert>}</ModalBody><ModalFooter><Button color="light" onClick={closeToggle} disabled={busy}>انصراف</Button><Button color={toggleJob?.nextEnabled ? "success" : "danger"} onClick={confirmToggle} disabled={busy}>{busy && <Spinner size="sm" className="ms-1" />}{toggleJob?.nextEnabled ? "فعال‌کردن" : "غیرفعال‌کردن"}</Button></ModalFooter></Modal>
    <Modal isOpen={Boolean(editJob)} toggle={() => !busy && setEditJob(null)} size="lg" scrollable><ModalHeader toggle={() => setEditJob(null)}>ویرایش {editJob?.name}</ModalHeader><ModalBody>{editJob && <>
      <FormGroup><Label for="job-interval">فاصله اجرا (ثانیه)</Label><Input id="job-interval" type="number" min="30" max="86400" value={editForm.intervalSeconds} invalid={Boolean(fieldErrors.intervalSeconds)} onChange={(event) => setEditForm((old) => ({ ...old, intervalSeconds: event.target.value }))} /><FormFeedback>{fieldErrors.intervalSeconds}</FormFeedback><small className="text-muted">{intervalLabel(editForm.intervalSeconds)}</small></FormGroup>
      <Row className="g-3">{Object.entries(editJob.configurationGuide || {}).map(([key, guide]) => <Col md="6" key={key}><FormGroup><Label for={"config-" + key}>{guide.title || key}</Label>{guide.type === "enum" ? <Input id={"config-" + key} type="select" value={editForm.configuration[key] ?? guide.default ?? ""} invalid={Boolean(fieldErrors[key])} onChange={(event) => setEditForm((old) => ({ ...old, configuration: { ...old.configuration, [key]: event.target.value } }))}>{(guide.values || []).map((value) => <option key={value}>{value}</option>)}</Input> : <Input id={"config-" + key} type="number" min={guide.minimum} max={guide.maximum} value={editForm.configuration[key] ?? guide.default ?? ""} invalid={Boolean(fieldErrors[key])} onChange={(event) => setEditForm((old) => ({ ...old, configuration: { ...old.configuration, [key]: event.target.value } }))} />}<FormFeedback>{fieldErrors[key]}</FormFeedback>{guide.help && <small className="text-muted">{guide.help}</small>}</FormGroup></Col>)}</Row>
    </>}</ModalBody><ModalFooter><Button color="light" onClick={() => setEditJob(null)} disabled={busy}>انصراف</Button><Button color="success" onClick={saveEdit} disabled={busy}>{busy && <Spinner size="sm" className="ms-1" />}ذخیره</Button></ModalFooter></Modal>
    <Modal isOpen={Boolean(executeJob)} toggle={() => !busy && setExecuteJob(null)} centered><ModalHeader toggle={() => setExecuteJob(null)}>اجرای دستی {executeJob?.name}</ModalHeader><ModalBody><Alert color="warning">اجرای دستی ممکن است روی production اثر بگذارد و از configuration ذخیره‌شده استفاده می‌کند.</Alert><Label for="execute-reason">دلیل اجرا</Label><Input id="execute-reason" type="textarea" rows="3" maxLength="500" value={reason} onChange={(event) => setReason(event.target.value)} /><small className="text-muted">{reason.length.toLocaleString("fa-IR")} / ۵۰۰</small></ModalBody><ModalFooter><Button color="light" onClick={() => setExecuteJob(null)} disabled={busy}>انصراف</Button><Button color="primary" onClick={execute} disabled={busy}>{busy && <Spinner size="sm" className="ms-1" />}شروع اجرا</Button></ModalFooter></Modal>
  </div></div>;
};

export default ManagedJobs;
