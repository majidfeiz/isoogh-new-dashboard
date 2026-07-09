import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Navigate, useSearchParams } from "react-router-dom"
import { Button, Card, CardBody, CardHeader, Col, Input, Label, Row, Table } from "reactstrap"

import Breadcrumbs from "../../components/Common/Breadcrumb"
import Paginations from "../../components/Common/Paginations.jsx"
import { useAuth } from "../../context/AuthContext.jsx"
import {
  exportContactFormsOnlineReport,
  getContactFormsOnlineReport,
} from "../../services/reportService.jsx"
import { getSchools } from "../../services/schoolService.jsx"
import { getSupportForms } from "../../services/supportFormService.jsx"
import {
  canExportOnlineReport,
  canViewOnlineReport,
  defaultOnlineQuery,
  flattenOnlineGroups,
  formatOnlineDuration,
  formatOnlinePercent,
  onlineViewState,
  parseOnlineQuery,
  resetOnlineView,
  saveOnlineReportBlob,
  scheduleOnlineSearch,
  serializeOnlineQuery,
  sortedQuestions,
  toggleOnlineSort,
} from "./contactFormsOnlineUtils.js"

const fa = (value) => value == null ? "—" : Number(value).toLocaleString("fa-IR")

const FIXED_COLUMNS = [
  { key: "headAdviserName", label: "نام سرمشاور" },
  { key: "adviserName", label: "نام مشاور" },
  { key: "adviserNumber", label: "شماره مشاور" },
  { key: "totalStudents", label: "تعداد دانش‌آموزان" },
  { key: "totalCallsPercent", label: "مجموع تماس‌ها (%)", help: "(تعداد تمام CDRهای فرم ÷ دانش‌آموزان تخصیص‌یافته) × ۱۰۰" },
  { key: "successfulCallsPercent", label: "تماس موفق (%)", help: "(دانش‌آموزان دارای تماس ANSWERED ÷ دانش‌آموزان تخصیص‌یافته) × ۱۰۰" },
  { key: "totalConversationSeconds", label: "مجموع مکالمات", help: "جمع playtime_seconds غیرمنفی تماس‌های ANSWERED" },
  { key: "successfulFormsPercent", label: "فرم موفق (%)", help: "(دانش‌آموزان با وضعیت فرم ۱ ÷ کل دانش‌آموزان فرم) × ۱۰۰" },
  { key: "incompleteFormsPercent", label: "فرم ناقص (%)", help: "(دانش‌آموزان با وضعیت فرم ۲ ÷ کل دانش‌آموزان فرم) × ۱۰۰" },
  { key: "averageFormCompletionPercent", label: "میانگین فرم (%)", help: "متوسط درصد تکمیل بر مبنای سؤال‌های اجباری" },
]

const ContactFormsOnline = () => {
  document.title = "گزارش آنلاین فرم تماس‌ها | داشبورد آیسوق"
  const { permissions, hasPermission } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryString = searchParams.toString()
  const query = useMemo(() => parseOnlineQuery(new URLSearchParams(queryString)), [queryString])
  const [data, setData] = useState({ form: null, questions: [], groups: [], meta: {} })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState(query.search)
  const [forms, setForms] = useState([])
  const [schools, setSchools] = useState([])
  const [exporting, setExporting] = useState(false)
  const showSchoolFilter = hasPermission("schools.index")
  const canExport = canExportOnlineReport(permissions)

  const updateQuery = useCallback((updates) => {
    setSearchParams(serializeOnlineQuery({ ...query, ...updates }))
  }, [query, setSearchParams])

  const loadReport = useCallback((signal) => {
    if (!query.formId) {
      setData({ form: null, questions: [], groups: [], meta: {} })
      setLoading(false)
      setError("")
      return Promise.resolve()
    }
    setLoading(true)
    setError("")
    return getContactFormsOnlineReport(query, signal)
      .then(setData)
      .catch((requestError) => {
        if (requestError?.code === "ERR_CANCELED" || requestError?.name === "CanceledError" || signal?.aborted) return
        setError("دریافت گزارش آنلاین فرم تماس با خطا مواجه شد.")
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
      .then((result) => setForms(result.items || []))
      .catch(() => setForms([]))
    if (showSchoolFilter) {
      getSchools({ page: 1, limit: 100 }).then((result) => setSchools(result.items || [])).catch(() => setSchools([]))
    }
  }, [showSchoolFilter])

  useEffect(() => { setSearch(query.search) }, [query.search])
  useEffect(() => {
    if (search === query.search) return
    return scheduleOnlineSearch((value) => updateQuery({ search: value.trim(), page: 1 }), search)
  }, [search, query.search, updateQuery])

  const questions = useMemo(() => sortedQuestions(data.questions), [data.questions])
  const rows = useMemo(() => flattenOnlineGroups(data.groups), [data.groups])
  const state = onlineViewState({ formId: query.formId, loading, error, groupCount: data.groups.length })

  const handleExport = async () => {
    if (!query.formId || exporting) return
    setExporting(true)
    try {
      const blob = await exportContactFormsOnlineReport(query)
      saveOnlineReportBlob(blob)
    } catch {
      // httpClient shows the standard API error toast
    } finally {
      setExporting(false)
    }
  }

  const renderSortIcon = (field) => {
    if (query.sortBy !== field) return <i className="mdi mdi-unfold-more-horizontal text-muted ms-1" />
    return <i className={`mdi ${query.sortOrder === "ASC" ? "mdi-arrow-up" : "mdi-arrow-down"} text-primary ms-1`} />
  }

  const renderValue = (row, key) => {
    if (key === "totalConversationSeconds") return formatOnlineDuration(row[key])
    if (key.endsWith("Percent")) return formatOnlinePercent(row[key])
    if (key === "totalStudents") return fa(row[key])
    return row[key] || "—"
  }

  if (!canViewOnlineReport(permissions)) return <Navigate to="/" replace />

  return <div className="page-content"><div className="container-fluid">
    <Breadcrumbs title="گزارش‌های مدیریتی" breadcrumbItem="گزارش آنلاین فرم تماس‌ها" />
    <Card className="mb-4"><CardHeader className="bg-white"><h5 className="mb-0">گزارش آنلاین فرم تماس‌ها</h5></CardHeader><CardBody>
      <Row className="g-3 align-items-end">
        <Col xl="4" md="6"><Label>فرم تماس <span className="text-danger">*</span></Label>
          <Input type="select" value={query.formId} onChange={(event) => updateQuery({ formId: event.target.value, page: 1 })}>
            <option value="">انتخاب فرم تماس</option>
            {forms.map((form) => <option key={form.id} value={form.id}>{form.title || form.name || `فرم ${form.id}`}</option>)}
          </Input></Col>
        {showSchoolFilter && <Col xl="3" md="6"><Label>مدرسه</Label><Input type="select" value={query.schoolId}
          onChange={(event) => updateQuery({ schoolId: event.target.value, page: 1 })}><option value="">همه مدارس</option>
          {schools.map((school) => <option key={school.id} value={school.id}>{school.name || school.title}</option>)}</Input></Col>}
        <Col xl="3" md="6"><Label>جستجو</Label><Input value={search} onChange={(event) => setSearch(event.target.value)}
          placeholder="نام، شماره یا مقدار آماری" /></Col>
        <Col xl="auto" className="d-flex gap-2 flex-wrap">
          <Button color="secondary" outline onClick={() => setSearchParams(serializeOnlineQuery(resetOnlineView(query)))}>
            <i className="mdi mdi-refresh me-1" />نمایش همه
          </Button>
          {canExport && <Button color="success" disabled={!query.formId || exporting} onClick={handleExport}>
            <i className={`mdi ${exporting ? "mdi-loading mdi-spin" : "mdi-file-excel-outline"} me-1`} />دانلود Excel
          </Button>}
        </Col>
      </Row>
    </CardBody></Card>

    {state === "no-form" && <Card><CardBody className="text-center text-muted py-5">
      <i className="mdi mdi-file-question-outline fs-1 d-block mb-2" />برای مشاهده گزارش، ابتدا یک فرم تماس انتخاب کنید.
    </CardBody></Card>}
    {state === "error" && <div className="alert alert-danger text-center py-4">{error}<div className="mt-2">
      <Button color="danger" outline onClick={() => loadReport(new AbortController().signal)}>تلاش مجدد</Button></div></div>}
    {state === "empty" && <Card><CardBody className="text-center text-muted py-5">
      <i className="mdi mdi-account-off-outline fs-1 d-block mb-2" />برای این فرم، سرمشاور یا مشاوری یافت نشد.
    </CardBody></Card>}
    {state === "loading" && <Card><CardBody><div className="table-responsive"><Table bordered>
      <tbody>{Array.from({ length: 7 }).map((_, row) => <tr key={row}>
        {Array.from({ length: 10 + questions.length }).map((__, column) => <td key={column}><span className="placeholder col-9" /></td>)}
      </tr>)}</tbody></Table></div></CardBody></Card>}
    {state === "ready" && <Card><CardHeader className="bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div><h6 className="mb-1">{data.form?.title || "گزارش فرم تماس"}</h6>
        <small className="text-muted">ردیف سرمشاور، جمع وزنی زیرمجموعه است و میانگین ساده درصدها نیست.</small></div>
      <div className="d-flex align-items-center gap-2"><Label className="mb-0">تعداد گروه در صفحه</Label><Input type="select" value={query.limit}
        onChange={(event) => updateQuery({ limit: Number(event.target.value), page: 1 })} style={{ width: 85 }}>
        {[10, 25, 50, 100].map((limit) => <option key={limit}>{limit}</option>)}</Input></div>
    </CardHeader><CardBody>
      <div className="table-responsive"><Table bordered hover className="align-middle table-nowrap mb-0">
        <thead className="table-light"><tr>
          {FIXED_COLUMNS.map((column) => <th key={column.key} onClick={() => setSearchParams(serializeOnlineQuery(toggleOnlineSort(query, column.key)))}
            style={{ cursor: "pointer" }} title={column.help || "مرتب‌سازی بر اساس این ستون"}>{column.label}
            {column.help && <i className="mdi mdi-information-outline text-info ms-1" />}{renderSortIcon(column.key)}</th>)}
          {questions.map((question) => <th key={question.id}
            onClick={() => setSearchParams(serializeOnlineQuery(toggleOnlineSort(query, question.sortKey || `question:${question.id}`)))}
            className={question.required ? "text-danger" : ""} style={{ cursor: "pointer" }}
            title="درصد دانش‌آموزان دارای حداقل یک پاسخ معتبر برای سؤال">
            {question.title}{question.required && " *"}{renderSortIcon(question.sortKey || `question:${question.id}`)}
          </th>)}
        </tr></thead>
        <tbody>{rows.map((row, index) => <tr key={`${row.rowType}-${row.headAdviserId}-${row.adviserId || index}`}
          className={row.rowType === "head" ? "table-primary fw-semibold" : ""}>
          {FIXED_COLUMNS.map((column) => <td key={column.key}>
            {column.key === "adviserName" && row.rowType === "adviser" && <i className="mdi mdi-subdirectory-arrow-left text-muted me-2" />}
            {renderValue(row, column.key)}
          </td>)}
          {questions.map((question) => <td key={question.id}>{formatOnlinePercent(row.questionPercentages?.[String(question.id)])}</td>)}
        </tr>)}</tbody>
      </Table></div>
      <div className="mt-3"><Paginations perPageData={data.meta.limit || query.limit} data={data.groups}
        totalRecords={data.meta.totalGroups || 0} currentPage={data.meta.page || query.page}
        setCurrentPage={(page) => updateQuery({ page })} isShowingPageLength paginationDiv="col-sm-auto"
        paginationClass="pagination pagination-sm mb-0" /></div>
      <div className="border-top mt-3 pt-3 text-muted d-flex gap-4 flex-wrap">
        <span>تعداد گروه‌های سرمشاور: <strong>{fa(data.meta.totalGroups || 0)}</strong></span>
        <span>تعداد کل مشاوران: <strong>{fa(data.meta.totalAdvisers || 0)}</strong></span>
        <span>گروه‌های هر صفحه بدون شکستن زیرمجموعه نمایش داده می‌شوند.</span>
      </div>
    </CardBody></Card>}
  </div></div>
}

export default ContactFormsOnline
