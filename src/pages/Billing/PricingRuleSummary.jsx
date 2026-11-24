import React from "react";
import { Badge } from "reactstrap";
import { moneyDisplay } from "./billingUtils.js";

export const normalizePricingSnapshot = (snapshot) => {
  if (!snapshot) return {};
  if (typeof snapshot === "object") return snapshot;
  try { return JSON.parse(snapshot); } catch { return {}; }
};

const number = (value) => Number(value).toLocaleString("fa-IR");

export default function PricingRuleSummary({ snapshot }) {
  const rule = normalizePricingSnapshot(snapshot);
  const values = [
    ["منبع قیمت‌گذاری", rule.source, "text"],
    ["تعداد مشاور قراردادی", rule.contractedAdviserCount ?? rule.contracted_adviser_count, "advisers"],
    ["مبلغ ماهانه هر مشاور", rule.adviserMonthlyAmount ?? rule.adviser_monthly_amount, "money"],
    ["ظرفیت پایه هر مشاور", rule.includedStudentsPerAdviser ?? rule.included_students_per_adviser, "count"],
    ["مبلغ پایه مشاور جدید", rule.adviserBaseAmount ?? rule.adviser_base_amount ?? rule.baseAdviserAmount ?? rule.base_adviser_amount, "money"],
    ["جمع پله‌های اضافه", rule.extraStepsAmount ?? rule.extra_steps_amount ?? rule.capacitySurchargeAmount ?? rule.capacity_surcharge_amount, "money"],
    ["ظرفیت پایه", rule.includedStudents ?? rule.included_students, "count"],
    ["وضعیت مبلغ پایه", (rule.baseAmountIncluded ?? rule.base_amount_included) == null ? undefined : ((rule.baseAmountIncluded ?? rule.base_amount_included) ? "اعمال شده" : "حذف شده"), "text"],
    ["مبلغ پایه تعرفه", rule.baseMonthlyAmount ?? rule.base_monthly_amount, "money"],
    ["مبلغ پایه اخذشده", rule.chargedBaseMonthlyAmount ?? rule.charged_base_monthly_amount, "money"],
    ["مبلغ پایه حذف‌شده", rule.excludedBaseMonthlyAmount ?? rule.excluded_base_monthly_amount, "money"],
    ["ظرفیت هدف", rule.targetStudentCapacity ?? rule.target_student_capacity, "count"],
    ["ظرفیت اضافه دانش‌آموز", rule.extraStudentCapacity ?? rule.extra_student_capacity, "count"],
    ["اندازه هر پله", rule.capacityStepSeats ?? rule.capacity_step_seats, "count"],
    ["درصد هر پله", rule.capacityStepPercent ?? rule.capacity_step_percent, "percent"],
    ["پله‌های اضافه", rule.extraSteps ?? rule.extra_steps, "steps"],
    ["هزینه هر پله", rule.surchargePerStep ?? rule.surcharge_per_step ?? rule.capacityStepAmount ?? rule.capacity_step_amount, "money"],
    ["مبلغ ماهانه پله‌های اضافه", rule.extraMonthlyAmount ?? rule.extra_monthly_amount, "money"],
    ["مبلغ ماهانه", rule.calculatedMonthlyAmount ?? rule.calculated_monthly_amount, "money"],
    ["مبلغ نهایی محاسباتی", rule.calculatedFinalAmount ?? rule.calculated_final_amount, "money"],
  ].filter(([, value]) => value !== undefined && value !== null && value !== "");

  if (!values.length) return <span className="text-muted">—</span>;

  const chargedBase = rule.chargedBaseMonthlyAmount ?? rule.charged_base_monthly_amount;
  const extraSteps = rule.extraSteps ?? rule.extra_steps;
  const surcharge = rule.surchargePerStep ?? rule.surcharge_per_step;
  return <div className="d-flex flex-column gap-2" style={{ minWidth: 250 }}>
    {chargedBase != null && extraSteps != null && surcharge != null && <div className="alert alert-light border mb-1"><strong>فرمول:</strong> {moneyDisplay(chargedBase)} + ({number(extraSteps)} پله × {moneyDisplay(surcharge)})</div>}
    {values.map(([label, value, type]) => <div key={label} className="d-flex align-items-start justify-content-between gap-3 border-bottom pb-1">
      <span className="text-muted text-nowrap">{label}</span>
      {type === "money" ? <strong className="text-nowrap">{moneyDisplay(value)}</strong> : type === "text" ? <strong>{value === "adviser_contract_monthly" ? "قرارداد ماهانه مشاور" : value}</strong> : <Badge color={type === "steps" ? "primary" : "light"} className={type === "steps" ? "" : "text-dark"}>{number(value)}{type === "percent" ? "٪" : type === "steps" ? " پله" : type === "advisers" ? " مشاور" : " نفر"}</Badge>}
    </div>)}
  </div>;
}
