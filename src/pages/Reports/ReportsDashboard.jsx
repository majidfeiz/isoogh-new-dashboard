import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Navigate, useSearchParams } from "react-router-dom"
import { Alert, Button, Col, Row } from "reactstrap"
import Breadcrumbs from "../../components/Common/Breadcrumb"
import { useAuth } from "../../context/AuthContext.jsx"
import { clearReportCache, getReportsOverview, getReportsCallsTrend, getReportsCallsByHour, getReportsStudentsCoverage, getReportsFormsStatus, getReportsMonthlyComparison, reportQueryKey, runReportQuery } from "../../services/reportService.jsx"
import PeriodPicker from "./components/PeriodPicker.jsx"
import ReportSchoolPicker from "./components/ReportSchoolPicker.jsx"
import KpiCards from "./components/KpiCards.jsx"
import CallsTrendChart from "./components/CallsTrendChart.jsx"
import CallsByHourChart from "./components/CallsByHourChart.jsx"
import StudentsCoverageChart from "./components/StudentsCoverageChart.jsx"
import FormsStatusChart from "./components/FormsStatusChart.jsx"
import MonthlyComparisonChart from "./components/MonthlyComparisonChart.jsx"
import UncontactedStudentsTable from "./components/UncontactedStudentsTable.jsx"
import { canceledReportError, currentJalaliMonthRange, isReportManager, normalizeReportSchools, reportErrorMessage, reportRoleNames, validDashboardRange } from "./reportDashboardUtils.js"

function useReportWidget(endpoint, fetcher, params, enabled) {
  const key = useMemo(() => reportQueryKey(endpoint, params), [endpoint, params.from, params.to, params.schoolId])
  const [state, setState] = useState({ data: null, loading: false, refreshing: false, error: "", revision: 0 })
  const currentKey = useRef(key)
  const load = useCallback(async (force = false) => {
    if (!enabled) return
    const previousKey = currentKey.current
    currentKey.current = key
    setState((old) => {
      const sameQueryData = previousKey === key ? old.data : null
      return { ...old, data: sameQueryData, loading: !sameQueryData, refreshing: !!sameQueryData, error: "" }
    })
    const request = () => fetcher(params)
    try {
      let data
      try { data = await runReportQuery(key, request, { force }) }
      catch (error) { if (error?.response?.status !== 503) throw error; data = await runReportQuery(key, request, { force: true }) }
      if (currentKey.current === key) setState((old) => ({ ...old, data, loading: false, refreshing: false, error: "" }))
    } catch (error) { if (!canceledReportError(error) && currentKey.current === key) { if (error?.response?.status === 403) clearReportCache((cacheKey) => cacheKey.includes(`|${params.schoolId}|`)); setState((old) => ({ ...old, data: null, loading: false, refreshing: false, error: reportErrorMessage(error) })) } }
  }, [enabled, fetcher, key, params])
  useEffect(() => { currentKey.current = key; if (!enabled) { setState({ data: null, loading: false, refreshing: false, error: "", revision: 0 }); return }; setState((old) => ({ ...old, data: null })); load(false) }, [enabled, key]) // eslint-disable-line react-hooks/exhaustive-deps
  return { ...state, retry: () => load(true) }
}

function LazySection({ children, onVisible }) {
  const ref = useRef(null); const [visible, setVisible] = useState(false)
  useEffect(() => { if (!globalThis.IntersectionObserver) { setVisible(true); return undefined }; const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } }, { rootMargin: "200px" }); if (ref.current) observer.observe(ref.current); return () => observer.disconnect() }, [])
  useEffect(() => { if (visible) onVisible?.() }, [visible, onVisible])
  return <div ref={ref} style={{ minHeight: visible ? undefined : 220 }}>{children(visible)}</div>
}

const Widget = ({ section, children }) => section.error ? <Alert color="danger">{section.error} <Button size="sm" color="link" onClick={section.retry}>تلاش مجدد</Button></Alert> : <>{section.refreshing && <div className="small text-primary mb-1" aria-live="polite">در حال بروزرسانی…</div>}{children}</>

export default function ReportsDashboard() {
  document.title = "گزارشات | داشبورد آیسوق"
  const { user, hasPermission, selectedSchoolId, setSelectedSchoolId } = useAuth(); const [searchParams, setSearchParams] = useSearchParams()
  const defaults = useMemo(() => currentJalaliMonthRange(), [])
  const from = searchParams.get("from") || defaults.from; const to = searchParams.get("to") || defaults.to
  const managerAccount = isReportManager(user)
  const roles = reportRoleNames(user)
  const isAdminScope = !managerAccount && (roles.some((role) => ["admin", "super_manager"].includes(role)) || hasPermission("schools.index"))
  const ownSchools = useMemo(() => normalizeReportSchools(user, selectedSchoolId), [selectedSchoolId, user])
  const automaticSchool = !isAdminScope && ownSchools.length === 1 ? String(ownSchools[0].id) : ""
  const schoolId = automaticSchool || searchParams.get("schoolId") || ""
  const range = useMemo(() => ({ from, to }), [from, to]); const params = useMemo(() => ({ from, to, schoolId: schoolId || undefined }), [from, to, schoolId])
  const validRange = validDashboardRange(range); const ready = validRange && (!isAdminScope || !!schoolId)
  useEffect(() => { if (automaticSchool && String(selectedSchoolId || "") !== automaticSchool) setSelectedSchoolId?.(automaticSchool); if (!searchParams.get("from") || !searchParams.get("to") || (automaticSchool && searchParams.get("schoolId") !== automaticSchool)) setSearchParams((current) => { const next = new URLSearchParams(current); next.set("from", from); next.set("to", to); if (automaticSchool) next.set("schoolId", automaticSchool); return next }, { replace: true }) }, [automaticSchool, from, searchParams, selectedSchoolId, setSearchParams, setSelectedSchoolId, to])
  const update = (values) => setSearchParams((current) => { const next = new URLSearchParams(current); Object.entries(values).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key)); next.delete("page"); return next })

  const overview = useReportWidget("overview", getReportsOverview, params, ready)
  const trend = useReportWidget("calls-trend", getReportsCallsTrend, params, ready)
  const [lowerVisible, setLowerVisible] = useState(false)
  const byHour = useReportWidget("calls-by-hour", getReportsCallsByHour, params, ready && lowerVisible)
  const coverage = useReportWidget("students-coverage", getReportsStudentsCoverage, params, ready && lowerVisible)
  const formsStatus = useReportWidget("forms-status", getReportsFormsStatus, params, ready && lowerVisible)
  const monthly = useReportWidget("monthly-comparison", getReportsMonthlyComparison, params, ready && lowerVisible)
  const revealLower = useCallback(() => setLowerVisible(true), [])

  if (!hasPermission("reports.index")) return <Navigate to="/" replace />
  const schoolControl = <ReportSchoolPicker value={schoolId} onChange={(value) => { setSelectedSchoolId?.(value); update({ schoolId: value }) }} allowAll={!isAdminScope && ownSchools.length > 1} scopedSchools={isAdminScope ? null : ownSchools} />
  return <div className="page-content"><div className="container-fluid"><Breadcrumbs title="گزارشات" breadcrumbItem="داشبورد گزارشات" />
    <PeriodPicker value={range} onApply={(next) => update(next)} schoolControl={schoolControl} />
    {!validRange && <Alert color="danger">تاریخ شروع باید قبل از تاریخ پایان بازه باشد.</Alert>}
    {isAdminScope && !schoolId && <Alert color="info">برای مشاهده گزارش، مجموعه را انتخاب کنید</Alert>}
    {ready && <><Widget section={overview}><KpiCards data={overview.data} loading={overview.loading} /></Widget><Widget section={trend}><CallsTrendChart data={trend.data} loading={trend.loading} /></Widget>
      <LazySection onVisible={revealLower}>{(visible) => visible ? <><Row className="g-4 mb-4"><Col lg="7"><Widget section={byHour}><CallsByHourChart data={byHour.data} loading={byHour.loading} /></Widget></Col><Col lg="5"><Widget section={coverage}><StudentsCoverageChart data={coverage.data} loading={coverage.loading} /></Widget></Col></Row><Row className="g-4 mb-4"><Col lg="7"><Widget section={formsStatus}><FormsStatusChart data={formsStatus.data} loading={formsStatus.loading} /></Widget></Col><Col lg="5"><Widget section={monthly}><MonthlyComparisonChart data={monthly.data} loading={monthly.loading} /></Widget></Col></Row><UncontactedStudentsTable period={range} schoolId={schoolId} hasExportPerm={hasPermission("reports.uncontacted-students.export") || hasPermission("reports.adviser-call-performance.export")} enabled={ready} /></> : <div className="placeholder-glow"><span className="placeholder col-12" style={{ height: 180 }} /></div>}</LazySection>
    </>}
  </div></div>
}
