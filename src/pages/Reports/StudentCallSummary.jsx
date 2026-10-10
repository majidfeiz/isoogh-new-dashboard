import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Button, Card, CardBody, CardHeader, Col, Input, Label, Row, Spinner, Table } from "reactstrap"
import DatePicker from "react-multi-date-picker"
import DateObject from "react-date-object"
import persian from "react-date-object/calendars/persian"
import persianFa from "react-date-object/locales/persian_fa"

import Breadcrumbs from "../../components/Common/Breadcrumb"
import Paginations from "../../components/Common/Paginations.jsx"
import TableContainer from "../../components/Common/TableContainer.jsx"
import { useAuth } from "../../context/AuthContext.jsx"
import { AUTH_CLEARED_EVENT } from "../../helpers/authStorage.jsx"
import { getSchools } from "../../services/schoolService.jsx"
import { getStudentCallSummary, streamStudentCallSummaryExport } from "../../services/studentCallSummaryService.jsx"
import {
  buildStudentCallSummaryRange, formatStudentCallDuration, logInconsistentCallTotals,
  parseStudentCallSummaryQuery, rowNumber,
  serializeStudentCallSummaryQuery, studentCallSummaryErrorMessage,
} from "./studentCallSummaryUtils.js"

const fa = (value) => Number(value || 0).toLocaleString("fa-IR")
const display = (value) => value == null || value === "" ? "—" : value
const dateFromIso = (value) => value ? new DateObject({ date: String(value).slice(0, 10), format: "YYYY-MM-DD" }).convert(persian, persianFa) : null
const emptyData = (query) => ({ items: [], meta: { page: query.page, limit: query.limit, total: 0, lastPage: 1 } })

const StudentCallSummary = () => {
  document.title = "گزارش تجمیعی تماس دانش‌آموزان | داشبورد آیسوق"
  const { hasPermission } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryString = searchParams.toString()
  const query = useMemo(() => parseStudentCallSummaryQuery(new URLSearchParams(queryString)), [queryString])
  const [data, setData] = useState(() => emptyData(query))
  const [schools, setSchools] = useState([])
  const [schoolsLoading, setSchoolsLoading] = useState(true)
  const [schoolsError, setSchoolsError] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [exportProgress, setExportProgress] = useState({ status: "idle", loadedBytes: 0, totalBytes: null, filename: "" })
  const [retrySchools, setRetrySchools] = useState(0)
  const [retryReport, setRetryReport] = useState(0)
  const [search, setSearch] = useState(query.search)
  const [fromDate, setFromDate] = useState(() => dateFromIso(query.from))
  const [toDate, setToDate] = useState(() => query.to ? dateFromIso(new Date(Date.parse(query.to) - 86400000).toISOString()) : null)
  const [filterError, setFilterError] = useState("")
  const exportControllerRef = React.useRef(null)

  const updateQuery = useCallback((updates) => {
    setSearchParams(serializeStudentCallSummaryQuery({ ...query, ...updates }))
  }, [query, setSearchParams])

  useEffect(() => {
    const controller = new AbortController()
    setSchoolsLoading(true)
    setSchoolsError("")
    getSchools({ page: 1, limit: 100, sortBy: "name", sortOrder: "ASC", signal: controller.signal })
      .then((result) => {
        const items = result.items || []
        setSchools(items)
        if (!query.schoolId && items.length === 1) updateQuery({ schoolId: items[0].id, page: 1 })
      })
      .catch((requestError) => {
        if (requestError?.code !== "ERR_CANCELED") setSchoolsError("دریافت مجموعه‌ها با خطا مواجه شد.")
      })
      .finally(() => { if (!controller.signal.aborted) setSchoolsLoading(false) })
    return () => controller.abort()
    // School access is enforced by the server and options only need reloading on retry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retrySchools])

  useEffect(() => {
    setData(emptyData(query))
    setError("")
    if (!query.schoolId) { setLoading(false); return }
    const controller = new AbortController()
    setLoading(true)
    getStudentCallSummary(query, controller.signal)
      .then((result) => { logInconsistentCallTotals(result.items); setData(result) })
      .catch((requestError) => {
        if (requestError?.code !== "ERR_CANCELED" && !controller.signal.aborted) setError(studentCallSummaryErrorMessage(requestError))
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [query, retryReport])

  useEffect(() => { setSearch(query.search) }, [query.search])
  useEffect(() => {
    setFromDate(dateFromIso(query.from))
    setToDate(query.to ? dateFromIso(new Date(Date.parse(query.to) - 86400000).toISOString()) : null)
  }, [query.from, query.to])
  useEffect(() => {
    const cancelExport = () => exportControllerRef.current?.abort()
    window.addEventListener(AUTH_CLEARED_EVENT, cancelExport)
    return () => { window.removeEventListener(AUTH_CLEARED_EVENT, cancelExport); cancelExport() }
  }, [])
  useEffect(() => {
    if (search === query.search) return
    const timer = setTimeout(() => updateQuery({ search: search.trim(), page: 1 }), 400)
    return () => clearTimeout(timer)
  }, [query.search, search, updateQuery])

  const applyRange = () => {
    const range = buildStudentCallSummaryRange(fromDate, toDate)
    setFilterError(range.error)
    if (!range.error) updateQuery({ from: range.from, to: range.to, page: 1 })
  }
  const clearFilters = () => {
    setSearch(""); setFromDate(null); setToDate(null); setFilterError("")
    setSearchParams(serializeStudentCallSummaryQuery({ ...query, from: "", to: "", search: "", page: 1 }))
  }
  const handleExport = async () => {
    if (!query.schoolId || ["connecting", "streaming"].includes(exportProgress.status)) return
    const controller = new AbortController()
    exportControllerRef.current = controller
    try {
      await streamStudentCallSummaryExport(query, { signal: controller.signal, onProgress: setExportProgress })
    } catch (requestError) {
      const cancelled = controller.signal.aborted || requestError?.name === "AbortError"
      setExportProgress((current) => ({ ...current, status: cancelled ? "cancelled" : "failed", error: cancelled ? "دانلود لغو شد." : studentCallSummaryErrorMessage(requestError) }))
    } finally {
      if (exportControllerRef.current === controller) exportControllerRef.current = null
    }
  }
  const changeSort = (next) => {
    const field = next?.[0]?.id || query.sortBy
    const order = query.sortBy === field && query.sortOrder === "ASC" ? "DESC" : "ASC"
    updateQuery({ sortBy: field, sortOrder: order, page: 1 })
  }

  const columns = useMemo(() => [
    { id: "rowNumber", header: "ردیف", enableSorting: false, cell: ({ row }) => fa(rowNumber(query.page, query.limit, row.index)) },
    { id: "username", accessorKey: "username", header: "نام کاربری", cell: ({ getValue }) => display(getValue()) },
    { id: "studentName", accessorKey: "studentName", header: "نام دانش‌آموز", cell: ({ getValue }) => display(getValue()) },
    { id: "totalConversationSeconds", accessorKey: "totalConversationSeconds", header: "مجموع مدت مکالمه", cell: ({ getValue }) => formatStudentCallDuration(getValue()) },
    { id: "totalCalls", accessorKey: "totalCalls", header: "مجموع تعداد دفعات تماس", cell: ({ getValue }) => fa(getValue()) },
    { id: "successfulCalls", accessorKey: "successfulCalls", header: "تعداد کل تماس‌های موفق", cell: ({ getValue }) => fa(getValue()) },
    { id: "unsuccessfulCalls", accessorKey: "unsuccessfulCalls", header: "تعداد کل تماس‌های ناموفق", cell: ({ getValue }) => fa(getValue()) },
    { id: "adviserName", accessorKey: "adviserName", header: "نام مشاور", cell: ({ getValue }) => display(getValue()) },
  ], [query.limit, query.page])

  const state = !query.schoolId ? "guide" : loading ? "loading" : error ? "error" : data.items.length ? "ready" : "empty"
  const exporting = ["connecting", "streaming"].includes(exportProgress.status)
  const exportPercent = exportProgress.totalBytes ? Math.min(100, Math.round((exportProgress.loadedBytes / exportProgress.totalBytes) * 100)) : null
  const formatBytes = (bytes = 0) => bytes < 1024 ? `${bytes} بایت` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} کیلوبایت` : `${(bytes / 1048576).toFixed(1)} مگابایت`
  return <div className="page-content" dir="rtl"><div className="container-fluid">
    <Breadcrumbs title="گزارشات" breadcrumbItem="گزارش تجمیعی تماس دانش‌آموزان" />
    <Card className="mb-4"><CardHeader className="bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
      <h5 className="mb-0">گزارش تجمیعی تماس دانش‌آموزان</h5>
      {hasPermission("reports.student-call-summary.export") && <Button data-testid="export-button" color="success" disabled={!query.schoolId || exporting} onClick={handleExport}>
        {exporting ? <Spinner size="sm" className="me-1" /> : <i className="mdi mdi-file-excel-outline me-1" />}
        {exporting ? "در حال دانلود..." : "خروجی Excel"}
      </Button>}
    </CardHeader><CardBody><Row className="g-3 align-items-end">
      <Col xl="3" md="6"><Label for="summary-school">مجموعه <span className="text-danger">*</span></Label>
        <Input id="summary-school" type="select" value={query.schoolId} disabled={schoolsLoading} onChange={(event) => updateQuery({ schoolId: event.target.value, page: 1 })}>
          <option value="">انتخاب مجموعه</option>{schools.map((school) => <option key={school.id} value={school.id}>{school.title || school.name}</option>)}
        </Input>{schoolsError && <div className="text-danger small mt-1">{schoolsError} <button type="button" className="btn btn-link btn-sm p-0" onClick={() => setRetrySchools((value) => value + 1)}>تلاش مجدد</button></div>}
      </Col>
      <Col xl="2" md="4"><Label>از تاریخ</Label><DatePicker value={fromDate} onChange={setFromDate} calendar={persian} locale={persianFa} format="YYYY/MM/DD" inputClass="form-control" calendarPosition="bottom-right" /></Col>
      <Col xl="2" md="4"><Label>تا تاریخ</Label><DatePicker value={toDate} onChange={setToDate} calendar={persian} locale={persianFa} format="YYYY/MM/DD" inputClass="form-control" calendarPosition="bottom-right" /></Col>
      <Col xl="2" md="4"><Button color="primary" outline className="w-100" onClick={applyRange}>اعمال بازه</Button></Col>
      <Col xl="3" md="6"><Label for="summary-search">جستجو</Label><Input id="summary-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="نام دانش‌آموز، نام کاربری یا مشاور" /></Col>
      <Col xs="12"><Button color="secondary" outline onClick={clearFilters} disabled={!query.from && !query.search}>پاک‌کردن فیلترها</Button></Col>
    </Row>{filterError && <div className="alert alert-danger py-2 mt-3 mb-0">{filterError}</div>}
      {exportProgress.status !== "idle" && <div className="border rounded p-3 mt-3" data-testid="export-progress">
        <div className="d-flex justify-content-between align-items-center mb-2"><strong>در حال آماده‌سازی خروجی</strong>
          {exporting && <Button size="sm" color="danger" outline onClick={() => exportControllerRef.current?.abort()}>لغو</Button>}
        </div>
        <div className="progress mb-2" role="progressbar" aria-valuenow={exportPercent == null ? undefined : exportPercent}>
          <div className={`progress-bar ${exportPercent == null && exporting ? "progress-bar-striped progress-bar-animated" : ""}`} style={{ width: exportPercent == null ? (exporting ? "100%" : "0%") : `${exportPercent}%` }}>{exportPercent == null ? "" : `${exportPercent}٪`}</div>
        </div>
        <div className="small text-muted">حجم دریافت‌شده: {formatBytes(exportProgress.loadedBytes)}{exportProgress.totalBytes ? ` از ${formatBytes(exportProgress.totalBytes)}` : ""}</div>
        {exportProgress.memoryFallback && <div className="alert alert-warning py-2 mt-2 mb-0">مرورگر شما ذخیره مستقیم فایل را پشتیبانی نمی‌کند؛ فایل تا پایان دانلود در حافظه نگهداری می‌شود.</div>}
        {exportProgress.status === "completed" && <div className="text-success mt-2">دانلود با موفقیت کامل شد.</div>}
        {exportProgress.status === "cancelled" && <div className="text-warning mt-2">دانلود لغو شد.</div>}
        {exportProgress.status === "failed" && <div className="text-danger mt-2">{exportProgress.error}<Button size="sm" color="link" onClick={handleExport}>تلاش مجدد</Button></div>}
      </div>}
    </CardBody></Card>

    {state === "guide" && <Card><CardBody className="text-center text-muted py-5">ابتدا مجموعه را انتخاب کنید.</CardBody></Card>}
    {state === "error" && <div className="alert alert-danger text-center py-4">{error}<div className="mt-2"><Button color="danger" outline onClick={() => setRetryReport((value) => value + 1)}>تلاش مجدد</Button></div></div>}
    {state === "empty" && <Card><CardBody className="text-center text-muted py-5"><i className="mdi mdi-account-search-outline fs-1 d-block mb-2" />رکوردی برای فیلترهای انتخاب‌شده یافت نشد.</CardBody></Card>}
    {state === "loading" && <Card><CardBody><div className="table-responsive"><Table bordered><tbody>{Array.from({ length: 7 }).map((_, row) => <tr key={row}>{columns.map((column) => <td key={column.id}><span className="placeholder col-8" /></td>)}</tr>)}</tbody></Table></div></CardBody></Card>}
    {state === "ready" && <Card><CardHeader className="bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
      <span>تعداد کل رکوردها: <strong>{fa(data.meta.total)}</strong></span><div className="d-flex align-items-center gap-2"><Label className="mb-0" for="summary-limit">تعداد در صفحه</Label>
      <Input id="summary-limit" type="select" value={query.limit} onChange={(event) => updateQuery({ limit: Number(event.target.value), page: 1 })} style={{ width: 85 }}>{[10, 25, 50, 100].map((limit) => <option key={limit} value={limit}>{limit}</option>)}</Input></div>
    </CardHeader><CardBody><TableContainer columns={columns} data={data.items} isGlobalFilter={false} isPagination={false} manualSorting sortingState={[{ id: query.sortBy, desc: query.sortOrder === "DESC" }]} onSortingChange={changeSort} tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline" />
      <div className="mt-3"><Paginations perPageData={data.meta.limit || query.limit} data={data.items} totalRecords={data.meta.total || 0} currentPage={data.meta.page || query.page} setCurrentPage={(page) => updateQuery({ page })} isShowingPageLength paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" /></div>
    </CardBody></Card>}
  </div></div>
}

export default StudentCallSummary
