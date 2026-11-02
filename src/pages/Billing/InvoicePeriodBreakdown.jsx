import React from "react";
import PropTypes from "prop-types";
import { Alert, Badge, Table } from "reactstrap";
import { formatJalali, moneyDisplay } from "./billingUtils.js";
import { formatBillingPeriodRange } from "./billingPeriodDate.js";

const valueOf = (object, camel, snake = camel) => object?.[camel] ?? object?.[snake];
const number = (value) => value == null ? "—" : Number(value).toLocaleString("fa-IR");
const date = (value) => {
  if (value == null) return "—";
  const numeric = Number(value);
  return formatJalali(Number.isFinite(numeric) ? (numeric < 1_000_000_000_000 ? numeric * 1000 : numeric) : value);
};

export default function InvoicePeriodBreakdown({ line }) {
  const snapshot = line?.pricingSnapshot || {};
  const basis = valueOf(snapshot, "billingBasis", "billing_basis");
  if (basis !== "jalali_month_overlap_v1") return <Alert color="secondary" className="mb-0">جزئیات دوره‌ای برای این فاکتور قدیمی ثبت نشده است.</Alert>;
  const months = valueOf(snapshot, "monthlyBreakdown", "monthly_breakdown") || [];
  return <div className="d-flex flex-column gap-3">
    <div className="d-flex flex-wrap gap-4"><span><b>مبنای محاسبه:</b> مصرف ماهانه فرم‌های تماس شمسی</span><span><b>بیشترین تعداد ماهانه:</b> {number(valueOf(snapshot, "peakStudentCount", "peak_student_count"))}</span></div>
    {months.length ? months.map((month, index) => { const forms = month.forms || []; return <div className="border rounded p-3" key={`${month.jalaliLabel || month.jalali_label}-${index}`}>
      <div className="d-flex flex-wrap justify-content-between gap-2 mb-3"><div><strong>{month.jalaliLabel || month.jalali_label || `ماه ${index + 1}`}</strong><small className="d-block text-muted mt-1">{formatBillingPeriodRange(month.periodStart ?? month.period_start, month.periodEnd ?? month.period_end)}</small></div><div className="d-flex flex-wrap gap-3 small"><span>دانش‌آموز یکتا: {number(valueOf(month, "distinctStudentCount", "distinct_student_count"))}</span><span>ظرفیت صورتحساب: {number(valueOf(month, "billedCapacity", "billed_capacity"))}</span><span>ظرفیت پایه: {number(valueOf(month, "includedCapacity", "included_capacity"))}</span><span>ظرفیت اضافه: {number(valueOf(month, "extraCapacity", "extra_capacity"))}</span><span>پله اضافه: {number(valueOf(month, "extraSteps", "extra_steps"))}</span></div></div>
      <div className="d-flex flex-wrap gap-4 mb-3 small"><span>مبلغ پایه ماه: {moneyDisplay(valueOf(month, "baseMonthlyAmount", "base_monthly_amount"))}</span><span>مبلغ هر پله: {moneyDisplay(valueOf(month, "surchargePerStep", "surcharge_per_step"))}</span><span className="text-success"><b>مبلغ محاسباتی ماه: {moneyDisplay(valueOf(month, "calculatedAmount", "calculated_amount"))}</b></span></div>
      {forms.length ? <div className="table-responsive"><Table bordered size="sm" className="mb-0"><thead><tr><th>فرم تماس</th><th>شروع شمسی</th><th>پایان شمسی</th><th>دانش‌آموز فرم</th></tr></thead><tbody>{forms.map((form) => <tr key={form.formId ?? form.form_id}><td>{form.formTitle ?? form.form_title ?? "—"}{(form.partialMonth ?? form.partial_month) && <Badge color="warning" className="me-2">فعال در بخشی از ماه</Badge>}</td><td>{date(form.formStartAt ?? form.form_start_at)}</td><td>{date(form.formEndAt ?? form.form_end_at)}</td><td>{number(form.studentCount ?? form.student_count)}</td></tr>)}</tbody></Table></div> : <div className="text-center text-muted py-2">در snapshot این ماه فرم مؤثری ثبت نشده است.</div>}
    </div>; }) : <Alert color="info" className="mb-0">برای این دوره ماهی در snapshot ثبت نشده است.</Alert>}
  </div>;
}

InvoicePeriodBreakdown.propTypes = { line: PropTypes.object };
