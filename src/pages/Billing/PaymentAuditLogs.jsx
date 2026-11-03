import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Badge, Button, Card, CardBody, CardHeader, Col, Input, Label, Row } from "reactstrap";
import { useSearchParams } from "react-router-dom";
import moment from "moment-jalaali";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import Paginations from "../../components/Common/Paginations.jsx";
import { getAuditLogs } from "../../services/auditLogService.jsx";
import { SchoolPicker } from "../IncomingCalls/IncomingCallsCommon.jsx";
import ActorAutocomplete from "../AuditLogs/ActorAutocomplete.jsx";
import AuditDateFilter from "../AuditLogs/AuditDateFilter.jsx";
import { validIsoRange } from "../AuditLogs/auditLogUtils.js";
import PaymentAuditDrawer from "./PaymentAuditDrawer.jsx";
import { PAYMENT_OPERATIONS, auditValue, paymentOperation, paymentStatusMessage, sanitizeAuditData } from "./paymentAuditUtils.js";

const dateTime = (value) => value ? moment(value).format("jYYYY/jMM/jDD HH:mm:ss") : "—";
const shown = (value) => value == null || value === "" ? "—" : String(value);

export default function PaymentAuditLogs() {
  document.title = "لاگ عملیات پرداخت | داشبورد آیسوق";
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, lastPage: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [searchDraft, setSearchDraft] = useState(params.get("search") || "");
  const [actorLabel, setActorLabel] = useState(params.get("actorUserId") ? `کاربر #${params.get("actorUserId")}` : "");
  const controller = useRef(null);
  const requestSequence = useRef(0);
  const signature = params.toString();

  const update = useCallback((changes, resetPage = true) => setParams((current) => {
    const next = new URLSearchParams(current);
    Object.entries(changes).forEach(([key, value]) => value == null || value === "" ? next.delete(key) : next.set(key, String(value)));
    if (resetPage) next.delete("page");
    return next;
  }, { replace: true }), [setParams]);

  const query = useMemo(() => {
    const operation = PAYMENT_OPERATIONS.find((entry) => entry.key === params.get("operation"));
    return {
      page: params.get("page") || 1,
      limit: params.get("limit") || 20,
      module: "billing",
      status: params.get("status") || undefined,
      schoolId: params.get("schoolId") || undefined,
      actorUserId: params.get("actorUserId") || undefined,
      search: params.get("search") || operation?.search || undefined,
      from: params.get("from") || undefined,
      to: params.get("to") || undefined,
    };
  }, [signature]); // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback(async () => {
    if (!validIsoRange(query.from, query.to)) { setItems([]); setError("بازه زمانی انتخاب‌شده معتبر نیست."); setLoading(false); return; }
    controller.current?.abort();
    controller.current = new AbortController();
    const requestId = ++requestSequence.current;
    setLoading(true); setError("");
    try {
      const result = await getAuditLogs({ ...query, signal: controller.current.signal });
      if (requestId === requestSequence.current) { setItems(result.items); setPagination(result.pagination); }
    } catch (caught) {
      if (requestId === requestSequence.current && caught?.code !== "ERR_CANCELED") { setItems([]); setError(caught?.response?.data?.message || "دریافت لاگ عملیات پرداخت انجام نشد."); }
    } finally { if (requestId === requestSequence.current) setLoading(false); }
  }, [query]);

  useEffect(() => { load(); return () => controller.current?.abort(); }, [load]);
  useEffect(() => { const timer = setTimeout(() => { if ((params.get("search") || "") !== searchDraft) update({ search: searchDraft || undefined, operation: searchDraft ? undefined : params.get("operation") }); }, 400); return () => clearTimeout(timer); }, [searchDraft]); // eslint-disable-line react-hooks/exhaustive-deps

  const actorChanged = ({ actorUserId, label }) => { setActorLabel(label || ""); update({ actorUserId }); };
  const operationChanged = (value) => { setSearchDraft(""); update({ operation: value, search: undefined }); };
  const selectedOperation = params.get("operation");
  const visibleItems = selectedOperation ? items.filter((item) => paymentOperation(item).key === selectedOperation) : items;

  return <div className="page-content"><div className="container-fluid">
    <Breadcrumbs title="مالی و اشتراک" breadcrumbItem="لاگ عملیات پرداخت" />
    <Alert color="info" className="d-flex gap-2 align-items-start"><i className="bx bx-info-circle fs-4" /><div><strong>توجه:</strong> این گزارش فعالیت API را نمایش می‌دهد. گزارش کامل تعاملات درگاه پس از اضافه‌شدن Gateway Logs قابل دسترسی خواهد بود.<small className="d-block mt-1">موفقیت شروع پرداخت به معنی پرداخت موفق نیست؛ فقط موفقیت عملیات تأیید پرداخت (verify) تأیید نهایی محسوب می‌شود.</small></div></Alert>
    <Card className="mb-4"><CardHeader><h5 className="mb-0">فیلترهای گزارش</h5></CardHeader><CardBody><Row className="g-3">
      <Col lg="12"><Label>بازه زمانی</Label><AuditDateFilter onChange={({ from, to }) => update({ from, to })} />{params.get("from") && <small className="text-muted d-block mt-1">از {dateTime(params.get("from"))} تا {dateTime(params.get("to"))}</small>}</Col>
      <Col md="4"><SchoolPicker value={params.get("schoolId") || ""} onChange={(schoolId) => update({ schoolId })} /></Col>
      <Col md="4"><Label>وضعیت</Label><Input type="select" value={params.get("status") || ""} onChange={(event) => update({ status: event.target.value })}><option value="">همه وضعیت‌ها</option><option value="success">موفق</option><option value="failed">ناموفق</option></Input></Col>
      <Col md="4"><Label>نوع عملیات</Label><Input type="select" value={params.get("operation") || ""} onChange={(event) => operationChanged(event.target.value)}><option value="">همه عملیات‌ها</option>{PAYMENT_OPERATIONS.map((operation) => <option key={operation.key} value={operation.key}>{operation.label}</option>)}</Input></Col>
      <Col md="4"><Label>کاربر</Label><ActorAutocomplete value={params.get("actorUserId")} initialText={actorLabel} onChange={actorChanged} /></Col>
      <Col md="4"><Label>جست‌وجوی Request ID</Label><Input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Request ID را وارد کنید" dir="ltr" /></Col>
      <Col md="2"><Label>تعداد در صفحه</Label><Input type="select" value={params.get("limit") || "20"} onChange={(event) => update({ limit: event.target.value })}><option value="20">۲۰</option><option value="50">۵۰</option><option value="100">۱۰۰</option></Input></Col>
    </Row></CardBody></Card>
    <Card><CardHeader className="d-flex justify-content-between align-items-center"><div><h5 className="mb-1">درخواست‌های مالی ثبت‌شده</h5><small className="text-muted">این جدول رسید قطعی پرداخت نیست.</small></div><span className="text-muted">{pagination.total.toLocaleString("fa-IR")} رکورد</span></CardHeader><CardBody>
      {error && <Alert color="danger">{String(error)} <Button size="sm" outline color="danger" onClick={load}>تلاش مجدد</Button></Alert>}
      {loading ? <div aria-label="در حال بارگذاری" className="placeholder-glow">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="placeholder col-12 mb-3" style={{ height: 30 }} />)}</div> : !error && !visibleItems.length ? <div className="text-center text-muted py-5"><i className="bx bx-receipt fs-1 d-block mb-2" />لاگ عملیات پرداختی با این فیلترها یافت نشد.</div> : <div className="table-responsive"><table className="table table-bordered table-hover table-nowrap align-middle"><thead><tr><th>تاریخ و ساعت</th><th>Request ID</th><th>نام کاربر</th><th>مجموعه</th><th>نوع عملیات</th><th>مسیر درخواست</th><th>نتیجه</th><th>HTTP</th><th>مدت</th><th>IP</th><th>پیام خطا</th><th>جزئیات امن</th></tr></thead><tbody>{visibleItems.map((item, index) => {
        const code = auditValue(item, "statusCode", "status_code"); const failed = item.status === "failed" || Number(code) >= 400; const schoolsValue = item.schoolName || item.school_name || auditValue(item, "schoolIds", "school_ids"); const requestData = sanitizeAuditData(auditValue(item, "requestData", "request_data"));
        return <tr key={item.id || index} role="button" tabIndex="0" onClick={() => setSelected(item)} onKeyDown={(event) => event.key === "Enter" && setSelected(item)}><td>{dateTime(auditValue(item, "createdAt", "created_at"))}</td><td className="text-truncate" style={{ maxWidth: 150 }} title={auditValue(item, "requestId", "request_id")}>{shown(auditValue(item, "requestId", "request_id"))}</td><td>{auditValue(item, "actorName", "actor_name") || "سیستم"}</td><td>{Array.isArray(schoolsValue) && schoolsValue.length ? schoolsValue.join("، ") : shown(schoolsValue)}</td><td>{paymentOperation(item).label}</td><td dir="ltr" className="text-truncate" style={{ maxWidth: 260 }} title={`${auditValue(item, "httpMethod", "http_method")} ${item.path}`}>{shown(auditValue(item, "httpMethod", "http_method"))} {shown(item.path)}</td><td><Badge color={failed ? "danger" : "success"}>{failed ? "ناموفق" : "موفق"}</Badge></td><td>{shown(code)}</td><td>{auditValue(item, "durationMs", "duration_ms") == null ? "—" : `${Number(auditValue(item, "durationMs", "duration_ms")).toLocaleString("fa-IR")} ms`}</td><td>{item.ipAddress || item.ip_address || "—"}</td><td className={failed ? "text-danger" : "text-muted"}>{failed ? paymentStatusMessage(item) : "—"}</td><td><Button size="sm" outline color="primary" onClick={(event) => { event.stopPropagation(); setSelected({ ...item, request_data: requestData, requestData }); }}>مشاهده</Button></td></tr>;
      })}</tbody></table></div>}
      {!loading && !error && <Paginations perPageData={pagination.limit} data={visibleItems} totalRecords={pagination.total} currentPage={pagination.page} setCurrentPage={(page) => update({ page }, false)} isShowingPageLength />}
    </CardBody></Card>
    <PaymentAuditDrawer item={selected} onClose={() => setSelected(null)} />
  </div></div>;
}

