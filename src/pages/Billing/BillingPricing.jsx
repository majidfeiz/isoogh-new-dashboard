import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Badge, Button, Card, CardBody, CardHeader, FormGroup, Input, InputGroup, InputGroupText, Label, Spinner, Table } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useAuth } from "../../context/AuthContext.jsx";
import { getBillingPricing, getBillingPricingHistory, updateBillingPricing } from "../../services/billingService.jsx";
import { billingErrorMessage, formatJalali, formatTomanDisplay, invalidateBillingCache, tomanToRial } from "./billingUtils.js";

export const EXTRA_STEP_PERCENT_ERROR = "درصد افزایش هر پله باید بین ۰ تا ۱۰۰ و حداکثر دارای دو رقم اعشار باشد.";
export const isValidExtraStepPercent = (rawValue) => {
  const value = String(rawValue ?? "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return false;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= 100;
};

const extraStepPercentApiError = (error) => {
  if (error?.response?.status !== 400) return "";
  const data = error?.response?.data || {};
  const source = data?.message?.errors ?? data?.errors ?? data?.message;
  if (typeof source === "string") return source;
  if (Array.isArray(source)) {
    const match = source.find((item) => typeof item === "string" || item?.field === "extraStepPercent" || item?.property === "extraStepPercent");
    return typeof match === "string" ? match : match?.message || match?.reason || "";
  }
  if (source && typeof source === "object") {
    const field = source.extraStepPercent ?? source.extra_step_percent;
    if (Array.isArray(field)) return field.filter(Boolean).join("، ");
    if (typeof field === "string") return field;
  }
  return "";
};

const emptyForm = { baseMonthlyAmountToman: "", includedStudents: "", extraStudentStep: "", extraStepPercent: "", capacityStepPercent: "", capacityStepAmountToman: "", taxPercent: "", vatPercent: "" };

export default function BillingPricing() {
  const { hasPermission } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [currentRial, setCurrentRial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [extraStepPercentError, setExtraStepPercentError] = useState("");
  const [history, setHistory] = useState([]);
  const submitRef = useRef(false);

  const loadPricing = useCallback(async () => {
    const [data, historyData] = await Promise.all([getBillingPricing(), getBillingPricingHistory()]);
    const baseAmount = data.baseMonthlyAmount ?? data.base_monthly_amount;
    const fixedStepAmount = data.capacityStepAmount ?? data.capacity_step_amount;
    setCurrentRial(baseAmount);
    setHistory(historyData?.items || historyData?.data || historyData || []);
    setForm({
      baseMonthlyAmountToman: baseAmount == null ? "" : String(Number(baseAmount) / 10),
      includedStudents: data.includedStudents ?? data.included_students ?? "",
      extraStudentStep: data.extraStudentStep ?? data.extra_student_step ?? "",
      extraStepPercent: data.extraStepPercent ?? data.extra_step_percent ?? "",
      capacityStepPercent: data.capacityStepPercent ?? data.capacity_step_percent ?? "",
      capacityStepAmountToman: fixedStepAmount == null ? "" : String(Number(fixedStepAmount) / 10),
      taxPercent: data.taxPercent ?? data.tax_percent ?? "",
      vatPercent: data.vatPercent ?? data.vat_percent ?? "",
    });
  }, []);

  useEffect(() => {
    loadPricing().catch((caught) => setError(billingErrorMessage(caught))).finally(() => setLoading(false));
  }, [loadPricing]);

  const submit = async (event) => {
    event.preventDefault();
    if (submitRef.current || saving) return;
    setError("");
    setExtraStepPercentError("");
    if (!isValidExtraStepPercent(form.extraStepPercent)) {
      setExtraStepPercentError(EXTRA_STEP_PERCENT_ERROR);
      return;
    }
    const percentagesValid = [form.taxPercent, form.vatPercent].every((value) => value !== "" && Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 100);
    if (!percentagesValid) {
      setError("درصد مالیات و ارزش افزوده باید عددی بین صفر تا صد باشد.");
      return;
    }
    submitRef.current = true;
    setSaving(true);
    try {
      await updateBillingPricing({
        baseMonthlyAmount: tomanToRial(form.baseMonthlyAmountToman),
        includedStudents: Number(form.includedStudents),
        extraStudentStep: Number(form.extraStudentStep),
        extraStepPercent: Number(form.extraStepPercent),
        capacityStepPercent: Number(form.capacityStepPercent),
        capacityStepAmount: form.capacityStepAmountToman === "" ? null : tomanToRial(form.capacityStepAmountToman),
        taxPercent: Number(form.taxPercent),
        vatPercent: Number(form.vatPercent),
      });
      invalidateBillingCache();
      await loadPricing();
    } catch (caught) {
      const fieldError = extraStepPercentApiError(caught);
      if (fieldError) setExtraStepPercentError(fieldError);
      else setError(billingErrorMessage(caught));
    } finally {
      submitRef.current = false;
      setSaving(false);
    }
  };

  return <div className="page-content" dir="rtl"><div className="container-fluid"><Breadcrumbs title="مالی و اشتراک" breadcrumbItem="تنظیم قیمت" /><Card><CardBody>
    <Alert color="warning">تغییر قیمت فقط روی فاکتورهای آینده اثر دارد و فاکتورهای قبلی تغییر نمی‌کنند.</Alert>{error && <Alert color="danger">{error}</Alert>}
    {loading ? <Spinner /> : <form onSubmit={submit} noValidate><FormGroup><Label for="baseMonthlyAmount">مبلغ پایه ماهانه (تومان)</Label><Input id="baseMonthlyAmount" type="number" min="0" value={form.baseMonthlyAmountToman} onChange={(e) => setForm({ ...form, baseMonthlyAmountToman: e.target.value })} required /><small className="text-muted">مقدار جاری API: {formatTomanDisplay(currentRial)}؛ هنگام ثبت به ریال ارسال می‌شود.</small></FormGroup><FormGroup><Label for="includedStudents">ظرفیت پایه</Label><Input id="includedStudents" type="number" min="0" value={form.includedStudents} onChange={(e) => setForm({ ...form, includedStudents: e.target.value })} required /></FormGroup><div className="row"><FormGroup className="col-md-6"><Label for="taxPercent">درصد مالیات</Label><Input id="taxPercent" type="number" min="0" max="100" step="0.01" value={form.taxPercent} onChange={(e) => setForm({ ...form, taxPercent: e.target.value })} required /></FormGroup><FormGroup className="col-md-6"><Label for="vatPercent">درصد ارزش افزوده</Label><Input id="vatPercent" type="number" min="0" max="100" step="0.01" value={form.vatPercent} onChange={(e) => setForm({ ...form, vatPercent: e.target.value })} required /></FormGroup></div><FormGroup><Label for="capacityStepPercent">درصد هر پله ظرفیت</Label><Input id="capacityStepPercent" type="number" min="0.01" step="0.01" value={form.capacityStepPercent} onChange={(e) => setForm({ ...form, capacityStepPercent: e.target.value })} required /></FormGroup><FormGroup><Label for="capacityStepAmount">مبلغ ثابت هر پله (تومان، اختیاری)</Label><Input id="capacityStepAmount" type="number" min="0" value={form.capacityStepAmountToman} onChange={(e) => setForm({ ...form, capacityStepAmountToman: e.target.value })} /><small className="text-muted">اگر مقدار داشته باشد، backend مبلغ ثابت ریالی را به‌جای درصد مبنا قرار می‌دهد.</small></FormGroup><FormGroup><Label for="extraStudentStep">گام دانش‌آموز اضافه</Label><Input id="extraStudentStep" type="number" min="1" value={form.extraStudentStep} onChange={(e) => setForm({ ...form, extraStudentStep: e.target.value })} required /></FormGroup><FormGroup><Label for="extraStepPercent">درصد افزایش مبلغ به‌ازای هر پله دانش‌آموز اضافه</Label><InputGroup><Input id="extraStepPercent" type="number" min="0" max="100" step="0.01" value={form.extraStepPercent} onChange={(e) => { setForm({ ...form, extraStepPercent: e.target.value }); setExtraStepPercentError(""); }} invalid={Boolean(extraStepPercentError)} aria-describedby="extraStepPercent-error" required /><InputGroupText>%</InputGroupText></InputGroup>{extraStepPercentError && <div id="extraStepPercent-error" className="invalid-feedback d-block">{extraStepPercentError}</div>}<small className="text-muted">این مقدار درصد است؛ مبلغ ثابت هر پله در فیلد جداگانه بالا ثبت می‌شود.</small></FormGroup><Button color="primary" type="submit" disabled={saving || !hasPermission("billing.pricing.update")}>{saving && <Spinner size="sm" />} ذخیره تنظیمات</Button></form>}
  </CardBody></Card><Card className="mt-4"><CardHeader><strong>تاریخچه تعرفه‌ها</strong><div className="small text-muted">سوابق فقط خواندنی هستند و امکان ویرایش یا حذف ندارند.</div></CardHeader><CardBody className="p-0">{history.length ? <div className="table-responsive"><Table hover className="align-middle mb-0"><thead><tr><th>تاریخ اعمال</th><th>مبلغ پایه</th><th>ظرفیت پایه</th><th>پله ظرفیت</th><th>قیمت هر پله</th><th>وضعیت</th></tr></thead><tbody>{history.map((item) => <tr key={item.id || item.created_at}><td>{formatJalali(item.createdAt || item.created_at)}</td><td>{formatTomanDisplay(item.baseMonthlyAmount ?? item.base_monthly_amount)}</td><td>{Number(item.includedStudents ?? item.included_students ?? 0).toLocaleString("fa-IR")}</td><td>{Number(item.capacityStepSeats ?? item.capacity_step_seats ?? item.extraStudentStep ?? item.extra_student_step ?? 0).toLocaleString("fa-IR")}</td><td>{formatTomanDisplay(item.capacityStepAmount ?? item.capacity_step_amount)}</td><td><Badge color={(item.isActive ?? item.is_active) ? "success" : "secondary"}>{(item.isActive ?? item.is_active) ? "تعرفه فعلی" : "منقضی‌شده"}</Badge></td></tr>)}</tbody></Table></div> : <div className="text-muted text-center py-4">سابقه‌ای ثبت نشده است.</div>}</CardBody></Card></div></div>;
}
