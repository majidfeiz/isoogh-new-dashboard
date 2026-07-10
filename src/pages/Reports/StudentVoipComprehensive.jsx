import React, { useCallback, useEffect, useMemo, useState } from "react"
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
import {
  exportStudentVoipComprehensiveReport,
  getStudentVoipComprehensiveReport,
} from "../../services/reportService.jsx"
import { getSchools } from "../../services/schoolService.jsx"
import { getSupportForms } from "../../services/supportFormService.jsx"
import {
  canExportStudentVoipReport,
  canViewStudentVoipReport,
  formatStudentVoipDuration,
  formatStudentVoipPercent,
  hasRequiredStudentVoipFilters,
  parseStudentVoipQuery,
  resetStudentVoipView,
  saveStudentVoipBlob,
  scheduleStudentVoipSearch,
  serializeStudentVoipQuery,
  studentVoipViewState,
  toggleStudentVoipSort,
  uniqueStudentRows,
} from "./studentVoipComprehensiveUtils.js"

const fa = (value) => value == null || value === "" ? "—" : Number(value).toLocaleString("fa-IR")
const text = (value) => value == null || value === "" ? "—" : value
const dateObject = (date) => new DateObject({ date: moment(String(date).slice(0, 10), "YYYY-MM-DD").toDate(), calendar: persian, locale: persianFa })
const dateObjectToGregorianDate = (dateObjectValue) => {
  const pad = (n) => String(n).padStart(2, "0")
  const g = toGregorian(dateObjectValue.year, dateObjectValue.month.number, dateObjectValue.day)
  return `${g.gy}-${pad(g.gm)}-${pad(g.gd)}`
}

const StudentVoipComprehensive = () => {
  document.title = "گزارش جامع VoIP دانش‌آموزی | داشبورد آیسوق"
  const { permissions, hasPermission } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryString = searchParams.toString()
  const query = useMemo(() => parseStudentVoipQuery(new URLSearchParams(queryString)), [queryString])
  const [data, setData] = useState({ form: null, items: [], meta: {} })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [forms, setForms] = useState([])
  const [schools, setSchools] = useState([])
  const [search, setSearch] = useState(query.search)
  const [draftFormId, setDraftFormId] = useState(query.formId)
  const [draftFrom, setDraftFrom] = useState(() => dateObject(query.from))
  const [draftTo, setDraftTo] = useState(() => dateObject(query.to))
  const [draftSchoolId, setDraftSchoolId] = useState(query.schoolId)
  const [filterError, setFilterError] = useState("")
  const [exporting, setExporting] = useState(false)
  const showSchoolFilter = hasPermission("schools.index")
  const canExport = canExportStudentVoipReport(permissions)

  const updateQuery = useCallback((updates) => {
    setSearchParams(serializeStudentVoipQuery({ ...query, ...updates }))
  }, [query, setSearchParams])

  const loadReport = useCallback((signal) => {
    if (!hasRequiredStudentVoipFilters(query)) {
      setData({ form: null, items: [], meta: {} })
      setLoading(false)
      setError("")
      return Promise.resolve()
    }
    setLoading(true)
    setError("")
    return getStudentVoipComprehensiveReport(query, signal)
      .then((result) => setData({ ...result, items: uniqueStudentRows(result.items) }))
      .catch((requestError) => {
        if (requestError?.code === "ERR_CANCELED" || requestError?.name === "CanceledError" || signal?.aborted) return
        setError("دریافت گزارش جامع VoIP دانش‌آموزی با خطا مواجه شد.")
      })
      .finally(() => { if (!signal?.aborted) setLoading(false) })
  }, [query])

  useEffect(() => {
    const controller = new AbortController()
    loadReport(controller.signal)
    return () => controller.abort()
  }, [loadReport])

  useEffect(() => {
    getSupportForms({ page: 1, limit: 100 }).then((result) => setForms(result.items || [])).catch(() => setForms([]))
    if (showSchoolFilter) {
      getSchools({ page: 1, limit: 100 }).then((result) => setSchools(result.items || [])).catch(() => setSchools([]))
    }
  }, [showSchoolFilter])

  useEffect(() => {
    setDraftFormId(query.formId)
    setDraftFrom(dateObject(query.from))
    setDraftTo(dateObject(query.to))
    setDraftSchoolId(query.schoolId)
    setSearch(query.search)
  }, [query.formId, query.from, query.to, query.schoolId, query.search])

  useEffect(() => {
    if (search === query.search) return
    return scheduleStudentVoipSearch((value) => updateQuery({ search: value.trim(), page: 1 }), search)
  }, [search, query.search, updateQuery])

  const applyFilters = () => {
    if (!draftFormId || !draftFrom || !draftTo) {
      setFilterError("انتخاب فرم تماس و هر دو تاریخ الزامی است.")
      return
    }
    if (draftFrom.toDate().getTime() > draftTo.toDate().getTime()) {
      setFilterError("تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.")
      return
    }
    setFilterError("")
    updateQuery({
      formId: draftFormId,
      from: dateObjectToGregorianDate(draftFrom),
      to: dateObjectToGregorianDate(draftTo),
      schoolId: showSchoolFilter ? draftSchoolId : "",
      page: 1,
    })
  }

  const showAll = () => {
    setSearch("")
    setDraftSchoolId("")
    setSearchParams(serializeStudentVoipQuery(resetStudentVoipView(query)))
  }

  const handleExport = async () => {
    if (!hasRequiredStudentVoipFilters(query) || exporting) return
    setExporting(true)
    try {
      const blob = await exportStudentVoipComprehensiveReport(query)
      saveStudentVoipBlob(blob)
    } catch {
      // httpClient shows the standard API error toast
    } finally {
      setExporting(false)
    }
  }

  const columns = useMemo(() => {
    const stringColumn = (id, header) => ({ id, accessorKey: id, header, cell: ({ getValue }) => text(getValue()) })
    const numberColumn = (id, header) => ({ id, accessorKey: id, header, cell: ({ getValue }) => fa(getValue()) })
    const durationColumn = (id, header) => ({ id, accessorKey: id, header, cell: ({ getValue }) => formatStudentVoipDuration(getValue()) })
    return [
      stringColumn("studentName", "دانش‌آموز"),
      stringColumn("username", "نام کاربری"),
      stringColumn("phone", "شماره تماس"),
      stringColumn("ssn", "کد ملی"),
      stringColumn("province", "استان"),
      stringColumn("gender", "جنسیت"),
      durationColumn("successfulDurationSeconds", "زمان موفق"),
      numberColumn("successfulCalls", "تعداد موفق"),
      durationColumn("avgSuccessfulDurationSeconds", "میانگین زمان موفق"),
      { id: "successfulRatioPercent", accessorKey: "successfulRatioPercent", header: "نسبت موفق به کل (%)", cell: ({ getValue }) => formatStudentVoipPercent(getValue()) },
      numberColumn("totalCalls", "تعداد کل"),
      stringColumn("adviserName", "نام مشاور"),
      stringColumn("headAdviserName", "نام سرمشاور"),
    ]
  }, [])

  const hasFilters = hasRequiredStudentVoipFilters(query)
  const state = studentVoipViewState({ hasFilters, loading, error, itemCount: data.items.length })
  if (!canViewStudentVoipReport(permissions)) return <Navigate to="/" replace />

  return <div className="page-content"><div className="container-fluid">
    <Breadcrumbs title="گزارش‌های مدیریتی" breadcrumbItem="گزارش جامع VoIP دانش‌آموزی" />
    <Card className="mb-4"><CardHeader className="bg-white"><h5 className="mb-0">گزارش جامع VoIP دانش‌آموزی</h5></CardHeader><CardBody>
      <Row className="g-3 align-items-end">
        <Col xl="3" md="6"><Label>فرم تماس <span className="text-danger">*</span></Label><Input type="select"
          value={draftFormId} onChange={(event) => setDraftFormId(event.target.value)}><option value="">انتخاب فرم تماس</option>
          {forms.map((form) => <option key={form.id} value={form.id}>{form.title || form.name || `فرم ${form.id}`}</option>)}</Input></Col>
        <Col xl="2" md="4"><Label>از تاریخ <span className="text-danger">*</span></Label><DatePicker calendar={persian} locale={persianFa}
          value={draftFrom} onChange={setDraftFrom} format="YYYY/MM/DD" inputClass="form-control" calendarPosition="bottom-right" /></Col>
        <Col xl="2" md="4"><Label>تا تاریخ <span className="text-danger">*</span></Label><DatePicker calendar={persian} locale={persianFa}
          value={draftTo} onChange={setDraftTo} format="YYYY/MM/DD" inputClass="form-control" calendarPosition="bottom-right" /></Col>
        {showSchoolFilter && <Col xl="2" md="4"><Label>مدرسه</Label><Input type="select" value={draftSchoolId}
          onChange={(event) => setDraftSchoolId(event.target.value)}><option value="">همه مدارس</option>
          {schools.map((school) => <option key={school.id} value={school.id}>{school.name || school.title}</option>)}</Input></Col>}
        <Col xl="3" md="6"><Label>جستجو</Label><Input value={search} onChange={(event) => setSearch(event.target.value)}
          placeholder="جستجو در همه ستون‌ها" /></Col>
        <Col xs="12" className="d-flex gap-2 flex-wrap"><Button color="primary" onClick={applyFilters}>
          <i className="mdi mdi-filter-outline me-1" />اعمال فیلتر</Button><Button color="secondary" outline onClick={showAll}>
          <i className="mdi mdi-refresh me-1" />نمایش همه</Button>
          {canExport && <Button color="success" disabled={!hasFilters || exporting} onClick={handleExport}>
            <i className={`mdi ${exporting ? "mdi-loading mdi-spin" : "mdi-file-excel-outline"} me-1`} />دانلود Excel</Button>}
        </Col>
      </Row>{filterError && <div className="alert alert-danger py-2 mt-3 mb-0">{filterError}</div>}
    </CardBody></Card>

    {state === "missing-filters" && <Card><CardBody className="text-center text-muted py-5">
      <i className="mdi mdi-filter-alert-outline fs-1 d-block mb-2" />برای مشاهده گزارش، فرم تماس و بازه تاریخ را انتخاب و اعمال کنید.
    </CardBody></Card>}
    {state === "error" && <div className="alert alert-danger text-center py-4">{error}<div className="mt-2">
      <Button color="danger" outline onClick={() => loadReport(new AbortController().signal)}>تلاش مجدد</Button></div></div>}
    {state === "empty" && <Card><CardBody className="text-center text-muted py-5">
      <i className="mdi mdi-account-search-outline fs-1 d-block mb-2" />دانش‌آموزی برای فیلترهای انتخاب‌شده یافت نشد.
    </CardBody></Card>}
    {state === "loading" && <Card><CardBody><Table bordered responsive><tbody>{Array.from({ length: 7 }).map((_, row) =>
      <tr key={row}>{columns.map((column) => <td key={column.id}><span className="placeholder col-8" /></td>)}</tr>)}</tbody></Table></CardBody></Card>}
    {state === "ready" && <Card><CardHeader className="bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div><h6 className="mb-1">{data.form?.title || "گزارش دانش‌آموزان"}</h6><small className="text-muted">
        تعداد کل رکوردها: <strong>{fa(data.meta.total || 0)}</strong></small></div>
      <div className="d-flex align-items-center gap-2"><Label className="mb-0">تعداد در صفحه</Label><Input type="select" value={query.limit}
        onChange={(event) => updateQuery({ limit: Number(event.target.value), page: 1 })} style={{ width: 85 }}>
        {[10, 25, 50, 100].map((limit) => <option key={limit}>{limit}</option>)}</Input></div>
    </CardHeader><CardBody>
      <TableContainer columns={columns} data={data.items} isGlobalFilter={false} isPagination={false} manualSorting
        sortingState={[{ id: query.sortBy, desc: query.sortOrder === "DESC" }]}
        onSortingChange={(next) => { const field = next?.[0]?.id || query.sortBy; setSearchParams(serializeStudentVoipQuery(toggleStudentVoipSort(query, field))) }}
        tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline" />
      <div className="mt-3"><Paginations perPageData={data.meta.limit || query.limit} data={data.items}
        totalRecords={data.meta.total || 0} currentPage={data.meta.page || query.page} setCurrentPage={(page) => updateQuery({ page })}
        isShowingPageLength paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" /></div>
    </CardBody></Card>}
  </div></div>
}

export default StudentVoipComprehensive
