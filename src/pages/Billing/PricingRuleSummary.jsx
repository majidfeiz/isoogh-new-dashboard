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
    ["ظرفیت پایه", rule.includedStudents ?? rule.included_students, "count"],
    ["ظرفیت هدف", rule.targetStudentCapacity ?? rule.target_student_capacity, "count"],
    ["اندازه هر پله", rule.capacityStepSeats ?? rule.capacity_step_seats, "count"],
    ["درصد هر پله", rule.capacityStepPercent ?? rule.capacity_step_percent, "percent"],
    ["پله‌های اضافه", rule.extraSteps ?? rule.extra_steps, "steps"],
    ["هزینه هر پله", rule.surchargePerStep ?? rule.surcharge_per_step ?? rule.capacityStepAmount ?? rule.capacity_step_amount, "money"],
    ["مبلغ ماهانه", rule.calculatedMonthlyAmount ?? rule.calculated_monthly_amount, "money"],
  ].filter(([, value]) => value !== undefined && value !== null && value !== "");

  if (!values.length) return <span className="text-muted">—</span>;

  return <div className="d-flex flex-column gap-2" style={{ minWidth: 250 }}>
    {values.map(([label, value, type]) => <div key={label} className="d-flex align-items-start justify-content-between gap-3 border-bottom pb-1">
      <span className="text-muted text-nowrap">{label}</span>
      {type === "money" ? <strong className="text-nowrap">{moneyDisplay(value)}</strong> : <Badge color={type === "steps" ? "primary" : "light"} className={type === "steps" ? "" : "text-dark"}>{number(value)}{type === "percent" ? "٪" : type === "steps" ? " پله" : " نفر"}</Badge>}
    </div>)}
  </div>;
}
