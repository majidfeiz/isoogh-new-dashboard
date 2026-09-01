import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Alert, Badge, Button, Card, CardBody, CardHeader, Col, Input, Label, Row, Spinner } from "reactstrap";
import { toast } from "react-toastify";
import Breadcrumbs from "../../../components/Common/Breadcrumb.jsx";
import Paginations from "../../../components/Common/Paginations.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";
import { getSchools } from "../../../services/schoolService.jsx";
import { cancelCallQueueJob, getCallQueue, getCallQueueStats, retryCallQueueJob } from "../../../services/callQueueService.jsx";
import { formatDuration, formatQueueDate, isCallQueueAdminLike, oldestQueueWait, parseCallQueueQuery, QUEUE_STATUS, serializeCallQueueQuery, shouldPollCallQueue } from "./callQueueUtils.js";

const POLL_MS = 5000;
const emptyMeta = { page: 1, limit: 20, total: 0, lastPage: 1 };
const isCanceled = (error) => error?.code === "ERR_CANCELED" || error?.name === "CanceledError";
const statusCards = [
  ["pending", "در صف", "warning"], ["retry", "در انتظار تلاش مجدد", "info"],
  ["processing", "در حال پردازش", "primary"], ["completed", "ارسال‌شده", "success"],
  ["failed", "ناموفق", "danger"], ["cancelled", "لغوشده", "secondary"],
];
const schoolLabel = (item) => item?.schoolName || `مجموعه #${item?.schoolId ?? "—"}`;

const CallQueue = () => {
  document.title = "صف تماس مجموعه‌ها | داشبورد آیسوق";
  const auth = useAuth();
  const isAdminLike = useMemo(() => isCallQueueAdminLike(auth?.user), [auth?.user]);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryString = searchParams.toString();
  const query = useMemo(() => parseCallQueueQuery(new URLSearchParams(queryString), isAdminLike), [queryString, isAdminLike]);
  const effectiveAllSchools = isAdminLike && !query.schoolId;
  const scopeParams = useMemo(() => ({ schoolId: query.schoolId || undefined, allSchools: effectiveAllSchools }), [query.schoolId, effectiveAllSchools]);

  const [schools, setSchools] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(emptyMeta);
  const [stats, setStats] = useState(null);
  const [listLoading, setListLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [listRefreshing, setListRefreshing] = useState(false);
  const [statsRefreshing, setStatsRefreshing] = useState(false);
  const [listError, setListError] = useState("");
  const [statsError, setStatsError] = useState("");
  const [actionId, setActionId] = useState(null);
  const listAbortRef = useRef(null);
  const statsAbortRef = useRef(null);

  const updateQuery = useCallback((updates) => {
    const next = { ...query, ...updates };
    if (Object.prototype.hasOwnProperty.call(updates, "schoolId")) next.allSchools = !updates.schoolId && isAdminLike;
    setSearchParams(serializeCallQueueQuery(next));
  }, [isAdminLike, query, setSearchParams]);

  const resetUnauthorizedScope = useCallback(() => {
    setItems([]); setStats(null); setMeta((current) => ({ ...emptyMeta, limit: current.limit }));
    setSearchParams(serializeCallQueueQuery({ schoolId: null, allSchools: isAdminLike, status: query.status, page: 1, limit: query.limit }));
  }, [isAdminLike, query.limit, query.status, setSearchParams]);

  useEffect(() => {
    if (auth?.meLoading) return undefined;
    getSchools({ page: 1, limit: 500, sortBy: "name", sortOrder: "ASC" })
      .then((result) => setSchools(result.items || [])).catch(() => setSchools([])).finally(() => setSchoolsLoading(false));
    return undefined;
  }, [auth?.meLoading]);

  useEffect(() => {
    if (auth?.meLoading) return;
    const normalized = serializeCallQueueQuery({ ...query, allSchools: effectiveAllSchools }).toString();
    if (normalized !== queryString) setSearchParams(new URLSearchParams(normalized), { replace: true });
  }, [auth?.meLoading, effectiveAllSchools, query, queryString, setSearchParams]);

  const loadList = useCallback(async ({ background = false } = {}) => {
    listAbortRef.current?.abort();
    const controller = new AbortController(); listAbortRef.current = controller;
    if (background) setListRefreshing(true); else setListLoading(true);
    setListError("");
    try {
      const result = await getCallQueue({ ...scopeParams, status: query.status, page: query.page, limit: query.limit, signal: controller.signal });
      if (listAbortRef.current !== controller) return;
      setItems(result.items || []); setMeta(result.pagination || emptyMeta);
    } catch (error) {
      if (isCanceled(error) || listAbortRef.current !== controller) return;
      setItems([]);
      if (error?.response?.status === 403) { setListError("به محدوده انتخاب‌شده دسترسی ندارید؛ محدوده قبلی پاک شد."); resetUnauthorizedScope(); }
      else if (error?.response?.status === 400) setListError("محدوده انتخاب‌شده معتبر نیست. لطفاً مجموعه را دوباره انتخاب کنید.");
      else setListError("دریافت درخواست‌های صف تماس انجام نشد.");
    } finally {
      if (listAbortRef.current === controller) { setListLoading(false); setListRefreshing(false); }
    }
  }, [query.limit, query.page, query.status, resetUnauthorizedScope, scopeParams]);

  const loadStats = useCallback(async ({ background = false } = {}) => {
    statsAbortRef.current?.abort();
    const controller = new AbortController(); statsAbortRef.current = controller;
    if (background) setStatsRefreshing(true); else setStatsLoading(true);
    setStatsError("");
    try {
      const result = await getCallQueueStats({ ...scopeParams, signal: controller.signal });
      if (statsAbortRef.current === controller) setStats(result);
    } catch (error) {
      if (isCanceled(error) || statsAbortRef.current !== controller) return;
      setStats(null);
      if (error?.response?.status === 403) { setStatsError("به آمار محدوده انتخاب‌شده دسترسی ندارید."); resetUnauthorizedScope(); }
      else if (error?.response?.status === 400) setStatsError("محدوده آمار معتبر نیست.");
      else setStatsError("دریافت آمار صف تماس انجام نشد.");
    } finally {
      if (statsAbortRef.current === controller) { setStatsLoading(false); setStatsRefreshing(false); }
    }
  }, [resetUnauthorizedScope, scopeParams]);

  useEffect(() => { if (!auth?.meLoading) loadList(); return () => listAbortRef.current?.abort(); }, [auth?.meLoading, loadList]);
  useEffect(() => { if (!auth?.meLoading) loadStats(); return () => statsAbortRef.current?.abort(); }, [auth?.meLoading, loadStats]);

  useEffect(() => {
    if (auth?.meLoading) return undefined;
    let timer = null;
    const start = () => {
      if (timer || !shouldPollCallQueue(true, document.visibilityState)) return;
      timer = window.setInterval(() => { loadList({ background: true }); loadStats({ background: true }); }, POLL_MS);
    };
    const stop = () => { if (timer) window.clearInterval(timer); timer = null; };
    const onVisibility = () => {
      if (document.visibilityState === "visible") { loadList({ background: true }); loadStats({ background: true }); start(); } else stop();
    };
    start(); document.addEventListener("visibilitychange", onVisibility);
    return () => { stop(); document.removeEventListener("visibilitychange", onVisibility); };
  }, [auth?.meLoading, loadList, loadStats]);

  const refreshCurrentView = useCallback(() => { loadList({ background: true }); loadStats({ background: true }); }, [loadList, loadStats]);
  const runAction = async (item, action) => {
    const retrying = action === "retry";
    if (!item.schoolId) return toast.error("شناسه مجموعه این درخواست مشخص نیست.");
    if (!window.confirm(retrying ? "برای این درخواست دوباره تلاش شود؟" : "این درخواست لغو شود؟")) return;
    setActionId(item.id);
    try {
      await (retrying ? retryCallQueueJob(item.id, Number(item.schoolId)) : cancelCallQueueJob(item.id, Number(item.schoolId)));
      toast.success(retrying ? "درخواست تلاش مجدد ثبت شد." : "درخواست لغو شد.");
    } catch (error) {
      if (error?.response?.status === 404) toast.warning("درخواست در این مجموعه پیدا نشد؛ جدول تازه‌سازی شد.");
      else if (error?.response?.status === 409) toast.warning("وضعیت درخواست هم‌زمان تغییر کرده است؛ اطلاعات تازه‌سازی شد.");
      else if (error?.response?.status === 403) toast.error("اجازه انجام این عملیات را برای مجموعه مربوطه ندارید.");
      else toast.error("انجام عملیات ممکن نشد.");
    } finally { setActionId(null); refreshCurrentView(); }
  };

  const activeSchool = useMemo(() => schools.find((school) => Number(school.id) === Number(query.schoolId)), [query.schoolId, schools]);
  const activeScopeLabel = query.schoolId ? activeSchool?.name || activeSchool?.title || `مجموعه #${query.schoolId}` : isAdminLike ? "همه مجموعه‌ها" : "همه مجموعه‌های مجاز";

  return <div className="page-content"><div className="container-fluid">
    <Breadcrumbs title="سرویس وویپ" breadcrumbItem="صف تماس مجموعه‌ها" />
    <Card className="mb-4">
      <CardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div><h4 className="card-title mb-1">صف تماس مجموعه‌ها</h4><Badge color="primary" pill>{activeScopeLabel}</Badge></div>
        <div className="d-flex gap-2">
          {isAdminLike && query.schoolId ? <Button color="secondary" outline onClick={() => updateQuery({ schoolId: null, page: 1 })}>بازگشت به همه مجموعه‌ها</Button> : null}
          <Button color="light" onClick={refreshCurrentView} disabled={listRefreshing || statsRefreshing}>{listRefreshing || statsRefreshing ? <Spinner size="sm" className="ms-1" /> : <i className="bx bx-refresh ms-1" />}به‌روزرسانی</Button>
        </div>
      </CardHeader>
      <CardBody><Row className="g-3 align-items-end">
        <Col lg="5" md="6"><Label for="call-queue-scope">محدوده نمایش</Label><Input id="call-queue-scope" type="select" value={query.schoolId ? String(query.schoolId) : isAdminLike ? "all" : "managed"} disabled={schoolsLoading} onChange={(event) => updateQuery({ schoolId: Number(event.target.value) || null, page: 1 })}>
          <option value={isAdminLike ? "all" : "managed"}>{isAdminLike ? "همه مجموعه‌ها" : "همه مجموعه‌های مجاز"}</option>
          {schools.map((school) => <option key={school.id} value={school.id}>{school.name || school.title || `مجموعه #${school.id}`}</option>)}
        </Input></Col>
        <Col lg="3" md="3"><Label for="call-queue-status">وضعیت</Label><Input id="call-queue-status" type="select" value={query.status} onChange={(event) => updateQuery({ status: event.target.value, page: 1 })}><option value="">همه وضعیت‌ها</option>{Object.entries(QUEUE_STATUS).map(([value, config]) => <option key={value} value={value}>{config.label}</option>)}</Input></Col>
        <Col lg="2" md="3"><Label for="call-queue-limit">تعداد در صفحه</Label><Input id="call-queue-limit" type="select" value={query.limit} onChange={(event) => updateQuery({ limit: Number(event.target.value), page: 1 })}>{[15, 20, 50, 100].map((limit) => <option key={limit} value={limit}>{limit}</option>)}</Input></Col>
      </Row></CardBody>
    </Card>
    {statsError ? <Alert color="warning">{statsError}<Button color="link" className="p-0 me-2" onClick={() => loadStats()}>تلاش مجدد</Button></Alert> : null}
    <Row>{statusCards.map(([key, label, color]) => <Col xl="3" lg="4" md="6" key={key}><Card className={`border-${color}`}><CardBody><div className="text-muted">{label}</div><div className={`fs-3 fw-bold text-${color}`}>{statsLoading ? <Spinner size="sm" /> : Number(stats?.byStatus?.[key] ?? 0).toLocaleString("fa-IR")}</div></CardBody></Card></Col>)}
      <Col xl="3" lg="4" md="6"><Card className="border-dark"><CardBody><div className="text-muted">مجموع منتظر ارسال</div><div className="fs-3 fw-bold">{statsLoading ? <Spinner size="sm" /> : Number(stats?.queued ?? 0).toLocaleString("fa-IR")}</div></CardBody></Card></Col>
    </Row>
    <Row><Col md="6"><Alert color="light" className="border"><strong>قدیمی‌ترین انتظار:</strong> {statsLoading ? "در حال دریافت…" : oldestQueueWait(stats?.oldestQueuedAt)}</Alert></Col><Col md="6"><Alert color="light" className="border"><strong>فاصله ارسال:</strong> {statsLoading ? "در حال دریافت…" : formatDuration(stats?.intervalMs)}</Alert></Col></Row>
    <Card><CardHeader className="d-flex justify-content-between"><strong>درخواست‌های صف تماس</strong><span className="text-muted">{Number(meta.total || 0).toLocaleString("fa-IR")} مورد</span></CardHeader><CardBody>
      {listError ? <Alert color="danger">{listError}<Button size="sm" color="danger" outline className="me-2" onClick={() => loadList()}>تلاش مجدد</Button></Alert> : null}
      {listLoading ? <div className="text-center py-5"><Spinner color="primary" /><div className="mt-2">در حال دریافت صف تماس…</div></div> : !listError && !items.length ? <div className="text-center text-muted py-5">درخواستی با این وضعیت وجود ندارد.</div> : items.length ? <>
        <div className="table-responsive"><table className="table table-bordered table-hover align-middle"><thead><tr><th>مجموعه</th><th>ID صف</th><th>ID تماس</th><th>وضعیت</th><th>اولویت</th><th>تلاش‌ها</th><th>زمان ایجاد</th><th>زمان ارسال</th><th>آخرین خطا</th><th>عملیات</th></tr></thead><tbody>
          {items.map((item) => { const config = QUEUE_STATUS[item.status] || { label: item.status || "نامشخص", color: "dark" }; return <tr key={item.id}>
            <td><Button color="link" className="p-0 text-start" onClick={() => updateQuery({ schoolId: item.schoolId, page: 1 })}>{schoolLabel(item)}</Button></td><td>{item.id ?? "—"}</td><td>{item.voipCallId ?? item.callId ?? "—"}</td><td><Badge color={config.color}>{config.label}</Badge></td><td>{Number(item.priority ?? 0).toLocaleString("fa-IR")}</td><td>{Number(item.attempts ?? 0).toLocaleString("fa-IR")} / {item.maxAttempts == null ? "—" : Number(item.maxAttempts).toLocaleString("fa-IR")}</td><td className="text-nowrap">{formatQueueDate(item.createdAt)}</td><td className="text-nowrap">{formatQueueDate(item.dispatchedAt ?? item.sentAt)}</td><td className="text-break" style={{ minWidth: 180 }}>{String(item.lastError || "—")}</td>
            <td><div className="d-flex gap-1 flex-wrap">{item.traceId ? <Link className="btn btn-sm btn-outline-info" to={`/voip/call-traces?traceId=${encodeURIComponent(item.traceId)}`}>Trace</Link> : null}{["failed", "cancelled"].includes(item.status) && auth.hasPermission("voip.call-queue.retry") ? <Button size="sm" color="primary" disabled={actionId === item.id} onClick={() => runAction(item, "retry")}>تلاش مجدد</Button> : null}{["pending", "retry"].includes(item.status) && auth.hasPermission("voip.call-queue.cancel") ? <Button size="sm" color="danger" outline disabled={actionId === item.id} onClick={() => runAction(item, "cancel")}>لغو</Button> : null}</div></td>
          </tr>; })}
        </tbody></table></div><Paginations perPageData={meta.limit} data={items} totalRecords={meta.total} currentPage={meta.page} setCurrentPage={(page) => updateQuery({ page })} isShowingPageLength paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" />
      </> : null}
    </CardBody></Card>
  </div></div>;
};

export default CallQueue;
