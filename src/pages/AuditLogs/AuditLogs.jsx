import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, Card, CardBody, CardHeader, Col, Input, Label, Row } from "reactstrap";
import { useSearchParams } from "react-router-dom";
import moment from "moment-jalaali";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import Paginations from "../../components/Common/Paginations.jsx";
import Can from "../../components/Access/Can.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getSchools } from "../../services/schoolService.jsx";
import { getAuditLogs, getAuditStats } from "../../services/auditLogService.jsx";
import ActorAutocomplete from "./ActorAutocomplete.jsx";
import AuditDateFilter from "./AuditDateFilter.jsx";
import AuditLogDrawer from "./AuditLogDrawer.jsx";
import AuditStats from "./AuditStats.jsx";
import { ACTION_TYPES, isAdminUser, validIsoRange } from "./auditLogUtils.js";

const LIST_KEYS = ["from", "to", "schoolId", "actorUserId", "actorSearch", "module", "actionType", "status", "search", "page", "limit"];
const STATS_KEYS = ["from", "to", "schoolId", "actorUserId"];

const fromParams = (params, keys) => Object.fromEntries(keys.map((key) => [key, params.get(key)]).filter(([, value]) => value));
const persianDateTime = (value) => value ? moment(value).format("jYYYY/jMM/jDD HH:mm:ss") : "—";

const AuditLogs = () => {
  document.title = "لاگ فعالیت‌ها | داشبورد آیسوق";
  const { user, hasPermission } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, lastPage: 1 });
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [stats, setStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");
  const [selected, setSelected] = useState(null);
  const [schools, setSchools] = useState([]);
  const [searchDraft, setSearchDraft] = useState(searchParams.get("search") || "");
  const [actorLabel, setActorLabel] = useState(searchParams.get("actorSearch") || (searchParams.get("actorUserId") ? `کاربر #${searchParams.get("actorUserId")}` : ""));
  const listRequest = useRef(0);
  const statsRequest = useRef(0);
  const actorSearchTimer = useRef(null);
  const isAdmin = isAdminUser(user);
  const queryString = searchParams.toString();

  const updateQuery = useCallback((changes, resetPage = true) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      Object.entries(changes).forEach(([key, value]) => value === "" || value == null ? next.delete(key) : next.set(key, String(value)));
      if (resetPage) next.delete("page");
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const fetchList = useCallback(async () => {
    const id = ++listRequest.current;
    const params = new URLSearchParams(window.location.search);
    const query = fromParams(params, LIST_KEYS);
    if (!validIsoRange(query.from, query.to)) { setListError("بازه تاریخ نامعتبر است"); setListLoading(false); return; }
    setListLoading(true); setListError("");
    try {
      const result = await getAuditLogs(query);
      if (id === listRequest.current) { setItems(result.items); setPagination(result.pagination); }
    } catch (error) {
      if (id === listRequest.current) { setItems([]); setListError(error?.response?.data?.message || "خطا در دریافت لاگ‌ها"); }
    } finally { if (id === listRequest.current) setListLoading(false); }
  }, []);

  const fetchStats = useCallback(async () => {
    const id = ++statsRequest.current;
    const params = new URLSearchParams(window.location.search);
    const query = fromParams(params, STATS_KEYS);
    if (!validIsoRange(query.from, query.to)) return;
    setStatsLoading(true); setStatsError("");
    try {
      const result = await getAuditStats(query);
      if (id === statsRequest.current) setStats(result);
    } catch (error) {
      if (id === statsRequest.current) setStatsError(error?.response?.data?.message || "خطا در دریافت آمار");
    } finally { if (id === statsRequest.current) setStatsLoading(false); }
  }, []);

  useEffect(() => { fetchList(); }, [queryString, fetchList]);
  const statsSignature = useMemo(() => STATS_KEYS.map((key) => searchParams.get(key) || "").join("|"), [queryString]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (hasPermission("audit-logs.statistics")) fetchStats();
    else setStatsLoading(false);
  }, [statsSignature, fetchStats, hasPermission]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if ((searchParams.get("search") || "") !== searchDraft) updateQuery({ search: searchDraft || undefined });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchDraft]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isAdmin) return;
    getSchools({ page: 1, limit: 100 }).then((result) => setSchools(result.items || [])).catch(() => setSchools([]));
  }, [isAdmin]);

  const handleActor = ({ actorUserId, actorSearch, label }) => {
    setActorLabel(label || "");
    clearTimeout(actorSearchTimer.current);
    if (actorUserId || (!actorUserId && !actorSearch)) {
      updateQuery({ actorUserId, actorSearch });
      return;
    }
    actorSearchTimer.current = setTimeout(() => updateQuery({ actorUserId: undefined, actorSearch }), 400);
  };
  const handleDate = ({ from, to }) => updateQuery({ from, to });

  return (
    <div className="page-content"><div className="container-fluid">
      <Breadcrumbs title="مدیریت" breadcrumbItem="لاگ فعالیت‌ها" />
      <Card className="mb-4"><CardHeader><h5 className="mb-0">فیلترها</h5></CardHeader><CardBody>
        <Row className="g-3">
          <Col lg="12"><Label>بازه تاریخ</Label><AuditDateFilter onChange={handleDate} />{searchParams.get("from") && <small className="text-muted d-block mt-1">از {persianDateTime(searchParams.get("from"))} تا {persianDateTime(searchParams.get("to"))} (انتهای بازه محاسبه نمی‌شود)</small>}</Col>
          <Col md="4"><Label>کاربر</Label><ActorAutocomplete value={searchParams.get("actorUserId")} initialText={actorLabel} onChange={handleActor} /></Col>
          {isAdmin && <Col md="4"><Label>مجموعه</Label><Input bsSize="sm" type="select" value={searchParams.get("schoolId") || ""} onChange={(event) => updateQuery({ schoolId: event.target.value })}><option value="">همه مجموعه‌ها</option>{schools.map((school) => <option key={school.id} value={school.id}>{school.name || school.title || `مجموعه ${school.id}`}</option>)}</Input></Col>}
          <Col md="4"><Label>ماژول</Label><Input bsSize="sm" value={searchParams.get("module") || ""} onChange={(event) => updateQuery({ module: event.target.value })} placeholder="مثلاً users یا support-forms" /></Col>
          <Col md="4"><Label>نوع عملیات</Label><Input bsSize="sm" type="select" value={searchParams.get("actionType") || ""} onChange={(event) => updateQuery({ actionType: event.target.value })}><option value="">همه انواع</option>{Object.entries(ACTION_TYPES).map(([key, config]) => <option key={key} value={key}>{config.label}</option>)}</Input></Col>
          <Col md="4"><Label>وضعیت</Label><Input bsSize="sm" type="select" value={searchParams.get("status") || ""} onChange={(event) => updateQuery({ status: event.target.value })}><option value="">همه وضعیت‌ها</option><option value="success">موفق</option><option value="failed">ناموفق</option></Input></Col>
          <Col md="4"><Label>جست‌وجو</Label><Input bsSize="sm" value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="شرح، مسیر یا نام کاربر" /></Col>
        </Row>
      </CardBody></Card>

      <Can permission="audit-logs.statistics"><AuditStats data={stats} loading={statsLoading} error={statsError} onRetry={fetchStats} /></Can>

      <Card><CardHeader className="d-flex justify-content-between"><h5 className="mb-0">فعالیت‌ها</h5><span className="text-muted">{pagination.total.toLocaleString("fa-IR")} رکورد</span></CardHeader><CardBody>
        {listError && <div className="alert alert-danger">{String(listError)} <Button size="sm" outline color="danger" className="ms-2" onClick={fetchList}>تلاش مجدد</Button></div>}
        {listLoading ? <div aria-label="در حال بارگذاری" className="placeholder-glow">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="placeholder col-12 mb-3" style={{ height: 28 }} />)}</div> : !listError && !items.length ? <div className="text-center text-muted py-5"><i className="bx bx-search-alt fs-1 d-block mb-2" />فعالیتی با این فیلترها یافت نشد.</div> : (
          <div className="table-responsive"><table className="table table-bordered table-hover table-nowrap align-middle"><thead><tr><th>تاریخ</th><th>کاربر</th><th>مجموعه</th><th>ماژول</th><th>نوع</th><th>شرح</th><th>Subject</th><th>وضعیت</th><th>IP</th><th>مدت</th><th>Request ID</th></tr></thead><tbody>{items.map((item) => {
            const action = ACTION_TYPES[item.action_type] || ACTION_TYPES.other;
            return <tr key={item.id} role="button" onClick={() => setSelected(item)}><td>{persianDateTime(item.created_at)}</td><td>{item.actor_name || "سیستم"}<small className="text-muted d-block">{item.actor_user_id ? `#${item.actor_user_id}` : ""}</small></td><td>{item.school_ids?.length ? item.school_ids.join("، ") : "—"}</td><td>{item.module}</td><td><Badge color={action.color}>{action.label}</Badge></td><td className="text-truncate" style={{ maxWidth: 240 }} title={item.action}>{item.action}</td><td>{item.subject_type || "—"}{item.subject_id && <small className="d-block">#{item.subject_id}</small>}</td><td><Badge color={item.status === "failed" ? "danger" : "success"}>{item.status === "failed" ? "ناموفق" : "موفق"}</Badge></td><td>{item.ip_address || "—"}</td><td>{item.duration_ms == null ? "—" : `${item.duration_ms.toLocaleString("fa-IR")} ms`}</td><td><Button size="sm" color="link" className="p-0 text-truncate" style={{ maxWidth: 130 }} title="نمایش و کپی در جزئیات" onClick={(event) => { event.stopPropagation(); setSelected(item); }}>{item.request_id || "—"}</Button></td></tr>;
          })}</tbody></table></div>
        )}
        {!listLoading && !listError && <Paginations perPageData={pagination.limit} data={items} totalRecords={pagination.total} currentPage={pagination.page} setCurrentPage={(page) => updateQuery({ page }, false)} isShowingPageLength paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" />}
      </CardBody></Card>
      <AuditLogDrawer item={selected} onClose={() => setSelected(null)} />
    </div></div>
  );
};

export default AuditLogs;
