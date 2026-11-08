import React, { useEffect, useState } from "react"
import { Button, Col, Label, Row } from "reactstrap"
import DatePicker from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persianFa from "react-date-object/locales/persian_fa"
import { jalaliDateObject, normalizeJalaliDateOnly } from "../../../helpers/jalaliDateOnly.js"
import { validDashboardRange } from "../reportDashboardUtils.js"

export default function PeriodPicker({ value, onApply, schoolControl }) {
  const [draft, setDraft] = useState(value)
  const [error, setError] = useState("")
  useEffect(() => setDraft(value), [value.from, value.to])
  const apply = () => {
    const range = { from: normalizeJalaliDateOnly(draft.from), to: normalizeJalaliDateOnly(draft.to) }
    if (!validDashboardRange(range)) { setError("تاریخ شروع باید قبل از تاریخ پایان بازه باشد"); return }
    setError(""); onApply(range)
  }
  return <div className="p-3 rounded-3 mb-4 bg-light border"><Row className="g-3 align-items-end"><Col lg="3" sm="6"><Label>از تاریخ</Label><DatePicker calendar={persian} locale={persianFa} value={jalaliDateObject(draft.from)} onChange={(date) => { setError(""); setDraft((current) => ({ ...current, from: normalizeJalaliDateOnly(date) })) }} format="YYYY/MM/DD" inputClass="form-control" /></Col><Col lg="3" sm="6"><Label>تا ابتدای روز (بدون احتساب)</Label><DatePicker calendar={persian} locale={persianFa} value={jalaliDateObject(draft.to)} onChange={(date) => { setError(""); setDraft((current) => ({ ...current, to: normalizeJalaliDateOnly(date) })) }} format="YYYY/MM/DD" inputClass="form-control" /></Col>{schoolControl && <Col lg="4">{schoolControl}</Col>}<Col lg="2"><Button color="primary" className="w-100" onClick={apply}>اعمال فیلتر</Button></Col></Row>{error && <div role="alert" className="text-danger small mt-2">{error}</div>}</div>
}
