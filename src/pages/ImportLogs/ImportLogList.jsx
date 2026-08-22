import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, CardBody, CardHeader, Col, Input, Label, Row } from "reactstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import Paginations from "../../components/Common/Paginations.jsx";
import Can from "../../components/Access/Can.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getSchools } from "../../services/schoolService.jsx";
import { exportImportLogs, getImportLogs, saveBlob } from "../../services/importLogService.jsx";
import { ErrorBox, faDate, faNumber, LoadingRows, ProgressCell, StatusBadge } from "./ImportLogComponents.jsx";
import { errorState, FILTER_KEYS, isActiveStatus, mergeQuery, paramsToObject } from "./importLogUtils.js";
import useVisiblePolling from "./useVisiblePolling.js";

const isAdmin = (user) => (user?.roles || []).some((role) => ["admin", "super_manager"].includes(typeof role === "string" ? role : role?.name));
const toIso = (value) => value ? new Date(value).toISOString() : "";

const ImportLogList = () => {
  document.title = "لاگ ورود اطلاعات | داشبورد آیسوق";
  const { user, hasPermission } = useAuth(); const navigate = useNavigate(); const [query, setQuery] = useSearchParams();
  const [items, setItems] = useState([]); const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, lastPage: 1 }); const [loading, setLoading] = useState(true); const [error, setError] = useState(null); const [schools, setSchools] = useState([]); const [draft, setDraft] = useState(query.get("search") || ""); const [exporting, setExporting] = useState(false); const controller = useRef();
  const signature = query.toString();
  const update = useCallback((changes, reset = true) => setQuery((current) => mergeQuery(current, changes, reset), { replace: true }), [setQuery]);
  const load = useCallback(async () => { controller.current?.abort(); const abort = new AbortController(); controller.current = abort; setLoading(true); setError(null); try { const result = await getImportLogs(paramsToObject(new URLSearchParams(window.location.search), FILTER_KEYS), abort.signal); setItems(result.items); setMeta(result.pagination); } catch (e) { if (e?.code !== "ERR_CANCELED") { setItems([]); setError(errorState(e)); } } finally { if (!abort.signal.aborted) setLoading(false); } }, []);
  useEffect(() => { load(); return () => controller.current?.abort(); }, [signature, load]);
  useEffect(() => { const timer = setTimeout(() => { if ((query.get("search") || "") !== draft) update({ search: draft }); }, 400); return () => clearTimeout(timer); }, [draft]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (isAdmin(user)) getSchools({ page: 1, limit: 100 }).then((r) => setSchools(r.items || [])).catch(() => {}); }, [user]);
  const hasActive = useMemo(() => items.some((item) => isActiveStatus(item.status)), [items]);
  useVisiblePolling(load, hasActive);
  const clear = () => { setDraft(""); setQuery({}, { replace: true }); };
  const doExport = async () => { setExporting(true); try { const params = paramsToObject(query, FILTER_KEYS.filter((key) => !["page", "limit"].includes(key))); saveBlob(await exportImportLogs(params)); } finally { setExporting(false); } };
  return <div className="page-content"><div className="container-fluid"><Breadcrumbs title="مدیریت" breadcrumbItem="لاگ ورود اطلاعات" />
    <Card className="mb-3"><CardHeader><h5 className="mb-0">فیلترها</h5></CardHeader><CardBody><Row className="g-3">
      <Col md="4"><Label>جست‌وجو</Label><Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="نام فایل یا اطلاعات لاگ" /></Col><Col md="2"><Label>وضعیت</Label><Input type="select" value={query.get("status") || ""} onChange={(e) => update({ status: e.target.value })}><option value="">همه</option><option value="pending">در انتظار</option><option value="processing">در حال پردازش</option><option value="success">موفق</option><option value="failed">ناموفق</option></Input></Col>
      <Col md="2"><Label>نوع import</Label><Input value={query.get("importType") || ""} onChange={(e) => update({ importType: e.target.value })} /></Col><Col md="2"><Label>شناسه سازنده</Label><Input inputMode="numeric" value={query.get("createdBy") || ""} onChange={(e) => update({ createdBy: e.target.value.replace(/\D/g, "") })} /></Col>
      {isAdmin(user) && <Col md="2"><Label>مجموعه</Label><Input type="select" value={query.get("schoolId") || ""} onChange={(e) => update({ schoolId: e.target.value })}><option value="">همه</option>{schools.map((school) => <option key={school.id} value={school.id}>{school.name || school.title}</option>)}</Input></Col>}
      <Col md="3"><Label>از تاریخ</Label><Input type="datetime-local" onChange={(e) => update({ from: toIso(e.target.value) })} /></Col><Col md="3"><Label>تا تاریخ (غیرشامل)</Label><Input type="datetime-local" onChange={(e) => update({ to: toIso(e.target.value) })} /></Col><Col className="d-flex align-items-end gap-2"><Button color="light" onClick={clear}>پاک‌کردن فیلترها</Button><Can permission="import-logs.export"><Button color="success" disabled={exporting} onClick={doExport}>{exporting ? "در حال دریافت…" : "خروجی Excel"}</Button></Can></Col>
    </Row></CardBody></Card>
    <Card><CardHeader className="d-flex justify-content-between"><h5 className="mb-0">ورودها</h5><span>{faNumber(meta.total)} رکورد</span></CardHeader><CardBody><ErrorBox error={error} onRetry={load} />{loading ? <LoadingRows /> : !error && !items.length ? <div className="text-center text-muted py-5">نتیجه‌ای مطابق فیلترها یافت نشد.</div> : <div className="table-responsive"><table className="table table-bordered table-hover table-nowrap align-middle"><thead><tr>{[["id","شناسه"],["fileName","نام فایل"],["importType","نوع"],["status","وضعیت"],["schoolId","مجموعه"],["createdBy","سازنده"],["totalRows","پیشرفت"],["failedRows","ناموفق"],["startedAt","شروع"],["finishedAt","پایان"],["createdAt","ایجاد"]].map(([key,label]) => <th role="button" key={key} onClick={() => update({ sortBy: key, sortOrder: query.get("sortBy") === key && query.get("sortOrder") !== "DESC" ? "DESC" : "ASC" })}>{label}</th>)}<th>عملیات</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{faNumber(item.id)}</td><td>{item.fileName || "—"}</td><td>{item.importType || "—"}</td><td><StatusBadge status={item.status} /></td><td>{item.school?.name || item.schoolName || item.schoolId || "—"}</td><td>{item.creator?.name || item.createdByUser?.name || item.createdBy || "—"}</td><td><ProgressCell item={item} /></td><td className={Number(item.failedRows) ? "text-danger fw-bold" : ""}>{faNumber(item.failedRows)}</td><td>{faDate(item.startedAt)}</td><td>{faDate(item.finishedAt)}</td><td>{faDate(item.createdAt)}</td><td>{hasPermission("import-logs.show") && <Button size="sm" color="primary" onClick={() => navigate(`/import-logs/${item.id}${query.get("schoolId") ? `?schoolId=${query.get("schoolId")}` : ""}`)}>جزئیات</Button>}</td></tr>)}</tbody></table></div>}
      {!loading && !error && <Paginations perPageData={meta.limit} data={items} totalRecords={meta.total} currentPage={meta.page} setCurrentPage={(page) => update({ page }, false)} isShowingPageLength paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" />}</CardBody></Card>
  </div></div>;
};
export default ImportLogList;
