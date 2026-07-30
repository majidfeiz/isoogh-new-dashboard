import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Badge, Button, Card, CardBody, CardHeader, Col, Input, Label, Row, Table } from "reactstrap"
import DatePicker from "react-multi-date-picker"
import DateObject from "react-date-object"
import persian from "react-date-object/calendars/persian"
import persianFa from "react-date-object/locales/persian_fa"
import gregorian from "react-date-object/calendars/gregorian"
import moment from "moment-jalaali"

import Breadcrumbs from "../../components/Common/Breadcrumb"
import Paginations from "../../components/Common/Paginations.jsx"
import TableContainer from "../../components/Common/TableContainer.jsx"
import { useAuth } from "../../context/AuthContext.jsx"
import {
  exportSupportFormAnswersReport,
  getSupportFormAnswersReport,
} from "../../services/reportService.jsx"
import {
  SUPPORT_FORM_ANSWER_FILTER_KEYS,
  formatSupportFormAnswerDate,
  parseSupportFormAnswersQuery,
  saveSupportFormAnswersBlob,
  serializeSupportFormAnswersQuery,
} from "./supportFormAnswersUtils.js"

const emptyText = (value) => value == null || String(value).trim() === "" ? "—" : value
const faNumber = (value) => value == null || value === "" ? "—" : Number(value).toLocaleString("fa-IR")
const answerText = (row) => String(row.answer || "").trim() || String(row.answerIds || "").trim() || null
const latinDigits = (value) => String(value || "")
  .replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
  .replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit))
const dateObject = (value) => value
  ? new DateObject({ date: moment(value, "YYYY-MM-DD").toDate(), calendar: persian, locale: persianFa })
  : null
const apiDate = (value) => value
  ? latinDigits(new DateObject(value).convert(gregorian).format("YYYY-MM-DD"))
  : ""
const filterLabels = {
  studentName: "نام دانش‌آموز",
  adviserName: "نام مشاور",
  adviserNumber: "شماره یا کد مشاور",
  ssn: "کد ملی دانش‌آموز",
  studentUsername: "نام کاربری دانش‌آموز",
}

const EllipsisText = ({ value }) => {
  const display = emptyText(value)
  return <span className="d-inline-block text-truncate" style={{ maxWidth: 260 }} title={display === "—" ? "" : String(display)}>
    {display}
  </span>
}

const SupportFormAnswers = () => {
  document.title = "پاسخ‌های فرم پشتیبانی | داشبورد آیسوق"
  const { hasPermission } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryString = searchParams.toString()
  const query = useMemo(() => parseSupportFormAnswersQuery(new URLSearchParams(queryString)), [queryString])
  const [filters, setFilters] = useState(() => Object.fromEntries(
    SUPPORT_FORM_ANSWER_FILTER_KEYS.map((key) => [key, query[key]])
  ))
  const [data, setData] = useState({ items: [], meta: { page: 1, limit: 10, total: 0, lastPage: 1 } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [exporting, setExporting] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("studentName")
  const [dateFrom, setDateFrom] = useState(() => dateObject(query.from))
  const [dateTo, setDateTo] = useState(() => dateObject(query.to))
  const [filterError, setFilterError] = useState("")

  const updateQuery = useCallback((updates) => {
    setSearchParams(serializeSupportFormAnswersQuery({ ...query, ...updates }))
  }, [query, setSearchParams])

  useEffect(() => {
    setFilters(Object.fromEntries(SUPPORT_FORM_ANSWER_FILTER_KEYS.map((key) => [key, query[key]])))
    setDateFrom(dateObject(query.from))
    setDateTo(dateObject(query.to))
  }, [query])

  useEffect(() => {
    const changed = SUPPORT_FORM_ANSWER_FILTER_KEYS.some((key) => filters[key] !== query[key])
    if (!changed) return
    const timer = setTimeout(() => updateQuery({ ...filters, page: 1 }), 400)
    return () => clearTimeout(timer)
  }, [filters, query, updateQuery])

  const loadReport = useCallback((signal) => {
    setLoading(true)
    setError("")
    return getSupportFormAnswersReport(query, signal)
      .then(setData)
      .catch((requestError) => {
        if (requestError?.code === "ERR_CANCELED" || signal?.aborted) return
        setError("دریافت گزارش پاسخ‌های فرم پشتیبانی با خطا مواجه شد.")
      })
      .finally(() => {
        if (!signal?.aborted) setLoading(false)
      })
  }, [query])

  useEffect(() => {
    const controller = new AbortController()
    loadReport(controller.signal)
    return () => controller.abort()
  }, [loadReport])

  const clearFilters = () => {
    const cleared = Object.fromEntries(SUPPORT_FORM_ANSWER_FILTER_KEYS.map((key) => [key, ""]))
    setFilters(cleared)
    setDateFrom(null)
    setDateTo(null)
    setFilterError("")
    updateQuery({ ...cleared, from: "", to: "", page: 1 })
  }

  const changeDateRange = (nextFrom, nextTo) => {
    setDateFrom(nextFrom)
    setDateTo(nextTo)
    if (nextFrom && nextTo && nextFrom.toDate().getTime() > nextTo.toDate().getTime()) {
      setFilterError("تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.")
      return
    }
    setFilterError("")
    updateQuery({ from: apiDate(nextFrom), to: apiDate(nextTo), page: 1 })
  }

  const handleExport = async () => {
    if (exporting || filterError) return
    setExporting(true)
    try {
      const blob = await exportSupportFormAnswersReport(query)
      saveSupportFormAnswersBlob(blob)
    } catch {
      // httpClient displays the standard API error notification, including blob errors.
    } finally {
      setExporting(false)
    }
  }

  const columns = useMemo(() => [
    {
      id: "rowNumber",
      header: "ردیف",
      enableSorting: false,
      cell: ({ row }) => faNumber((data.meta.page - 1) * data.meta.limit + row.index + 1),
    },
    { id: "createdAt", accessorKey: "createdAt", header: "زمان ثبت", enableSorting: false, cell: ({ getValue }) => formatSupportFormAnswerDate(getValue()) },
    { id: "studentName", accessorKey: "studentName", header: "نام دانش‌آموز", enableSorting: false, cell: ({ getValue }) => emptyText(getValue()) },
    { id: "studentUsername", accessorKey: "studentUsername", header: "نام کاربری دانش‌آموز", enableSorting: false, cell: ({ getValue }) => emptyText(getValue()) },
    { id: "studentSsn", accessorKey: "studentSsn", header: "کد ملی دانش‌آموز", enableSorting: false, cell: ({ getValue }) => emptyText(getValue()) },
    { id: "adviserName", accessorKey: "adviserName", header: "نام مشاور", enableSorting: false, cell: ({ getValue }) => emptyText(getValue()) },
    { id: "adviserNumber", accessorKey: "adviserNumber", header: "شماره مشاور", enableSorting: false, cell: ({ getValue }) => emptyText(getValue()) },
    { id: "supportFormTitle", accessorKey: "supportFormTitle", header: "عنوان فرم", enableSorting: false, cell: ({ getValue }) => emptyText(getValue()) },
    { id: "questionTitle", accessorKey: "questionTitle", header: "سؤال", enableSorting: false, cell: ({ getValue }) => <EllipsisText value={getValue()} /> },
    { id: "answer", header: "پاسخ", enableSorting: false, cell: ({ row }) => <EllipsisText value={answerText(row.original)} /> },
    {
      id: "isAnswered",
      accessorKey: "isAnswered",
      header: "وضعیت پاسخ",
      enableSorting: false,
      cell: ({ getValue }) => getValue()
        ? <Badge color="success">پاسخ داده شده</Badge>
        : <Badge color="secondary">بدون پاسخ</Badge>,
    },
  ], [data.meta.limit, data.meta.page])

  const viewState = loading ? "loading" : error ? "error" : data.items.length ? "ready" : "empty"
  const activeFilters = SUPPORT_FORM_ANSWER_FILTER_KEYS.filter((key) => String(filters[key] || "").trim())

  return <div className="page-content"><div className="container-fluid">
    <Breadcrumbs title="گزارش‌ها" breadcrumbItem="پاسخ‌های فرم پشتیبانی" />
    <Card className="mb-4">
      <CardHeader className="bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">پاسخ‌های فرم پشتیبانی</h5>
        <Button color="light" className="d-md-none" onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen} aria-controls="support-answer-filters">
          <i className={`mdi mdi-chevron-${filtersOpen ? "up" : "down"} me-1`} />فیلترها
        </Button>
      </CardHeader>
      <CardBody id="support-answer-filters" className={`${filtersOpen ? "d-block" : "d-none"} d-md-block`}>
        <Row className="g-2 align-items-center">
          <Col lg="2" md="4" sm="6">
            <DatePicker calendar={persian} locale={persianFa} value={dateFrom}
              onChange={(value) => changeDateRange(value || null, dateTo)}
              format="YYYY/MM/DD" inputClass="form-control" calendarPosition="bottom-right"
              placeholder="از تاریخ" />
          </Col>
          <Col lg="2" md="4" sm="6">
            <DatePicker calendar={persian} locale={persianFa} value={dateTo}
              onChange={(value) => changeDateRange(dateFrom, value || null)}
              format="YYYY/MM/DD" inputClass="form-control" calendarPosition="bottom-right"
              placeholder="تا تاریخ" />
          </Col>
          <Col lg="3" md="4">
            <Input type="select" value={selectedFilter} aria-label="نوع فیلتر"
              onChange={(event) => setSelectedFilter(event.target.value)}>
              {SUPPORT_FORM_ANSWER_FILTER_KEYS.map((key) =>
                <option key={key} value={key}>{filterLabels[key]}</option>
              )}
            </Input>
          </Col>
          <Col lg="5" md="8">
            <Input value={filters[selectedFilter]} aria-label={filterLabels[selectedFilter]}
              placeholder={`جستجو بر اساس ${filterLabels[selectedFilter]}`}
              onChange={(event) => setFilters((current) => ({ ...current, [selectedFilter]: event.target.value }))} />
          </Col>
          <Col xl="auto" className="d-flex gap-2 flex-wrap">
            <Button color="secondary" outline onClick={clearFilters}>
              <i className="mdi mdi-filter-remove-outline me-1" />پاک‌کردن همه فیلترها
            </Button>
            {hasPermission("reports.support-form-answers.export") && <Button color="success" onClick={handleExport}
              disabled={exporting || Boolean(filterError)}>
              <i className={`mdi ${exporting ? "mdi-loading mdi-spin" : "mdi-file-excel-outline"} me-1`} />
              {exporting ? "در حال دانلود..." : "دانلود Excel"}
            </Button>}
          </Col>
        </Row>
        {filterError && <div className="text-danger small mt-2">{filterError}</div>}
        {activeFilters.length > 0 && <div className="d-flex flex-wrap gap-2 mt-3">
          {activeFilters.map((key) => <Button key={key} color="light" size="sm" className="border"
            title={`حذف فیلتر ${filterLabels[key]}`}
            onClick={() => setFilters((current) => ({ ...current, [key]: "" }))}>
            <span className="text-muted">{filterLabels[key]}:</span>{" "}
            <span>{filters[key]}</span>
            <i className="mdi mdi-close ms-1" />
          </Button>)}
        </div>}
      </CardBody>
    </Card>

    {viewState === "error" && <div className="alert alert-danger text-center py-4">{error}<div className="mt-2">
      <Button color="danger" outline onClick={() => loadReport(new AbortController().signal)}>تلاش مجدد</Button>
    </div></div>}
    {viewState === "empty" && <Card><CardBody className="text-center text-muted py-5">
      <i className="mdi mdi-file-document-outline fs-1 d-block mb-2" />
      پاسخی مطابق فیلترهای انتخاب‌شده یافت نشد.
    </CardBody></Card>}
    {viewState === "loading" && <Card><CardBody><div className="table-responsive"><Table bordered>
      <tbody>{Array.from({ length: 7 }).map((_, row) => <tr key={row}>
        {columns.map((column) => <td key={column.id}><span className="placeholder col-8" /></td>)}
      </tr>)}</tbody>
    </Table></div></CardBody></Card>}
    {viewState === "ready" && <Card>
      <CardHeader className="bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>تعداد کل پاسخ‌ها: <strong>{faNumber(data.meta.total)}</strong></div>
        <div className="d-flex align-items-center gap-2"><Label className="mb-0">تعداد در صفحه</Label>
          <Input type="select" value={query.limit} onChange={(event) => updateQuery({ limit: Number(event.target.value), page: 1 })}
            style={{ width: 85 }}>
            {[10, 25, 50, 100].map((limit) => <option key={limit} value={limit}>{limit}</option>)}
          </Input>
        </div>
      </CardHeader>
      <CardBody>
        <TableContainer columns={columns} data={data.items} isGlobalFilter={false} isPagination={false}
          tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline" />
        <div className="mt-3"><Paginations perPageData={data.meta.limit || query.limit} data={data.items}
          totalRecords={data.meta.total || 0} currentPage={data.meta.page || query.page}
          setCurrentPage={(page) => updateQuery({ page })} isShowingPageLength
          paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" />
        </div>
      </CardBody>
    </Card>}
  </div></div>
}

export default SupportFormAnswers
