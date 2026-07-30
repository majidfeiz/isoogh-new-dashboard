import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  Label,
  Offcanvas,
  OffcanvasBody,
  OffcanvasHeader,
  Row,
  Spinner,
  Table,
} from "reactstrap";

import Breadcrumbs from "../../../components/Common/Breadcrumb.jsx";
import Paginations from "../../../components/Common/Paginations.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";
import { getCallTrace, getCallTraces } from "../../../services/voipService.jsx";
import { ProgressCell, StatusBadge, TraceTimeline } from "./CallTraceComponents.jsx";
import {
  formatTraceDate,
  parseCallTraceQuery,
  readableStep,
  serializeCallTraceQuery,
  shouldPollDetail,
  shouldPollList,
} from "./callTraceUtils.js";
import "./call-traces.scss";

const emptyMeta = { page: 1, limit: 15, total: 0, lastPage: 1 };
const isCanceled = (error) => error?.code === "ERR_CANCELED" || error?.name === "CanceledError";
const partyText = (party) => party?.name || party?.code || party?.phone || "—";

const CopyValue = ({ value }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!value) return;
    await navigator.clipboard?.writeText(String(value));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  return (
    <span className="d-inline-flex align-items-center gap-1 trace-ltr">
      <code>{value || "—"}</code>
      {value ? (
        <Button color="link" size="sm" className="p-0" onClick={copy} title="کپی">
          <i className={`bx ${copied ? "bx-check text-success" : "bx-copy"}`} />
        </Button>
      ) : null}
    </span>
  );
};

const CallTraces = () => {
  document.title = "رهگیری تماس‌های VoIP | داشبورد آیسوق";
  const { hasPermission, meLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryString = searchParams.toString();
  const query = useMemo(() => parseCallTraceQuery(new URLSearchParams(queryString)), [queryString]);
  const [draftSearch, setDraftSearch] = useState(query.search);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ ...emptyMeta, page: query.page, limit: query.limit });
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [visibility, setVisibility] = useState(() => document.visibilityState);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailRefreshing, setDetailRefreshing] = useState(false);
  const [detailError, setDetailError] = useState("");
  const listAbort = useRef(null);
  const detailAbort = useRef(null);

  const canIndex = hasPermission("voip.call-traces.index");
  const canShow = hasPermission("voip.call-traces.show");

  const updateQuery = useCallback((updates) => {
    setSearchParams(serializeCallTraceQuery({ ...query, ...updates }));
  }, [query, setSearchParams]);

  const loadList = useCallback(async ({ background = false } = {}) => {
    listAbort.current?.abort();
    const controller = new AbortController();
    listAbort.current = controller;
    if (background) setRefreshing(true);
    else setInitialLoading(true);
    setError("");
    try {
      const result = await getCallTraces({ ...query, signal: controller.signal });
      setItems(result.items);
      setMeta(result.meta);
    } catch (requestError) {
      if (isCanceled(requestError)) return;
      if (!background) setItems([]);
      setError("دریافت رهگیری تماس‌ها با خطا مواجه شد. دوباره تلاش کنید.");
    } finally {
      if (listAbort.current === controller) {
        setInitialLoading(false);
        setRefreshing(false);
      }
    }
  }, [query]);

  const loadDetail = useCallback(async (id, { background = false } = {}) => {
    if (!id || !canShow) return;
    detailAbort.current?.abort();
    const controller = new AbortController();
    detailAbort.current = controller;
    if (background) setDetailRefreshing(true);
    else setDetailLoading(true);
    setDetailError("");
    try {
      const result = await getCallTrace(id, { signal: controller.signal });
      setDetail(result);
    } catch (requestError) {
      if (isCanceled(requestError)) return;
      setDetailError("دریافت جزئیات تماس با خطا مواجه شد.");
    } finally {
      if (detailAbort.current === controller) {
        setDetailLoading(false);
        setDetailRefreshing(false);
      }
    }
  }, [canShow]);

  useEffect(() => {
    if (canIndex) loadList();
    return () => listAbort.current?.abort();
  }, [canIndex, loadList]);

  useEffect(() => {
    if (!query.traceId || !canShow || selectedId) return;
    const traceId = Number(query.traceId);
    if (Number.isInteger(traceId) && traceId > 0) openDetail(traceId);
    // Opening the trace is intentionally one-shot; polling owns later refreshes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.traceId, canShow]);

  useEffect(() => {
    setDraftSearch(query.search);
  }, [query.search]);

  useEffect(() => {
    if (draftSearch === query.search) return undefined;
    const timer = window.setTimeout(() => updateQuery({ search: draftSearch, page: 1 }), 400);
    return () => window.clearTimeout(timer);
  }, [draftSearch, query.search, updateQuery]);

  useEffect(() => {
    const onVisibility = () => setVisibility(document.visibilityState);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (!shouldPollList(items, visibility)) return undefined;
    const timer = window.setInterval(() => loadList({ background: true }), 3000);
    return () => window.clearInterval(timer);
  }, [items, visibility, loadList]);

  useEffect(() => {
    if (!selectedId || !shouldPollDetail(detail, visibility)) return undefined;
    const timer = window.setInterval(() => loadDetail(selectedId, { background: true }), 2500);
    return () => window.clearInterval(timer);
  }, [selectedId, detail, visibility, loadDetail]);

  const openDetail = (id) => {
    if (!canShow) return;
    setSelectedId(id);
    setDetail(null);
    loadDetail(id);
  };

  const closeDetail = () => {
    detailAbort.current?.abort();
    setSelectedId(null);
    setDetail(null);
    setDetailError("");
  };

  const clearFilters = () => {
    setDraftSearch("");
    setSearchParams(new URLSearchParams());
  };

  if (!meLoading && !canIndex) return <Navigate to="/403" replace />;

  return (
    <div className="page-content call-traces-page">
      <div className="container-fluid">
        <Breadcrumbs title="سرویس وویپ" breadcrumbItem="رهگیری تماس‌ها" />

        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h4 className="card-title mb-1">رهگیری تماس‌های VoIP</h4>
              <p className="text-muted mb-0">وضعیت اجرای تماس از ثبت درخواست تا دریافت گزارش نهایی سیموتل</p>
            </div>
            <Button color="light" onClick={() => loadList({ background: true })} disabled={refreshing}>
              {refreshing ? <Spinner size="sm" className="ms-1" /> : <i className="bx bx-refresh ms-1" />}
              به‌روزرسانی
            </Button>
          </CardHeader>
          <CardBody>
            <Row className="g-3 mb-4 trace-filters">
              <Col xl="4" lg="6">
                <Label for="trace-search">جستجو</Label>
                <Input
                  id="trace-search"
                  value={draftSearch}
                  onChange={(event) => setDraftSearch(event.target.value)}
                  placeholder="نام، تلفن، کد، عنوان فرم یا شناسه تماس"
                />
              </Col>
              <Col xl="2" md="4">
                <Label for="trace-status">وضعیت</Label>
                <Input id="trace-status" type="select" value={query.status} onChange={(event) => updateQuery({ status: event.target.value, page: 1 })}>
                  <option value="">همه وضعیت‌ها</option>
                  <option value="in_progress">در حال اجرا</option>
                  <option value="waiting_for_cdr">در انتظار گزارش نهایی</option>
                  <option value="completed">تکمیل‌شده</option>
                  <option value="failed">ناموفق</option>
                </Input>
              </Col>
              <Col xl="2" md="4">
                <Label for="trace-adviser">شناسه مشاور</Label>
                <Input id="trace-adviser" type="number" min="1" value={query.adviserId} onChange={(event) => updateQuery({ adviserId: event.target.value, page: 1 })} />
              </Col>
              <Col xl="2" md="4">
                <Label for="trace-student">شناسه دانش‌آموز</Label>
                <Input id="trace-student" type="number" min="1" value={query.studentId} onChange={(event) => updateQuery({ studentId: event.target.value, page: 1 })} />
              </Col>
              <Col xl="2" md="4">
                <Label for="trace-form">شناسه فرم تماس</Label>
                <Input id="trace-form" type="number" min="1" value={query.supportFormId} onChange={(event) => updateQuery({ supportFormId: event.target.value, page: 1 })} />
              </Col>
              <Col xl="2" md="4">
                <Label for="trace-from">از تاریخ</Label>
                <Input id="trace-from" type="date" value={query.from} onChange={(event) => updateQuery({ from: event.target.value, page: 1 })} />
              </Col>
              <Col xl="2" md="4">
                <Label for="trace-to">تا تاریخ</Label>
                <Input id="trace-to" type="date" value={query.to} min={query.from || undefined} onChange={(event) => updateQuery({ to: event.target.value, page: 1 })} />
              </Col>
              <Col xl="2" md="4" className="d-flex align-items-end">
                <Button color="outline-secondary" className="w-100" onClick={clearFilters}>
                  <i className="bx bx-filter-alt-off ms-1" /> پاک کردن فیلترها
                </Button>
              </Col>
            </Row>

            {error ? (
              <Alert color="danger" className="d-flex justify-content-between align-items-center">
                <span>{error}</span>
                <Button color="danger" size="sm" onClick={() => loadList()}>تلاش دوباره</Button>
              </Alert>
            ) : null}

            {initialLoading ? (
              <div className="trace-state"><Spinner color="primary" /><span>در حال دریافت تماس‌ها…</span></div>
            ) : !error && items.length === 0 ? (
              <div className="trace-state">
                <i className="bx bx-phone-off display-5 text-muted" />
                <strong>تماسی با این فیلترها پیدا نشد</strong>
                <span className="text-muted">فیلترها را تغییر دهید یا کمی بعد دوباره بررسی کنید.</span>
              </div>
            ) : items.length ? (
              <>
                <div className="table-responsive">
                  <Table hover className="align-middle trace-table">
                    <thead>
                      <tr>
                        <th>زمان</th><th>مشاور</th><th>دانش‌آموز</th><th>فرم تماس</th>
                        <th>شناسه تماس</th><th>وضعیت</th><th>مرحله جاری</th><th className="trace-progress-column">پیشرفت</th><th>عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} onClick={() => openDetail(item.id)} className={canShow ? "trace-row-clickable" : ""}>
                          <td className="text-nowrap">{formatTraceDate(item.createdAt)}</td>
                          <td><strong>{partyText(item.adviser)}</strong><div className="small text-muted">{item.adviser?.code || item.adviser?.phone || "—"}</div></td>
                          <td><strong>{partyText(item.student)}</strong><div className="small text-muted">{item.student?.code || item.student?.phone || "—"}</div></td>
                          <td>{item.supportForm?.title || "—"}</td>
                          <td><code className="trace-ltr">{item.callGroupId || item.voipCallId || "—"}</code></td>
                          <td><StatusBadge status={item.status} /></td>
                          <td>{readableStep(item.currentStep)}</td>
                          <td><ProgressCell progress={item.progress} status={item.status} errorMessage={item.errorMessage} /></td>
                          <td>
                            <Button color="primary" outline size="sm" disabled={!canShow} onClick={(event) => { event.stopPropagation(); openDetail(item.id); }}>
                              جزئیات
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                <Paginations
                  perPageData={meta.limit}
                  data={items}
                  totalRecords={meta.total}
                  currentPage={meta.page}
                  setCurrentPage={(page) => updateQuery({ page })}
                  isShowingPageLength
                  paginationDiv="col-sm-auto"
                  paginationClass="pagination pagination-sm mb-0"
                />
              </>
            ) : null}
          </CardBody>
        </Card>
      </div>

      <Offcanvas isOpen={Boolean(selectedId)} toggle={closeDetail} direction="end" className="trace-drawer">
        <OffcanvasHeader toggle={closeDetail}>
          جزئیات رهگیری تماس
          {detailRefreshing ? <Spinner size="sm" color="primary" className="me-2" /> : null}
        </OffcanvasHeader>
        <OffcanvasBody>
          {detailLoading ? <div className="trace-state"><Spinner color="primary" /><span>در حال دریافت جزئیات…</span></div> : null}
          {detailError ? <Alert color="danger">{detailError}<Button color="link" onClick={() => loadDetail(selectedId)}>تلاش دوباره</Button></Alert> : null}
          {detail ? (
            <>
              <div className="trace-summary mb-4">
                <div><span>وضعیت</span><StatusBadge status={detail.status} /></div>
                <div><span>پیشرفت</span><strong>{Number(detail.progress || 0).toLocaleString("fa-IR")}٪</strong></div>
                <div><span>مشاور</span><strong>{partyText(detail.adviser)}</strong></div>
                <div><span>دانش‌آموز</span><strong>{partyText(detail.student)}</strong></div>
                <div><span>فرم تماس</span><strong>{detail.supportForm?.title || "—"}</strong></div>
                <div><span>Correlation ID</span><CopyValue value={detail.correlationId} /></div>
                <div><span>VoIP Call ID</span><CopyValue value={detail.voipCallId} /></div>
                <div><span>Call Group ID</span><CopyValue value={detail.callGroupId} /></div>
              </div>
              {detail.errorMessage ? <Alert color="danger"><strong>خطای تماس:</strong> {detail.errorMessage}</Alert> : null}
              <h5 className="mb-3">خط زمانی رویدادها</h5>
              <TraceTimeline events={detail.events || []} />
            </>
          ) : null}
        </OffcanvasBody>
      </Offcanvas>
    </div>
  );
};

export default CallTraces;
