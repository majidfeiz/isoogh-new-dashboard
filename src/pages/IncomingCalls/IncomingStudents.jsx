import React, { useCallback, useEffect, useState } from "react";
import { Button, Card, CardBody, Col, Input, Label, Row, Table } from "reactstrap";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import Paginations from "../../components/Common/Paginations.jsx";
import { getIncomingStudents, incomingCallErrorMessage } from "../../services/incomingCallService.jsx";
import { RequestState, SchoolPicker } from "./IncomingCallsCommon.jsx";

const IncomingStudents = () => {
  document.title = "دانش‌آموزان تماس ورودی | آیسوق";
  const navigate = useNavigate(); const [schoolId, setSchoolId] = useState(""); const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0, lastPage: 1 }); const [search, setSearch] = useState(""); const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const load = useCallback(async (page = 1) => { if (!schoolId) return; setLoading(true); setError(""); try { const data = await getIncomingStudents({ schoolId, search: query, page, limit: meta.limit }); setItems(data.items); setMeta(data.pagination); } catch (e) { setError(incomingCallErrorMessage(e)); } finally { setLoading(false); } }, [schoolId, query, meta.limit]);
  useEffect(() => { if (schoolId) load(1); }, [schoolId, query]);
  return <div className="page-content"><div className="container-fluid"><Breadcrumbs title="تماس‌های ورودی" breadcrumbItem="دانش‌آموزان" /><Card><CardBody><Row className="g-3 align-items-end"><Col lg="4"><SchoolPicker value={schoolId} onChange={setSchoolId} /></Col><Col lg="6"><form onSubmit={(e) => { e.preventDefault(); setQuery(search.trim()); }}><Label>جستجو</Label><div className="input-group"><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="نام، نام کاربری یا شماره تماس" /><Button type="submit" color="primary">جستجو</Button></div></form></Col></Row>
    {!schoolId ? <div className="text-center text-muted py-5">مجموعه را انتخاب کنید.</div> : <RequestState loading={loading} error={error} empty={!items.length} onRetry={() => load(meta.page)} emptyText="دانش‌آموزی یافت نشد." />}
    {!!items.length && !loading && <><div className="table-responsive mt-4"><Table hover><thead><tr><th>نام</th><th>نام کاربری</th><th>تلفن</th><th /></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.fullName || item.name || `${item.firstName || ""} ${item.lastName || ""}`}</td><td>{item.username || "—"}</td><td>{item.phone || item.mobile || "—"}</td><td><Button size="sm" outline color="primary" onClick={() => navigate(`/incoming-calls/students/${item.id}?schoolId=${schoolId}`)}>مشاهده پرونده</Button></td></tr>)}</tbody></Table></div><Paginations perPageData={meta.limit} data={items} totalRecords={meta.total} currentPage={meta.page} setCurrentPage={load} isShowingPageLength paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" /></>}
  </CardBody></Card></div></div>;
};
export default IncomingStudents;
