// src/pages/Voip/Analytics/components/AnalyticsFilters.jsx
import React, { useEffect, useState } from "react"
import { Button, Col, Input, Label, Row } from "reactstrap"
import DatePicker from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import DateObject from "react-date-object"
import moment from "moment-jalaali"
import { toGregorian } from "jalaali-js"

function initDateObj(date) {
  return new DateObject({ date, calendar: persian, locale: persian_fa })
}

// initialFrom / initialTo: YYYY-MM-DD strings read from URL params
// initialSchoolId: string — syncs dropdown with external school selection (table click or URL)
const AnalyticsFilters = ({ onApply, schools = [], showSchoolFilter = false, initialFrom, initialTo, initialSchoolId = "" }) => {
  const [fromDO, setFromDO] = useState(() => {
    if (initialFrom) return initDateObj(moment(initialFrom, "YYYY-MM-DD").toDate())
    return initDateObj(moment().startOf("jMonth").toDate())
  })
  const [toDO, setToDO] = useState(() => {
    if (initialTo) return initDateObj(moment(initialTo, "YYYY-MM-DD").toDate())
    return initDateObj(moment().endOf("jMonth").toDate())
  })
  const [schoolId, setSchoolId] = useState(initialSchoolId)
  const [error, setError] = useState("")

  useEffect(() => {
    setSchoolId(initialSchoolId)
  }, [initialSchoolId])

  const handleApply = () => {
    if (!fromDO || !toDO) {
      setError("لطفاً هر دو تاریخ را انتخاب کنید")
      return
    }
    const fromMs = fromDO.toDate().getTime()
    const toMs = toDO.toDate().getTime()
    if (fromMs > toMs) {
      setError("تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد")
      return
    }
    setError("")
    // use Jalali year/month/day directly — avoids JS Date timezone pitfalls
    const pad = (n) => String(n).padStart(2, "0")
    const fG = toGregorian(fromDO.year, fromDO.month.number, fromDO.day)
    const tG = toGregorian(toDO.year, toDO.month.number, toDO.day)
    const dateFrom = `${fG.gy}-${pad(fG.gm)}-${pad(fG.gd)}`
    const dateTo = `${tG.gy}-${pad(tG.gm)}-${pad(tG.gd)}`
    onApply({ from: dateFrom, to: dateTo, schoolId: schoolId || undefined })
  }

  return (
    <div
      className="p-3 rounded-3 mb-4"
      style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}
    >
      <Row className="g-3 align-items-end">
        <Col md="3" sm="6">
          <Label className="form-label fw-medium mb-1" style={{ fontSize: "0.85rem" }}>
            <i className="mdi mdi-calendar-start me-1 text-muted" />
            از تاریخ
          </Label>
          <DatePicker
            calendar={persian}
            locale={persian_fa}
            value={fromDO}
            onChange={(d) => { setError(""); setFromDO(d || null) }}
            format="YYYY/MM/DD"
            placeholder="تاریخ شروع"
            inputClass="form-control form-control-sm border-0 shadow-sm"
            calendarPosition="bottom-right"
          />
        </Col>

        <Col md="3" sm="6">
          <Label className="form-label fw-medium mb-1" style={{ fontSize: "0.85rem" }}>
            <i className="mdi mdi-calendar-end me-1 text-muted" />
            تا تاریخ
          </Label>
          <DatePicker
            calendar={persian}
            locale={persian_fa}
            value={toDO}
            onChange={(d) => { setError(""); setToDO(d || null) }}
            format="YYYY/MM/DD"
            placeholder="تاریخ پایان"
            inputClass="form-control form-control-sm border-0 shadow-sm"
            calendarPosition="bottom-right"
          />
        </Col>

        {showSchoolFilter && (
          <Col md="3" sm="6">
            <Label className="form-label fw-medium mb-1" style={{ fontSize: "0.85rem" }}>
              <i className="mdi mdi-school-outline me-1 text-muted" />
              مجموعه
            </Label>
            <Input
              type="select"
              bsSize="sm"
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              className="border-0 shadow-sm"
            >
              <option value="">همه مجموعه‌ها</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name || s.title || `مجموعه ${s.id}`}
                </option>
              ))}
            </Input>
          </Col>
        )}

        <Col md="auto" className="d-flex align-items-end">
          <Button
            color="primary"
            size="sm"
            onClick={handleApply}
            className="d-flex align-items-center gap-1 px-3"
            style={{ whiteSpace: "nowrap" }}
          >
            <i className="mdi mdi-check" />
            اعمال فیلتر
          </Button>
        </Col>
      </Row>

      {error && (
        <div className="mt-2 text-danger" style={{ fontSize: "0.82rem" }}>
          <i className="mdi mdi-alert-circle-outline me-1" />
          {error}
        </div>
      )}
    </div>
  )
}

export default AnalyticsFilters
