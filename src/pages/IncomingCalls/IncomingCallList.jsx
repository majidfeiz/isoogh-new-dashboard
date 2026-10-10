import React, { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, CardBody, Col, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from "reactstrap";
import { toast } from "react-toastify";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import Paginations from "../../components/Common/Paginations.jsx";
import { getIncomingCalls, incomingCallErrorMessage, saveIncomingCallResult } from "../../services/incomingCallService.jsx";
import { formatDateTime, formatDuration, RequestState, SchoolPicker } from "./IncomingCallsCommon.jsx";

const statuses = { routing: ["در حال مسیریابی", "info"], answered: ["پاسخ داده‌شده", "success"], missed: ["از دست‌رفته", "danger"], voice: ["پیام صوتی", "warning"], ended: ["پایان‌یافته", "secondary"] };
const IncomingCallList = () => {
  document.title = "تماس‌های ورودی | آیسوق";
  const [schoolId, setSchoolId] = useState(""); const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0, lastPage: 1 });
  const [status, setStatus] = useState(""); const [search, setSearch] = useState(""); const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const [selected, setSelected] = useState(null); const [result, setResult] = useState(""); const [note, setNote] = useState(""); const [saving, setSaving] = useState(false);
  const load = useCallback(async (page = 1) => { if (!schoolId) return; setLoading(true); setError(""); try { const data = await getIncomingCalls({ schoolId, page, limit: meta.limit, status, search: query }); setItems(data.items); setMeta(data.pagination); } catch (e) { setError(incomingCallErrorMessage(e)); } finally { setLoading(false); } }, [schoolId, meta.limit, status, query]);
  useEffect(() => { if (schoolId) load(1); }, [schoolId, status, query]);
  const submitSearch = (e) => { e.preventDefault(); setQuery(search.trim()); };
  const submitResult = async (e) => { e.preventDefault(); if (!result.trim()) { toast.error("نتیجه تماس الزامی است."); return; } setSaving(true); try { await saveIncomingCallResult(selected.id, { schoolId, result, note }); toast.success("نتیجه تماس ثبت شد."); setSelected(null); setResult(""); setNote(""); await load(meta.page); } catch (err) { toast.error(incomingCallErrorMessage(err)); } finally { setSaving(false); } };
  return <div className="page-content"><div className="container-fluid"><Breadcrumbs title="تماس‌های ورودی" breadcrumbItem="لیست تماس‌ها" />
    <Card><CardBody><Row className="g-3 align-items-end"><Col lg="3"><SchoolPicker value={schoolId} onChange={setSchoolId} /></Col><Col lg="3"><Label>وضعیت</Label><Input type="select" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">همه</option>{Object.entries(statuses).map(([key, value]) => <option key={key} value={key}>{value[0]}</option>)}</Input></Col><Col lg="5"><form onSubmit={submitSearch}><Label>جستجو</Label><div className="input-group"><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="شماره تماس‌گیرنده یا مقصد" /><Button type="submit" color="primary">جستجو</Button></div></form></Col></Row>
      {!schoolId ? <div className="text-muted text-center py-5">مجموعه را انتخاب کنید.</div> : <RequestState loading={loading} error={error} empty={!items.length} onRetry={() => load(meta.page)} emptyText="تماسی یافت نشد." />}
      {!!items.length && !loading && <><div className="table-responsive mt-4"><Table hover><thead><tr><th>وضعیت</th><th>تماس‌گیرنده</th><th>مقصد</th><th>مدت</th><th>شروع</th><th>پاسخ</th><th>پایان</th><th /></tr></thead><tbody>{items.map((item) => { const view = statuses[item.status] || [item.status || "—", "secondary"]; return <tr key={item.id} className={item.status === "missed" ? "table-danger" : ""}><td><Badge color={view[1]}>{view[0]}</Badge></td><td>{item.callerNumber ?? item.caller ?? item.from ?? "—"}</td><td>{item.destinationName ?? item.destination ?? item.to ?? "—"}</td><td>{formatDuration(item.durationSeconds ?? item.duration)}</td><td>{formatDateTime(item.startedAt ?? item.createdAt)}</td><td>{formatDateTime(item.answeredAt)}</td><td>{formatDateTime(item.endedAt)}</td><td>{["answered", "ended"].includes(item.status) && <Button size="sm" outline color="primary" onClick={() => { setSelected(item); setResult(item.result || ""); setNote(item.note || ""); }}>ثبت نتیجه</Button>}</td></tr>; })}</tbody></Table></div><Paginations perPageData={meta.limit} data={items} totalRecords={meta.total} currentPage={meta.page} setCurrentPage={load} isShowingPageLength paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" /></>}
    </CardBody></Card>
    <Modal isOpen={!!selected} toggle={() => setSelected(null)}><form onSubmit={submitResult}><ModalHeader toggle={() => setSelected(null)}>ثبت نتیجه تماس</ModalHeader><ModalBody><Label>نتیجه تماس</Label><Input required value={result} onChange={(e) => setResult(e.target.value)} placeholder="نتیجه را وارد کنید" /><Label className="mt-3">یادداشت (اختیاری)</Label><Input type="textarea" rows="4" value={note} onChange={(e) => setNote(e.target.value)} /></ModalBody><ModalFooter><Button type="submit" color="primary" disabled={saving}>ذخیره</Button><Button type="button" color="secondary" onClick={() => setSelected(null)}>انصراف</Button></ModalFooter></form></Modal>
  </div></div>;
};
export default IncomingCallList;
