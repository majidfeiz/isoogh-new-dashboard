import React, { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner, Table } from "reactstrap";
import { createBillingInvoice, getBillingInvoicePreview } from "../../services/billingService.jsx";
import { billingErrorMessage, formatJalali, invalidateBillingCache, invalidateCapacityReport, tomanToRial } from "./billingUtils.js";
import { formatBillingPeriodRange } from "./billingPeriodDate.js";

const emptySnapshot = { fullName: "", nationalId: "", companyName: "", nationalCode: "", address: "" };
const PAGE_SIZE = 20;
export const billingPreviewKey = ({ schoolId, durationMonths, adviserId = null }) => ["billing", "invoice-preview", Number(schoolId), Number(durationMonths), adviserId == null ? null : Number(adviserId)];
const minimumTarget = (adviser, included) => Math.max(Number(included) || 0, Number(adviser?.peakStudentCount) || 0);
const unixDate = (value) => value == null ? "—" : formatJalali(Number(value) < 1_000_000_000_000 ? Number(value) * 1000 : Number(value));
const isPartMonth = (form, month) => {
  const start = form.formStartAt == null ? null : Number(form.formStartAt);
  const end = form.formEndAt == null ? null : Number(form.formEndAt);
  return (start != null && start > Number(month.startUnix)) || (end != null && end < Number(month.endExclusiveUnix));
};

function UsageDetails({ adviser, period }) {
  return <details className="border rounded bg-light p-2 mt-2"><summary className="fw-semibold" style={{ cursor: "pointer" }}>مبنای محاسبه</summary><div className="pt-3">
    <Alert color="info" className="py-2">دانش‌آموز تکراری بین فرم‌ها فقط یک‌بار در عدد ماهانه محاسبه شده است؛ جمع تعداد فرم‌ها لزوماً برابر مقدار یکتا نیست.</Alert>
    {(adviser.months || []).map((month, index) => { const periodMonth = period?.months?.[index] || {}; return <div className="border rounded p-2 mb-2" key={`${month.jalaliLabel}-${index}`}><div className="d-flex flex-wrap justify-content-between gap-2 mb-2"><strong>{month.jalaliLabel || periodMonth.jalaliLabel || "ماه دوره"}</strong><span className="text-muted">{Number(month.distinctStudentCount || 0).toLocaleString("fa-IR")} دانش‌آموز یکتا — {Number(month.contributingFormCount || 0).toLocaleString("fa-IR")} فرم</span></div>
      {(month.forms || []).length ? <div className="table-responsive"><Table bordered size="sm" className="mb-0"><thead><tr><th>فرم تماس</th><th>شروع شمسی</th><th>پایان شمسی</th><th>دانش‌آموز فرم</th></tr></thead><tbody>{month.forms.map((item) => <tr key={item.formId}><td>{item.formTitle || `فرم ${item.formId}`}{isPartMonth(item, periodMonth) && <Badge color="warning" className="me-2">فعال در بخشی از ماه</Badge>}</td><td>{unixDate(item.formStartAt)}</td><td>{unixDate(item.formEndAt)}</td><td>{Number(item.studentCount || 0).toLocaleString("fa-IR")}</td></tr>)}</tbody></Table></div> : <div className="text-center text-muted py-3">در این ماه فرم مؤثری ثبت نشده است.</div>}
    </div>; })}
  </div></details>;
}

export default function InvoiceCreateModal({ open, toggle, schools, fixedSchoolId, allowOverrides = false, onCreated }) {
  const [form, setForm] = useState({ schoolId: fixedSchoolId || "", durationMonths: 1, customerType: "individual", customerSnapshot: emptySnapshot, advisers: {} });
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewRevision, setPreviewRevision] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [manualPricing, setManualPricing] = useState(false);
  const [discountToman, setDiscountToman] = useState("");
  const [adjustmentNote, setAdjustmentNote] = useState("");

  useEffect(() => { if (open) { setForm((current) => ({ ...current, schoolId: fixedSchoolId || current.schoolId, advisers: {} })); setManualPricing(false); setDiscountToman(""); setAdjustmentNote(""); setSearch(""); setPage(1); setError(""); } }, [open, fixedSchoolId]);
  useEffect(() => {
    if (!open || !form.schoolId) { setPreview(null); setPreviewError(""); return undefined; }
    let active = true; const controller = new AbortController();
    setPreviewLoading(true); setPreviewError(""); setPreview(null);
    getBillingInvoicePreview({ schoolId: form.schoolId, durationMonths: form.durationMonths, signal: controller.signal }).then((result) => {
      if (!active) return; setPreview(result);
      setForm((current) => { const next = {}; result.advisers.forEach((adviser) => { const key = String(adviser.adviserId); const previous = current.advisers[key]; next[key] = { ...previous, selected: previous?.selected || false, targetStudentCapacity: previous?.targetStudentCapacity ?? adviser.suggestedTargetCapacity }; }); return { ...current, advisers: next }; });
    }).catch((requestError) => { if (active && requestError?.code !== "ERR_CANCELED") setPreviewError(billingErrorMessage(requestError)); }).finally(() => { if (active) setPreviewLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [form.durationMonths, form.schoolId, open, previewRevision]);

  const filtered = useMemo(() => { const query = search.trim().toLocaleLowerCase("fa-IR"); return (preview?.advisers || []).filter((item) => !query || String(item.adviserName || "").toLocaleLowerCase("fa-IR").includes(query)); }, [preview, search]);
  const lastPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { if (page > lastPage) setPage(lastPage); }, [lastPage, page]);
  const selected = useMemo(() => (preview?.advisers || []).filter((item) => form.advisers[String(item.adviserId)]?.selected), [form.advisers, preview]);
  const setSnapshot = (key, value) => setForm((current) => ({ ...current, customerSnapshot: { ...current.customerSnapshot, [key]: value } }));
  const setAdviserValue = (id, key, value) => setForm((current) => ({ ...current, advisers: { ...current.advisers, [id]: { ...current.advisers[id], [key]: value } } }));
  const toggleAdviser = (adviser) => { const key = String(adviser.adviserId); setForm((current) => ({ ...current, advisers: { ...current.advisers, [key]: { ...current.advisers[key], selected: !current.advisers[key]?.selected, targetStudentCapacity: current.advisers[key]?.targetStudentCapacity ?? adviser.suggestedTargetCapacity } } })); };
  const customerValid = form.customerType === "individual" ? form.customerSnapshot.fullName.trim() && form.customerSnapshot.nationalId.trim() : form.customerSnapshot.companyName.trim() && form.customerSnapshot.nationalCode.trim();
  const targetsValid = selected.every((item) => Number(form.advisers[String(item.adviserId)]?.targetStudentCapacity) >= minimumTarget(item, preview?.includedStudents));
  const hasManual = manualPricing && selected.some((item) => form.advisers[String(item.adviserId)]?.manualFinalAmountToman !== "");
  const discountValid = discountToman === "" || (Number(discountToman) >= 0 && Number.isInteger(Number(discountToman)));
  const adjustmentRequired = hasManual || Number(discountToman) > 0;
  const valid = preview && !previewLoading && !previewError && customerValid && selected.length > 0 && targetsValid && discountValid && (!adjustmentRequired || adjustmentNote.trim().length >= 3);

  const submit = async (event) => {
    event.preventDefault(); if (!valid || submitting) return; setSubmitting(true); setError("");
    const snapshot = form.customerType === "individual" ? { fullName: form.customerSnapshot.fullName.trim(), nationalId: form.customerSnapshot.nationalId.trim(), address: form.customerSnapshot.address.trim() || undefined } : { companyName: form.customerSnapshot.companyName.trim(), nationalCode: form.customerSnapshot.nationalCode.trim(), address: form.customerSnapshot.address.trim() || undefined };
    try {
      const payload = { schoolId: Number(form.schoolId), durationMonths: Number(form.durationMonths), customerType: form.customerType, customerSnapshot: snapshot, advisers: selected.map((item) => { const value = form.advisers[String(item.adviserId)]; return { adviserId: Number(item.adviserId), targetStudentCapacity: Number(value.targetStudentCapacity), ...(allowOverrides && manualPricing && value.manualFinalAmountToman !== "" ? { manualFinalAmount: tomanToRial(value.manualFinalAmountToman) } : {}) }; }) };
      if (allowOverrides && Number(discountToman) > 0) payload.discountAmount = tomanToRial(discountToman);
      if (allowOverrides && adjustmentRequired) payload.adjustmentNote = adjustmentNote.trim();
      await createBillingInvoice(payload); invalidateBillingCache(); invalidateCapacityReport(); window.dispatchEvent(new CustomEvent("billing-invoice-preview:invalidate")); onCreated?.(); toggle();
    } catch (submitError) { setError(billingErrorMessage(submitError)); } finally { setSubmitting(false); }
  };

  return <Modal isOpen={open} toggle={submitting ? undefined : toggle} centered size="xl" dir="rtl"><form onSubmit={submit}><ModalHeader toggle={submitting ? undefined : toggle}>صدور فاکتور دوره‌ای</ModalHeader><ModalBody>
    {error && <Alert color="danger">{error}</Alert>}
    <FormGroup><Label for="billing-school">مجموعه</Label><Input id="billing-school" type="select" value={form.schoolId} disabled={!!fixedSchoolId} onChange={(event) => { setForm({ ...form, schoolId: event.target.value, advisers: {} }); setPage(1); }} required><option value="">انتخاب کنید</option>{schools.map((item) => <option key={item.id} value={item.id}>{item.name || item.title}</option>)}</Input></FormGroup>
    <FormGroup><Label for="billing-duration">مدت اشتراک</Label><Input id="billing-duration" type="select" value={form.durationMonths} onChange={(event) => { setForm({ ...form, durationMonths: Number(event.target.value), advisers: {} }); setPage(1); }}><option value={1}>یک‌ماهه</option><option value={3}>سه‌ماهه</option></Input></FormGroup>
    {previewLoading && <div aria-label="در حال دریافت پیش‌نمایش" className="border rounded p-3 mb-3"><span className="placeholder col-5 mb-3" /><span className="placeholder col-12 mb-2" /><span className="placeholder col-12 mb-2" /></div>}
    {previewError && <Alert color="danger">{previewError}<Button type="button" color="link" onClick={() => setPreviewRevision((value) => value + 1)}>تلاش دوباره</Button></Alert>}
    {preview && !previewLoading && <><div className="border rounded p-3 mb-3 bg-light"><div className="d-flex flex-wrap justify-content-between gap-2"><div><small className="text-muted d-block">دوره صورتحساب</small><strong>{preview.period?.jalaliLabel || "—"}</strong><small className="d-block mt-1">{formatBillingPeriodRange(preview.period?.periodStart, preview.period?.periodEnd)}</small></div><div><small className="text-muted d-block">ماه‌های دوره</small><strong>{(preview.period?.months || []).map((item) => item.jalaliLabel).join("، ") || "—"}</strong></div><div><small className="text-muted d-block">ظرفیت پایه</small><strong>{Number(preview.includedStudents || 0).toLocaleString("fa-IR")}</strong></div></div></div>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-2"><div><Label for="billing-adviser-search" className="mb-0">مشاورها</Label><small className="text-muted d-block">ظرفیت و مصرف صرفاً از پیش‌نمایش backend نمایش داده می‌شود.</small></div><Input id="billing-adviser-search" type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="جستجوی نام مشاور…" style={{ maxWidth: 320 }} /></div>
      <div className="d-flex flex-column gap-2">{visible.map((adviser) => { const key = String(adviser.adviserId); const value = form.advisers[key] || {}; const minimum = minimumTarget(adviser, preview.includedStudents); return <div className={`border rounded p-3 ${value.selected ? "border-primary" : ""}`} key={adviser.adviserId}><div className="d-flex flex-wrap align-items-center gap-3"><Input aria-label={`انتخاب ${adviser.adviserName}`} type="checkbox" checked={!!value.selected} onChange={() => toggleAdviser(adviser)} /><div className="flex-grow-1"><strong>{adviser.adviserName || `مشاور ${adviser.adviserId}`}</strong><div className="d-flex flex-wrap gap-3 small text-muted mt-1"><span>ظرفیت فعلی: {Number(adviser.currentCapacity || 0).toLocaleString("fa-IR")}</span><span>بیشترین مصرف ماهانه: {Number(adviser.peakStudentCount || 0).toLocaleString("fa-IR")}</span><span>ظرفیت پیشنهادی: {Number(adviser.suggestedTargetCapacity || 0).toLocaleString("fa-IR")}</span></div></div><div style={{ minWidth: 190 }}><Label for={`target-${key}`} className="small">ظرفیت دوره</Label><Input id={`target-${key}`} type="number" min={minimum} disabled={!value.selected} value={value.targetStudentCapacity ?? adviser.suggestedTargetCapacity ?? minimum} onChange={(event) => setAdviserValue(key, "targetStudentCapacity", event.target.value)} invalid={!!value.selected && Number(value.targetStudentCapacity) < minimum} /><small className="text-muted">حداقل {minimum.toLocaleString("fa-IR")}</small></div>{allowOverrides && manualPricing && <div style={{ minWidth: 210 }}><Label for={`manual-${key}`} className="small">مبلغ دستی کل دوره (تومان)</Label><Input id={`manual-${key}`} type="number" min="1" disabled={!value.selected} value={value.manualFinalAmountToman ?? ""} onChange={(event) => setAdviserValue(key, "manualFinalAmountToman", event.target.value)} /></div>}</div><UsageDetails adviser={adviser} period={preview.period} /></div>; })}{!visible.length && <div className="text-center text-muted border rounded py-4">مشاوری یافت نشد.</div>}</div>
      <div className="d-flex justify-content-between align-items-center my-3"><small>{filtered.length.toLocaleString("fa-IR")} مشاور — {selected.length.toLocaleString("fa-IR")} انتخاب‌شده</small><div><Button type="button" size="sm" color="light" className="ms-2" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>قبلی</Button><span>{page.toLocaleString("fa-IR")} از {lastPage.toLocaleString("fa-IR")}</span><Button type="button" size="sm" color="light" className="me-2" disabled={page >= lastPage} onClick={() => setPage((value) => value + 1)}>بعدی</Button></div></div></>}
    <FormGroup><Label>نوع مشتری</Label><div><Input id="individual" type="radio" name="customerType" checked={form.customerType === "individual"} onChange={() => setForm({ ...form, customerType: "individual", customerSnapshot: emptySnapshot })} /> <Label for="individual" className="ms-3">حقیقی</Label><Input id="legal" type="radio" name="customerType" checked={form.customerType === "legal"} onChange={() => setForm({ ...form, customerType: "legal", customerSnapshot: emptySnapshot })} /> <Label for="legal">حقوقی</Label></div></FormGroup>
    {form.customerType === "individual" ? <><FormGroup><Label for="fullName">نام و نام خانوادگی</Label><Input id="fullName" value={form.customerSnapshot.fullName} onChange={(event) => setSnapshot("fullName", event.target.value)} required /></FormGroup><FormGroup><Label for="nationalId">کد ملی</Label><Input id="nationalId" inputMode="numeric" value={form.customerSnapshot.nationalId} onChange={(event) => setSnapshot("nationalId", event.target.value)} required /></FormGroup></> : <><FormGroup><Label for="companyName">نام شرکت</Label><Input id="companyName" value={form.customerSnapshot.companyName} onChange={(event) => setSnapshot("companyName", event.target.value)} required /></FormGroup><FormGroup><Label for="nationalCode">شناسه ملی</Label><Input id="nationalCode" inputMode="numeric" value={form.customerSnapshot.nationalCode} onChange={(event) => setSnapshot("nationalCode", event.target.value)} required /></FormGroup></>}
    <FormGroup><Label for="billing-address">نشانی (اختیاری)</Label><Input id="billing-address" value={form.customerSnapshot.address} onChange={(event) => setSnapshot("address", event.target.value)} /></FormGroup>
    {allowOverrides && <FormGroup switch><Input id="manual-pricing" type="switch" checked={manualPricing} onChange={(event) => setManualPricing(event.target.checked)} /><Label for="manual-pricing" check>قیمت‌گذاری دستی</Label></FormGroup>}
    {allowOverrides && <><FormGroup><Label for="invoice-discount">تخفیف کل فاکتور (تومان)</Label><Input id="invoice-discount" type="number" min="0" step="1" value={discountToman} onChange={(event) => setDiscountToman(event.target.value)} invalid={!discountValid} /></FormGroup><FormGroup><Label for="adjustment-note">دلیل قیمت‌گذاری/تخفیف</Label><Input id="adjustment-note" type="textarea" value={adjustmentNote} onChange={(event) => setAdjustmentNote(event.target.value)} required={adjustmentRequired} minLength={adjustmentRequired ? 3 : undefined} invalid={adjustmentRequired && adjustmentNote.trim().length < 3} /></FormGroup></>}
    <Alert color="info" className="mb-0">تعداد مصرف، ظرفیت پیشنهادی و مبالغ نهایی فقط توسط backend تعیین می‌شوند و پس از صدور در سند فاکتور ثبت خواهند شد.</Alert>
  </ModalBody><ModalFooter><Button type="button" color="secondary" onClick={toggle} disabled={submitting}>انصراف</Button><Button color="primary" type="submit" disabled={!valid || submitting || previewLoading}>{submitting && <Spinner size="sm" className="ms-1" />}صدور فاکتور</Button></ModalFooter></form></Modal>;
}
