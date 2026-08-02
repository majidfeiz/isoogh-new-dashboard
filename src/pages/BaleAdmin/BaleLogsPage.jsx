import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Chart from "react-apexcharts";
import { Badge, Button, Card, CardBody, CardHeader, Col, Input, Label, Modal, ModalBody, ModalHeader, Row, Spinner } from "reactstrap";
import { useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import Paginations from "../../components/Common/Paginations.jsx";
import Can from "../../components/Access/Can.jsx";
import { getBaleLogs, getBaleLogStats, getBaleLogUsers } from "../../services/baleService.jsx";

const KEYS = ["schoolId", "userId", "baleUserId", "event", "operation", "status", "provider", "from", "to", "search", "page", "limit"];
const compactQuery = (params) => Object.fromEntries(KEYS.map((key) => [key, params.get(key)]).filter(([, value]) => value));
const localInput = (iso) => iso ? iso.slice(0, 16) : "";
const toIso = (value) => value ? new Date(value).toISOString() : "";
const faDate = (value) => value ? new Date(value).toLocaleString("fa-IR") : "—";

function UserAutocomplete({ value, onSelect }) {
  const [text, setText] = useState("");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const controller = useRef();
  useEffect(() => { const timer = setTimeout(async () => { if (text.trim().length < 2) { setItems([]); return; } controller.current?.abort(); controller.current = new AbortController(); try { const result = await getBaleLogUsers({ search: text, limit: 10 }, controller.current.signal); setItems(result.items ?? result.data ?? (Array.isArray(result) ? result : [])); setOpen(true); } catch (error) { if (error.code !== "ERR_CANCELED") setItems([]); } }, 350); return () => { clearTimeout(timer); controller.current?.abort(); }; }, [text]);
  return <div className="position-relative"><Input aria-label="جست‌وجوی کاربر" value={text} placeholder={value ? `کاربر #${value}` : "نام یا شماره کاربر"} onChange={(event) => { setText(event.target.value); if (!event.target.value) onSelect(""); }} autoComplete="off" />{open && items.length > 0 && <div className="list-group position-absolute w-100 shadow" style={{ zIndex: 20 }}>{items.map((item) => <button type="button" className="list-group-item list-group-item-action" key={item.id || item.userId} onClick={() => { onSelect(item.id || item.userId); setText(item.name || item.fullName || ""); setOpen(false); }}>{item.name || item.fullName}<small className="d-block text-muted">{item.maskedPhone || ""}</small></button>)}</div>}</div>;
}

function Stats({ data }) {
  const timeline = data.timeline || data.byTime || [];
  const events = data.events || data.byEvent || [];
  const statuses = data.statuses || data.byStatus || [];
  const barOptions = (categories) => ({ chart: { toolbar: { show: false } }, xaxis: { categories }, dataLabels: { enabled: false }, noData: { text: "داده‌ای وجود ندارد" } });
  return <Can permission="bale.logs.statistics"><Row><Col md="4"><Card><CardBody><small>کل رویدادها</small><h3>{data.total ?? 0}</h3></CardBody></Card></Col><Col md="4"><Card><CardBody><small>شکست‌ها</small><h3>{data.failed ?? 0}</h3></CardBody></Card></Col><Col md="4"><Card><CardBody><small>نرخ موفقیت</small><h3>{data.successRate == null ? "—" : `${data.successRate}%`}</h3></CardBody></Card></Col></Row><Row><Col lg="6"><Card><CardHeader>روند رویدادها</CardHeader><CardBody><Chart type="line" height={260} options={barOptions(timeline.map((item) => item.label || item.date || item.time))} series={[{ name: "تعداد", data: timeline.map((item) => item.count || item.total || 0) }]} /></CardBody></Card></Col><Col lg="3"><Card><CardHeader>رویدادها</CardHeader><CardBody><Chart type="bar" height={260} options={barOptions(events.map((item) => item.event || item.label))} series={[{ name: "تعداد", data: events.map((item) => item.count || 0) }]} /></CardBody></Card></Col><Col lg="3"><Card><CardHeader>وضعیت‌ها</CardHeader><CardBody><Chart type="donut" height={260} options={{ labels: statuses.map((item) => item.status || item.label), noData: { text: "داده‌ای وجود ندارد" } }} series={statuses.map((item) => Number(item.count || 0))} /></CardBody></Card></Col></Row></Can>;
}

export default function BaleLogsPage() {
  document.title = "لاگ تخصصی بله | داشبورد سرآمد";
  const [params, setParams] = useSearchParams();
  const queryString = params.toString();
  const query = useMemo(() => compactQuery(params), [queryString]); // eslint-disable-line react-hooks/exhaustive-deps
  const [search, setSearch] = useState(params.get("search") || "");
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0 });
  const [stats, setStats] = useState({});
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const listController = useRef();
  const statsController = useRef();
  const change = useCallback((key, value, resetPage = true) => setParams((current) => { const next = new URLSearchParams(current); value ? next.set(key, value) : next.delete(key); if (resetPage) next.delete("page"); return next; }, { replace: true }), [setParams]);
  const load = useCallback(async () => { listController.current?.abort(); listController.current = new AbortController(); setLoading(true); setError(""); try { const result = await getBaleLogs(query, listController.current.signal); setItems(result.items); setMeta(result.pagination); } catch (caught) { if (caught.code !== "ERR_CANCELED") setError(String(caught?.response?.data?.message || "دریافت لاگ‌ها انجام نشد.")); } finally { setLoading(false); } }, [queryString]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); return () => listController.current?.abort(); }, [load]);
  useEffect(() => { statsController.current?.abort(); statsController.current = new AbortController(); getBaleLogStats(query, statsController.current.signal).then(setStats).catch(() => {}); return () => statsController.current?.abort(); }, [queryString]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const timer = setTimeout(() => { if ((params.get("search") || "") !== search) change("search", search); }, 400); return () => clearTimeout(timer); }, [search, change, params]);

  return <div className="page-content"><div className="container-fluid"><Breadcrumbs title="یکپارچه‌سازی بله" breadcrumbItem="لاگ تخصصی" /><Stats data={stats} /><Card><CardHeader><Row className="g-2">
    <Col md="3"><UserAutocomplete value={params.get("userId")} onSelect={(value) => change("userId", String(value || ""))} /></Col>
    <Col md="3"><Input aria-label="شناسه کاربر بله" placeholder="Bale User ID" value={params.get("baleUserId") || ""} onChange={(event) => change("baleUserId", event.target.value)} /></Col>
    {["schoolId", "event", "operation", "provider"].map((key) => <Col md="3" key={key}><Input aria-label={key} placeholder={key} value={params.get(key) || ""} onChange={(event) => change(key, event.target.value)} /></Col>)}
    <Col md="3"><Input aria-label="وضعیت" type="select" value={params.get("status") || ""} onChange={(event) => change("status", event.target.value)}><option value="">همه وضعیت‌ها</option><option value="success">موفق</option><option value="failed">ناموفق</option><option value="pending">در انتظار</option></Input></Col>
    <Col md="3"><Label for="bale-log-from">از</Label><Input id="bale-log-from" type="datetime-local" value={localInput(params.get("from"))} onChange={(event) => change("from", toIso(event.target.value))} /></Col><Col md="3"><Label for="bale-log-to">تا (انتهای بازه محاسبه نمی‌شود)</Label><Input id="bale-log-to" type="datetime-local" value={localInput(params.get("to"))} onChange={(event) => change("to", toIso(event.target.value))} /></Col>
    <Col md="6"><Label className="visually-hidden" for="bale-log-search">جست‌وجو</Label><Input id="bale-log-search" placeholder="جست‌وجو در عملیات، subject یا correlation ID" value={search} onChange={(event) => setSearch(event.target.value)} /></Col>
  </Row></CardHeader><CardBody>{loading ? <div className="text-center py-5"><Spinner /></div> : error ? <div className="alert alert-danger">{error} <Button size="sm" onClick={load}>تلاش مجدد</Button></div> : !items.length ? <div className="text-center text-muted py-5">لاگی با این فیلترها یافت نشد.</div> : <div className="table-responsive"><table className="table table-bordered table-hover align-middle"><thead><tr><th>زمان</th><th>مجموعه</th><th>کاربر</th><th>Bale ID</th><th>رویداد</th><th>عملیات</th><th>Provider</th><th>وضعیت</th><th>Subject</th><th>Correlation ID</th><th>خطا</th></tr></thead><tbody>{items.map((item, index) => <tr key={item.id || index} role="button" tabIndex="0" onClick={() => setSelected(item)} onKeyDown={(event) => event.key === "Enter" && setSelected(item)}><td>{faDate(item.createdAt || item.created_at)}</td><td>{item.schoolName || item.schoolId || "—"}</td><td>{item.userName || item.userId || "—"}</td><td>{item.baleUserId == null ? "—" : String(item.baleUserId)}</td><td>{item.event || "—"}</td><td>{item.operation || "—"}</td><td>{item.provider || "—"}</td><td><Badge color={item.status === "success" ? "success" : item.status === "failed" ? "danger" : "warning"}>{item.status}</Badge></td><td>{String(item.subject || "—")}</td><td>{String(item.correlationId || "—")}</td><td>{String(item.errorMessage || "")}</td></tr>)}</tbody></table></div>}{!loading && !error && items.length > 0 && <Paginations perPageData={meta.limit} data={items} totalRecords={meta.total} currentPage={meta.page} setCurrentPage={(page) => change("page", String(page), false)} isShowingPageLength />}</CardBody></Card>
    <Modal isOpen={Boolean(selected)} toggle={() => setSelected(null)} size="lg"><ModalHeader toggle={() => setSelected(null)}>جزئیات لاگ بله</ModalHeader><ModalBody><dl><dt>Correlation ID</dt><dd>{String(selected?.correlationId || "—")}</dd><dt>خطا</dt><dd className="text-break">{String(selected?.errorMessage || "—")}</dd><dt>Metadata پاک‌سازی‌شده</dt><dd><pre className="text-wrap bg-light border rounded p-3">{JSON.stringify(selected?.metadata ?? {}, null, 2)}</pre></dd></dl></ModalBody></Modal>
  </div></div>;
}
