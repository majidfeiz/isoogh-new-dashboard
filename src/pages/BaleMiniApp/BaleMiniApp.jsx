import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MemoryRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Alert, Badge, Button, Card, CardBody, Input, Label, Spinner } from "reactstrap";
import {
  baleMiniHttp, clearBaleMiniSession, exchangeBaleSession, getBaleBootstrap,
  getBaleCallRoom, getBalePreferences, setBaleMiniToken, updateBalePreferences,
} from "../../services/baleService.jsx";
import { API_ROUTES } from "../../helpers/apiRoutes.jsx";
import { applyBaleTheme, createBaleAdapter, normalizeBootstrap } from "./baleAdapter.js";
import CallRoom from "./CallRoom.jsx";
import "./bale-mini-app.scss";

const adapter = createBaleAdapter();
const errorText = (error) => {
  const status = error?.response?.status;
  const messages = { 400: "اطلاعات درخواست معتبر نیست.", 401: "اتصال بله منقضی شده است.", 403: "برای این بخش دسترسی ندارید.", 404: "اطلاعات مورد نظر پیدا نشد.", 409: "اطلاعات تغییر کرده؛ صفحه را تازه کنید.", 429: "درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.", 503: "سرویس بله موقتاً آماده نیست." };
  return error?.response?.data?.message || messages[status] || "ارتباط با سرور برقرار نشد.";
};

function Picker({ title, items, valueKey = "id", labelKey = "name", onSelect }) {
  return <main className="bale-center"><h1>{title}</h1><div className="bale-picker">{items.map((item) => <button key={String(item[valueKey] ?? item)} onClick={() => onSelect(item)}>{item[labelKey] ?? item.title ?? item}</button>)}</div></main>;
}

function DynamicPage({ bootstrap }) {
  const location = useLocation();
  const navigate = useNavigate();
  const context = location.state || {};
  const [state, setState] = useState({ loading: true, data: null, error: "" });
  const [page, setPage] = useState(1);
  const entry = bootstrap.navigation?.find((item) => (item.path || item.route) === location.pathname) || {};
  const resource = entry.key || entry.resource || location.pathname.split("/").filter(Boolean).pop() || "home";
  const endpoint = useMemo(() => {
    if (entry.endpoint) return entry.endpoint;
    if (bootstrap.activeRole === "adviser") {
      if (resource === "schools") return API_ROUTES.adviserPortal.schools;
      if (["forms", "support-forms"].includes(resource) && (context.schoolId || bootstrap.activeSchoolId)) return API_ROUTES.adviserPortal.schoolSupportForms(context.schoolId || bootstrap.activeSchoolId);
      if (["students", "form-students"].includes(resource) && context.formId) return API_ROUTES.adviserPortal.supportFormStudents(context.formId);
      if (["call-history", "calls"].includes(resource)) return API_ROUTES.adviserPortal.callLogs;
      if (resource === "home" && bootstrap.activeSchoolId) return API_ROUTES.adviserPortal.schoolStats(bootstrap.activeSchoolId);
    }
    if (["super-adviser", "super_adviser"].includes(bootstrap.activeRole)) {
      const routes = { schools: API_ROUTES.superAdviserPortal.schools, advisers: API_ROUTES.superAdviserPortal.advisers, forms: API_ROUTES.superAdviserPortal.supportForms, "support-forms": API_ROUTES.superAdviserPortal.supportForms, students: API_ROUTES.superAdviserPortal.students, monitoring: API_ROUTES.superAdviserPortal.monitoring, performance: API_ROUTES.superAdviserPortal.performanceReport, salary: API_ROUTES.superAdviserPortal.salary };
      return routes[resource];
    }
    if (bootstrap.activeRole === "manager" && ["home", "dashboard"].includes(resource)) return API_ROUTES.dashboard.stats;
    return undefined;
  }, [entry.endpoint, resource, bootstrap.activeRole, bootstrap.activeSchoolId, context.schoolId, context.formId]);
  const load = useCallback(async () => {
    if (!endpoint) {
      const managerData = bootstrap.activeRole === "manager" && resource === "reports"
        ? { items: [
          { id: "reports", title: "مرکز گزارش‌ها", description: "مشاهده گزارش‌های مدیریتی", fullPanelPath: "/reports" },
          { id: "adviser-performance", title: "عملکرد مشاوران", description: "گزارش عملکرد مشاوران مجموعه", fullPanelPath: "/reports/adviser-performance" },
        ] }
        : bootstrap.activeRole === "manager" && resource === "schools" ? { items: bootstrap.schools } : null;
      setState({ loading: false, data: entry?.data ?? managerData, error: "" }); return;
    }
    if (!/^\/(dashboard|adviser-portal|super-adviser-portal|bale\/mini-app)\//.test(endpoint)) { setState({ loading: false, data: null, error: "مسیر این بخش معتبر نیست." }); return; }
    setState((old) => ({ ...old, loading: true, error: "" }));
    try { const response = await baleMiniHttp.get(endpoint, { params: { schoolId: context.schoolId || bootstrap.activeSchoolId, adviserId: context.adviserId || undefined, supportFormId: context.formId || undefined, page, limit: 20 } }); setState({ loading: false, data: response?.data?.data ?? response?.data, error: "" }); }
    catch (error) { setState({ loading: false, data: null, error: errorText(error) }); }
  }, [endpoint, bootstrap.activeSchoolId, context.schoolId, context.adviserId, context.formId, page]);
  useEffect(() => { load(); }, [load]);
  const items = state.data?.items ?? state.data?.data ?? (Array.isArray(state.data) ? state.data : []);
  const meta = state.data?.meta ?? state.data?.pagination ?? {};
  const openItem = async (item) => {
    const nav = bootstrap.navigation || [];
    if (item.fullPanelPath) { window.open(item.fullPanelPath, "_blank", "noopener,noreferrer"); return; }
    if (resource === "schools") { const target = nav.find((x) => ["forms", "support-forms"].includes(x.key || x.resource)); if (target) navigate(target.path || target.route, { state: { schoolId: item.id, school: item } }); }
    else if (["forms", "support-forms"].includes(resource)) { const target = nav.find((x) => ["students", "form-students"].includes(x.key || x.resource)); if (target) { let form = item; if (bootstrap.activeRole === "adviser") { try { const response = await baleMiniHttp.get(API_ROUTES.adviserPortal.supportFormDetail(item.id)); form = response?.data?.data ?? response?.data ?? item; } catch {} } navigate(target.path || target.route, { state: { ...context, formId: item.id, form } }); } }
    else if (["students", "form-students"].includes(resource) && bootstrap.activeRole === "adviser") { const studentId = item.studentId || item.id; setState((current) => ({ ...current, loading: true, error: "" })); try { const room = await getBaleCallRoom({ formId: context.formId, studentId, schoolId: context.schoolId || bootstrap.activeSchoolId }); navigate("/call-room", { state: { ...room, formId: room.form?.id || context.formId, studentId: room.student?.id || studentId, school: context.school, questions: room.form?.questions || [], readiness: room.readiness, voipLineId: room.voipLineId } }); } catch (caught) { setState((current) => ({ ...current, loading: false, error: errorText(caught) })); } }
  };
  return <main><h1>{entry?.label || entry?.title || "سرآمد"}</h1>{state.loading ? <div className="bale-center-inline"><Spinner /><span>در حال دریافت اطلاعات…</span></div> : state.error ? <Alert color="danger">{state.error}<Button size="sm" className="ms-2" onClick={load}>تلاش مجدد</Button></Alert> : items.length ? <><div className="bale-list">{items.map((item, index) => <Card key={String(item.id ?? index)} role="button" tabIndex="0" onClick={() => openItem(item)} onKeyDown={(event) => event.key === "Enter" && openItem(item)}><CardBody><strong>{item.name || item.title || item.fullName || item.studentName || item.adviserName || `مورد ${index + 1}`}</strong>{item.status != null && <Badge color="info">{String(item.status)}</Badge>}<p>{item.description || item.maskedPhone || item.summary || item.adviserName || ""}</p></CardBody></Card>)}</div>{(meta.lastPage > 1 || meta.total > 20) && <div className="bale-pager"><Button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>قبلی</Button><span>صفحه {page} از {meta.lastPage || Math.ceil(meta.total / 20)}</span><Button disabled={page >= (meta.lastPage || 1)} onClick={() => setPage((value) => value + 1)}>بعدی</Button></div>}</> : state.data && !Array.isArray(state.data) && Object.keys(state.data).length ? <div className="bale-kpis">{Object.entries(state.data).filter(([, value]) => ["string", "number", "boolean"].includes(typeof value)).map(([key, value]) => <Card key={key}><CardBody><small>{key}</small><strong>{typeof value === "boolean" ? (value ? "بله" : "خیر") : value}</strong></CardBody></Card>)}</div> : <div className="bale-empty">موردی برای نمایش وجود ندارد.</div>}</main>;
}

function Preferences({ bootstrap }) {
  const schoolId = bootstrap.activeSchoolId;
  const [data, setData] = useState({ schoolId, isEnabled: true, enabledEvents: [], mutedUntil: null });
  const [loading, setLoading] = useState(true);
  const events = ["support_form.assigned", "support_form.deadline_near", "support_form.incomplete_call", "adviser.inactive", "voip.call.missed", "report.daily_ready", "security.new_bale_link"];
  useEffect(() => { getBalePreferences(schoolId).then((value) => setData({ ...data, ...value, schoolId })).finally(() => setLoading(false)); }, [schoolId]); // eslint-disable-line react-hooks/exhaustive-deps
  const save = async () => { setLoading(true); try { setData(await updateBalePreferences(data)); } finally { setLoading(false); } };
  return <main><h1>تنظیمات اعلان‌ها</h1><Label check><Input type="checkbox" checked={data.isEnabled} onChange={(e) => setData({ ...data, isEnabled: e.target.checked })} /> دریافت اعلان</Label>{events.map((event) => <Label check className="d-block my-3" key={event}><Input type="checkbox" checked={data.enabledEvents.includes(event)} onChange={(e) => setData({ ...data, enabledEvents: e.target.checked ? [...data.enabledEvents, event] : data.enabledEvents.filter((x) => x !== event) })} /> {event}</Label>)}<Button color="primary" disabled={loading} onClick={save}>ذخیره</Button></main>;
}

function Shell({ bootstrap, onContextChange }) {
  const navigate = useNavigate(); const location = useLocation();
  useEffect(() => adapter.onBack(() => location.pathname === "/" ? null : navigate(-1)), [location.pathname, navigate]);
  const nav = bootstrap.navigation || [];
  return <div className="bale-app"><header><div><small>{bootstrap.activeRole}</small><strong>{bootstrap.schools?.find((x) => String(x.id) === String(bootstrap.activeSchoolId))?.name || "سرآمد"}</strong></div><Button size="sm" outline onClick={onContextChange}>تغییر نقش/مجموعه</Button></header><Routes><Route path="/call-room" element={<CallRoom bootstrap={bootstrap} />} /><Route path="/preferences" element={<Preferences bootstrap={bootstrap} />} /><Route path="*" element={<DynamicPage bootstrap={bootstrap} />} /></Routes><nav>{nav.slice(0, 5).map((item, index) => <button className={location.pathname === (item.path || item.route) ? "active" : ""} key={item.key || index} onClick={() => navigate(item.path || item.route || "/")}><i className={item.icon || "bx bx-grid-alt"} /><span>{item.label || item.title}</span></button>)}</nav></div>;
}

function MiniAppController() {
  const [status, setStatus] = useState("booting"); const [bootstrap, setBootstrap] = useState(null); const [error, setError] = useState("");
  const [role, setRole] = useState(""); const [schoolId, setSchoolId] = useState(""); const exchangeAttempted = useRef(false);
  const boot = useCallback(async () => {
    if (!adapter.isSupported || !adapter.initData) { setStatus("unsupported"); return; }
    if (exchangeAttempted.current) return; exchangeAttempted.current = true; setStatus("exchanging"); setError("");
    try { const exchange = await exchangeBaleSession(adapter.initData); if (!exchange.linked) { setStatus("unlinked"); return; } setBaleMiniToken(exchange.accessToken); const next = normalizeBootstrap(await getBaleBootstrap({ activeRole: role || undefined, schoolId: schoolId || undefined })); setBootstrap(next); setRole(next.activeRole || ""); setSchoolId(next.activeSchoolId || ""); if ((next.roles || []).length > 1 && !role) setStatus("role-selection"); else if ((next.schools || []).length > 1 && !schoolId) setStatus("school-selection"); else setStatus("ready"); }
    catch (caught) { clearBaleMiniSession(); setError(errorText(caught)); setStatus(caught?.response?.status === 403 ? "forbidden" : "recoverable-error"); }
  }, [role, schoolId]);
  useEffect(() => { applyBaleTheme(adapter.themeParams); boot(); }, [boot]);
  useEffect(() => {
    let reauthenticating = false;
    const reauthenticate = async () => {
      if (reauthenticating) return;
      reauthenticating = true;
      exchangeAttempted.current = false;
      setStatus("booting");
      await boot();
      reauthenticating = false;
    };
    window.addEventListener("isoogh:bale-mini-unauthorized", reauthenticate);
    return () => window.removeEventListener("isoogh:bale-mini-unauthorized", reauthenticate);
  }, [boot]);
  useEffect(() => { if (status === "ready") { adapter.ready(); adapter.expand(); } }, [status]);
  const refreshContext = async (nextRole, nextSchool) => { setStatus("exchanging"); try { const next = normalizeBootstrap(await getBaleBootstrap({ activeRole: nextRole, schoolId: nextSchool })); setBootstrap(next); setRole(next.activeRole); setSchoolId(next.activeSchoolId); setStatus("ready"); } catch (caught) { setError(errorText(caught)); setStatus("recoverable-error"); } };
  if (["booting", "exchanging"].includes(status)) return <div className="bale-center"><Spinner /><p>در حال آماده‌سازی…</p></div>;
  if (status === "unsupported") return <div className="bale-center"><h1>نسخه بله پشتیبانی نمی‌شود</h1><p>این صفحه را داخل آخرین نسخه بله باز کنید.</p><a className="btn btn-primary" href="https://bale.ai/">دریافت نسخه جدید</a></div>;
  if (status === "unlinked") return <div className="bale-center"><h1>اتصال حساب لازم است</h1><p>ابتدا حساب سرآمد را از پنل یا بازوی بله متصل کنید و دوباره برگردید.</p></div>;
  if (status === "role-selection") return <Picker title="با کدام نقش وارد می‌شوید؟" items={bootstrap.roles || []} valueKey="key" labelKey="label" onSelect={(item) => { const selected = item.key || item.role || item; setRole(selected); if ((bootstrap.schools || []).length > 1) setStatus("school-selection"); else refreshContext(selected, schoolId || bootstrap.schools?.[0]?.id); }} />;
  if (status === "school-selection") return <Picker title="مجموعه را انتخاب کنید" items={bootstrap.schools || []} onSelect={(item) => refreshContext(role, item.id)} />;
  if (status !== "ready") return <div className="bale-center"><Alert color="danger">{error || "امکان ورود وجود ندارد."}</Alert>{status !== "forbidden" && <Button onClick={() => { exchangeAttempted.current = false; boot(); }}>تلاش مجدد</Button>}</div>;
  return <MemoryRouter><Routes><Route path="*" element={<Shell bootstrap={bootstrap} onContextChange={() => setStatus((bootstrap.roles || []).length > 1 ? "role-selection" : "school-selection")} />} /><Route path="/" element={<Navigate to={bootstrap.navigation?.[0]?.path || "/home"} replace />} /></Routes></MemoryRouter>;
}

export default MiniAppController;
