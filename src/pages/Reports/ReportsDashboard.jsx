// src/pages/Reports/ReportsDashboard.jsx
import React, { useCallback, useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { Col, Row } from "reactstrap"
import moment from "moment-jalaali"

import Breadcrumbs from "../../components/Common/Breadcrumb"
import { useAuth } from "../../context/AuthContext.jsx"
import { getSchools } from "../../services/schoolService.jsx"
import {
  getReportsOverview,
  getReportsCallsTrend,
  getReportsCallsByHour,
  getReportsStudentsCoverage,
  getReportsFormsStatus,
  getReportsMonthlyComparison,
} from "../../services/reportService.jsx"

import PeriodPicker from "./components/PeriodPicker.jsx"
import KpiCards from "./components/KpiCards.jsx"
import CallsTrendChart from "./components/CallsTrendChart.jsx"
import CallsByHourChart from "./components/CallsByHourChart.jsx"
import StudentsCoverageChart from "./components/StudentsCoverageChart.jsx"
import FormsStatusChart from "./components/FormsStatusChart.jsx"
import MonthlyComparisonChart from "./components/MonthlyComparisonChart.jsx"
import CallsByAdviserTable from "./components/CallsByAdviserTable.jsx"
import UncontactedStudentsTable from "./components/UncontactedStudentsTable.jsx"

function defaultPeriod() {
  const from = moment().format("YYYY-MM-DD") + "T00:00:00+03:30"
  const jNow = moment()
  const jYear = jNow.jYear()
  const jMonth = jNow.jMonth()
  const lastDay = moment.jDaysInMonth(jYear, jMonth)
  const firstOfMonth = moment(`${jYear}/${jMonth + 1}/1`, "jYYYY/jM/jD")
  const lastOfMonth = moment(`${jYear}/${jMonth + 1}/${lastDay}`, "jYYYY/jM/jD")
  return {
    from: firstOfMonth.format("YYYY-MM-DD") + "T00:00:00+03:30",
    to: lastOfMonth.format("YYYY-MM-DD") + "T23:59:59+03:30",
  }
}

function useSectionFetch(fetchFn) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const run = useCallback(
    async (params) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetchFn(params)
        setData(res)
      } catch (e) {
        setError(e?.response?.data?.message || "خطا در بارگذاری داده")
        setData(null)
      } finally {
        setLoading(false)
      }
    },
    [fetchFn]
  )

  return { data, loading, error, run }
}

const ReportsDashboard = () => {
  document.title = "گزارشات | داشبورد آیسوق"

  const { hasPermission } = useAuth()

  const [period, setPeriod] = useState(defaultPeriod)
  const [schoolId, setSchoolId] = useState(undefined)
  const [schools, setSchools] = useState([])

  const showSchoolFilter = hasPermission("schools.index")
  const hasExportPerm = hasPermission("reports.export")

  const overview = useSectionFetch(getReportsOverview)
  const trend = useSectionFetch(getReportsCallsTrend)
  const byHour = useSectionFetch(getReportsCallsByHour)
  const coverage = useSectionFetch(getReportsStudentsCoverage)
  const formsStatus = useSectionFetch(getReportsFormsStatus)
  const monthly = useSectionFetch(getReportsMonthlyComparison)

  const fetchAll = useCallback(
    (p = period, sid = schoolId) => {
      const params = { from: p.from, to: p.to, schoolId: sid }
      overview.run(params)
      trend.run(params)
      byHour.run(params)
      coverage.run(params)
      formsStatus.run(params)
      monthly.run(params)
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  )

  useEffect(() => {
    fetchAll(period, schoolId)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!showSchoolFilter) return
    getSchools({ page: 1, limit: 200 })
      .then((res) => setSchools(res?.items || []))
      .catch(() => {})
  }, [showSchoolFilter])

  const handleApply = ({ from, to, schoolId: sid }) => {
    const newPeriod = { from, to }
    const newSchoolId = sid || undefined
    setPeriod(newPeriod)
    setSchoolId(newSchoolId)
    fetchAll(newPeriod, newSchoolId)
  }

  if (!hasPermission("reports.index")) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="گزارشات" breadcrumbItem="داشبورد گزارشات" />

        {/* Period Picker */}
        <PeriodPicker
          onApply={handleApply}
          schools={schools}
          showSchoolFilter={showSchoolFilter}
        />

        {/* Row 1: KPI Cards */}
        <KpiCards data={overview.data} loading={overview.loading} error={overview.error} />

        {/* Row 2: Calls Trend (full width) */}
        <CallsTrendChart data={trend.data} loading={trend.loading} error={trend.error} />

        {/* Row 3: Calls By Hour + Students Coverage */}
        <Row className="g-4 mb-4">
          <Col lg="7">
            <CallsByHourChart data={byHour.data} loading={byHour.loading} error={byHour.error} />
          </Col>
          <Col lg="5">
            <StudentsCoverageChart
              data={coverage.data}
              loading={coverage.loading}
              error={coverage.error}
            />
          </Col>
        </Row>

        {/* Row 4: Forms Status + Monthly Comparison */}
        <Row className="g-4 mb-4">
          <Col lg="7">
            <FormsStatusChart
              data={formsStatus.data}
              loading={formsStatus.loading}
              error={formsStatus.error}
            />
          </Col>
          <Col lg="5">
            <MonthlyComparisonChart
              data={monthly.data}
              loading={monthly.loading}
              error={monthly.error}
            />
          </Col>
        </Row>

        {/* Row 5: Calls By Adviser Table (full width) */}
        <CallsByAdviserTable
          period={period}
          schoolId={schoolId}
          hasExportPerm={hasExportPerm}
        />

        {/* Row 6: Uncontacted Students Table (full width) */}
        <UncontactedStudentsTable
          period={period}
          schoolId={schoolId}
          hasExportPerm={hasExportPerm}
        />
      </div>
    </div>
  )
}

export default ReportsDashboard
