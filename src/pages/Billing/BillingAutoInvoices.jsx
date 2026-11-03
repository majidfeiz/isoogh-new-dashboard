import React, { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Row, Spinner, Table } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import DeleteModal from "../../components/Common/DeleteModal.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { createAutoInvoice, executeAutoInvoices, getAutoInvoices, updateAutoInvoice } from "../../services/billingService.jsx";
import { SchoolPicker } from "../IncomingCalls/IncomingCallsCommon.jsx";
import { billingErrorMessage, formatRial, getUserSchoolId, invalidateBillingCache } from "./billingUtils.js";

const line = () => ({ description: "", quantity: 1, unitAmount: "" });
const emptyForm = () => ({ id: null, name: "", isActive: true, jalaliDay: 1, dueDays: 7, customerType: "legal", customerSnapshot: {}, items: [line()] });

export default function BillingAutoInvoices() {
  const { user, selectedSchoolId, setSelectedSchoolId, hasPermission } = useAuth();
  const fixedSchoolId = getUserSchoolId(user) || "";
  const [schoolId, setSchoolId] = useState(String(fixedSchoolId || selectedSchoolId || ""));
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [executeConfirm, setExecuteConfirm] = useState(false);

  useEffect(() => { if (!schoolId && (fixedSchoolId || selectedSchoolId)) setSchoolId(String(fixedSchoolId || selectedSchoolId)); }, [fixedSchoolId, schoolId, selectedSchoolId]);
  const load = useCallback(async () => {
    if (!schoolId) { setItems([]); return; }
    setLoading(true); setError("");
    try { const result = await getAutoInvoices(schoolId); setItems(Array.isArray(result) ? result : result?.items || []); }
    catch (caught) { setItems([]); setError(billingErrorMessage(caught)); }
    finally { setLoading(false); }
  }, [schoolId]);
  useEffect(() => { load(); }, [load]);

  const selectSchool = (value) => { setSchoolId(value); setSelectedSchoolId(value); };
  const setSnapshot = (key, value) => setForm((current) => ({ ...current, customerSnapshot: { ...current.customerSnapshot, [key]: value } }));
  const changeLine = (index, key, value) => setForm((current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }));
  const addLine = () => setForm((current) => ({ ...current, items: [...current.items, line()] }));
  const removeLine = (index) => setForm((current) => ({ ...current, items: current.items.length === 1 ? current.items : current.items.filter((_, itemIndex) => itemIndex !== index) }));
  const valid = Boolean(schoolId && form.name.trim() && Number(form.jalaliDay) >= 1 && Number(form.jalaliDay) <= 31 && Number(form.dueDays) >= 1 && form.items.length && form.items.every((item) => item.description.trim() && Number.isInteger(Number(item.quantity)) && Number(item.quantity) > 0 && Number.isInteger(Number(item.unitAmount)) && Number(item.unitAmount) > 0));

  const submit = async (event) => {
    event.preventDefault(); if (!valid || busy) return;
    setBusy(true); setError("");
    const payload = { schoolId: Number(schoolId), name: form.name.trim(), isActive: form.isActive, jalaliDay: Number(form.jalaliDay), dueDays: Number(form.dueDays), customerType: form.customerType, customerSnapshot: form.customerSnapshot, items: form.items.map((item) => ({ description: item.description.trim(), quantity: Number(item.quantity), unitAmount: Number(item.unitAmount) })) };
    try { form.id ? await updateAutoInvoice(form.id, payload) : await createAutoInvoice(payload); setForm(emptyForm()); invalidateBillingCache(); await load(); }
    catch (caught) { setError(billingErrorMessage(caught)); }
    finally { setBusy(false); }
  };

  const execute = async () => {
    if (busy) return; setBusy(true); setError("");
    try { await executeAutoInvoices(); setExecuteConfirm(false); invalidateBillingCache(); await load(); }
    catch (caught) { setError(billingErrorMessage(caught)); }
    finally { setBusy(false); }
  };
  const edit = (item) => setForm({ ...emptyForm(), ...item, jalaliDay: item.jalaliDay ?? item.jalali_day ?? 1, dueDays: item.dueDays ?? item.due_days ?? 7, customerType: item.customerType || item.customer_type || "legal", customerSnapshot: item.customerSnapshot || item.customer_snapshot || {}, items: (item.items?.length ? item.items : [line()]).map((entry) => ({ description: entry.description || "", quantity: entry.quantity ?? 1, unitAmount: entry.unitAmount ?? entry.unit_amount ?? "" })) });

  return <div className="page-content" dir="rtl"><div className="container-fluid"><Breadcrumbs title="مالی و اشتراک" breadcrumbItem="صدور خودکار" />
    <Card><CardBody>{fixedSchoolId ? <div><Label>مجموعه</Label><div className="form-control bg-light"><i className="bx bx-buildings text-primary ms-2" />{user?.schoolName || user?.school_name || user?.school?.name || "مجموعه من"} <Badge color="primary" className="float-start">انتخاب خودکار</Badge></div></div> : <SchoolPicker value={schoolId} onChange={selectSchool} />}</CardBody></Card>
    {error && <Alert color="danger" aria-live="polite">{error}</Alert>}
    {schoolId && <><Card><CardHeader className="d-flex justify-content-between align-items-center"><strong>تنظیمات صدور خودکار</strong>{hasPermission("billing.auto-invoices.execute") && <Button size="sm" color="warning" onClick={() => setExecuteConfirm(true)} disabled={busy}>اجرای دستی</Button>}</CardHeader><CardBody>{loading ? <div className="text-center py-4"><Spinner /></div> : items.length ? <div className="table-responsive"><Table hover className="align-middle"><thead><tr><th>نام</th><th>وضعیت</th><th>روز ماه شمسی</th><th>مهلت</th><th>آخرین دوره</th><th /></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.name}</td><td><Badge color={(item.isActive ?? item.is_active) ? "success" : "secondary"}>{(item.isActive ?? item.is_active) ? "فعال" : "غیرفعال"}</Badge></td><td>{Number(item.jalaliDay ?? item.jalali_day).toLocaleString("fa-IR")}</td><td>{Number(item.dueDays ?? item.due_days).toLocaleString("fa-IR")} روز</td><td>{item.lastIssuedPeriod || item.last_issued_period || "هنوز صادر نشده"}</td><td>{hasPermission("billing.auto-invoices.manage") && <Button size="sm" outline color="primary" onClick={() => edit(item)}>ویرایش</Button>}</td></tr>)}</tbody></Table></div> : <div className="text-muted text-center py-4">تنظیمی ثبت نشده است.</div>}</CardBody></Card>

      {hasPermission("billing.auto-invoices.manage") && <Card><CardHeader><strong>{form.id ? "ویرایش تنظیم" : "تنظیم جدید"}</strong></CardHeader><CardBody><form onSubmit={submit}>
        <Row><FormGroup tag={Col} lg={4}><Label>نام تنظیم</Label><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></FormGroup><FormGroup tag={Col} md={3} lg={2}><Label>روز ماه شمسی</Label><Input type="number" min="1" max="31" value={form.jalaliDay} onChange={(event) => setForm({ ...form, jalaliDay: event.target.value })} required /></FormGroup><FormGroup tag={Col} md={3} lg={2}><Label>مهلت پرداخت</Label><Input type="number" min="1" value={form.dueDays} onChange={(event) => setForm({ ...form, dueDays: event.target.value })} required /></FormGroup><FormGroup tag={Col} md={4} lg={2}><Label>نوع مشتری</Label><Input type="select" value={form.customerType} onChange={(event) => setForm({ ...form, customerType: event.target.value, customerSnapshot: {} })}><option value="legal">حقوقی</option><option value="individual">حقیقی</option></Input></FormGroup><FormGroup tag={Col} md={2} className="d-flex align-items-center pt-4" switch><Input type="switch" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /><Label check>فعال</Label></FormGroup></Row>
        {form.customerType === "legal" ? <Row><FormGroup tag={Col} md={6}><Label>نام شرکت</Label><Input value={form.customerSnapshot.companyName || ""} onChange={(event) => setSnapshot("companyName", event.target.value)} /></FormGroup><FormGroup tag={Col} md={6}><Label>شناسه ملی</Label><Input value={form.customerSnapshot.nationalCode || ""} onChange={(event) => setSnapshot("nationalCode", event.target.value)} /></FormGroup></Row> : <Row><FormGroup tag={Col} md={6}><Label>نام و نام خانوادگی</Label><Input value={form.customerSnapshot.fullName || ""} onChange={(event) => setSnapshot("fullName", event.target.value)} /></FormGroup><FormGroup tag={Col} md={6}><Label>کد ملی</Label><Input value={form.customerSnapshot.nationalId || ""} onChange={(event) => setSnapshot("nationalId", event.target.value)} /></FormGroup></Row>}
        <div className="d-flex justify-content-between align-items-center mb-2"><strong>ردیف‌های ثابت فاکتور</strong><Button type="button" size="sm" color="success" outline onClick={addLine}><i className="bx bx-plus ms-1" />افزودن ردیف</Button></div>
        {form.items.map((item, index) => <Row key={index} className="border rounded p-2 mb-2 align-items-end"><FormGroup tag={Col} lg={5}><Label>شرح</Label><Input value={item.description} onChange={(event) => changeLine(index, "description", event.target.value)} required /></FormGroup><FormGroup tag={Col} md={3} lg={2}><Label>تعداد</Label><Input type="number" min="1" step="1" value={item.quantity} onChange={(event) => changeLine(index, "quantity", event.target.value)} required /></FormGroup><FormGroup tag={Col} md={6} lg={3}><Label>مبلغ واحد (ریال)</Label><Input type="number" min="1" step="1" value={item.unitAmount} onChange={(event) => changeLine(index, "unitAmount", event.target.value)} required /><small className="text-muted">{item.unitAmount ? formatRial(item.unitAmount) : "—"}</small></FormGroup><Col md={3} lg={2} className="mb-3"><Button type="button" color="danger" outline className="w-100" disabled={form.items.length === 1} onClick={() => removeLine(index)}>حذف</Button></Col></Row>)}
        <div className="d-flex gap-2"><Button color="primary" type="submit" disabled={!valid || busy}>{busy ? <><Spinner size="sm" className="ms-1" />در حال ذخیره…</> : "ذخیره تنظیم"}</Button>{form.id && <Button type="button" color="light" onClick={() => setForm(emptyForm())}>انصراف ویرایش</Button>}</div>
      </form></CardBody></Card>}
    </>}
    {!schoolId && <Alert color="info">مجموعه را انتخاب کنید.</Alert>}
    <DeleteModal show={executeConfirm} onCloseClick={() => !busy && setExecuteConfirm(false)} onDeleteClick={execute} loading={busy} message="صدور خودکار فاکتورهای سررسیدشده اجرا شود؟ نتیجه عملیات ممکن است چند فاکتور جدید ایجاد کند." confirmText="بله، اجرا کن" loadingText="در حال اجرا…" cancelText="انصراف" confirmColor="warning" icon="bx bx-calendar-check" />
  </div></div>;
}
