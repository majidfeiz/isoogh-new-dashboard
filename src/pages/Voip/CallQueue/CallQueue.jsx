import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Badge, Button, Card, CardBody, CardHeader, Col, Input, Label, Row, Spinner } from "reactstrap";
import { toast } from "react-toastify";
import Breadcrumbs from "../../../components/Common/Breadcrumb.jsx";
import Paginations from "../../../components/Common/Paginations.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";
import { getSchools } from "../../../services/schoolService.jsx";
import { cancelCallQueueJob, getCallQueue, getCallQueueStats, retryCallQueueJob } from "../../../services/callQueueService.jsx";
import { formatDuration, formatQueueDate, oldestQueueWait, QUEUE_STATUS, shouldPollCallQueue } from "./callQueueUtils.js";

const POLL_MS = 5000;
const emptyMeta = { page: 1, limit: 15, total: 0, lastPage: 1 };
const statCards = [
  ["queued", "در صف", "warning"],
  ["processing", "در حال پردازش", "primary"],
  ["completed", "تکمیل ارسال", "success"],
  ["failed", "ناموفق", "danger"],
  ["cancelled", "لغوشده", "secondary"],
];

const CallQueue = () => {
  document.title = "صف تماس سیموتل | داشبورد آیسوق";
  const { hasPermission } = useAuth();
  const [schools, setSchools] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [schoolId, setSchoolId] = useState("");
  const [status, setStatus] = useState("");
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(emptyMeta);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);
  const requestRef = useRef(null);

  useEffect(() => {
    getSchools({ page: 1, limit: 500, sortBy: "name", sortOrder: "ASC" })
      .then((result) => setSchools(result.items || []))
      .catch(() => setSchools([]))
      .finally(() => setSchoolsLoading(false));
  }, []);

  const load = useCallback(async ({ page = meta.page, background = false } = {}) => {
    if (!schoolId) return;
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    if (!background) setLoading(true);
    setError("");
    try {
      const [queueResult, statsResult] = await Promise.all([
        getCallQueue({ schoolId: Number(schoolId), status, page, limit: meta.limit, signal: controller.signal }),
        getCallQueueStats({ schoolId: Number(schoolId), signal: controller.signal }),
      ]);
      setItems(queueResult.items);
      setMeta(queueResult.pagination);
      setStats(statsResult);
    } catch (err) {
      if (err?.code !== "ERR_CANCELED" && !controller.signal.aborted) {
        setError(err?.response?.status === 403 ? "این مدرسه خارج از محدوده دسترسی شماست." : "دریافت اطلاعات صف تماس انجام نشد.");
      }
    } finally {
      if (!background && requestRef.current === controller) setLoading(false);
    }
  }, [schoolId, status, meta.page, meta.limit]);

  useEffect(() => {
    if (!schoolId) {
      setItems([]); setStats(null); setMeta(emptyMeta); setError("");
      return undefined;
    }
    load({ page: 1 });
    return () => requestRef.current?.abort();
  }, [schoolId, status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!schoolId) return undefined;
    let timer = null;
    const start = () => {
      if (timer || !shouldPollCallQueue(schoolId, document.visibilityState)) return;
      timer = window.setInterval(() => load({ background: true }), POLL_MS);
    };
    const stop = () => { if (timer) window.clearInterval(timer); timer = null; };
    const onVisibility = () => {
      if (document.visibilityState === "visible") { load({ background: true }); start(); }
      else stop();
    };
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => { stop(); document.removeEventListener("visibilitychange", onVisibility); };
  }, [schoolId, load]);

  const handleActionError = useCallback((err) => {
    if (err?.response?.status === 409) toast.warning("وضعیت این درخواست هم‌زمان تغییر کرده است؛ اطلاعات تازه‌سازی شد.");
    else if (err?.response?.status === 403) toast.error("این مدرسه خارج از محدوده دسترسی شماست.");
    else toast.error("انجام عملیات ممکن نشد.");
  }, []);

  const runAction = async (item, action) => {
    const retrying = action === "retry";
    if (!window.confirm(retrying ? "برای این درخواست دوباره تلاش شود؟" : "این درخواست لغو شود؟")) return;
    setActionId(item.id);
    try {
      await (retrying ? retryCallQueueJob(item.id, Number(schoolId)) : cancelCallQueueJob(item.id, Number(schoolId)));
      toast.success(retrying ? "درخواست تلاش مجدد ثبت شد." : "درخواست لغو شد.");
    } catch (err) {
      handleActionError(err);
    } finally {
      setActionId(null);
      await load({ background: true });
    }
  };

  const waiting = useMemo(() => oldestQueueWait(stats?.oldestQueuedAt), [stats]);

  return <div className="page-content"><div className="container-fluid">
    <Breadcrumbs title="سرویس وویپ" breadcrumbItem="صف تماس سیموتل" />
    <Card className="mb-4"><CardHeader><Row className="align-items-end g-3"><Col md="6"><Label for="call-queue-school">مدرسه</Label><Input id="call-queue-school" type="select" value={schoolId} disabled={schoolsLoading} onChange={(event) => { setSchoolId(event.target.value); setMeta(emptyMeta); }}><option value="">مدرسه را انتخاب کنید</option>{schools.map((school) => <option key={school.id} value={school.id}>{school.name || school.title || `مدرسه ${school.id}`}</option>)}</Input></Col><Col md="3"><Label for="call-queue-status">وضعیت</Label><Input id="call-queue-status" type="select" value={status} disabled={!schoolId} onChange={(event) => { setStatus(event.target.value); setMeta(emptyMeta); }}><option value="">همه وضعیت‌ها</option>{Object.entries(QUEUE_STATUS).map(([value, config]) => <option key={value} value={value}>{config.label}</option>)}</Input></Col><Col md="3"><Button color="primary" outline block disabled={!schoolId || loading} onClick={() => load()}><i className="bx bx-refresh me-1" />تازه‌سازی</Button></Col></Row></CardHeader></Card>
    {!schoolId ? <Alert color="info">برای مشاهده آمار و صف تماس، ابتدا مدرسه را انتخاب کنید.</Alert> : <>
      <Row>{statCards.map(([key, label, color]) => <Col xl md="4" sm="6" key={key}><Card className={`border-${color}`}><CardBody><div className="text-muted">{label}</div><div className={`fs-3 fw-bold text-${color}`}>{Number(stats?.[key] ?? 0).toLocaleString("fa-IR")}</div></CardBody></Card></Col>)}</Row>
      <Row><Col md="6"><Alert color="light" className="border"><strong>قدیمی‌ترین انتظار در صف:</strong> {waiting}</Alert></Col><Col md="6"><Alert color="light" className="border"><strong>محدودیت فاصله ارسال:</strong> {formatDuration(stats?.intervalMs)}</Alert></Col></Row>
      <Card><CardHeader className="d-flex justify-content-between"><strong>درخواست‌های صف تماس</strong><span className="text-muted">{Number(meta.total || 0).toLocaleString("fa-IR")} مورد</span></CardHeader><CardBody>
        {loading ? <div className="text-center py-5"><Spinner color="primary" /><div className="mt-2">در حال دریافت صف تماس…</div></div> : error ? <Alert color="danger">{error} <Button size="sm" color="danger" outline className="ms-2" onClick={() => load()}>تلاش مجدد</Button></Alert> : !items.length ? <div className="text-center text-muted py-5">درخواستی با این وضعیت وجود ندارد.</div> : <div className="table-responsive"><table className="table table-bordered table-hover align-middle"><thead><tr><th>ID صف</th><th>ID تماس</th><th>اولویت</th><th>وضعیت</th><th>تلاش‌ها</th><th>زمان ایجاد</th><th>زمان ارسال</th><th>خطای آخر</th><th>Trace</th><th>عملیات</th></tr></thead><tbody>{items.map((item) => { const config = QUEUE_STATUS[item.status] || { label: item.status || "نامشخص", color: "dark" }; return <tr key={item.id}><td>{item.id ?? "—"}</td><td>{item.voipCallId ?? item.callId ?? "—"}</td><td>{Number(item.priority ?? 0).toLocaleString("fa-IR")}</td><td><Badge color={config.color}>{config.label}</Badge></td><td>{Number(item.attempts ?? 0).toLocaleString("fa-IR")} / {item.maxAttempts == null ? "—" : Number(item.maxAttempts).toLocaleString("fa-IR")}</td><td className="text-nowrap">{formatQueueDate(item.createdAt)}</td><td className="text-nowrap">{formatQueueDate(item.sentAt)}</td><td className="text-break" style={{ minWidth: 180 }}>{String(item.lastError || "—")}</td><td>{item.traceId ? <Link to={`/voip/call-traces?traceId=${encodeURIComponent(item.traceId)}`}>{item.traceId}</Link> : "—"}</td><td><div className="d-flex gap-1">{["failed", "cancelled"].includes(item.status) && hasPermission("voip.call-queue.retry") ? <Button size="sm" color="primary" disabled={actionId === item.id} onClick={() => runAction(item, "retry")}>تلاش مجدد</Button> : null}{["pending", "retry"].includes(item.status) && hasPermission("voip.call-queue.cancel") ? <Button size="sm" color="danger" outline disabled={actionId === item.id} onClick={() => runAction(item, "cancel")}>لغو</Button> : null}</div></td></tr>; })}</tbody></table></div>}
        {!loading && !error && items.length > 0 ? <Paginations perPageData={meta.limit} data={items} totalRecords={meta.total} currentPage={meta.page} setCurrentPage={(page) => load({ page })} isShowingPageLength paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" /> : null}
      </CardBody></Card>
    </>}
  </div></div>;
};

export default CallQueue;
