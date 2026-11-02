import React, { useEffect, useState } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";
import { Alert, Button, Label } from "reactstrap";
import { callQueueRangeFromDates, callQueueRangePreset, callQueueRangeToDates, formatCallQueueRange } from "./callQueueDateRange.js";

const shortcuts = [["today", "امروز"], ["7days", "۷ روز اخیر"], ["month", "ماه جاری شمسی"]];

export default function CallQueueDateRangeFilter({ range, onChange }) {
  const [draft, setDraft] = useState(() => callQueueRangeToDates(range));
  const [error, setError] = useState("");
  useEffect(() => setDraft(callQueueRangeToDates(range)), [range.from, range.to]);

  const apply = () => {
    const next = callQueueRangeFromDates(draft);
    if (!next) { setError("ابتدا روز شروع و پایان بازه را انتخاب کنید."); return; }
    setError(""); onChange(next);
  };

  return <div className="border rounded p-3 mt-3">
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
      <div><Label className="mb-1 fw-semibold" for="call-queue-date-range">بازه زمانی درخواست</Label><div className="small text-muted">{formatCallQueueRange(range)}</div></div>
      <div className="d-flex flex-wrap gap-1">{shortcuts.map(([key, label]) => <Button key={key} type="button" size="sm" color="primary" outline onClick={() => { setError(""); onChange(callQueueRangePreset(key)); }}>{label}</Button>)}<Button type="button" size="sm" color="secondary" outline disabled={!range.from} onClick={() => { setError(""); setDraft([]); onChange({ from: null, to: null }); }}>پاک کردن</Button></div>
    </div>
    <div className="d-flex flex-wrap align-items-center gap-2">
      <DatePicker id="call-queue-date-range" range rangeHover calendar={persian} locale={persianFa} value={draft} onChange={(value) => { setError(""); setDraft(value || []); }} format="YYYY/MM/DD" inputClass="form-control" inputProps={{ "aria-label": "بازه زمانی درخواست" }} placeholder="انتخاب بازه شمسی" calendarPosition="bottom-right" />
      <Button type="button" color="primary" onClick={apply}>اعمال بازه</Button>
    </div>
    {error ? <Alert color="danger" className="py-2 mt-2 mb-0">{error}</Alert> : null}
  </div>;
}

