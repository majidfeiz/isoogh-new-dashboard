import React, { useState } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";
import { Button, ButtonGroup } from "reactstrap";
import { customDateRange, datePreset } from "./auditLogUtils.js";

const presets = [
  ["today", "امروز"], ["yesterday", "دیروز"], ["7days", "۷ روز اخیر"],
  ["30days", "۳۰ روز اخیر"], ["jalaliMonth", "این ماه جلالی"],
];

const AuditDateFilter = ({ onChange }) => {
  const [custom, setCustom] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [error, setError] = useState("");

  const applyCustom = () => {
    const result = customDateRange(fromDate, toDate);
    if (result.error) return setError(result.error);
    setError("");
    onChange(result);
  };

  return (
    <div>
      <ButtonGroup size="sm" className="d-flex flex-wrap">
        {presets.map(([key, label]) => (
          <Button key={key} outline color="primary" onClick={() => { setCustom(false); setError(""); onChange(datePreset(key)); }}>
            {label}
          </Button>
        ))}
        <Button outline color="primary" onClick={() => setCustom(true)}>بازه سفارشی</Button>
        <Button outline color="secondary" onClick={() => { setCustom(false); setError(""); onChange({ from: "", to: "" }); }}>همه زمان‌ها</Button>
      </ButtonGroup>
      {custom && (
        <div className="d-flex flex-wrap gap-2 mt-2 align-items-center">
          <DatePicker calendar={persian} locale={persianFa} value={fromDate} onChange={(value) => { setError(""); setFromDate(value); }} format="YYYY/MM/DD" inputClass="form-control form-control-sm" placeholder="از تاریخ" />
          <DatePicker calendar={persian} locale={persianFa} value={toDate} onChange={(value) => { setError(""); setToDate(value); }} format="YYYY/MM/DD" inputClass="form-control form-control-sm" placeholder="تا تاریخ" />
          <Button size="sm" color="primary" onClick={applyCustom}>اعمال بازه</Button>
        </div>
      )}
      {error && <div role="alert" className="text-danger small mt-1">{error}</div>}
    </div>
  );
};

export default AuditDateFilter;
