// src/pages/Reports/components/KpiCards.jsx
import React from "react"
import { Card, CardBody, Col, Row, Spinner } from "reactstrap"

const fa = (v) => (v == null ? "—" : Number(v).toLocaleString("fa-IR"))
const pct = (v) => (v == null ? "—" : `${Number(v).toFixed(1).toLocaleString("fa-IR")}٪`)

function calcChange(curr, prev) {
  if (prev == null || prev === 0) return null
  return ((curr - prev) / Math.abs(prev)) * 100
}

function Trend({ current, previous }) {
  const change = calcChange(current, previous)
  if (change == null) return null
  const up = change >= 0
  return (
    <span
      className={`ms-1 d-inline-flex align-items-center gap-1 ${up ? "text-success" : "text-danger"}`}
      style={{ fontSize: "0.78rem" }}
    >
      <i className={`mdi ${up ? "mdi-arrow-up" : "mdi-arrow-down"}`} />
      {Math.abs(change).toFixed(1).toLocaleString("fa-IR")}٪
    </span>
  )
}

const KPI_DEFS = [
  {
    key: "totalCalls",
    label: "تعداد تماس",
    icon: "mdi-phone",
    color: "#556ee6",
    format: fa,
  },
  {
    key: "activeAdvisers",
    label: "مشاوران فعال",
    icon: "mdi-account-tie",
    color: "#34c38f",
    format: fa,
  },
  {
    key: "contactedStudents",
    label: "دانش‌آموزان تماس‌گرفته",
    icon: "mdi-account-check",
    color: "#f1b44c",
    format: fa,
  },
  {
    key: "studentCoveragePercent",
    label: "پوشش دانش‌آموزان",
    icon: "mdi-chart-donut",
    color: "#50a5f1",
    format: pct,
  },
  {
    key: "formCompletionPercent",
    label: "تکمیل فرم‌ها",
    icon: "mdi-file-check-outline",
    color: "#f46a6a",
    format: pct,
  },
]

const SkeletonCard = () => (
  <Card className="shadow-sm h-100">
    <CardBody>
      <div className="placeholder-glow">
        <span className="placeholder col-6 mb-2" />
        <span className="placeholder col-10 mb-2" style={{ height: 28 }} />
        <span className="placeholder col-4" />
      </div>
    </CardBody>
  </Card>
)

const KpiCards = ({ data, loading, error }) => {
  if (loading) {
    return (
      <Row className="g-3 mb-4">
        {KPI_DEFS.map((d) => (
          <Col key={d.key} xs="12" sm="6" xl>
            <SkeletonCard />
          </Col>
        ))}
      </Row>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger mb-4" role="alert">
        <i className="mdi mdi-alert-circle-outline me-2" />
        خطا در بارگذاری شاخص‌ها: {error}
      </div>
    )
  }

  const curr = data?.current || {}
  const prev = data?.previous || {}

  return (
    <Row className="g-3 mb-4">
      {KPI_DEFS.map((def) => (
        <Col key={def.key} xs="12" sm="6" xl>
          <Card className="shadow-sm h-100">
            <CardBody>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                  {def.label}
                </span>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white"
                  style={{ width: 36, height: 36, backgroundColor: def.color, flexShrink: 0 }}
                >
                  <i className={`mdi ${def.icon}`} />
                </div>
              </div>
              <div className="d-flex align-items-baseline gap-1">
                <h4 className="mb-0 fw-bold">{def.format(curr[def.key])}</h4>
                <Trend current={curr[def.key]} previous={prev[def.key]} />
              </div>
              {prev[def.key] != null && (
                <small className="text-muted mt-1 d-block">
                  دوره قبل: {def.format(prev[def.key])}
                </small>
              )}
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  )
}

export default KpiCards
