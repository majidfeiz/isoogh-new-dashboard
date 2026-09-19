import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button, Card, CardBody, CardHeader, Col, Input, Label, Row, Spinner, Table } from "reactstrap"
import { toast } from "react-toastify"

import Breadcrumbs from "../../components/Common/Breadcrumb"
import Paginations from "../../components/Common/Paginations.jsx"
import { useAuth } from "../../context/AuthContext.jsx"
import AccessDenied from "../DynamicReports/AccessDenied.jsx"
import {
  exportAdviserFormPerformanceReport,
  getAdviserFormPerformanceForms,
  getAdviserFormPerformanceReport,
  getAdviserFormPerformanceSchools,
} from "../../services/adviserFormPerformanceReportService.jsx"
import { displayValue, downloadBlob, EMPTY_META, filenameFromContentDisposition, sortQuestions } from "./adviserFormPerformanceUtils.js"

const emptyReport = (page = 1, limit = 15) => ({
  school: null, form: null, questions: [], rows: [], meta: { ...EMPTY_META, page, limit },
})
const isCanceled = (error) => error?.code === "ERR_CANCELED" || error?.name === "CanceledError"
const isForbidden = (error) => error?.response?.status === 403

const fixedColumns = [
  ["studentName", "نام دانش‌آموز", 0, 180],
  ["studentSsn", "کد ملی", 180, 130],
  ["studentUsername", "نام کاربری", null, 140],
  ["adviserName", "نام مشاور", null, 170],
  ["headAdviserName", "نام سرمشاور", null, 170],
  ["callCount", "تعداد تماس", null, 110],
]

const stickyStyle = (offset, header = false) => offset == null ? undefined : {
  position: "sticky", right: offset, zIndex: header ? 4 : 2,
  background: header ? "var(--bs-light)" : "var(--bs-body-bg)", minWidth: offset === 0 ? 180 : 130,
}

const AdviserFormPerformanceReport = () => {
  document.title = "گزارش جدید عملکرد مشاوران | داشبورد آیسوق"
  const { hasPermission } = useAuth()
  const [schools, setSchools] = useState([])
  const [forms, setForms] = useState([])
  const [schoolId, setSchoolId] = useState("")
  const [formId, setFormId] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(15)
  const [report, setReport] = useState(() => emptyReport())
  const [schoolsState, setSchoolsState] = useState({ loading: true, error: "" })
  const [formsState, setFormsState] = useState({ loading: false, error: "" })
  const [reportState, setReportState] = useState({ loading: false, error: "" })
  const [forbidden, setForbidden] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [schoolsRetry, setSchoolsRetry] = useState(0)
  const [formsRetry, setFormsRetry] = useState(0)
  const [reportRetry, setReportRetry] = useState(0)
  const formsRequest = useRef(0)
  const reportRequest = useRef(0)

  useEffect(() => {
    const controller = new AbortController()
    setSchoolsState({ loading: true, error: "" })
    getAdviserFormPerformanceSchools(controller.signal).then((items) => {
      if (!controller.signal.aborted) setSchools(items)
    }).catch((error) => {
      if (isForbidden(error)) setForbidden(true)
      else if (!isCanceled(error)) setSchoolsState({ loading: false, error: "دریافت مجموعه‌ها با خطا مواجه شد." })
    }).finally(() => {
      if (!controller.signal.aborted) setSchoolsState((state) => ({ ...state, loading: false }))
    })
    return () => controller.abort()
  }, [schoolsRetry])

  useEffect(() => {
    setForms([])
    setFormsState({ loading: false, error: "" })
    if (!schoolId) return undefined
    const controller = new AbortController()
    const requestId = ++formsRequest.current
    setFormsState({ loading: true, error: "" })
    getAdviserFormPerformanceForms(schoolId, controller.signal).then((items) => {
      if (!controller.signal.aborted && requestId === formsRequest.current) setForms(items)
    }).catch((error) => {
      if (isForbidden(error)) setForbidden(true)
      else if (!isCanceled(error) && requestId === formsRequest.current) setFormsState({ loading: false, error: "دریافت فرم‌ها با خطا مواجه شد." })
    }).finally(() => {
      if (!controller.signal.aborted && requestId === formsRequest.current) setFormsState((state) => ({ ...state, loading: false }))
    })
    return () => controller.abort()
  }, [schoolId, formsRetry])

  useEffect(() => {
    setReport(emptyReport(page, limit))
    setReportState({ loading: false, error: "" })
    if (!schoolId || !formId) return undefined
    const controller = new AbortController()
    const requestId = ++reportRequest.current
    setReportState({ loading: true, error: "" })
    getAdviserFormPerformanceReport({ schoolId, formId, page, limit }, controller.signal).then((data) => {
      if (!controller.signal.aborted && requestId === reportRequest.current) setReport(data)
    }).catch((error) => {
      if (isForbidden(error)) setForbidden(true)
      else if (!isCanceled(error) && requestId === reportRequest.current) setReportState({ loading: false, error: "دریافت گزارش با خطا مواجه شد." })
    }).finally(() => {
      if (!controller.signal.aborted && requestId === reportRequest.current) setReportState((state) => ({ ...state, loading: false }))
    })
    return () => controller.abort()
  }, [schoolId, formId, page, limit, reportRetry])

  const questions = useMemo(() => sortQuestions(report.questions), [report.questions])
  const changeSchool = (value) => {
    formsRequest.current += 1
    reportRequest.current += 1
    setSchoolId(value); setFormId(""); setForms([]); setPage(1); setReport(emptyReport(1, limit))
  }
  const changeForm = (value) => {
    reportRequest.current += 1
    setFormId(value); setPage(1); setReport(emptyReport(1, limit))
  }
  const handleExport = useCallback(async () => {
    if (!schoolId || !formId || exporting) return
    setExporting(true)
    try {
      const { blob, contentDisposition } = await exportAdviserFormPerformanceReport({ schoolId, formId })
      downloadBlob(blob, filenameFromContentDisposition(contentDisposition))
      toast.success("فایل Excel با موفقیت دانلود شد.")
    } catch (error) {
      if (isForbidden(error)) setForbidden(true)
      // The shared HTTP client displays the standard failure toast.
    } finally { setExporting(false) }
  }, [schoolId, formId, exporting])

  if (forbidden) return <AccessDenied />

  const ready = schoolId && formId
  return <div className="page-content" dir="rtl"><div className="container-fluid">
    <Breadcrumbs title="گزارشات" breadcrumbItem="گزارش جدید عملکرد مشاوران" />
    <Card className="mb-4">
      <CardHeader className="bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h5 className="mb-0">گزارش عملکرد مشاوران</h5>
        {hasPermission("adviser-form-performance-reports.export") && <Button color="success" disabled={!ready || exporting} onClick={handleExport} data-testid="export-button">
          {exporting ? <Spinner size="sm" className="ms-1" /> : <i className="mdi mdi-file-excel-outline ms-1" />}
          {exporting ? "در حال دانلود..." : "دانلود Excel"}
        </Button>}
      </CardHeader>
      <CardBody><Row className="g-3 align-items-end">
        <Col md="6" xl="4"><Label htmlFor="performance-school">مجموعه</Label>
          <Input id="performance-school" type="select" value={schoolId} disabled={schoolsState.loading} onChange={(e) => changeSchool(e.target.value)}>
            <option value="">{schoolsState.loading ? "در حال دریافت مجموعه‌ها..." : "انتخاب مجموعه"}</option>
            {schools.map((school) => <option key={school.id} value={school.id}>{school.title}</option>)}
          </Input>
          {schoolsState.error && <div className="text-danger small mt-1">{schoolsState.error} <Button color="link" size="sm" className="p-0" onClick={() => setSchoolsRetry((v) => v + 1)}>تلاش مجدد</Button></div>}
        </Col>
        <Col md="6" xl="4"><Label htmlFor="performance-form">فرم</Label>
          <Input id="performance-form" type="select" value={formId} disabled={!schoolId || formsState.loading} onChange={(e) => changeForm(e.target.value)}>
            <option value="">{formsState.loading ? "در حال دریافت فرم‌ها..." : "انتخاب فرم"}</option>
            {forms.map((form) => <option key={form.id} value={form.id}>{form.title}</option>)}
          </Input>
          {formsState.error && <div className="text-danger small mt-1">{formsState.error} <Button color="link" size="sm" className="p-0" onClick={() => setFormsRetry((v) => v + 1)}>تلاش مجدد</Button></div>}
        </Col>
      </Row></CardBody>
    </Card>

    {schoolsState.loading && <Card><CardBody className="text-center py-5"><Spinner color="primary" /><div className="text-muted mt-2">در حال دریافت مجموعه‌ها...</div></CardBody></Card>}
    {!schoolId && !schoolsState.loading && <Card><CardBody className="text-center text-muted py-5">ابتدا مجموعه را انتخاب کنید.</CardBody></Card>}
    {schoolId && !formId && <Card><CardBody className="text-center text-muted py-5">فرم را انتخاب کنید.</CardBody></Card>}
    {reportState.error && <div className="alert alert-danger text-center py-4">{reportState.error}<div className="mt-2"><Button color="danger" outline onClick={() => setReportRetry((v) => v + 1)}>تلاش مجدد</Button></div></div>}
    {ready && reportState.loading && <Card><CardBody className="text-center py-5"><Spinner color="primary" /><div className="text-muted mt-2">در حال دریافت گزارش...</div></CardBody></Card>}
    {ready && !reportState.loading && !reportState.error && report.rows.length === 0 && <Card><CardBody className="text-center text-muted py-5">رکوردی برای نمایش وجود ندارد.</CardBody></Card>}
    {ready && !reportState.loading && !reportState.error && report.rows.length > 0 && <Card>
      <CardHeader className="bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
        <span>مجموع رکوردها: <strong>{report.meta.total}</strong></span>
        <div className="d-flex align-items-center gap-2"><Label className="mb-0" htmlFor="performance-limit">تعداد در صفحه</Label>
          <Input id="performance-limit" type="select" value={limit} style={{ width: 85 }} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }}>
            {[15, 25, 50, 100].map((value) => <option key={value} value={value}>{value}</option>)}
          </Input>
        </div>
      </CardHeader>
      <CardBody>
        <div className="table-responsive" style={{ maxWidth: "100%" }} data-testid="report-table-scroll">
          <Table bordered hover className="align-middle table-nowrap mb-0" aria-label="گزارش عملکرد مشاوران">
            <thead className="table-light"><tr>
              {fixedColumns.map(([key, title, offset, width]) => <th key={key} style={{ minWidth: width, ...stickyStyle(offset, true) }}>{title}</th>)}
              {questions.map((question) => <th key={`question-${question.id}`} data-column-key={`question-${question.id}`} style={{ minWidth: 180 }}>{question.title}{question.required && <span className="text-danger me-1">*</span>}</th>)}
            </tr></thead>
            <tbody>{report.rows.map((row, index) => <tr key={`${row.studentId}-${index}`}>
              {fixedColumns.map(([key, , offset]) => <td key={key} style={stickyStyle(offset)}>{displayValue(row[key])}</td>)}
              {questions.map((question) => <td key={`question-${question.id}`}>{displayValue(row.answers?.[String(question.id)])}</td>)}
            </tr>)}</tbody>
          </Table>
        </div>
        <div className="mt-3"><Paginations perPageData={report.meta.limit} data={report.rows} totalRecords={report.meta.total}
          totalPages={report.meta.lastPage}
          currentPage={report.meta.page} setCurrentPage={setPage} isShowingPageLength
          paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" /></div>
      </CardBody>
    </Card>}
  </div></div>
}

export default AdviserFormPerformanceReport
