import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Navigate, useSearchParams } from "react-router-dom"
import {
  Button, Card, CardBody, CardHeader, Col, Input, Label, Progress, Row, Table,
} from "reactstrap"
import DatePicker from "react-multi-date-picker"
import DateObject from "react-date-object"
import persian from "react-date-object/calendars/persian"
import persianFa from "react-date-object/locales/persian_fa"
import moment from "moment-jalaali"
import { toGregorian } from "jalaali-js"
import Select from "react-select"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import Breadcrumbs from "../../components/Common/Breadcrumb"
import Paginations from "../../components/Common/Paginations.jsx"
import TableContainer from "../../components/Common/TableContainer.jsx"
import { useAuth } from "../../context/AuthContext.jsx"
import {
  exportContactFormsComprehensiveReport,
  getContactFormsComprehensiveReport,
} from "../../services/reportService.jsx"
import { getSchools } from "../../services/schoolService.jsx"
import { getSupportForms } from "../../services/supportFormService.jsx"
import {
  canViewComprehensiveReport,
  canExportComprehensiveReport,
  chartColor,
  comprehensiveViewState,
  defaultComprehensiveQuery,
  formatReportDuration,
  normalizeFormIds,
  parseComprehensiveQuery,
  progressValue,
  scheduleDebouncedSearch,
  saveComprehensiveReportBlob,
  serializeComprehensiveQuery,
  toggleSort,
  withDebouncedSearch,
} from "./contactFormsComprehensiveUtils.js"

const fa = (value) => value == null ? "—" : Number(value).toLocaleString("fa-IR")
const percent = (value) => value == null ? "—" : `${Number(value).toLocaleString("fa-IR", { maximumFractionDigits: 1 })}٪`
const dateObject = (date) => new DateObject({ date: moment(String(date).slice(0, 10), "YYYY-MM-DD").toDate(), calendar: persian, locale: persianFa })
const dateObjectToGregorianDate = (dateObjectValue) => {
  const pad = (n) => String(n).padStart(2, "0")
  const g = toGregorian(dateObjectValue.year, dateObjectValue.month.number, dateObjectValue.day)
  return `${g.gy}-${pad(g.gm)}-${pad(g.gd)}`
}

const SectionSkeleton = ({ rows = 4, columns = 6 }) => (
  <div className="placeholder-glow">
    {Array.from({ length: rows }).map((_, row) => <div className="d-flex gap-3 mb-3" key={row}>
      {Array.from({ length: columns }).map((__, column) =>
        <span className="placeholder col" style={{ height: 22 }} key={column} />)}
    </div>)}
  </div>
)

const KpiCards = ({ summary, loading }) => {
  const cards = [
    ["تعداد فرم‌ها", fa(summary.formsCount), "mdi-file-document-multiple-outline", "#556ee6"],
    ["دانش‌آموزان تخصیص‌یافته", fa(summary.assignedStudents), "mdi-account-group-outline", "#50a5f1"],
    ["تکمیل‌شده / باقی‌مانده", `${fa(summary.completedStudents)} / ${fa(summary.remainingStudents)}`, "mdi-account-check-outline", "#34c38f"],
    ["کل / پاسخ‌داده‌شده", `${fa(summary.totalCalls)} / ${fa(summary.answeredCalls)}`, "mdi-phone-check-outline", "#f1b44c"],
    ["دانش‌آموزان یکتا", fa(summary.uniqueStudents), "mdi-account-star-outline", "#6f42c1"],
    ["مجموع / میانگین زمان موفق", `${formatReportDuration(summary.totalDurationSeconds)} / ${formatReportDuration(summary.avgDurationSeconds)}`, "mdi-timer-outline", "#74788d"],
  ]
  return <Row className="g-3 mb-4">
    {cards.map(([label, value, icon, color]) => <Col xl="4" md="6" key={label}>
      <Card className="h-100 shadow-sm"><CardBody>
        {loading ? <SectionSkeleton rows={2} columns={2} /> : <div className="d-flex justify-content-between align-items-center">
          <div><div className="text-muted mb-2">{label}</div><h5 className="mb-0">{value}</h5></div>
          <span className="rounded-circle text-white d-flex align-items-center justify-content-center"
            style={{ width: 42, height: 42, backgroundColor: color }}><i className={`mdi ${icon} fs-5`} /></span>
        </div>}
      </CardBody></Card>
    </Col>)}
    <Col xs="12"><Card className="shadow-sm"><CardBody>
      {loading ? <SectionSkeleton rows={2} columns={1} /> : <>
        <div className="d-flex justify-content-between mb-2"><span>پیشرفت کل</span><strong>{percent(summary.progressPercent)}</strong></div>
        <Progress value={progressValue(summary.progressPercent)} color="success" style={{ height: 10 }} />
      </>}
    </CardBody></Card></Col>
  </Row>
}

const ContactFormsComprehensive = () => {
  document.title = "گزارش جامع فرم‌های تماس | داشبورد آیسوق"
  const { permissions, hasPermission } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryString = searchParams.toString()
  const query = useMemo(() => parseComprehensiveQuery(new URLSearchParams(queryString)), [queryString])
  const [data, setData] = useState({ summary: {}, statuses: [], chart: [], forms: [], meta: {} })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [schools, setSchools] = useState([])
  const [formOptions, setFormOptions] = useState([])
  const [draftFrom, setDraftFrom] = useState(() => dateObject(query.from))
  const [draftTo, setDraftTo] = useState(() => dateObject(query.to))
  const [draftSchoolId, setDraftSchoolId] = useState(query.schoolId)
  const [draftFormIds, setDraftFormIds] = useState(query.formIds ? query.formIds.split(",") : [])
  const [formSearch, setFormSearch] = useState(query.search)
  const [statusSearch, setStatusSearch] = useState(query.statusSearch)
  const [filterError, setFilterError] = useState("")
  const [exporting, setExporting] = useState(false)
  const showSchoolFilter = hasPermission("schools.index")
  const canExport = canExportComprehensiveReport(permissions)

  const updateQuery = useCallback((updates) => {
    setSearchParams(serializeComprehensiveQuery({ ...query, ...updates }))
  }, [query, setSearchParams])

  const loadReport = useCallback((signal) => {
    setLoading(true)
    setError("")
    return getContactFormsComprehensiveReport(query, signal)
      .then(setData)
      .catch((requestError) => {
        if (requestError?.code === "ERR_CANCELED" || requestError?.name === "CanceledError" || signal?.aborted) return
        setError("دریافت گزارش جامع فرم‌های تماس با خطا مواجه شد.")
      })
      .finally(() => { if (!signal?.aborted) setLoading(false) })
  }, [query])

  useEffect(() => {
    const controller = new AbortController()
    loadReport(controller.signal)
    return () => controller.abort()
  }, [loadReport])

  useEffect(() => {
    getSupportForms({ page: 1, limit: 100 })
      .then((result) => setFormOptions((result.items || []).map((form) => ({
        value: String(form.id), label: form.title || form.name || `فرم ${form.id}`,
      }))))
      .catch(() => setFormOptions([]))
    if (showSchoolFilter) {
      getSchools({ page: 1, limit: 100 }).then((result) => setSchools(result.items || [])).catch(() => setSchools([]))
    }
  }, [showSchoolFilter])

  useEffect(() => {
    setDraftFrom(dateObject(query.from))
    setDraftTo(dateObject(query.to))
    setDraftSchoolId(query.schoolId)
    setDraftFormIds(query.formIds ? query.formIds.split(",") : [])
    setFormSearch(query.search)
    setStatusSearch(query.statusSearch)
  }, [query.from, query.to, query.schoolId, query.formIds, query.search, query.statusSearch])

  useEffect(() => {
    if (formSearch === query.search) return
    return scheduleDebouncedSearch((value) => {
      setSearchParams(serializeComprehensiveQuery(withDebouncedSearch(query, "search", value)))
    }, formSearch)
  }, [formSearch, query, setSearchParams])

  useEffect(() => {
    if (statusSearch === query.statusSearch) return
    return scheduleDebouncedSearch((value) => {
      setSearchParams(serializeComprehensiveQuery(withDebouncedSearch(query, "statusSearch", value)))
    }, statusSearch)
  }, [statusSearch, query, setSearchParams])

  const applyFilters = () => {
    if (!draftFrom || !draftTo) return setFilterError("انتخاب هر دو تاریخ الزامی است.")
    if (draftFrom.toDate().getTime() > draftTo.toDate().getTime()) {
      return setFilterError("تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.")
    }
    setFilterError("")
    updateQuery({
      from: dateObjectToGregorianDate(draftFrom),
      to: dateObjectToGregorianDate(draftTo),
      formIds: normalizeFormIds(draftFormIds),
      schoolId: showSchoolFilter ? draftSchoolId : "",
      page: 1,
    })
  }

  const resetFilters = () => setSearchParams(serializeComprehensiveQuery(defaultComprehensiveQuery()))

  const handleExport = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const blob = await exportContactFormsComprehensiveReport(query)
      saveComprehensiveReportBlob(blob)
    } catch {
      // httpClient shows the standard API error toast
    } finally {
      setExporting(false)
    }
  }

  const statusColumns = useMemo(() => [
    { id: "label", accessorKey: "label", header: "نوع تماس", cell: ({ getValue }) => getValue() || "—" },
    { id: "totalDurationSeconds", accessorKey: "totalDurationSeconds", header: "مجموع زمان", cell: ({ getValue }) => formatReportDuration(getValue()) },
    { id: "avgDurationSeconds", accessorKey: "avgDurationSeconds", header: "میانگین زمان", cell: ({ getValue }) => formatReportDuration(getValue()) },
    { id: "uniqueStudents", accessorKey: "uniqueStudents", header: "دانش‌آموز یکتا", cell: ({ getValue }) => fa(getValue()) },
    { id: "totalCalls", accessorKey: "totalCalls", header: "تعداد تماس", cell: ({ getValue }) => fa(getValue()) },
    { id: "percent", accessorKey: "percent", header: "سهم از کل", cell: ({ getValue }) => percent(getValue()) },
  ], [])

  const formColumns = useMemo(() => [
    { id: "formTitle", accessorKey: "formTitle", header: "نام فرم", cell: ({ getValue }) => getValue() || "—" },
    ...["assignedStudents", "completedStudents", "remainingStudents"].map((id, index) => ({
      id, accessorKey: id, header: ["تخصیص‌یافته", "تکمیل‌شده", "باقی‌مانده"][index], cell: ({ getValue }) => fa(getValue()),
    })),
    { id: "progressPercent", accessorKey: "progressPercent", header: "پیشرفت", cell: ({ getValue }) => <div style={{ minWidth: 110 }}><small>{percent(getValue())}</small><Progress value={progressValue(getValue())} color="success" style={{ height: 6 }} /></div> },
    ...["totalCalls", "answeredCalls", "uniqueStudents"].map((id, index) => ({
      id, accessorKey: id, header: ["کل تماس", "پاسخ‌داده‌شده", "دانش‌آموز یکتا"][index], cell: ({ getValue }) => fa(getValue()),
    })),
    ...["totalDurationSeconds", "avgDurationSeconds"].map((id, index) => ({
      id, accessorKey: id, header: ["مجموع زمان", "میانگین زمان"][index], cell: ({ getValue }) => formatReportDuration(getValue()),
    })),
  ], [])

  const state = comprehensiveViewState({
    loading, error, formsCount: data.forms.length, statusesCount: data.statuses.length, chartCount: data.chart.length,
  })
  if (!canViewComprehensiveReport(permissions)) return <Navigate to="/" replace />

  return <div className="page-content"><div className="container-fluid">
    <Breadcrumbs title="مدیریت فرم‌های تماس" breadcrumbItem="گزارش جامع فرم‌های تماس" />
    <Card className="mb-4"><CardHeader className="bg-white"><h5 className="mb-0">گزارش جامع فرم‌های تماس</h5></CardHeader><CardBody>
      <Row className="g-3 align-items-end">
        <Col xl="2" md="4"><Label>از تاریخ</Label><DatePicker calendar={persian} locale={persianFa} value={draftFrom}
          onChange={setDraftFrom} format="YYYY/MM/DD" inputClass="form-control" calendarPosition="bottom-right" /></Col>
        <Col xl="2" md="4"><Label>تا تاریخ</Label><DatePicker calendar={persian} locale={persianFa} value={draftTo}
          onChange={setDraftTo} format="YYYY/MM/DD" inputClass="form-control" calendarPosition="bottom-right" /></Col>
        <Col xl="3" md="4"><Label>فرم‌های تماس</Label><Select isMulti isRtl options={formOptions}
          value={formOptions.filter((option) => draftFormIds.includes(option.value))}
          onChange={(options) => setDraftFormIds(options.map((option) => option.value))}
          placeholder="همه فرم‌ها" noOptionsMessage={() => "فرمی یافت نشد"} /></Col>
        {showSchoolFilter && <Col xl="2" md="4"><Label>مدرسه</Label><Input type="select" value={draftSchoolId}
          onChange={(event) => setDraftSchoolId(event.target.value)}><option value="">همه مدارس</option>
          {schools.map((school) => <option value={school.id} key={school.id}>{school.name || school.title}</option>)}</Input></Col>}
        <Col xl="auto" className="d-flex gap-2 flex-wrap"><Button color="primary" onClick={applyFilters}>اعمال فیلتر</Button>
          <Button color="secondary" outline onClick={resetFilters}>پاک‌کردن</Button>
          {canExport && <Button color="success" onClick={handleExport} disabled={exporting}>
            <i className={`mdi ${exporting ? "mdi-loading mdi-spin" : "mdi-file-excel-outline"} me-1`} />
            دانلود Excel
          </Button>}</Col>
      </Row>{filterError && <div className="alert alert-danger py-2 mt-3 mb-0">{filterError}</div>}
    </CardBody></Card>

    {state === "error" && <div className="alert alert-danger text-center py-4">{error}<div className="mt-2">
      <Button color="danger" outline onClick={() => loadReport(new AbortController().signal)}>تلاش مجدد</Button></div></div>}
    {state === "empty" && <div className="alert alert-light text-center text-muted py-5">داده‌ای برای فیلترهای انتخاب‌شده یافت نشد.</div>}
    {(state === "loading" || state === "ready") && <>
      <KpiCards summary={data.summary} loading={loading} />
      <div className="alert alert-info py-2"><i className="mdi mdi-information-outline me-1" />
        پیشرفت بر اساس وضعیت فعلی دانش‌آموزان تخصیص‌یافته است؛ آمار تماس، زمان و نمودار فقط به بازه زمانی انتخاب‌شده مربوط است.
      </div>
      <Row className="g-4 mb-4">
        <Col xl="7"><Card className="h-100"><CardHeader className="bg-white d-flex justify-content-between align-items-center">
          <h6 className="mb-0">وضعیت تماس‌ها</h6><Input value={statusSearch} onChange={(event) => setStatusSearch(event.target.value)}
            placeholder="جستجو در وضعیت‌ها" style={{ maxWidth: 260 }} /></CardHeader><CardBody>
          {loading ? <SectionSkeleton /> : data.statuses.length ? <TableContainer columns={statusColumns} data={data.statuses}
            isGlobalFilter={false} isPagination={false} manualSorting
            sortingState={[{ id: query.statusSortBy, desc: query.statusSortOrder === "DESC" }]}
            onSortingChange={(next) => { const field = next?.[0]?.id || query.statusSortBy; const sort = toggleSort(query.statusSortBy, query.statusSortOrder, field); updateQuery({ statusSortBy: sort.field, statusSortOrder: sort.order }) }}
            tableClass="table-bordered table-nowrap align-middle mb-0" /> : <div className="text-center text-muted py-5">وضعیتی یافت نشد.</div>}
        </CardBody></Card></Col>
        <Col xl="5"><Card className="h-100"><CardHeader className="bg-white"><h6 className="mb-0">توزیع وضعیت تماس‌ها</h6></CardHeader><CardBody>
          {loading ? <SectionSkeleton rows={6} columns={1} /> : data.chart.length ? <div dir="rtl"><ResponsiveContainer width="100%" height={330}>
            <PieChart><Pie data={data.chart} dataKey="value" nameKey="label" innerRadius={58} outerRadius={98} paddingAngle={2}>
              {data.chart.map((item, index) => <Cell key={item.key || index} fill={chartColor(item, index)} />)}
            </Pie><Tooltip formatter={(value, name, entry) => [`${fa(value)} تماس (${percent(entry.payload.percent)})`, name]} />
              <Legend formatter={(value) => <span className="ms-2">{value}</span>} /></PieChart>
          </ResponsiveContainer></div> : <div className="text-center text-muted py-5">داده‌ای برای نمودار موجود نیست.</div>}
        </CardBody></Card></Col>
      </Row>
      <Card><CardHeader className="bg-white d-flex justify-content-between align-items-center"><h6 className="mb-0">پیشرفت فرم‌ها</h6>
        <Input value={formSearch} onChange={(event) => setFormSearch(event.target.value)} placeholder="جستجو در فرم‌ها" style={{ maxWidth: 280 }} /></CardHeader><CardBody>
        {loading ? <SectionSkeleton rows={8} columns={8} /> : data.forms.length ? <>
          <TableContainer columns={formColumns} data={data.forms} isGlobalFilter={false} isPagination={false} manualSorting
            sortingState={[{ id: query.sortBy, desc: query.sortOrder === "DESC" }]}
            onSortingChange={(next) => { const field = next?.[0]?.id || query.sortBy; const sort = toggleSort(query.sortBy, query.sortOrder, field); updateQuery({ sortBy: sort.field, sortOrder: sort.order, page: 1 }) }}
            tableClass="table-bordered table-nowrap align-middle mb-0" />
          <div className="mt-3"><Paginations perPageData={data.meta.limit || query.limit} data={data.forms}
            totalRecords={data.meta.total || 0} currentPage={data.meta.page || query.page}
            setCurrentPage={(page) => updateQuery({ page })} isShowingPageLength paginationDiv="col-sm-auto"
            paginationClass="pagination pagination-sm mb-0" /></div></> : <div className="text-center text-muted py-5">فرمی یافت نشد.</div>}
      </CardBody></Card>
    </>}
  </div></div>
}

export default ContactFormsComprehensive
