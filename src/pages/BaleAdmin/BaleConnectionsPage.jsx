import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Badge, Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import Paginations from "../../components/Common/Paginations.jsx";
import Can from "../../components/Access/Can.jsx";
import { getUsers } from "../../services/userService.jsx";
import { createManualBaleConnection, getBaleConnections, revokeBaleConnection } from "../../services/baleService.jsx";
import { buildManualBaleConnectionPayload, isValidBaleUserId, normalizeBaleUserId } from "./baleAdminUtils.js";

const shown = (value) => value == null || value === "" ? "—" : value;
const faDate = (value) => value ? new Date(value).toLocaleString("fa-IR") : "—";
const userName = (user) => user?.fullName || user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || `کاربر #${user?.id}`;
const rolesText = (roles) => Array.isArray(roles) ? roles.map((role) => role?.name || role?.title || role).filter(Boolean).join("، ") : "—";

function manualError(error) {
  const status = error?.response?.status;
  const value = error?.response?.data?.data;
  const raw = String(value?.message || value?.errorCode || "").toLowerCase();
  if (status === 404) return "کاربر داخلی پیدا نشد.";
  if (status === 409 && /role|نقش/.test(raw)) return "نقش این کاربر برای Mini App معتبر نیست؛ فقط مدیر، مشاور یا سرمشاور قابل اتصال است.";
  if (status === 409 && /bale.*id|conflict|شناسه/.test(raw)) return "این شناسه بله متعلق به اتصال کاربر دیگری است.";
  if (status === 409 && /blocked|مسدود/.test(raw)) return "این اتصال مسدود است و از این صفحه قابل رفع نیست.";
  if (status === 409) return "این کاربر اتصال فعال دیگری دارد؛ ابتدا اتصال فعلی را از جدول لغو کنید.";
  return value?.message || "اتصال دستی انجام نشد.";
}

function UserAutocomplete({ selected, onSelect }) {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const request = useRef(0);
  useEffect(() => {
    const query = search.trim();
    if (query.length < 2) { setItems([]); return undefined; }
    const current = ++request.current;
    const timer = setTimeout(async () => {
      setLoading(true);
      try { const result = await getUsers({ page: 1, limit: 10, search: query }); if (current === request.current) setItems(result.items || []); }
      catch { if (current === request.current) setItems([]); }
      finally { if (current === request.current) setLoading(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);
  if (selected) return <div className="border rounded p-3"><strong>{userName(selected)}</strong><small className="d-block text-muted">شناسه: {selected.id} · نام کاربری: {shown(selected.username)} · شماره: {shown(selected.maskedPhone)}</small><small className="d-block text-muted">نقش‌ها: {rolesText(selected.roles)}</small><Button size="sm" color="link" className="px-0 mt-2" onClick={() => { onSelect(null); setSearch(""); }}>تغییر کاربر</Button></div>;
  return <div className="position-relative"><Input aria-label="جست‌وجوی کاربر داخلی" placeholder="نام، نام کاربری، شماره، کد ملی یا شناسه" value={search} onChange={(event) => setSearch(event.target.value)} autoComplete="off" />{loading && <Spinner size="sm" className="position-absolute top-50 end-0 translate-middle-y me-3" />}{items.length > 0 && <div className="list-group position-absolute w-100 shadow" style={{ zIndex: 1060 }}>{items.map((user) => <button type="button" className="list-group-item list-group-item-action" key={user.id} onClick={() => { onSelect(user); setItems([]); }}><strong>{userName(user)}</strong><small className="d-block text-muted">#{user.id} · {shown(user.username)} · {shown(user.maskedPhone)}</small><small className="d-block text-muted">{rolesText(user.roles)}</small></button>)}</div>}</div>;
}

function ManualConnectionModal({ open, onClose, onCreated }) {
  const [user, setUser] = useState(null);
  const [baleUserId, setBaleUserId] = useState("");
  const [verified, setVerified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const normalized = normalizeBaleUserId(baleUserId);
  const reset = () => { setUser(null); setBaleUserId(""); setVerified(false); setMessage(null); };
  const close = () => { if (saving) return; reset(); onClose(); };
  const submit = async () => {
    setMessage(null);
    if (!user || !isValidBaleUserId(normalized) || !verified) { setMessage({ color: "danger", text: "کاربر، شناسه معتبر بله و تأیید مالکیت الزامی است." }); return; }
    if (!window.confirm(`شناسه بله ${normalized} به ${userName(user)} متصل شود؟`)) return;
    setSaving(true);
    try {
      const result = await createManualBaleConnection(buildManualBaleConnectionPayload(user.id, normalized));
      if (result.alreadyConnected) { setMessage({ color: "info", text: "این اتصال از قبل فعال است." }); return; }
      reset(); onClose(); onCreated(result.connection);
    } catch (error) { setMessage({ color: "danger", text: manualError(error) }); }
    finally { setSaving(false); }
  };
  return <Modal isOpen={open} toggle={close} size="lg"><ModalHeader toggle={close}>اتصال دستی شناسه بله به کاربر</ModalHeader><ModalBody>
    <Alert color="warning">صاحب این شناسه بله پس از اتصال دقیقاً با دسترسی کاربر داخلی انتخاب‌شده وارد سرآمد می‌شود. این قابلیت فقط برای موارد استثنایی است.</Alert>
    {message && <Alert color={message.color}>{message.text}</Alert>}
    <FormGroup><Label>کاربر داخلی</Label><UserAutocomplete selected={user} onSelect={setUser} /></FormGroup>
    <FormGroup><Label for="manual-bale-user-id">شناسه عددی بله</Label><Input id="manual-bale-user-id" inputMode="numeric" maxLength={32} value={baleUserId} onChange={(event) => setBaleUserId(event.target.value)} invalid={Boolean(baleUserId && !isValidBaleUserId(normalized))} /><small className="text-muted">شناسه پس از تبدیل ارقام فارسی به انگلیسی: <bdi>{normalized || "—"}</bdi></small></FormGroup>
    <Label check><Input type="checkbox" checked={verified} onChange={(event) => setVerified(event.target.checked)} /> مالکیت این شناسه بله را بررسی و تأیید کرده‌ام</Label>
  </ModalBody><ModalFooter><Button outline onClick={close}>انصراف</Button><Button color="primary" disabled={saving || !user || !verified || !isValidBaleUserId(normalized)} onClick={submit}>{saving ? <Spinner size="sm" /> : "اتصال دستی"}</Button></ModalFooter></Modal>;
}

export default function BaleConnectionsPage() {
  document.title = "اتصال کاربران بله | داشبورد سرآمد";
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState({ search: "", userId: "", baleUserId: "", status: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const load = useCallback(async (page = 1) => {
    setLoading(true); setError("");
    try { const result = await getBaleConnections({ page, limit: meta.limit, ...filters }); setItems(result.items); setMeta(result.pagination); }
    catch { setError("دریافت اتصال‌ها انجام نشد."); }
    finally { setLoading(false); }
  }, [meta.limit, filters]);
  useEffect(() => { const timer = setTimeout(() => load(1), 350); return () => clearTimeout(timer); }, [load]);
  const change = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const revoke = async (id) => { if (!window.confirm("اتصال این کاربر از بله لغو شود؟")) return; await revokeBaleConnection(id); await load(meta.page); window.dispatchEvent(new CustomEvent("isoogh:bale-admin-data-changed")); };
  const created = async () => { setNotice("اتصال دستی با موفقیت ایجاد شد."); await load(1); window.dispatchEvent(new CustomEvent("isoogh:bale-admin-data-changed")); };

  return <div className="page-content"><div className="container-fluid"><Breadcrumbs title="یکپارچه‌سازی بله" breadcrumbItem="اتصال کاربران" />
    {notice && <Alert color="success" toggle={() => setNotice("")}>{notice}</Alert>}
    <Card><CardHeader><Row className="g-2"><Col lg="5"><Input aria-label="جست‌وجوی اتصال" placeholder="نام، Bale ID یا شماره ماسک‌شده" value={filters.search} onChange={(event) => change("search", event.target.value)} /></Col><Col lg="2"><Input aria-label="شناسه کاربر" placeholder="User ID" value={filters.userId} onChange={(event) => change("userId", event.target.value)} /></Col><Col lg="2"><Input aria-label="شناسه کاربر بله" placeholder="Bale ID" value={filters.baleUserId} onChange={(event) => change("baleUserId", normalizeBaleUserId(event.target.value))} /></Col><Col lg="2"><Input aria-label="وضعیت اتصال" type="select" value={filters.status} onChange={(event) => change("status", event.target.value)}><option value="">همه وضعیت‌ها</option><option value="active">فعال</option><option value="revoked">لغوشده</option><option value="blocked">مسدود</option></Input></Col><Col lg="1"><Can permission="bale.admin.connections.create"><Button color="primary" className="w-100" onClick={() => setManualOpen(true)} title="اتصال دستی"><i className="bx bx-link-alt" /></Button></Can></Col></Row></CardHeader><CardBody>
      {loading ? <div className="text-center p-5"><Spinner /></div> : error ? <Alert color="danger">{error}<Button size="sm" className="ms-2" onClick={() => load(meta.page)}>تلاش مجدد</Button></Alert> : !items.length ? <div className="text-center text-muted p-5">اتصالی یافت نشد.</div> : <div className="table-responsive"><table className="table table-bordered align-middle"><thead><tr><th>کاربر</th><th>شماره</th><th>Bale ID</th><th>username</th><th>نوع اتصال</th><th>وضعیت</th><th>اتصال/آخرین مشاهده</th><th><span className="visually-hidden">عملیات</span></th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{shown(item.userName)}</td><td>{shown(item.maskedPhone)}</td><td><bdi>{String(shown(item.baleUserId))}</bdi></td><td>{item.baleUsername ? `@${item.baleUsername}` : "—"}</td><td><Badge color={item.linkMethod === "manual" ? "warning" : "secondary"} title={item.linkMethod === "manual" ? `ایجادکننده: ${shown(item.linkedByUserId)}` : undefined}>{item.linkMethod === "manual" ? "دستی" : "عادی"}</Badge></td><td>{shown(item.status)}</td><td>{faDate(item.linkedAt)}<small className="d-block">{faDate(item.lastSeenAt)}</small></td><td><Can permission="bale.admin.connections.revoke"><Button color="danger" size="sm" outline onClick={() => revoke(item.id)}>لغو اتصال</Button></Can></td></tr>)}</tbody></table></div>}
      {!loading && !error && items.length > 0 && <Paginations perPageData={meta.limit} data={items} totalRecords={meta.total} currentPage={meta.page} setCurrentPage={load} isShowingPageLength paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" />}
    </CardBody></Card><Can permission="bale.admin.connections.create"><ManualConnectionModal open={manualOpen} onClose={() => setManualOpen(false)} onCreated={created} /></Can>
  </div></div>;
}
