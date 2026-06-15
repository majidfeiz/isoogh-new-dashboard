// src/pages/Reports/components/StudentsCoverageChart.jsx
import React from "react"
import { Card, CardBody, CardHeader, Progress, Spinner } from "reactstrap"

const faNum = (v) => (v == null ? "—" : Number(v).toLocaleString("fa-IR"))

const COLORS = ["#556ee6", "#34c38f", "#f1b44c", "#50a5f1", "#f46a6a", "#74788d"]

const StudentsCoverageChart = ({ data, loading, error }) => {
  const grades = data?.byGrade || []

  return (
    <Card className="shadow-sm h-100">
      <CardHeader className="bg-white border-bottom d-flex align-items-center gap-2">
        <div
          className="rounded-2 d-flex align-items-center justify-content-center text-white"
          style={{ width: 32, height: 32, backgroundColor: "#50a5f1", flexShrink: 0 }}
        >
          <i className="mdi mdi-account-multiple-check fs-6" />
        </div>
        <h6 className="mb-0 fw-semibold">پوشش دانش‌آموزان بر اساس پایه</h6>
      </CardHeader>
      <CardBody>
        {loading && (
          <div className="text-center py-5">
            <Spinner color="primary" />
          </div>
        )}
        {error && !loading && (
          <div className="text-center py-4 text-danger">
            <i className="mdi mdi-alert-circle-outline fs-3 d-block mb-2" />
            <small>{error}</small>
          </div>
        )}
        {!loading && !error && grades.length === 0 && (
          <div className="text-center py-5 text-muted">
            <i className="mdi mdi-account-multiple-outline fs-1 d-block mb-2 opacity-25" />
            داده‌ای برای نمایش وجود ندارد
          </div>
        )}
        {!loading && !error && grades.length > 0 && (
          <div className="d-flex flex-column gap-3">
            {grades.map((g, i) => {
              const pct = Math.min(100, Math.max(0, g.coveragePercent || 0))
              return (
                <div key={g.gradeId ?? i}>
                  <div className="d-flex justify-content-between mb-1">
                    <span style={{ fontSize: "0.82rem", fontWeight: 500 }}>
                      {g.gradeTitle || `پایه ${g.gradeId}`}
                    </span>
                    <span className="text-muted" style={{ fontSize: "0.78rem" }}>
                      {faNum(g.contactedStudents)} / {faNum(g.totalStudents)}
                      {" — "}
                      <strong style={{ color: COLORS[i % COLORS.length] }}>
                        {pct.toFixed(1).toLocaleString("fa-IR")}٪
                      </strong>
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    color="primary"
                    style={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#e9ecef",
                    }}
                    barStyle={{ backgroundColor: COLORS[i % COLORS.length], borderRadius: 4 }}
                  />
                </div>
              )
            })}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default StudentsCoverageChart
