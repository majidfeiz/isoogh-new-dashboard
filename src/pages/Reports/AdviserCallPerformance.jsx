import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Navigate, useSearchParams } from "react-router-dom"
import { Button, Card, CardBody, CardHeader, Col, Input, Label, Row, Table } from "reactstrap"
import DatePicker from "react-multi-date-picker"
import DateObject from "react-date-object"
import persian from "react-date-object/calendars/persian"
import persianFa from "react-date-object/locales/persian_fa"
import moment from "moment-jalaali"
import { toGregorian } from "jalaali-js"

import Breadcrumbs from "../../components/Common/Breadcrumb"
import Paginations from "../../components/Common/Paginations.jsx"
import TableContainer from "../../components/Common/TableContainer.jsx"
import { useAuth } from "../../context/AuthContext.jsx"
import { getSchools } from "../../services/schoolService.jsx"
import {
  exportReportsCallsByAdviser,
  getReportsCallsByAdviser,
} from "../../services/reportService.jsx"
import {
  formatDuration,
  nextSort,
  parseReportQuery,
  reportTableState,
  serializeReportQuery,
  withSearch,
} from "./adviserCallPerformanceUtils.js"

const number = (value) => value == null ? "—" : Number(value).toLocaleString("fa-IR")
const dateObject = (date) => new DateObject({ date: moment(String(date).slice(0, 10), "YYYY-MM-DD").toDate(), calendar: persian, locale: persianFa })
const dateObjectToGregorianDate = (dateObjectValue) => {
  const pad = (n) => String(n).padStart(2, "0")
  const g = toGregorian(dateObjectValue.year, dateObjectValue.month.number, dateObjectValue.day)
  return `${g.gy}-${pad(g.gm)}-${pad(g.gd)}`
}

const AdviserCallPerformance = () => {
  document.title = "گزارش عملکرد تماس مشاوران | داشبورد آیسوق"

  const { hasPermission } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryString = searchParams.toString()
  const query = useMemo(() => parseReportQuery(new URLSearchParams(queryString)), [queryString])
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ page: query.page, limit: query.limit, total: 0, lastPage: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [exporting, setExporting] = useState(false)
  const [schools, setSchools] = useState([])
  const [draftSearch, setDraftSearch] = useState(query.search)
  const [draftFrom, setDraftFrom] = useState(() => dateObject(query.from))
  const [draftTo, setDraftTo] = useState(() => dateObject(query.to))
  const [draftSchoolId, setDraftSchoolId] = useState(query.schoolId)
  const [filterError, setFilterError] = useState("")
  const requestId = useRef(0)

  const showSchoolFilter = hasPermission("schools.index")
  const canExport = hasPermission("reports.adviser-call-performance.export")

  const updateQuery = useCallback((updates) => {
    setSearchParams(serializeReportQuery({ ...query, ...updates }))
  }, [query, setSearchParams])

  const fetchData = useCallback(async () => {
    const currentRequest = ++requestId.current
    setLoading(true)
    setError("")
    try {
      const result = await getReportsCallsByAdviser(query)
      if (currentRequest !== requestId.current) return
      const rows = result?.items || result?.data || []
      const resultMeta = result?.meta || result?.pagination || {}
      setItems(rows)
      setMeta({
        page: resultMeta.page ?? query.page,
        limit: resultMeta.limit ?? query.limit,
        total: resultMeta.total ?? rows.length,
        lastPage: resultMeta.lastPage ?? 1,
      })
    } catch {
      if (currentRequest !== requestId.current) return
      setItems([])
      setError("دریافت گزارش با خطا مواجه شد.")
    } finally {
      if (currentRequest === requestId.current) setLoading(false)
    }
  }, [query])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    setDraftSearch(query.search)
    setDraftFrom(dateObject(query.from))
    setDraftTo(dateObject(query.to))
    setDraftSchoolId(query.schoolId)
  }, [query.from, query.to, query.schoolId, query.search])

  useEffect(() => {
    if (!showSchoolFilter) return
    getSchools({ page: 1, limit: 100 })
      .then((result) => setSchools(result?.items || []))
      .catch(() => setSchools([]))
  }, [showSchoolFilter])

  useEffect(() => {
    if (draftSearch === query.search) return
    const timer = setTimeout(() => {
      setSearchParams(serializeReportQuery(withSearch(query, draftSearch)))
    }, 400)
    return () => clearTimeout(timer)
  }, [draftSearch, query, setSearchParams])

  const applyFilters = () => {
    if (!draftFrom || !draftTo) {
      setFilterError("انتخاب هر دو تاریخ الزامی است.")
      return
    }
    if (draftFrom.toDate().getTime() > draftTo.toDate().getTime()) {
      setFilterError("تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.")
      return
    }
    setFilterError("")
    updateQuery({
      from: dateObjectToGregorianDate(draftFrom),
      to: dateObjectToGregorianDate(draftTo),
      schoolId: showSchoolFilter ? draftSchoolId : "",
      page: 1,
    })
  }

  const resetFilters = () => {
    const clean = parseReportQuery(new URLSearchParams())
    setSearchParams(serializeReportQuery(clean))
  }

  const handleExport = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const blob = await exportReportsCallsByAdviser(query)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "adviser-call-performance.xlsx"
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      // httpClient shows the standard API error toast
    } finally {
      setExporting(false)
    }
  }

  const columns = useMemo(() => {
    const textColumn = (id, header, empty = "—") => ({
      id,
      accessorKey: id,
      header,
      meta: { sortKey: id },
      cell: ({ getValue }) => getValue() || empty,
    })
    const numberColumn = (id, header) => ({
      id,
      accessorKey: id,
      header,
      meta: { sortKey: id },
      cell: ({ getValue }) => number(getValue()),
    })
    const durationColumn = (id, header) => ({
      id,
      accessorKey: id,
      header,
      meta: { sortKey: id },
      cell: ({ getValue }) => formatDuration(getValue()),
    })
    return [
      textColumn("adviserName", "نام مشاور"),
      textColumn("adviserNumber", "شماره مشاور"),
      textColumn("headAdviserName", "نام سرمشاور"),
      numberColumn("totalStudents", "کل دانش‌آموزان"),
      numberColumn("remainingStudents", "دانش‌آموزان باقی‌مانده"),
      durationColumn("totalDurationSeconds", "مدت کل تماس"),
      durationColumn("avgDurationSeconds", "میانگین مدت تماس"),
      durationColumn("avgStudentDurationSeconds", "میانگین زمان هر دانش‌آموز"),
      numberColumn("totalCalls", "کل تماس‌ها"),
      numberColumn("incomingCalls", "تماس‌های ورودی"),
      numberColumn("answeredCalls", "تماس‌های پاسخ‌داده"),
      numberColumn("missedCalls", "تماس‌های ازدست‌رفته"),
      numberColumn("busyCalls", "تماس‌های مشغول"),
    ]
  }, [])

  const sorting = [{ id: query.sortBy, desc: query.sortOrder === "DESC" }]
  const state = reportTableState({ loading, error, itemCount: items.length })

  if (!hasPermission("reports.adviser-call-performance.index")) return <Navigate to="/" replace />

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="گزارشات" breadcrumbItem="عملکرد تماس مشاوران" />
        <Card>
          <CardHeader className="bg-white"><h5 className="mb-0">گزارش عملکرد تماس مشاوران</h5></CardHeader>
          <CardBody>
            <Row className="g-3 align-items-end mb-4">
              <Col xl="2" md="4" sm="6">
                <Label>از تاریخ</Label>
                <DatePicker calendar={persian} locale={persianFa} value={draftFrom} onChange={setDraftFrom}
                  format="YYYY/MM/DD" inputClass="form-control" calendarPosition="bottom-right" />
              </Col>
              <Col xl="2" md="4" sm="6">
                <Label>تا تاریخ</Label>
                <DatePicker calendar={persian} locale={persianFa} value={draftTo} onChange={setDraftTo}
                  format="YYYY/MM/DD" inputClass="form-control" calendarPosition="bottom-right" />
              </Col>
              {showSchoolFilter && <Col xl="2" md="4" sm="6">
                <Label>مدرسه</Label>
                <Input type="select" value={draftSchoolId} onChange={(event) => setDraftSchoolId(event.target.value)}>
                  <option value="">همه مدارس</option>
                  {schools.map((school) => <option key={school.id} value={school.id}>{school.name || school.title}</option>)}
                </Input>
              </Col>}
              <Col xl="3" md="6">
                <Label>جستجو</Label>
                <Input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="جستجو در همه ستون‌ها" />
              </Col>
              <Col xl="auto" className="d-flex gap-2 flex-wrap">
                <Button color="primary" onClick={applyFilters}><i className="mdi mdi-filter-outline me-1" />اعمال فیلتر</Button>
                <Button color="secondary" outline onClick={resetFilters}>پاک‌کردن</Button>
                {canExport && <Button color="success" onClick={handleExport} disabled={exporting}>
                  <i className={`mdi ${exporting ? "mdi-loading mdi-spin" : "mdi-file-excel-outline"} me-1`} />
                  دانلود Excel
                </Button>}
              </Col>
            </Row>
            {filterError && <div className="alert alert-danger py-2">{filterError}</div>}

            {state === "loading" && <Table bordered responsive><tbody>{Array.from({ length: 6 }).map((_, row) =>
              <tr key={row}>{columns.map((column) => <td key={column.id}><span className="placeholder col-8" /></td>)}</tr>)}</tbody></Table>}
            {state === "error" && <div className="text-center py-5">
              <i className="mdi mdi-alert-circle-outline fs-2 text-danger d-block" />
              <p className="text-muted">{error}</p>
              <Button color="primary" outline onClick={fetchData}>تلاش مجدد</Button>
            </div>}
            {state === "empty" && <div className="text-center text-muted py-5">
              <i className="mdi mdi-database-off-outline fs-2 d-block mb-2" />داده‌ای برای فیلترهای انتخاب‌شده یافت نشد.
            </div>}
            {state === "ready" && <>
              <TableContainer columns={columns} data={items} isGlobalFilter={false} isPagination={false}
                manualSorting sortingState={sorting}
                onSortingChange={(next) => {
                  const field = next?.[0]?.id || query.sortBy
                  updateQuery(nextSort(query, field))
                }}
                tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline" />
              <Paginations perPageData={meta.limit} data={items} totalRecords={meta.total}
                currentPage={meta.page} setCurrentPage={(page) => updateQuery({ page })}
                isShowingPageLength paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" />
            </>}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default AdviserCallPerformance
