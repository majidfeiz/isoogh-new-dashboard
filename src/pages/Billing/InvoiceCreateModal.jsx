import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner, Table } from "reactstrap";
import { createBillingInvoice, getBillingPricing } from "../../services/billingService.jsx";
import { getAdvisers } from "../../services/adviserService.jsx";
import { getAdviserFormCapacity } from "../../services/adviserFormCapacityService.jsx";
import { billingErrorMessage, calculateCapacitySteps, invalidateBillingCache, moneyDisplay, tomanToRial, validateInvoiceAdjustment } from "./billingUtils.js";

const emptySnapshot = { fullName: "", nationalId: "", companyName: "", nationalCode: "", address: "" };
const adviserName = (adviser) => adviser.fullName || adviser.name || adviser.user?.fullName || adviser.user?.name || `مشاور ${adviser.id}`;

export default function InvoiceCreateModal({ open, toggle, schools, fixedSchoolId, allowOverrides = false, onCreated }) {
  const [form, setForm] = useState({ schoolId: fixedSchoolId || "", durationMonths: 1, customerType: "individual", customerSnapshot: emptySnapshot, advisers: {} });
  const [advisers, setAdvisers] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [manualPricing, setManualPricing] = useState(false);
  const [discountToman, setDiscountToman] = useState("");
  const [adjustmentNote, setAdjustmentNote] = useState("");

  useEffect(() => { if (open) { setForm((current) => ({ ...current, schoolId: fixedSchoolId || current.schoolId })); setManualPricing(false); setDiscountToman(""); setAdjustmentNote(""); } }, [open, fixedSchoolId]);
  useEffect(() => {
    if (!open || !form.schoolId) { setAdvisers([]); setPricing(null); return; }
    let active = true; setOptionsLoading(true);
    Promise.all([getAdvisers({ schoolId: form.schoolId, page: 1, limit: 100 }), getAdviserFormCapacity({ schoolId: form.schoolId, page: 1, limit: 100 }), getBillingPricing()])
      .then(([adviserResult, capacityResult, pricingResult]) => {
        if (!active) return;
        const capacities = new Map();
        (capacityResult.items || []).forEach((row) => { const current = capacities.get(String(row.adviserId)); if (!current || row.activeStudents > current.activeStudents) capacities.set(String(row.adviserId), row); });
        setAdvisers((adviserResult.items || []).map((item) => ({ ...item, capacityInfo: capacities.get(String(item.id)) })));
        setPricing(pricingResult);
      }).catch(() => { if (active) { setAdvisers([]); setPricing(null); setError("دریافت اطلاعات ظرفیت با خطا مواجه شد."); } }).finally(() => { if (active) setOptionsLoading(false); });
    return () => { active = false; };
  }, [open, form.schoolId]);

  const setSnapshot = (key, value) => setForm((current) => ({ ...current, customerSnapshot: { ...current.customerSnapshot, [key]: value } }));
  const selectedAdvisers = useMemo(() => Object.entries(form.advisers).filter(([, value]) => value.selected), [form.advisers]);
  const previewRows = useMemo(() => selectedAdvisers.map(([adviserId, value]) => {
    const steps = calculateCapacitySteps(value.targetStudentCapacity, pricing?.includedStudents, pricing?.capacityStepPercent);
    const base = Number(pricing?.baseMonthlyAmount) || 0;
    const surcharge = pricing?.capacityStepAmount != null ? Number(pricing.capacityStepAmount) : base * (Number(pricing?.extraStepPercent) || 0) / 100;
    const calculated = (base + steps * surcharge) * Number(form.durationMonths || 1);
    const manual = manualPricing && value.manualFinalAmountToman !== "" ? tomanToRial(value.manualFinalAmountToman) : null;
    return { adviserId, calculated, final: manual ?? calculated };
  }), [selectedAdvisers, pricing, form.durationMonths, manualPricing]);
  const previewSubtotal = previewRows.reduce((sum, row) => sum + row.final, 0);
  const discountRial = discountToman === "" ? 0 : tomanToRial(discountToman);
  const hasManualAmount = manualPricing && selectedAdvisers.some(([, value]) => value.manualFinalAmountToman !== "");
  const hasAdjustment = hasManualAmount || discountRial > 0;
  const customerValid = form.customerType === "individual" ? form.customerSnapshot.fullName.trim() && form.customerSnapshot.nationalId.trim() : form.customerSnapshot.companyName.trim() && form.customerSnapshot.nationalCode.trim();
  const capacitiesValid = selectedAdvisers.every(([, value]) => Number(value.targetStudentCapacity) >= Number(value.minimum));
  const manualAmountsValid = !manualPricing || selectedAdvisers.every(([, value]) => Number(value.manualFinalAmountToman) > 0);
  const { discountValid, reasonValid: adjustmentValid } = validateInvoiceAdjustment({ subtotal: previewSubtotal, discountAmount: discountRial, hasManualAmount, adjustmentNote });
  const valid = form.schoolId && customerValid && selectedAdvisers.length > 0 && capacitiesValid && manualAmountsValid && discountValid && adjustmentValid;
  const toggleAdviser = (adviser) => {
    const key = String(adviser.id); const minimum = Math.max(Number(pricing?.includedStudents) || 0, Number(adviser.capacityInfo?.activeStudents) || 0);
    setForm((current) => ({ ...current, advisers: { ...current.advisers, [key]: current.advisers[key]?.selected ? { ...current.advisers[key], selected: false } : { selected: true, minimum, targetStudentCapacity: current.advisers[key]?.targetStudentCapacity || minimum } } }));
  };
  const setAdviserValue = (id, key, value) => setForm((current) => ({ ...current, advisers: { ...current.advisers, [id]: { ...current.advisers[id], [key]: value } } }));

  const submit = async (event) => {
    event.preventDefault(); if (!valid || submitting) return;
    setSubmitting(true); setError("");
    const snapshot = form.customerType === "individual" ? { fullName: form.customerSnapshot.fullName.trim(), nationalId: form.customerSnapshot.nationalId.trim(), address: form.customerSnapshot.address.trim() || undefined } : { companyName: form.customerSnapshot.companyName.trim(), nationalCode: form.customerSnapshot.nationalCode.trim(), address: form.customerSnapshot.address.trim() || undefined };
    try {
      const payload = { schoolId: Number(form.schoolId), durationMonths: Number(form.durationMonths), customerType: form.customerType, customerSnapshot: snapshot, advisers: selectedAdvisers.map(([adviserId, value]) => ({ adviserId: Number(adviserId), targetStudentCapacity: Number(value.targetStudentCapacity), ...(allowOverrides && manualPricing ? { manualFinalAmount: tomanToRial(value.manualFinalAmountToman) } : {}) })) };
      if (allowOverrides && discountRial > 0) payload.discountAmount = discountRial;
      if (allowOverrides && hasAdjustment) payload.adjustmentNote = adjustmentNote.trim();
      await createBillingInvoice(payload);
      invalidateBillingCache(); onCreated?.(); toggle();
    } catch (e) { setError(billingErrorMessage(e)); } finally { setSubmitting(false); }
  };

  return <Modal isOpen={open} toggle={submitting ? undefined : toggle} centered size="lg" dir="rtl"><form onSubmit={submit}><ModalHeader toggle={submitting ? undefined : toggle}>صدور فاکتور</ModalHeader><ModalBody>
    {error && <Alert color="danger">{error}</Alert>}
    <FormGroup><Label for="billing-school">مجموعه</Label><Input id="billing-school" type="select" value={form.schoolId} disabled={!!fixedSchoolId} onChange={(e) => setForm({ ...form, schoolId: e.target.value, advisers: {} })} required><option value="">انتخاب کنید</option>{schools.map((s) => <option key={s.id} value={s.id}>{s.name || s.title}</option>)}</Input></FormGroup>
    <FormGroup><Label for="billing-duration">مدت اشتراک</Label><Input id="billing-duration" type="select" value={form.durationMonths} onChange={(e) => setForm({ ...form, durationMonths: Number(e.target.value) })}><option value={1}>یک ماه</option><option value={3}>سه ماه</option></Input></FormGroup>
    <FormGroup><Label>نوع مشتری</Label><div><Input id="individual" type="radio" name="customerType" checked={form.customerType === "individual"} onChange={() => setForm({ ...form, customerType: "individual", customerSnapshot: emptySnapshot })} /> <Label for="individual" className="ms-3">حقیقی</Label><Input id="legal" type="radio" name="customerType" checked={form.customerType === "legal"} onChange={() => setForm({ ...form, customerType: "legal", customerSnapshot: emptySnapshot })} /> <Label for="legal">حقوقی</Label></div></FormGroup>
    {form.customerType === "individual" ? <><FormGroup><Label for="fullName">نام و نام خانوادگی</Label><Input id="fullName" value={form.customerSnapshot.fullName} onChange={(e) => setSnapshot("fullName", e.target.value)} required /></FormGroup><FormGroup><Label for="nationalId">کد ملی</Label><Input id="nationalId" inputMode="numeric" value={form.customerSnapshot.nationalId} onChange={(e) => setSnapshot("nationalId", e.target.value)} required /></FormGroup></> : <><FormGroup><Label for="companyName">نام شرکت</Label><Input id="companyName" value={form.customerSnapshot.companyName} onChange={(e) => setSnapshot("companyName", e.target.value)} required /></FormGroup><FormGroup><Label for="nationalCode">شناسه ملی</Label><Input id="nationalCode" inputMode="numeric" value={form.customerSnapshot.nationalCode} onChange={(e) => setSnapshot("nationalCode", e.target.value)} required /></FormGroup></>}
    <FormGroup><Label for="billing-address">نشانی (اختیاری)</Label><Input id="billing-address" value={form.customerSnapshot.address} onChange={(e) => setSnapshot("address", e.target.value)} /></FormGroup>
    {allowOverrides && <FormGroup switch><Input id="manual-pricing" type="switch" checked={manualPricing} onChange={(e) => setManualPricing(e.target.checked)} /><Label for="manual-pricing" check>قیمت‌گذاری دستی</Label></FormGroup>}
    <Label>مشاورها و ظرفیت کل بعد از پرداخت</Label>{optionsLoading ? <div className="text-center"><Spinner size="sm" /></div> : <div className="table-responsive"><Table bordered size="sm"><thead><tr><th>انتخاب</th><th>مشاور</th><th>فعال فعلی</th><th>ظرفیت هدف</th><th>پیش‌نمایش پله</th>{allowOverrides && manualPricing && <th>مبلغ نهایی کل دوره (تومان)</th>}</tr></thead><tbody>{advisers.map((adviser) => { const value = form.advisers[String(adviser.id)]; const activeStudents = adviser.capacityInfo?.activeStudents || 0; const minimum = Math.max(Number(pricing?.includedStudents) || 0, activeStudents); return <tr key={adviser.id}><td><Input aria-label={`انتخاب ${adviserName(adviser)}`} type="checkbox" checked={!!value?.selected} onChange={() => toggleAdviser(adviser)} /></td><td>{adviserName(adviser)}</td><td>{activeStudents.toLocaleString("fa-IR")}</td><td><Input aria-label={`ظرفیت ${adviserName(adviser)}`} type="number" min={minimum} disabled={!value?.selected} value={value?.targetStudentCapacity ?? minimum} onChange={(e) => setAdviserValue(String(adviser.id), "targetStudentCapacity", e.target.value)} invalid={!!value?.selected && Number(value.targetStudentCapacity) < minimum} /></td><td>{value?.selected ? `${calculateCapacitySteps(value.targetStudentCapacity, pricing?.includedStudents, pricing?.capacityStepPercent).toLocaleString("fa-IR")} پله` : "—"}</td>{allowOverrides && manualPricing && <td><Input aria-label={`مبلغ دستی ${adviserName(adviser)}`} type="number" min="1" disabled={!value?.selected} value={value?.manualFinalAmountToman ?? ""} onChange={(e) => setAdviserValue(String(adviser.id), "manualFinalAmountToman", e.target.value)} required={!!value?.selected} /></td>}</tr>})}{!advisers.length && <tr><td colSpan={allowOverrides && manualPricing ? 6 : 5} className="text-center">مشاوری یافت نشد.</td></tr>}</tbody></Table></div>}
    {allowOverrides && <><FormGroup><Label for="invoice-discount">تخفیف کل فاکتور (تومان)</Label><Input id="invoice-discount" type="number" min="0" step="1" value={discountToman} onChange={(e) => setDiscountToman(e.target.value)} invalid={!discountValid} /></FormGroup><FormGroup><Label for="adjustment-note">دلیل قیمت‌گذاری/تخفیف</Label><Input id="adjustment-note" type="textarea" value={adjustmentNote} onChange={(e) => setAdjustmentNote(e.target.value)} required={hasAdjustment} minLength={hasAdjustment ? 3 : undefined} invalid={hasAdjustment && adjustmentNote.trim().length < 3} /></FormGroup><div className="border rounded p-3 mb-3"><div className="d-flex justify-content-between"><span>جمع ردیف‌ها</span><strong>{moneyDisplay(previewSubtotal)}</strong></div><div className="d-flex justify-content-between"><span>تخفیف</span><strong>{moneyDisplay(discountRial)}</strong></div><div className="d-flex justify-content-between border-top mt-2 pt-2"><span>مبلغ قابل پرداخت</span><strong>{moneyDisplay(Math.max(0, previewSubtotal - discountRial))}</strong></div></div></>}
    <Alert color="info" className="mb-0">این پیش‌نمایش صرفاً تعداد پله ظرفیت است؛ مبلغ نهایی فقط مبلغ محاسبه‌شده و بازگردانده‌شده توسط backend است.</Alert>
  </ModalBody><ModalFooter><Button type="button" color="secondary" onClick={toggle} disabled={submitting}>انصراف</Button><Button color="primary" type="submit" disabled={!valid || submitting}>{submitting && <Spinner size="sm" className="ms-1" />}صدور فاکتور</Button></ModalFooter></form></Modal>;
}
