import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Alert, Button, Card, CardBody, CardHeader, Col, Row, Spinner, Table } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import Paginations from "../../components/Common/Paginations.jsx";
import Can from "../../components/Access/Can.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getTicketTaxonomy, getTickets } from "../../services/ticketService.jsx";
import TicketFilters from "./TicketFilters.jsx";
import TicketStatus from "./TicketStatus.jsx";
import useTicketSchools from "./useTicketSchools.js";
import { formatTicketDate, isGlobalTicketRole, sanitizeTicketStatus, taxonomyName } from "./ticketUtils.js";

const keys = ["schoolId", "search", "status", "categoryId", "resultId", "from", "to"];
export default function TicketList() {
  document.title = "تیکت‌ها | داشبورد آیسوق";
  const [params, setParams] = useSearchParams();
  const { user, hasPermission } = useAuth();
  const allowAllSchools = isGlobalTicketRole(user);
  const canManage = hasPermission("tickets.manage");
  const filters = useMemo(() => Object.fromEntries(keys.map((key) => {
    if (key === "status") return [key, sanitizeTicketStatus(params.get(key))];
    if (key === "resultId" && !canManage) return [key, ""];
    return [key, params.get(key) || ""];
  })), [params, canManage]);
  const page = Number(params.get("page")) || 1;
  const limit = Number(params.get("limit")) || 10;
  const [state, setState] = useState({ items: [], meta: { page, limit, total: 0, lastPage: 1 }, loading: true, error: "" });
  const [taxonomy, setTaxonomy] = useState({ categories: [], results: [] });
  const { schools, loading: schoolsLoading, validSavedSchoolId, rememberSchool } = useTicketSchools();
  const update = useCallback((changes) => setParams((current) => { const next = new URLSearchParams(current); Object.entries(changes).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key)); return next; }), [setParams]);

  useEffect(() => { Promise.all([getTicketTaxonomy("categories"), canManage ? getTicketTaxonomy("results") : Promise.resolve([])]).then(([categories, results]) => setTaxonomy({ categories, results })).catch(() => {}); }, [canManage]);
  useEffect(() => { if (schoolsLoading || allowAllSchools || filters.schoolId) return; const schoolId = validSavedSchoolId() || schools[0]?.id; if (schoolId) update({ schoolId: String(schoolId), page: "1" }); }, [schoolsLoading, schools, filters.schoolId, allowAllSchools, validSavedSchoolId, update]);
  useEffect(() => { if (!allowAllSchools && !filters.schoolId) return; const timer = setTimeout(async () => { setState((s) => ({ ...s, loading: true, error: "" })); try { const data = await getTickets({ ...filters, page, limit }); setState({ ...data, loading: false, error: "" }); } catch { setState((s) => ({ ...s, items: [], loading: false, error: "دریافت تیکت‌ها ناموفق بود. دوباره تلاش کنید." })); } }, 350); return () => clearTimeout(timer); }, [filters, page, limit, allowAllSchools]);
  const change = (key, value) => { if (key === "schoolId" && value) rememberSchool(value); update({ [key]: value, page: "1" }); };

  return <div className="page-content"><div className="container-fluid"><Breadcrumbs title="پشتیبانی" breadcrumbItem="تیکت‌ها" /><Row><Col><Card><CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2"><div><h4 className="card-title mb-1">مرکز تیکت‌های پشتیبانی</h4><p className="text-muted mb-0">پیگیری درخواست‌ها و گفت‌وگو با تیم پشتیبانی</p></div><Can permission="tickets.create"><Button tag={Link} to="/tickets/create" color="primary"><i className="bx bx-plus ms-1" />ثبت تیکت جدید</Button></Can></CardHeader><CardBody><TicketFilters filters={filters} onChange={change} onReset={() => setParams({ page: "1", limit: String(limit) })} schools={schools} categories={taxonomy.categories} results={taxonomy.results} allowAllSchools={allowAllSchools} />{state.error && <Alert color="danger" className="mt-3">{state.error}</Alert>}<div className="table-responsive mt-4"><Table hover className="align-middle mb-0"><thead className="table-light"><tr><th>شماره</th><th>عنوان</th><th>وضعیت</th><th>دسته</th><th>نتیجه</th><th>تاریخ ایجاد</th><th><span className="visually-hidden">عملیات</span></th></tr></thead><tbody>{state.loading ? <tr><td colSpan="7" className="text-center py-5"><Spinner size="sm" /> <span className="me-2">در حال دریافت...</span></td></tr> : state.items.length === 0 ? <tr><td colSpan="7" className="text-center py-5 text-muted"><i className="bx bx-message-square-x fs-2 d-block mb-2" />تیکتی با این فیلترها یافت نشد.</td></tr> : state.items.map((ticket) => <tr key={ticket.id}><td dir="ltr" className="text-nowrap fw-semibold">#{ticket.ticketNumber || ticket.id}</td><td><Link to={`/tickets/${ticket.id}?schoolId=${ticket.schoolId}`} className="fw-medium text-dark">{ticket.title}</Link></td><td><TicketStatus status={ticket.status} /></td><td>{taxonomyName(ticket.category)}</td><td>{taxonomyName(ticket.result)}</td><td className="text-nowrap">{formatTicketDate(ticket.createdAt)}</td><td><Can permission="tickets.show"><Button tag={Link} to={`/tickets/${ticket.id}?schoolId=${ticket.schoolId}`} color="soft-primary" size="sm" aria-label={`مشاهده تیکت ${ticket.ticketNumber || ticket.id}`}>مشاهده</Button></Can></td></tr>)}</tbody></Table></div><div className="mt-4"><Paginations perPageData={state.meta.limit} data={state.items} totalRecords={state.meta.total} totalPages={state.meta.lastPage} currentPage={state.meta.page} setCurrentPage={(value) => update({ page: String(value) })} isShowingPageLength /></div></CardBody></Card></Col></Row></div></div>;
}
