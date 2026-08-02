import React, { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, CardBody, CardHeader, Col, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import Paginations from "../../components/Common/Paginations.jsx";
import Can from "../../components/Access/Can.jsx";
import { bulkUpdateBaleSchoolSettings, getBaleSchoolSettings, getBaleSchools, updateBaleSchoolSettings } from "../../services/baleService.jsx";
import { buildBulkSettingsPayload } from "./baleAdminUtils.js";
import { normalizeBaleSchoolSettings } from "../../services/baleSettingsMapper.js";

const EVENTS = [
  ["support_form.assigned", "تخصیص فرم پشتیبانی"],
  ["support_form.deadline_near", "نزدیک‌شدن مهلت فرم"],
  ["support_form.incomplete_call", "تماس ناقص فرم"],
  ["adviser.inactive", "غیرفعال‌شدن مشاور"],
  ["voip.call.missed", "تماس ازدست‌رفته"],
  ["report.daily_ready", "آماده‌شدن گزارش روزانه"],
  ["security.new_bale_link", "اتصال جدید حساب بله"],
];
const SWITCHES = [
  ["isEnabled", "فعال‌سازی یکپارچه‌سازی بله"],
  ["botEnabled", "فعال‌سازی بازوی بله"],
  ["miniAppEnabled", "فعال‌سازی Mini App"],
  ["safirEnabled", "فعال‌سازی ارسال از طریق سفیر"],
  ["allowManager", "دسترسی مدیر"],
  ["allowAdviser", "دسترسی مشاور"],
  ["allowSuperAdviser", "دسترسی سرمشاور"],
  ["notificationsEnabled", "فعال‌سازی اعلان‌ها"],
];
const apiError = (error, fallback) => String(error?.response?.data?.message || fallback);

function SettingsModal({ schoolId, onClose, onSaved }) {
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getBaleSchoolSettings(schoolId).then((value) => setForm(normalizeBaleSchoolSettings(value))).catch((caught) => setError(apiError(caught, "دریافت تنظیمات انجام نشد.")));
  }, [schoolId]);

  const toggleEvent = (event, checked) => setForm((current) => ({
    ...current,
    allowedNotificationTypes: checked
      ? Array.from(new Set([...(current.allowedNotificationTypes || []), event]))
      : (current.allowedNotificationTypes || []).filter((item) => item !== event),
  }));

  const save = async () => {
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    if ((form.quietHoursStart && !timePattern.test(form.quietHoursStart)) || (form.quietHoursEnd && !timePattern.test(form.quietHoursEnd))) { setError("ساعت سکوت باید با فرمت HH:mm باشد."); return; }
    if (!/^[A-Za-z_]+\/[A-Za-z_]+(?:\/[A-Za-z_]+)?$/.test(form.timezone || "")) { setError("منطقه زمانی باید یک شناسه IANA مانند Asia/Tehran باشد."); return; }
    if (form.isEnabled && !window.confirm("یکپارچه‌سازی بله برای این مجموعه فعال شود؟")) return;
    setSaving(true);
    setError("");
    try {
      await updateBaleSchoolSettings(schoolId, form);
      onSaved();
    } catch (caught) {
      setError(apiError(caught, "ذخیره تنظیمات انجام نشد."));
    } finally {
      setSaving(false);
    }
  };

  return <Modal isOpen toggle={onClose} size="lg">
    <ModalHeader toggle={onClose}>تنظیمات یکپارچه‌سازی بله</ModalHeader>
    <ModalBody>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {!form ? <div className="text-center py-4"><Spinner /></div> : <>
        <Row className="g-3">
          {SWITCHES.map(([key, label]) => <Col md="6" key={key}>
            <div className="border rounded p-3 h-100"><Label check className="d-flex gap-2 align-items-center mb-0"><Input type="switch" checked={Boolean(form[key])} onChange={(event) => setForm({ ...form, [key]: event.target.checked })} /> <span>{label}</span></Label></div>
          </Col>)}
          <Col md="6"><Label for="bale-otp-provider">ارائه‌دهنده OTP</Label><Input id="bale-otp-provider" type="select" value={form.otpProvider || "fallback"} onChange={(event) => setForm({ ...form, otpProvider: event.target.value })}><option value="bale">بله (سفیر)</option><option value="fallback">مسیر جایگزین</option><option value="kavenegar">کاوه‌نگار</option></Input></Col>
          <Col md="6"><Label for="bale-timezone">منطقه زمانی</Label><Input id="bale-timezone" value={form.timezone} placeholder="Asia/Tehran" onChange={(event) => setForm({ ...form, timezone: event.target.value })} /></Col>
          <Col md="6"><Label for="bale-quiet-start">شروع ساعت سکوت</Label><Input id="bale-quiet-start" type="time" value={form.quietHoursStart || ""} onChange={(event) => setForm({ ...form, quietHoursStart: event.target.value || null })} /><small className="text-muted">خالی یعنی بدون محدودیت</small></Col>
          <Col md="6"><Label for="bale-quiet-end">پایان ساعت سکوت</Label><Input id="bale-quiet-end" type="time" value={form.quietHoursEnd || ""} onChange={(event) => setForm({ ...form, quietHoursEnd: event.target.value || null })} /><small className="text-muted">بازه عبوری از نیمه‌شب بدون تبدیل ذخیره می‌شود.</small></Col>
        </Row>
        <hr />
        <fieldset disabled={!form.notificationsEnabled}><legend className="h6">رویدادهای مجاز اعلان</legend><Row>{EVENTS.map(([event, label]) => <Col md="6" className="mb-2" key={event}><Label check><Input type="checkbox" checked={form.allowedNotificationTypes.includes(event)} onChange={(change) => toggleEvent(event, change.target.checked)} /> {label}<small className="d-block text-muted ltr">{event}</small></Label></Col>)}</Row></fieldset>
        <div className="alert alert-light border mt-3 mb-0">توکن بازو، webhook secret و کلید سفیر فقط در تنظیمات امن سرور نگه‌داری می‌شوند و در این صفحه نمایش داده نمی‌شوند.</div>
      </>}
    </ModalBody>
    <ModalFooter><Button outline onClick={onClose}>انصراف</Button><Can permission="bale.admin.settings.update"><Button color="primary" disabled={!form || saving} onClick={save}>{saving ? <Spinner size="sm" /> : "ذخیره تنظیمات"}</Button></Can></ModalFooter>
  </Modal>;
}

function BulkSettingsModal({ schoolIds, onClose, onSaved }) {
  const [changes, setChanges] = useState({});
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fields = SWITCHES.filter(([key]) => ["isEnabled", "botEnabled", "miniAppEnabled", "safirEnabled", "allowManager", "allowAdviser", "allowSuperAdviser", "notificationsEnabled"].includes(key));
  const setChange = (key, value) => setChanges((current) => value === "" ? Object.fromEntries(Object.entries(current).filter(([item]) => item !== key)) : { ...current, [key]: value === "true" });
  const submit = async () => {
    if (!Object.keys(changes).length) { setError("حداقل یک تغییر انتخاب کنید."); return; }
    const summary = fields.filter(([key]) => key in changes).map(([key, label]) => `${label}: ${changes[key] ? "فعال" : "غیرفعال"}`).join("، ");
    if (!window.confirm(`تنظیمات ${schoolIds.length.toLocaleString("fa-IR")} مجموعه تغییر کند؟\n${summary}`)) return;
    setSaving(true); setError("");
    try { setResult(await bulkUpdateBaleSchoolSettings(buildBulkSettingsPayload(schoolIds, changes))); onSaved(); } catch (caught) { setError(apiError(caught, "تغییر گروهی انجام نشد.")); } finally { setSaving(false); }
  };
  return <Modal isOpen toggle={onClose} size="lg"><ModalHeader toggle={onClose}>تغییر گروهی {schoolIds.length.toLocaleString("fa-IR")} مجموعه</ModalHeader><ModalBody>{error && <div className="alert alert-danger">{error}</div>}{result ? <div className="alert alert-info"><div>درخواست‌شده: {result.requested ?? schoolIds.length}</div><div>به‌روزشده: {result.updated ?? 0}</div>{result.missingSchoolIds?.length > 0 && <div>شناسه‌های یافت‌نشده: {result.missingSchoolIds.map(String).join("، ")}</div>}</div> : <Row className="g-3">{fields.map(([key, label]) => <Col md="6" key={key}><Label for={`bulk-${key}`}>{label}</Label><Input id={`bulk-${key}`} type="select" value={key in changes ? String(changes[key]) : ""} onChange={(event) => setChange(key, event.target.value)}><option value="">بدون تغییر</option><option value="true">فعال</option><option value="false">غیرفعال</option></Input></Col>)}</Row>}</ModalBody><ModalFooter><Button outline onClick={onClose}>{result ? "بستن" : "انصراف"}</Button>{!result && <Button color="primary" disabled={saving} onClick={submit}>{saving ? <Spinner size="sm" /> : "اعمال تغییرات"}</Button>}</ModalFooter></Modal>;
}

export default function BaleSchoolsPage() {
  document.title = "مدیریت مجموعه‌های بله | داشبورد سرآمد";
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0 });
  const [search, setSearch] = useState("");
  const [enabled, setEnabled] = useState("");
  const [selected, setSelected] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async (page = 1) => { setLoading(true); setError(""); try { const result = await getBaleSchools({ page, limit: meta.limit, search, enabled }); setItems(result.items); setMeta(result.pagination); } catch (caught) { setError(apiError(caught, "دریافت مجموعه‌ها انجام نشد.")); } finally { setLoading(false); } }, [meta.limit, search, enabled]);
  useEffect(() => { const timer = setTimeout(() => load(1), 350); return () => clearTimeout(timer); }, [load]);

  const pageIds = items.map((item) => item.schoolId || item.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const toggleSchool = (id, checked) => setSelectedIds((current) => checked ? Array.from(new Set([...current, id])).slice(0, 500) : current.filter((item) => item !== id));
  return <div className="page-content"><div className="container-fluid"><Breadcrumbs title="یکپارچه‌سازی بله" breadcrumbItem="مدیریت مجموعه‌ها" /><Card><CardHeader><Row className="g-2"><Col md="7"><Label className="visually-hidden" for="bale-school-search">جست‌وجو</Label><Input id="bale-school-search" placeholder="نام یا کد مجموعه" value={search} onChange={(event) => setSearch(event.target.value)} /></Col><Col md="3"><Input aria-label="وضعیت اتصال" type="select" value={enabled} onChange={(event) => setEnabled(event.target.value)}><option value="">همه وضعیت‌ها</option><option value="true">فعال</option><option value="false">غیرفعال</option></Input></Col><Col md="2"><Can permission="bale.admin.settings.update"><Button color="primary" block disabled={!selectedIds.length} onClick={() => setBulkOpen(true)}>تغییر گروهی ({selectedIds.length.toLocaleString("fa-IR")})</Button></Can></Col></Row></CardHeader><CardBody>
    {loading ? <div className="text-center py-5"><Spinner /></div> : error ? <div className="alert alert-danger">{error} <Button size="sm" onClick={() => load(meta.page)}>تلاش مجدد</Button></div> : !items.length ? <div className="text-center text-muted py-5">مجموعه‌ای یافت نشد.</div> : <div className="table-responsive"><table className="table table-bordered align-middle"><thead><tr><th><Input aria-label="انتخاب همه مجموعه‌های صفحه" type="checkbox" checked={allPageSelected} onChange={(event) => setSelectedIds((current) => event.target.checked ? Array.from(new Set([...current, ...pageIds])).slice(0, 500) : current.filter((id) => !pageIds.includes(id)))} /></th><th>مجموعه</th><th>Integration</th><th>Bot</th><th>Mini App</th><th>Safir</th><th><span className="visually-hidden">عملیات</span></th></tr></thead><tbody>{items.map((item) => { const id = item.schoolId || item.id; return <tr key={id}><td><Input aria-label={`انتخاب ${item.name || item.schoolName}`} type="checkbox" checked={selectedIds.includes(id)} onChange={(event) => toggleSchool(id, event.target.checked)} /></td><td>{item.name || item.schoolName}<small className="d-block text-muted">{item.code || item.schoolCode}</small></td>{[item.enabled ?? item.isEnabled, item.botEnabled, item.miniAppEnabled, item.safirEnabled].map((value, index) => <td key={index}><Badge color={value ? "success" : "secondary"}>{value ? "فعال" : "غیرفعال"}</Badge></td>)}<td><Can permission="bale.admin.settings.show"><Button size="sm" onClick={() => setSelected(id)}>تنظیمات</Button></Can></td></tr>; })}</tbody></table></div>}
    {!loading && !error && items.length > 0 && <Paginations perPageData={meta.limit} data={items} totalRecords={meta.total} currentPage={meta.page} setCurrentPage={load} isShowingPageLength />}
  </CardBody></Card>{selected && <SettingsModal schoolId={selected} onClose={() => setSelected(null)} onSaved={() => { setSelected(null); load(meta.page); }} />}{bulkOpen && <BulkSettingsModal schoolIds={selectedIds} onClose={() => setBulkOpen(false)} onSaved={() => { setSelectedIds([]); load(meta.page); }} />}</div></div>;
}
