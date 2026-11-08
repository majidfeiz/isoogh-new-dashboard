import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Badge, Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Row } from "reactstrap";
import { useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import Paginations from "../../components/Common/Paginations.jsx";
import { SchoolPicker } from "../IncomingCalls/IncomingCallsCommon.jsx";
import AuditDateFilter from "../AuditLogs/AuditDateFilter.jsx";
import { validIsoRange } from "../AuditLogs/auditLogUtils.js";
import { getBillingGatewayLogs } from "../../services/gatewayLogService.jsx";
import GatewayLogDrawer from "./GatewayLogDrawer.jsx";
import { GATEWAY_STATUS, INTENT_LABELS, OPERATION_LABELS, gatewayValue } from "./gatewayLogUtils.js";

const dateTime = (value) => value ? new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "short", timeStyle: "medium", timeZone: "Asia/Tehran" }).format(new Date(value)) : "—";
const rial = (value) => value == null ? "—" : `${Number(value).toLocaleString("fa-IR")} ریال`;
const shown = (value) => value == null || value === "" ? "—" : String(value);
const QUERY_KEYS = ["schoolId", "invoiceId", "topupId", "intent", "operation", "status", "provider", "from", "to", "page", "limit"];

export default function BillingGatewayLogs() {
  document.title = "لاگ درگاه پرداخت | داشبورد آیسوق";
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, lastPage: 1 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const request = useRef({ id: 0, controller: null });
  const signature = params.toString();

  const update = useCallback((changes, resetPage = true) => setParams((current) => {
    const next = new URLSearchParams(current);
    Object.entries(changes).forEach(([key, value]) => value == null || value === "" || value === false ? next.delete(key) : next.set(key, String(value)));
    if (resetPage) next.delete("page");
    return next;
  }, { replace: true }), [setParams]);

  const query = useMemo(() => Object.fromEntries(QUERY_KEYS.map((key) => [key, params.get(key)]).filter(([, value]) => value)), [signature]); // eslint-disable-line react-hooks/exhaustive-deps
  const live = params.get("live") === "1";

  const load = useCallback(async ({ background = false } = {}) => {
    if (!validIsoRange(query.from, query.to)) { setItems([]); setError("بازه زمانی انتخاب‌شده معتبر نیست."); setLoading(false); return; }
    request.current.controller?.abort();
    const controller = new AbortController();
    const id = request.current.id + 1;
    request.current = { id, controller };
    background ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const result = await getBillingGatewayLogs(query, controller.signal);
      if (id === request.current.id) { setItems(result.items); setPagination(result.pagination); }
    } catch (caught) {
      if (id === request.current.id && caught?.code !== "ERR_CANCELED") { setItems([]); setError(caught?.response?.data?.message || "دریافت لاگ‌های درگاه انجام نشد."); }
    } finally {
      if (id === request.current.id) { setLoading(false); setRefreshing(false); }
    }
  }, [query]);

  useEffect(() => { load(); return () => request.current.controller?.abort(); }, [load]);
  useEffect(() => {
    if (!live) return undefined;
    const timer = setInterval(() => { if (document.visibilityState === "visible") load({ background: true }); }, 15000);
    return () => clearInterval(timer);
  }, [live, load]);

  return <div className="page-content"><div className="container-fluid">
    <Breadcrumbs title="مالی و اشتراک" breadcrumbItem="لاگ درگاه پرداخت" />
    <Alert color="info"><strong>گزارش تخصصی درگاه:</strong> موفقیت مرحله «شروع پرداخت» به معنی پرداخت موفق نیست. تنها verify موفق، پرداخت تأییدشده محسوب می‌شود.</Alert>
    <Card className="mb-4"><CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2"><h5 className="mb-0">فیلترها</h5><div className="d-flex align-items-center gap-2"><FormGroup switch className="mb-0"><Input type="switch" role="switch" aria-label="بازبینی زنده" checked={live} onChange={(event) => update({ live: event.target.checked ? 1 : undefined }, false)} /></FormGroup><span className="small">بازبینی زنده هر ۱۵ ثانیه</span>{refreshing && <span className="spinner-border spinner-border-sm text-primary" aria-label="در حال به‌روزرسانی" />}</div></CardHeader><CardBody><Row className="g-3">
      <Col xl="3" md="6"><SchoolPicker value={params.get("schoolId") || ""} onChange={(schoolId) => update({ schoolId })} /></Col>
      <Col xl="3" md="6"><Label>نوع پرداخت</Label><Input type="select" value={params.get("intent") || ""} onChange={(event) => update({ intent: event.target.value })}><option value="">همه</option><option value="invoice_payment">پرداخت فاکتور</option><option value="wallet_topup">افزایش موجودی کیف پول</option></Input></Col>
      <Col xl="2" md="4"><Label>مرحله</Label><Input type="select" value={params.get("operation") || ""} onChange={(event) => update({ operation: event.target.value })}><option value="">همه</option><option value="request">شروع پرداخت</option><option value="verify">تأیید پرداخت</option></Input></Col>
      <Col xl="2" md="4"><Label>وضعیت</Label><Input type="select" value={params.get("status") || ""} onChange={(event) => update({ status: event.target.value })}><option value="">همه</option><option value="started">شروع‌شده</option><option value="succeeded">موفق</option><option value="failed">ناموفق</option></Input></Col>
      <Col xl="2" md="4"><Label>درگاه</Label><Input type="select" value={params.get("provider") || ""} onChange={(event) => update({ provider: event.target.value })}><option value="">همه</option><option value="zarinpal">زرین‌پال</option><option value="sadad">سداد</option></Input></Col>
      <Col md="3"><Label>شناسه فاکتور</Label><Input type="number" min="1" value={params.get("invoiceId") || ""} onChange={(event) => update({ invoiceId: event.target.value })} /></Col>
      <Col md="3"><Label>شناسه شارژ کیف پول</Label><Input type="number" min="1" value={params.get("topupId") || ""} onChange={(event) => update({ topupId: event.target.value })} /></Col>
      <Col md="6"><Label>بازه زمانی</Label><AuditDateFilter onChange={({ from, to }) => update({ from, to })} /></Col>
      <Col md="2"><Label>تعداد در صفحه</Label><Input type="select" value={params.get("limit") || "20"} onChange={(event) => update({ limit: event.target.value })}>{[20, 50, 100].map((limit) => <option key={limit} value={limit}>{limit.toLocaleString("fa-IR")}</option>)}</Input></Col>
    </Row></CardBody></Card>
    <Card><CardHeader className="d-flex justify-content-between align-items-center"><div><h5 className="mb-1">تلاش‌های ثبت‌شده درگاه</h5><small className="text-muted">اطلاعات حساس در این گزارش ذخیره یا نمایش داده نمی‌شود.</small></div><span>{pagination.total.toLocaleString("fa-IR")} رکورد</span></CardHeader><CardBody>
      {error && <Alert color="danger">{String(error)} <Button size="sm" outline color="danger" onClick={() => load()}>تلاش مجدد</Button></Alert>}
      {loading ? <div className="placeholder-glow" aria-label="در حال بارگذاری">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="placeholder col-12 mb-3" style={{ height: 30 }} />)}</div> : !error && !items.length ? <div className="text-center text-muted py-5"><i className="bx bx-credit-card fs-1 d-block mb-2" />لاگی با این فیلترها یافت نشد.</div> : <div className="table-responsive"><table className="table table-bordered table-hover table-nowrap align-middle"><thead><tr><th>تاریخ</th><th>مجموعه</th><th>درگاه</th><th>نوع پرداخت</th><th>مرحله</th><th>مبلغ</th><th>وضعیت</th><th>زمان پاسخ</th><th>شناسه مرتبط</th><th>خطا</th><th>جزئیات</th></tr></thead><tbody>{items.map((item, index) => {
        const status = GATEWAY_STATUS[item.status] || { label: item.status || "—", color: "secondary" };
        const invoiceId = gatewayValue(item, "invoiceId", "invoice_id"); const topupId = gatewayValue(item, "topupId", "topup_id"); const duration = gatewayValue(item, "durationMs", "duration_ms") ?? gatewayValue(item, "responseTimeMs", "response_time_ms");
        return <tr key={item.id || gatewayValue(item, "attemptUuid", "attempt_uuid") || index}><td>{dateTime(gatewayValue(item, "createdAt", "created_at") || gatewayValue(item, "startedAt", "started_at"))}</td><td>{item.schoolName || item.school_name || item.school?.name || shown(item.schoolId || item.school_id)}</td><td>{shown(item.provider)}</td><td>{INTENT_LABELS[item.intent] || shown(item.intent)}</td><td>{OPERATION_LABELS[item.operation] || shown(item.operation)}</td><td>{rial(item.amount)}</td><td><Badge color={status.color}>{status.label}</Badge></td><td>{duration == null ? "—" : `${Number(duration).toLocaleString("fa-IR")} ms`}</td><td>{invoiceId ? `فاکتور #${invoiceId}` : topupId ? `شارژ #${topupId}` : "—"}</td><td className="text-danger text-truncate" style={{ maxWidth: 220 }} title={gatewayValue(item, "errorMessage", "error_message")}>{shown(gatewayValue(item, "errorMessage", "error_message"))}</td><td><Button size="sm" outline color="primary" onClick={() => setSelected(item)}>مشاهده</Button></td></tr>;
      })}</tbody></table></div>}
      {!loading && !error && <Paginations perPageData={pagination.limit} data={items} totalRecords={pagination.total} currentPage={pagination.page} setCurrentPage={(page) => update({ page }, false)} isShowingPageLength />}
    </CardBody></Card>
    <GatewayLogDrawer item={selected} onClose={() => setSelected(null)} />
  </div></div>;
}

