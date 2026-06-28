// src/pages/Voip/Analytics/VoipAnalytics.jsx
import React, { useCallback, useEffect, useState } from "react"
import { Navigate, useSearchParams } from "react-router-dom"
import moment from "moment-jalaali"

import Breadcrumbs from "../../../components/Common/Breadcrumb"
import { useAuth } from "../../../context/AuthContext.jsx"
import { getSchools } from "../../../services/schoolService.jsx"
import {
  getVoipAnalyticsSummary,
  getVoipAnalyticsDurationMismatch,
  getVoipAnalyticsFailedFiles,
  getVoipAnalyticsOrphanedCalls,
  getVoipAnalyticsNullCallGroup,
  getVoipAnalyticsUnansweredAnswers,
} from "../../../services/voipAnalyticsService.jsx"

import AnalyticsFilters from "./components/AnalyticsFilters.jsx"
import AnalyticsKpiCards from "./components/AnalyticsKpiCards.jsx"
import SummaryTable from "./components/SummaryTable.jsx"
import DurationMismatchSection from "./components/DurationMismatchSection.jsx"
import FailedFilesSection from "./components/FailedFilesSection.jsx"
import OrphanedCallsSection from "./components/OrphanedCallsSection.jsx"
import NullCallGroupSection from "./components/NullCallGroupSection.jsx"
import UnansweredAnswersSection from "./components/UnansweredAnswersSection.jsx"

// period state stores YYYY-MM-DD only — timezone is added at API call time
function defaultPeriod() {
  const jNow = moment()
  const jYear = jNow.jYear()
  const jMonth = jNow.jMonth()
  const lastDay = moment.jDaysInMonth(jYear, jMonth)
  const firstOfMonth = moment(`${jYear}/${jMonth + 1}/1`, "jYYYY/jM/jD")
  const lastOfMonth = moment(`${jYear}/${jMonth + 1}/${lastDay}`, "jYYYY/jM/jD")
  return {
    from: firstOfMonth.format("YYYY-MM-DD"),
    to: lastOfMonth.format("YYYY-MM-DD"),
  }
}

// adds Tehran UTC+3:30 offset — axios params object encodes + as %2B automatically
function toIso(date, endOfDay = false) {
  return `${date}T${endOfDay ? "23:59:59" : "00:00:00"}+03:30`
}

function initPeriodFromUrl(searchParams) {
  const fromDate = searchParams.get("from")
  const toDate = searchParams.get("to")
  if (fromDate && toDate) return { from: fromDate, to: toDate }
  return defaultPeriod()
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

const VoipAnalytics = () => {
  document.title = "آنالیز وویپ | داشبورد آیسوق"

  const { hasPermission } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [period, setPeriod] = useState(() => initPeriodFromUrl(searchParams))
  const [schoolId, setSchoolId] = useState(
    searchParams.get("school_id") ? Number(searchParams.get("school_id")) : undefined
  )
  const [schools, setSchools] = useState([])

  const showSchoolFilter = hasPermission("schools.index")
  const canExport = hasPermission("voip.analytics.export")

  const summary = useSectionFetch(getVoipAnalyticsSummary)
  const durationMismatch = useSectionFetch(getVoipAnalyticsDurationMismatch)
  const failedFiles = useSectionFetch(getVoipAnalyticsFailedFiles)
  const orphanedCalls = useSectionFetch(getVoipAnalyticsOrphanedCalls)
  const nullCallGroup = useSectionFetch(getVoipAnalyticsNullCallGroup)
  const unansweredAnswers = useSectionFetch(getVoipAnalyticsUnansweredAnswers)

  const fetchAll = useCallback(
    (p = period, sid = schoolId) => {
      const params = { from: toIso(p.from), to: toIso(p.to, true), schoolId: sid }
      summary.run(params)
      durationMismatch.run(params)
      failedFiles.run(params)
      orphanedCalls.run(params)
      nullCallGroup.run(params)
      unansweredAnswers.run(params)
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

  // from/to are YYYY-MM-DD strings from AnalyticsFilters — URL stays clean and shareable
  const handleApply = ({ from, to, schoolId: sid }) => {
    const newPeriod = { from, to }
    const newSchoolId = sid ? Number(sid) : undefined
    setPeriod(newPeriod)
    setSchoolId(newSchoolId)

    const urlParams = {}
    if (from) urlParams.from = from
    if (to) urlParams.to = to
    if (newSchoolId) urlParams.school_id = String(newSchoolId)
    setSearchParams(urlParams, { replace: true })

    fetchAll(newPeriod, newSchoolId)
  }

  const handleSchoolClick = (sid) => {
    const newSchoolId = sid ? Number(sid) : undefined
    setSchoolId(newSchoolId)
    const urlParams = {}
    if (period.from) urlParams.from = period.from
    if (period.to) urlParams.to = period.to
    if (newSchoolId) urlParams.school_id = String(newSchoolId)
    setSearchParams(urlParams, { replace: true })
    fetchAll(period, newSchoolId)
  }

  if (!hasPermission("voip.analytics.index")) {
    return <Navigate to="/" replace />
  }

  // exportParams for CSV download buttons — URLSearchParams encodes + as %2B
  const exportParams = {
    from: toIso(period.from),
    to: toIso(period.to, true),
    ...(schoolId ? { school_id: String(schoolId) } : {}),
  }

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="سرویس وویپ" breadcrumbItem="آنالیز وویپ" />

        <AnalyticsFilters
          onApply={handleApply}
          schools={schools}
          showSchoolFilter={showSchoolFilter}
          initialFrom={period.from}
          initialTo={period.to}
        />

        <AnalyticsKpiCards
          data={summary.data}
          loading={summary.loading}
          error={summary.error}
          unansweredData={unansweredAnswers.data}
          unansweredLoading={unansweredAnswers.loading}
          exportParams={exportParams}
          canExport={canExport}
        />

        <SummaryTable
          data={summary.data}
          loading={summary.loading}
          error={summary.error}
          onSchoolClick={handleSchoolClick}
        />

        <DurationMismatchSection
          data={durationMismatch.data}
          loading={durationMismatch.loading}
          error={durationMismatch.error}
          exportParams={exportParams}
          canExport={canExport}
        />

        <FailedFilesSection
          data={failedFiles.data}
          loading={failedFiles.loading}
          error={failedFiles.error}
          exportParams={exportParams}
          canExport={canExport}
        />

        <OrphanedCallsSection
          data={orphanedCalls.data}
          loading={orphanedCalls.loading}
          error={orphanedCalls.error}
          exportParams={exportParams}
          canExport={canExport}
        />

        <NullCallGroupSection
          data={nullCallGroup.data}
          loading={nullCallGroup.loading}
          error={nullCallGroup.error}
          exportParams={exportParams}
          canExport={canExport}
        />

        <UnansweredAnswersSection
          data={unansweredAnswers.data}
          loading={unansweredAnswers.loading}
          error={unansweredAnswers.error}
          exportParams={exportParams}
          canExport={canExport}
        />
      </div>
    </div>
  )
}

export default VoipAnalytics
