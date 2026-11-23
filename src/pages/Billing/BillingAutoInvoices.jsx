import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Badge, Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner, Table } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import DeleteModal from "../../components/Common/DeleteModal.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getAdvisers } from "../../services/adviserService.jsx";
import { addAutoInvoiceAdviser, createAutoInvoice, executeAutoInvoices, getAutoInvoices, updateAutoInvoice } from "../../services/billingService.jsx";
import { SchoolPicker } from "../IncomingCalls/IncomingCallsCommon.jsx";
import { billingErrorMessage, formatRial, getUserSchoolId, invalidateBillingCache, moneyDisplay } from "./billingUtils.js";
import PricingRuleSummary from "./PricingRuleSummary.jsx";

const fixedLine = () => ({ description: "", quantity: 1, unitAmount: "" });
const emptyForm = () => ({ id: null, name: "", isActive: true, jalaliDay: 1, dueDays: 7, customerType: "legal", customerSnapshot: {}, adviserCount: "", originalAdviserCount: null, adviserMonthlyAmount: "", includedStudentsPerAdviser: 200, items: [] });
const newAttemptKey = () => globalThis.crypto?.randomUUID?.() || `billing-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const readContract = (item = {}) => ({ adviserCount: item.adviserCount ?? item.contractedAdviserCount ?? item.contracted_adviser_count ?? "", adviserMonthlyAmount: item.adviserMonthlyAmount ?? item.adviser_monthly_amount ?? "", includedStudentsPerAdviser: item.includedStudentsPerAdviser ?? item.included_students_per_adviser ?? 200 });
const completeLine = (item) => item.description.trim() && Number.isInteger(Number(item.quantity)) && Number(item.quantity) > 0 && Number.isInteger(Number(item.unitAmount)) && Number(item.unitAmount) > 0;
const completeContract = (form) => Number.isInteger(Number(form.adviserCount)) && Number(form.adviserCount) >= 1 && Number.isInteger(Number(form.adviserMonthlyAmount)) && Number(form.adviserMonthlyAmount) >= 1 && Number.isInteger(Number(form.includedStudentsPerAdviser)) && Number(form.includedStudentsPerAdviser) >= 1;

export default function BillingAutoInvoices() {
  const { user, selectedSchoolId, setSelectedSchoolId, hasPermission } = useAuth();
  const fixedSchoolId = getUserSchoolId(user) || "";
  const [schoolId, setSchoolId] = useState(String(fixedSchoolId || selectedSchoolId || ""));
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [executeConfirm, setExecuteConfirm] = useState(false);
  const [adviserModal, setAdviserModal] = useState(null);
  const [advisers, setAdvisers] = useState([]);
  const [adviserForm, setAdviserForm] = useState({ adviserId: "", targetStudentCapacity: 200 });
  const [adviserResult, setAdviserResult] = useState(null);
  const [adviserError, setAdviserError] = useState("");
  const [adviserBusy, setAdviserBusy] = useState(false);
  const attemptKey = useRef("");

  useEffect(() => { if (!schoolId && (fixedSchoolId || selectedSchoolId)) setSchoolId(String(fixedSchoolId || selectedSchoolId)); }, [fixedSchoolId, schoolId, selectedSchoolId]);
  const load = useCallback(async () => {
    if (!schoolId) { setItems([]); return; }
    setLoading(true); setError("");
    try { const result = await getAutoInvoices(schoolId); setItems(Array.isArray(result) ? result : result?.items || []); }
    catch (caught) { setItems([]); setError(billingErrorMessage(caught)); }
    finally { setLoading(false); }
  }, [schoolId]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { const refresh = () => load(); window.addEventListener("billing-auto-invoices:invalidate", refresh); return () => window.removeEventListener("billing-auto-invoices:invalidate", refresh); }, [load]);

  const selectSchool = (value) => { setSchoolId(value); setSelectedSchoolId(value); };
  const setSnapshot = (key, value) => setForm((current) => ({ ...current, customerSnapshot: { ...current.customerSnapshot, [key]: value } }));
  const changeLine = (index, key, value) => setForm((current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }));
  const addLine = () => setForm((current) => ({ ...current, items: [...current.items, fixedLine()] }));
  const removeLine = (index) => setForm((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }));
  const hasContract = completeContract(form);
  const hasContractInput = form.adviserCount !== "" || form.adviserMonthlyAmount !== "";
  const hasLines = form.items.length > 0 && form.items.every(completeLine);
  const valid = Boolean(schoolId && form.name.trim() && Number(form.jalaliDay) >= 1 && Number(form.jalaliDay) <= 31 && Number(form.dueDays) >= 1 && (hasContract || hasLines) && (!hasContractInput || hasContract) && (!form.items.length || hasLines));

  const submit = async (event) => {
    event.preventDefault(); if (busy) return; setFormError("");
    if (form.id && form.originalAdviserCount != null && Number(form.adviserCount) > Number(form.originalAdviserCount)) { setFormError("افزایش تعداد مشاور از ویرایش تنظیم مجاز نیست؛ از اکشن «افزودن مشاور به قرارداد» استفاده کنید."); return; }
    if (!valid) { setFormError("حداقل یک قرارداد کامل مشاور یا یک ردیف ثابت معتبر وارد کنید."); return; }
    setBusy(true); setError("");
    const payload = { schoolId: Number(schoolId), name: form.name.trim(), dayOfJalaliMonth: Number(form.jalaliDay), dueDays: Number(form.dueDays), customerType: form.customerType, customerSnapshot: form.customerSnapshot, ...(hasContract ? { adviserCount: Number(form.adviserCount), adviserMonthlyAmount: Number(form.adviserMonthlyAmount), includedStudentsPerAdviser: Number(form.includedStudentsPerAdviser) } : {}), items: form.items.map((item) => ({ description: item.description.trim(), quantity: Number(item.quantity), unitAmount: Number(item.unitAmount) })) };
    try { form.id ? await updateAutoInvoice(form.id, payload) : await createAutoInvoice(payload); setForm(emptyForm()); invalidateBillingCache(); await load(); }
    catch (caught) { setError(billingErrorMessage(caught)); }
    finally { setBusy(false); }
  };
  const execute = async () => { if (busy) return; setBusy(true); setError(""); try { await executeAutoInvoices(); setExecuteConfirm(false); invalidateBillingCache(); await load(); } catch (caught) { setError(billingErrorMessage(caught)); } finally { setBusy(false); } };
  const edit = (item) => { const contract = readContract(item); setForm({ ...emptyForm(), ...item, ...contract, originalAdviserCount: contract.adviserCount === "" ? null : Number(contract.adviserCount), jalaliDay: item.jalaliDay ?? item.jalali_day ?? item.dayOfJalaliMonth ?? item.day_of_jalali_month ?? 1, dueDays: item.dueDays ?? item.due_days ?? 7, customerType: item.customerType || item.customer_type || "legal", customerSnapshot: item.customerSnapshot || item.customer_snapshot || {}, items: (item.items || []).map((entry) => ({ description: entry.description || "", quantity: entry.quantity ?? 1, unitAmount: entry.unitAmount ?? entry.unit_amount ?? "" })) }); setFormError(""); };

  const openAdviser = async (schedule) => {
    const contract = readContract(schedule); setAdviserModal({ ...schedule, ...contract }); setAdviserForm({ adviserId: "", targetStudentCapacity: Number(contract.includedStudentsPerAdviser) || 200 }); setAdviserResult(null); setAdviserError(""); attemptKey.current = newAttemptKey();
    try { const result = await getAdvisers({ schoolId, page: 1, limit: 100, sortBy: "name", sortOrder: "ASC" }); setAdvisers(result.items || []); } catch (caught) { setAdviserError(billingErrorMessage(caught)); }
  };
  const closeAdviser = () => { if (adviserBusy) return; setAdviserModal(null); setAdviserResult(null); attemptKey.current = ""; };
  const addAdviser = async (event) => {
    event.preventDefault(); if (adviserBusy || !adviserForm.adviserId || Number(adviserForm.targetStudentCapacity) < Number(adviserModal.includedStudentsPerAdviser || 200)) return;
    setAdviserBusy(true); setAdviserError("");
    try { const result = await addAutoInvoiceAdviser(adviserModal.id, { schoolId, adviserId: adviserForm.adviserId, targetStudentCapacity: adviserForm.targetStudentCapacity, idempotencyKey: attemptKey.current }); setAdviserResult(result); invalidateBillingCache(); await load(); }
    catch (caught) { setAdviserError(caught?.response?.status === 409 ? (caught?.response?.data?.message || "برای این مشاور اشتراک فعال یا فاکتور در انتظار پرداخت وجود دارد؛ فاکتور تکراری ساخته نشد.") : billingErrorMessage(caught)); }
    finally { setAdviserBusy(false); }
  };

  const contractSummary = hasContract ? Number(form.adviserCount) * Number(form.adviserMonthlyAmount) : null;
  const resultInvoice = adviserResult?.invoice || adviserResult;
  const resultSnapshot = resultInvoice?.pricingSnapshot || resultInvoice?.pricing_snapshot || resultInvoice?.items?.[0]?.pricingSnapshot || resultInvoice?.items?.[0]?.pricing_snapshot;

  return <div className="page-content" dir="rtl"><div className="container-fluid"><Breadcrumbs title="مالی و اشتراک" breadcrumbItem="صدور خودکار" />
    <Card><CardBody>{fixedSchoolId ? <div><Label>مجموعه</Label><div className="form-control bg-light"><i className="bx bx-buildings text-primary ms-2" />{user?.schoolName || user?.school_name || user?.school?.name || "مجموعه من"} <Badge color="primary" className="float-start">انتخاب خودکار</Badge></div></div> : <SchoolPicker value={schoolId} onChange={selectSchool} />}</CardBody></Card>
    {error && <Alert color="danger" aria-live="polite">{error}</Alert>}
    {schoolId && <><Card><CardHeader className="d-flex justify-content-between align-items-center"><strong>تنظیمات صدور خودکار</strong>{hasPermission("billing.auto-invoices.execute") && <Button size="sm" color="warning" onClick={() => setExecuteConfirm(true)} disabled={busy}>اجرای دستی</Button>}</CardHeader><CardBody>{loading ? <div className="text-center py-4"><Spinner /></div> : items.length ? <div className="table-responsive"><Table hover className="align-middle"><thead><tr><th>نام</th><th>وضعیت</th><th>قرارداد مشاور</th><th>روز صدور</th><th>آخرین دوره</th><th /></tr></thead><tbody>{items.map((item) => { const contract = readContract(item); const active = item.isActive ?? item.is_active; return <tr key={item.id}><td>{item.name}</td><td><Badge color={active ? "success" : "secondary"}>{active ? "فعال" : "غیرفعال"}</Badge></td><td>{contract.adviserCount === "" ? "—" : <><strong>{Number(contract.adviserCount).toLocaleString("fa-IR")} مشاور</strong><div className="small text-muted">هر مشاور {moneyDisplay(contract.adviserMonthlyAmount)}؛ ظرفیت پایه {Number(contract.includedStudentsPerAdviser).toLocaleString("fa-IR")}</div></>}</td><td>{Number(item.jalaliDay ?? item.jalali_day ?? item.dayOfJalaliMonth ?? item.day_of_jalali_month).toLocaleString("fa-IR")}</td><td>{item.lastIssuedPeriod || item.last_issued_period || "هنوز صادر نشده"}</td><td><div className="d-flex gap-1 flex-wrap">{hasPermission("billing.auto-invoices.manage") && <Button size="sm" outline color="primary" onClick={() => edit(item)}>ویرایش</Button>}{hasPermission("billing.auto-invoices.manage") && active && contract.adviserCount !== "" && <Button size="sm" color="success" onClick={() => openAdviser(item)}>افزودن مشاور به قرارداد</Button>}</div></td></tr>; })}</tbody></Table></div> : <div className="text-muted text-center py-4">تنظیمی ثبت نشده است.</div>}</CardBody></Card>
      {hasPermission("billing.auto-invoices.manage") && <Card><CardHeader><strong>{form.id ? "ویرایش تنظیم" : "تنظیم جدید"}</strong></CardHeader><CardBody><form onSubmit={submit} noValidate>
        {formError && <Alert color="warning">{formError}</Alert>}
        <Row><FormGroup tag={Col} lg={4}><Label for="schedule-name">نام تنظیم</Label><Input id="schedule-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></FormGroup><FormGroup tag={Col} md={3} lg={2}><Label for="jalali-day">روز ماه شمسی</Label><Input id="jalali-day" type="number" min="1" max="31" value={form.jalaliDay} onChange={(event) => setForm({ ...form, jalaliDay: event.target.value })} /></FormGroup><FormGroup tag={Col} md={3} lg={2}><Label for="due-days">مهلت پرداخت</Label><Input id="due-days" type="number" min="1" value={form.dueDays} onChange={(event) => setForm({ ...form, dueDays: event.target.value })} /></FormGroup><FormGroup tag={Col} md={4} lg={2}><Label>نوع مشتری</Label><Input type="select" value={form.customerType} onChange={(event) => setForm({ ...form, customerType: event.target.value, customerSnapshot: {} })}><option value="legal">حقوقی</option><option value="individual">حقیقی</option></Input></FormGroup><FormGroup tag={Col} md={2} className="d-flex align-items-center pt-4" switch><Input type="switch" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /><Label check>فعال</Label></FormGroup></Row>
        {form.customerType === "legal" && <Row><FormGroup tag={Col} md={6}><Label>نام شرکت</Label><Input value={form.customerSnapshot.companyName || ""} onChange={(event) => setSnapshot("companyName", event.target.value)} /></FormGroup><FormGroup tag={Col} md={6}><Label>شناسه ملی</Label><Input value={form.customerSnapshot.nationalCode || ""} onChange={(event) => setSnapshot("nationalCode", event.target.value)} /></FormGroup></Row>}
        <Card className="border"><CardHeader><strong>قرارداد ماهانه مشاوران</strong></CardHeader><CardBody><Row><FormGroup tag={Col} md={4}><Label for="adviser-count">تعداد مشاور قراردادی</Label><Input id="adviser-count" type="number" min="1" step="1" value={form.adviserCount} onChange={(e) => setForm({ ...form, adviserCount: e.target.value })} /></FormGroup><FormGroup tag={Col} md={4}><Label for="adviser-monthly-amount">مبلغ ماهانه هر مشاور (ریال)</Label><Input id="adviser-monthly-amount" type="number" min="1" step="1" value={form.adviserMonthlyAmount} onChange={(e) => setForm({ ...form, adviserMonthlyAmount: e.target.value })} /></FormGroup><FormGroup tag={Col} md={4}><Label for="included-per-adviser">ظرفیت پایه هر مشاور</Label><Input id="included-per-adviser" type="number" min="1" step="1" value={form.includedStudentsPerAdviser} onChange={(e) => setForm({ ...form, includedStudentsPerAdviser: e.target.value })} /></FormGroup></Row>{contractSummary != null && <Alert color="info" className="mb-0"><strong>{Number(form.adviserCount).toLocaleString("fa-IR")} مشاور × {moneyDisplay(form.adviserMonthlyAmount)} = {moneyDisplay(contractSummary)}</strong><div>مبلغ پایه ماهانه قرارداد؛ ظرفیت پایه هر مشاور داخل همین مبلغ است.</div></Alert>}</CardBody></Card>
        <div className="d-flex justify-content-between align-items-center mb-2"><strong>ردیف‌های ثابت فاکتور (اختیاری)</strong><Button type="button" size="sm" color="success" outline onClick={addLine}><i className="bx bx-plus ms-1" />افزودن ردیف</Button></div>
        {!form.items.length && <div className="text-muted mb-3">ردیف ثابتی تعریف نشده است.</div>}
        {form.items.map((item, index) => <Row key={index} className="border rounded p-2 mb-2 align-items-end"><FormGroup tag={Col} lg={5}><Label>شرح</Label><Input value={item.description} onChange={(event) => changeLine(index, "description", event.target.value)} /></FormGroup><FormGroup tag={Col} md={3} lg={2}><Label>تعداد</Label><Input type="number" min="1" step="1" value={item.quantity} onChange={(event) => changeLine(index, "quantity", event.target.value)} /></FormGroup><FormGroup tag={Col} md={6} lg={3}><Label>مبلغ واحد (ریال)</Label><Input type="number" min="1" step="1" value={item.unitAmount} onChange={(event) => changeLine(index, "unitAmount", event.target.value)} /><small className="text-muted">{item.unitAmount ? formatRial(item.unitAmount) : "—"}</small></FormGroup><Col md={3} lg={2} className="mb-3"><Button type="button" color="danger" outline className="w-100" onClick={() => removeLine(index)}>حذف</Button></Col></Row>)}
        <div className="d-flex gap-2"><Button color="primary" type="submit" disabled={busy}>{busy ? <><Spinner size="sm" className="ms-1" />در حال ذخیره…</> : "ذخیره تنظیم"}</Button>{form.id && <Button type="button" color="light" onClick={() => setForm(emptyForm())}>انصراف ویرایش</Button>}</div>
      </form></CardBody></Card>}
    </>}
    {!schoolId && <Alert color="info">مجموعه را انتخاب کنید.</Alert>}
    <DeleteModal show={executeConfirm} onCloseClick={() => !busy && setExecuteConfirm(false)} onDeleteClick={execute} loading={busy} message="صدور خودکار فاکتورهای سررسیدشده اجرا شود؟ نتیجه عملیات ممکن است چند فاکتور جدید ایجاد کند." confirmText="بله، اجرا کن" loadingText="در حال اجرا…" cancelText="انصراف" confirmColor="warning" icon="bx bx-calendar-check" />
    <Modal isOpen={Boolean(adviserModal)} toggle={closeAdviser} centered size="lg"><form onSubmit={addAdviser}><ModalHeader toggle={closeAdviser}>افزودن مشاور به قرارداد</ModalHeader><ModalBody>{adviserError && <Alert color="danger">{adviserError}</Alert>}{adviserResult ? <><Alert color="success">فاکتور مشاور جدید صادر شد. تعداد قراردادی فقط پس از پرداخت موفق افزایش می‌یابد.</Alert><div className="border rounded p-3"><div className="mb-2"><strong>مبلغ قطعی فاکتور: </strong>{moneyDisplay(resultInvoice?.totalAmount ?? resultInvoice?.total_amount ?? resultInvoice?.finalAmount ?? resultInvoice?.final_amount)}</div><PricingRuleSummary snapshot={resultSnapshot} /></div></> : <><Alert color="info">مبلغ پایه و هزینه پله‌های اضافه توسط backend محاسبه می‌شود و تعداد قرارداد تا پیش از پرداخت تغییر نمی‌کند.</Alert><FormGroup><Label for="new-contract-adviser">مشاور</Label><Input id="new-contract-adviser" type="select" value={adviserForm.adviserId} onChange={(e) => setAdviserForm({ ...adviserForm, adviserId: e.target.value })}><option value="">انتخاب کنید</option>{advisers.map((adviser) => <option key={adviser.id} value={adviser.id}>{adviser.name || adviser.user?.name || adviser.fullName || `مشاور ${adviser.id}`}</option>)}</Input></FormGroup><FormGroup><Label for="target-student-capacity">ظرفیت کل هدف</Label><Input id="target-student-capacity" type="number" min={adviserModal?.includedStudentsPerAdviser || 200} step="1" value={adviserForm.targetStudentCapacity} onChange={(e) => setAdviserForm({ ...adviserForm, targetStudentCapacity: e.target.value })} /><small className="text-muted">ظرفیت پایه {Number(adviserModal?.includedStudentsPerAdviser || 200).toLocaleString("fa-IR")} نفر در مبلغ ماهانه مشاور قرار دارد؛ فقط ظرفیت بالاتر از آن به‌صورت پله اضافه قیمت‌گذاری می‌شود.</small></FormGroup></>}</ModalBody><ModalFooter><Button type="button" color="light" onClick={closeAdviser} disabled={adviserBusy}>بستن</Button>{!adviserResult && <Button color="success" type="submit" disabled={adviserBusy || !adviserForm.adviserId || Number(adviserForm.targetStudentCapacity) < Number(adviserModal?.includedStudentsPerAdviser || 200)}>{adviserBusy && <Spinner size="sm" className="ms-1" />}صدور فاکتور افزودن مشاور</Button>}</ModalFooter></form></Modal>
  </div></div>;
}
