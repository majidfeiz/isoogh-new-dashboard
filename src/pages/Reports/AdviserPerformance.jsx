import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Button, Card, CardBody, CardHeader, Col, Input, Label, Row, Spinner, Table } from "reactstrap"
import { useSearchParams } from "react-router-dom"

import Breadcrumbs from "../../components/Common/Breadcrumb"
import Paginations from "../../components/Common/Paginations.jsx"
import { useAuth } from "../../context/AuthContext.jsx"
import {
  exportAdviserPerformanceReport,
  getAdviserPerformanceForms,
  getAdviserPerformanceReport,
  getAdviserPerformanceSchools,
} from "../../services/reportService.jsx"
import {
  displayAdviserPerformanceValue,
  parseAdviserPerformanceQuery,
  saveAdviserPerformanceBlob,
  serializeAdviserPerformanceQuery,
  sortedAdviserPerformanceQuestions,
} from "./adviserPerformanceUtils.js"

const emptyReport = (query) => ({
  school: null,
  form: null,
  questions: [],
  rows: [],
  meta: { page: query.page, limit: query.limit, total: 0, lastPage: 1 },
})

const EllipsisText = ({ value }) => {
  const display = displayAdviserPerformanceValue(value)
  return <span className="d-inline-block text-truncate" style={{ maxWidth: 260 }}
    title={display === "—" ? "" : display}>{display}</span>
}

const AdviserPerformance = () => {
  document.title = "گزارش عملکرد مشاوران | داشبورد آیسوق"

  const { hasPermission } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryString = searchParams.toString()
  const query = useMemo(() => parseAdviserPerformanceQuery(new URLSearchParams(queryString)), [queryString])
  const [schools, setSchools] = useState([])
  const [forms, setForms] = useState([])
  const [report, setReport] = useState(() => emptyReport(query))
  const [schoolsLoading, setSchoolsLoading] = useState(true)
  const [schoolsError, setSchoolsError] = useState("")
  const [formsLoading, setFormsLoading] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [formsError, setFormsError] = useState("")
  const [reportError, setReportError] = useState("")
  const [exporting, setExporting] = useState(false)
  const [retryForms, setRetryForms] = useState(0)
  const [retrySchools, setRetrySchools] = useState(0)
  const [retryReport, setRetryReport] = useState(0)
  const [studentSearch, setStudentSearch] = useState(query.studentSearch)
  const [adviserSearch, setAdviserSearch] = useState(query.adviserSearch)

  const updateQuery = useCallback((updates) => {
    setSearchParams(serializeAdviserPerformanceQuery({ ...query, ...updates }))
  }, [query, setSearchParams])

  useEffect(() => {
    const controller = new AbortController()
    setSchoolsLoading(true)
    setSchoolsError("")
    getAdviserPerformanceSchools(controller.signal)
      .then((items) => {
        setSchools(items)
        if (!query.schoolId && items.length === 1) {
          setSearchParams(serializeAdviserPerformanceQuery({ ...query, schoolId: items[0].id, page: 1 }))
        }
      })
      .catch((error) => {
        if (error?.code !== "ERR_CANCELED") setSchoolsError("دریافت مجموعه‌ها با خطا مواجه شد.")
      })
      .finally(() => { if (!controller.signal.aborted) setSchoolsLoading(false) })
    return () => controller.abort()
    // School options are loaded once; selection changes do not require reloading them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retrySchools])

  useEffect(() => {
    setStudentSearch(query.studentSearch)
    setAdviserSearch(query.adviserSearch)
  }, [query.studentSearch, query.adviserSearch])

  useEffect(() => {
    if (studentSearch === query.studentSearch && adviserSearch === query.adviserSearch) return
    const timer = setTimeout(() => updateQuery({ studentSearch, adviserSearch, page: 1 }), 400)
    return () => clearTimeout(timer)
  }, [adviserSearch, query.adviserSearch, query.studentSearch, studentSearch, updateQuery])

  useEffect(() => {
    setForms([])
    setFormsError("")
    if (!query.schoolId) return
    const controller = new AbortController()
    setFormsLoading(true)
    getAdviserPerformanceForms(query.schoolId, controller.signal)
      .then(setForms)
      .catch((error) => {
        if (error?.code !== "ERR_CANCELED") setFormsError("دریافت فرم‌های تماس با خطا مواجه شد.")
      })
      .finally(() => { if (!controller.signal.aborted) setFormsLoading(false) })
    return () => controller.abort()
  }, [query.schoolId, retryForms])

  useEffect(() => {
    setReport(emptyReport(query))
    setReportError("")
    if (!query.formId) {
      setReportLoading(false)
      return
    }
    const controller = new AbortController()
    setReportLoading(true)
    getAdviserPerformanceReport(query, controller.signal)
      .then(setReport)
      .catch((error) => {
        if (error?.code !== "ERR_CANCELED") setReportError("دریافت گزارش عملکرد مشاوران با خطا مواجه شد.")
      })
      .finally(() => { if (!controller.signal.aborted) setReportLoading(false) })
    return () => controller.abort()
  }, [query, retryReport])

  const questions = useMemo(() => sortedAdviserPerformanceQuestions(report.questions), [report.questions])
  const changeSchool = (schoolId) => {
    setForms([])
    setReport(emptyReport(query))
    updateQuery({ schoolId, formId: "", page: 1 })
  }
  const changeForm = (formId) => {
    setReport(emptyReport(query))
    updateQuery({ formId, page: 1 })
  }
  const clearSearches = () => {
    setStudentSearch("")
    setAdviserSearch("")
    updateQuery({ studentSearch: "", adviserSearch: "", page: 1 })
  }
  const handleExport = async () => {
    if (exporting || !query.formId) return
    setExporting(true)
    try {
      saveAdviserPerformanceBlob(await exportAdviserPerformanceReport(query))
    } catch {
      // Standard API notification is displayed by httpClient.
    } finally {
      setExporting(false)
    }
  }

  const viewState = !query.schoolId ? "school-guide"
    : !query.formId ? "form-guide"
      : reportLoading ? "loading"
        : reportError ? "error"
          : report.rows.length ? "ready" : "empty"

  return <div className="page-content"><div className="container-fluid">
    <Breadcrumbs title="گزارشات" breadcrumbItem="گزارش عملکرد مشاوران" />
    <Card className="mb-4">
      <CardHeader className="bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h5 className="mb-0">گزارش عملکرد مشاوران</h5>
        {hasPermission("reports.adviser-performance.export") && <Button color="success" onClick={handleExport}
          disabled={!query.formId || exporting}>
          {exporting ? <Spinner size="sm" className="me-1" /> : <i className="mdi mdi-file-excel-outline me-1" />}
          {exporting ? "در حال دانلود..." : "دانلود Excel"}
        </Button>}
      </CardHeader>
      <CardBody>
        <Row className="g-3 align-items-end">
          <Col xl="3" md="6">
            <Label>مجموعه</Label>
            <Input type="select" value={query.schoolId} disabled={schoolsLoading} onChange={(event) => changeSchool(event.target.value)}>
              <option value="">انتخاب مجموعه</option>
              {schools.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </Input>
            {schoolsError && <div className="text-danger small mt-1">{schoolsError}{" "}
              <button type="button" className="btn btn-link btn-sm p-0" onClick={() => setRetrySchools((value) => value + 1)}>تلاش مجدد</button>
            </div>}
          </Col>
          <Col xl="3" md="6">
            <Label>فرم تماس</Label>
            <Input type="select" value={query.formId} disabled={!query.schoolId || formsLoading || Boolean(formsError)}
              onChange={(event) => changeForm(event.target.value)}>
              <option value="">{formsLoading ? "در حال دریافت فرم‌ها..." : "انتخاب فرم تماس"}</option>
              {forms.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </Input>
            {formsError && <div className="text-danger small mt-1">{formsError}{" "}
              <button type="button" className="btn btn-link btn-sm p-0" onClick={() => setRetryForms((value) => value + 1)}>تلاش مجدد</button>
            </div>}
          </Col>
          <Col xl="2" md="6">
            <Label>جستجوی دانش‌آموز</Label>
            <Input value={studentSearch} placeholder="نام، کد ملی یا نام کاربری" onChange={(event) => setStudentSearch(event.target.value)} />
          </Col>
          <Col xl="2" md="6">
            <Label>جستجوی مشاور</Label>
            <Input value={adviserSearch} placeholder="نام یا کد مشاور" onChange={(event) => setAdviserSearch(event.target.value)} />
          </Col>
          <Col xl="2">
            <Button color="secondary" outline className="w-100" onClick={clearSearches}
              disabled={!studentSearch && !adviserSearch}>پاک‌کردن فیلترها</Button>
          </Col>
        </Row>
      </CardBody>
    </Card>

    {viewState === "school-guide" && <Card><CardBody className="text-center text-muted py-5">ابتدا مجموعه را انتخاب کنید.</CardBody></Card>}
    {viewState === "form-guide" && <Card><CardBody className="text-center text-muted py-5">فرم تماس را انتخاب کنید.</CardBody></Card>}
    {viewState === "error" && <div className="alert alert-danger text-center py-4">{reportError}<div className="mt-2">
      <Button color="danger" outline onClick={() => setRetryReport((value) => value + 1)}>تلاش مجدد</Button>
    </div></div>}
    {viewState === "empty" && <Card><CardBody className="text-center text-muted py-5">
      <i className="mdi mdi-account-search-outline fs-1 d-block mb-2" />این فرم دانش‌آموزی برای نمایش ندارد.
    </CardBody></Card>}
    {viewState === "loading" && <Card><CardBody><div className="table-responsive"><Table bordered>
      <tbody>{Array.from({ length: 7 }).map((_, row) => <tr key={row}>
        {Array.from({ length: Math.max(6, questions.length + 6) }).map((__, cell) =>
          <td key={cell}><span className="placeholder col-8" /></td>)}
      </tr>)}</tbody>
    </Table></div></CardBody></Card>}
    {viewState === "ready" && <Card>
      <CardHeader className="bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div><strong>{report.school?.title || "—"}</strong><span className="mx-2 text-muted">/</span>{report.form?.title || "—"}</div>
        <div className="d-flex align-items-center gap-2"><span className="text-muted">تعداد در صفحه</span>
          <Input type="select" value={query.limit} onChange={(event) => updateQuery({ limit: Number(event.target.value), page: 1 })}
            style={{ width: 85 }}>
            {[15, 25, 50, 100].map((limit) => <option key={limit} value={limit}>{limit}</option>)}
          </Input>
        </div>
      </CardHeader>
      <CardBody>
        <div className="table-responsive">
          <Table bordered hover className="align-middle table-nowrap mb-0" dir="rtl">
            <thead className="table-light"><tr>
              <th>ردیف</th><th>نام دانش‌آموز</th><th>کد ملی</th><th>نام کاربری</th><th>نام مشاور</th><th>نام سرمشاور</th>
              {questions.map((question) => <th key={question.id} style={{ minWidth: 180 }}>
                {question.title}{question.required && <span className="text-danger ms-1">*</span>}
              </th>)}
            </tr></thead>
            <tbody>{report.rows.map((row, index) => <tr key={row.studentId ?? index}>
              <td>{((report.meta.page || query.page) - 1) * (report.meta.limit || query.limit) + index + 1}</td>
              <td>{displayAdviserPerformanceValue(row.studentName)}</td>
              <td>{displayAdviserPerformanceValue(row.studentSsn)}</td>
              <td>{displayAdviserPerformanceValue(row.studentUsername)}</td>
              <td>{displayAdviserPerformanceValue(row.adviserName)}</td>
              <td>{displayAdviserPerformanceValue(row.headAdviserName)}</td>
              {questions.map((question) => <td key={question.id}><EllipsisText value={row.answers?.[String(question.id)]} /></td>)}
            </tr>)}</tbody>
          </Table>
        </div>
        <div className="mt-3"><Paginations perPageData={report.meta.limit || query.limit} data={report.rows}
          totalRecords={report.meta.total || 0} currentPage={report.meta.page || query.page}
          setCurrentPage={(page) => updateQuery({ page })} isShowingPageLength
          paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" />
        </div>
      </CardBody>
    </Card>}
  </div></div>
}

export default AdviserPerformance
