import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom"
import {
  Badge, Button, Card, CardBody, CardHeader, Col, Collapse, Input, Label,
  Modal, ModalBody, ModalHeader, Row, Spinner, Table,
} from "reactstrap"

import Breadcrumbs from "../../components/Common/Breadcrumb.jsx"
import Paginations from "../../components/Common/Paginations.jsx"
import AccessDenied from "../DynamicReports/AccessDenied.jsx"
import { useAuth } from "../../context/AuthContext.jsx"
import {
  getStudentContactCallAnswers,
  getStudentContactRecord,
} from "../../services/studentContactRecordService.jsx"
import {
  callStatus, formatDuration, formatRecordDate, formStatus, isAllowedReportUser,
  getContactCallId, parseRecordQuery, resetRecordQuery, serializeRecordQuery, toggleRecordSort,
} from "./studentContactRecordUtils.js"

const text = (value) => value == null || value === "" ? "—" : value
const number = (value) => Number(value ?? 0).toLocaleString("fa-IR")

const displayAnswer = (answer) => {
  if (answer == null) return "—"
  if (Array.isArray(answer)) {
    return answer.length
      ? <div className="d-flex flex-wrap gap-1">{answer.map((item, index) =>
        <Badge color="light" className="text-dark border" key={`${item}-${index}`}>{String(item)}</Badge>)}</div>
      : "—"
  }
  if (typeof answer === "boolean") return answer ? "بله" : "خیر"
  if (answer === "") return <span className="text-muted">پاسخ خالی</span>
  return String(answer)
}

const Answers = ({ answers = [] }) => answers.length
  ? <div className="d-grid gap-2">{answers.map((answer, index) => <div
    key={`${answer.questionId ?? "question"}-${answer.answeredAt ?? "no-date"}-${index}`}
    className={`border rounded p-3 ${answer.isAnswered === false ? "text-muted bg-light" : ""}`}>
    <div className="fw-semibold mb-1">{text(answer.question)}</div>
    <div>{displayAnswer(answer.answer)}</div>
  </div>)}</div>
  : <div className="text-center text-muted py-4">پاسخی برای نمایش وجود ندارد.</div>

const StudentContactRecordDetail = () => {
  document.title = "پرونده تماس دانش‌آموز | داشبورد آیسوق"
  const { studentId } = useParams()
  const { user, hasPermission } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = useMemo(() => parseRecordQuery(new URLSearchParams(searchParams.toString()), true), [searchParams])
  const [draftSearch, setDraftSearch] = useState(query.search)
  const [data, setData] = useState({ student: null, summary: {}, forms: [], calls: [], meta: {} })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [openForm, setOpenForm] = useState(null)
  const [selectedCall, setSelectedCall] = useState(null)
  const [answersModalOpen, setAnswersModalOpen] = useState(false)
  const [answersLoading, setAnswersLoading] = useState(false)
  const [answersError, setAnswersError] = useState("")
  const answersRequestRef = useRef(null)
  const canView = isAllowedReportUser(user) && hasPermission("reports.student-contact-records.show")

  useEffect(() => { setDraftSearch(query.search) }, [query.search])

  const load = useCallback((signal) => {
    setLoading(true)
    setError("")
    return getStudentContactRecord(studentId, query, signal)
      .then(setData)
      .catch((requestError) => {
        if (signal?.aborted || requestError?.code === "ERR_CANCELED") return
        const status = requestError?.response?.status
        setError(status === 403 ? "403" : status === 404 ? "404" : "دریافت پرونده تماس با خطا مواجه شد.")
      })
      .finally(() => { if (!signal?.aborted) setLoading(false) })
  }, [query, studentId])

  useEffect(() => {
    if (!canView) return
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [canView, load])

  const updateQuery = (updates) => setSearchParams(serializeRecordQuery({ ...query, ...updates }, true))
  const goBack = () => navigate(`/reports/student-contact-records${location.state?.listSearch ? `?${location.state.listSearch}` : ""}`)
  const showAll = () => setSearchParams(serializeRecordQuery(resetRecordQuery(true), true))
  useEffect(() => () => answersRequestRef.current?.abort(), [])

  const openAnswersModal = async (event, call) => {
    event.preventDefault()
    event.stopPropagation()
    answersRequestRef.current?.abort()
    const callId = getContactCallId(call)
    setSelectedCall({ ...call, resolvedAnswers: [] })
    setAnswersError("")
    setAnswersModalOpen(true)
    if (callId == null) {
      setAnswersError("شناسه تماس در اطلاعات دریافتی موجود نیست؛ امکان دریافت پاسخ‌نامه وجود ندارد.")
      setAnswersLoading(false)
      return
    }
    const controller = new AbortController()
    answersRequestRef.current = controller
    setAnswersLoading(true)
    try {
      const result = await getStudentContactCallAnswers(studentId, callId, controller.signal)
      setSelectedCall({
        ...call,
        ...(result.call || {}),
        resolvedAnswers: result.answers,
      })
    } catch (requestError) {
      if (controller.signal.aborted || requestError?.code === "ERR_CANCELED") return
      const status = requestError?.response?.status
      setAnswersError(status === 404
        ? "تماس موردنظر برای این دانش‌آموز یافت نشد یا خارج از دسترسی شماست."
        : status === 403
          ? "شما مجوز مشاهده پاسخ‌نامه این تماس را ندارید."
          : "دریافت پاسخ‌نامه با خطا مواجه شد.")
    } finally {
      if (!controller.signal.aborted) setAnswersLoading(false)
    }
  }
  const closeAnswersModal = () => {
    answersRequestRef.current?.abort()
    setAnswersModalOpen(false)
    setAnswersLoading(false)
    setAnswersError("")
    setSelectedCall(null)
  }

  const sortableCallHeaders = [
    ["calledAt", "تاریخ و ساعت"],
    ["formTitle", "فرم تماس"],
    ["status", "وضعیت تماس"],
    ["durationSeconds", "مدت"],
    ["adviserName", "مشاور"],
    ["headAdviserName", "سرمشاور"],
  ]
  const changeCallSort = (field) => {
    setSearchParams(serializeRecordQuery(toggleRecordSort(query, field), true))
  }

  if (!canView || error === "403") return <AccessDenied />

  if (error === "404") return <div className="page-content"><div className="container-fluid"><Card><CardBody className="text-center py-5">
    <i className="bx bx-user-x display-4 text-warning" /><h1 className="h4 mt-3">دانش‌آموز یافت نشد یا خارج از دسترسی شماست</h1>
    <Button color="primary" className="mt-3" onClick={goBack}>بازگشت به لیست</Button>
  </CardBody></Card></div></div>

  if (error) return <div className="page-content"><div className="container-fluid"><Card><CardBody className="text-center py-5 text-danger">
    {error}<div className="mt-3"><Button color="danger" outline onClick={() => load(new AbortController().signal)}>تلاش مجدد</Button></div>
  </CardBody></Card></div></div>

  if (loading && !data.student) return <div className="page-content"><div className="container-fluid">
    <Card><CardBody>{Array.from({ length: 8 }).map((_, index) => <div key={index} className="placeholder-glow mb-3">
      <span className="placeholder col-12" style={{ height: 30 }} /></div>)}</CardBody></Card>
  </div></div>

  const { student, summary } = data
  const formOptions = Array.from(new Map(data.forms.map((form) => [String(form.formId), form])).values())

  return <div className="page-content"><div className="container-fluid">
    <Breadcrumbs title="گزارش‌ها / لیست دانش‌آموزان" breadcrumbItem="پرونده تماس" />
    <Card className="mb-4"><CardBody>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div><h4>{text(student?.studentName)}</h4>
          <div className="text-muted d-flex flex-wrap gap-3"><span>کد ملی: {text(student?.ssn)}</span><span>تلفن: {text(student?.phone)}</span></div>
          <div className="d-flex flex-wrap gap-1 mt-2">{student?.tags?.length
            ? student.tags.map((tag, index) => <Badge color="info" pill key={`${tag}-${index}`}>{tag}</Badge>) : <span>—</span>}</div>
        </div>
        <Button color="secondary" outline onClick={goBack}><i className="bx bx-arrow-back me-1" />بازگشت به لیست</Button>
      </div>
    </CardBody></Card>

    <Row className="g-3 mb-4">
      {[
        ["bx-phone", "کل تماس‌ها", number(summary.totalCalls)],
        ["bx-phone-call", "تماس پاسخ‌داده‌شده", number(summary.answeredCalls)],
        ["bx-phone-off", "ازدست‌رفته / ناموفق", number(summary.missedCalls)],
        ["bx-time", "مجموع مدت تماس", formatDuration(summary.totalDurationSeconds)],
        ["bx-task", "فرم‌های تکمیل‌شده", `${number(summary.completedForms)} / ${number(summary.totalForms)}`],
      ].map(([icon, label, value]) => <Col xl md="6" key={label}><Card className="h-100 mb-0"><CardBody>
        <div className="d-flex align-items-center gap-3"><i className={`bx ${icon} fs-2 text-primary`} /><div>
          <div className="text-muted">{label}</div><div className="h4 mb-0 mt-1">{value}</div>
        </div></div></CardBody></Card></Col>)}
    </Row>

    <div className="d-flex flex-column">
    <Card className="order-2 mb-4"><CardHeader className="bg-white"><h5 className="mb-0">تاریخچه فرم‌های تماس</h5></CardHeader><CardBody>
      {!data.forms.length && <div className="text-center text-muted py-4">فرمی برای این دانش‌آموز ثبت نشده است.</div>}
      <div className="d-grid gap-2">{data.forms.map((form, index) => {
        const status = formStatus(form.status)
        const key = `${form.assignmentId ?? form.formId ?? "form"}-${form.assignedAt ?? "no-date"}-${index}`
        const isOpen = openForm === key
        return <Card className="border mb-0" key={key}><CardHeader className="bg-light">
          <button type="button" className="btn w-100 text-start p-0 d-flex justify-content-between align-items-center gap-2"
            aria-expanded={isOpen} onClick={() => setOpenForm(isOpen ? null : key)}>
            <span><strong>{text(form.formTitle)}</strong><Badge color={status.color} className="ms-2">{status.label}</Badge>
              <small className="d-block text-muted mt-1">مشاور: {text(form.adviserName)} | سرمشاور: {text(form.headAdviserName)} | تخصیص: {formatRecordDate(form.assignedAt)}</small>
            </span><i className={`bx ${isOpen ? "bx-chevron-up" : "bx-chevron-down"} fs-4`} />
          </button>
        </CardHeader><Collapse isOpen={isOpen}><CardBody><Answers answers={form.answers || []} /></CardBody></Collapse></Card>
      })}</div>
    </CardBody></Card>

    <Card className="order-1 mb-4"><CardHeader className="bg-white"><h5 className="mb-0">تاریخچه تماس‌ها</h5></CardHeader><CardBody>
      <form onSubmit={(event) => { event.preventDefault(); updateQuery({ search: draftSearch.trim(), page: 1 }) }}>
        <Row className="g-3 align-items-end mb-4">
          <Col lg="5"><Label for="call-record-search">جستجو</Label><Input id="call-record-search" value={draftSearch}
            onChange={(event) => setDraftSearch(event.target.value)} placeholder="جستجو در تاریخچه تماس‌ها" /></Col>
          <Col lg="3"><Label for="call-record-form">فرم تماس</Label><Input id="call-record-form" type="select" value={query.formId}
            onChange={(event) => updateQuery({ formId: event.target.value, page: 1 })}>
            <option value="">همه فرم‌ها</option>{formOptions.map((form) => <option key={form.formId} value={form.formId}>{form.formTitle}</option>)}
          </Input></Col>
          <Col lg="auto" className="d-flex gap-2"><Button color="primary" type="submit">جستجو</Button>
            <Button color="secondary" outline type="button" onClick={showAll}>نمایش همه</Button></Col>
        </Row>
      </form>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span>تعداد نتایج: <strong>{number(data.meta.total)}</strong></span>
        <div className="d-flex align-items-center gap-2"><Label for="call-record-limit" className="mb-0">تعداد در صفحه</Label>
          <Input id="call-record-limit" type="select" value={query.limit} style={{ width: 85 }}
            onChange={(event) => updateQuery({ limit: Number(event.target.value), page: 1 })}>
            {[10, 25, 50, 100].map((limit) => <option key={limit}>{limit}</option>)}
          </Input></div>
      </div>
      {loading && <Table bordered responsive><tbody>{Array.from({ length: 5 }).map((_, row) =>
        <tr key={row}>{Array.from({ length: 7 }).map((__, cell) => <td key={cell}><span className="placeholder col-8" /></td>)}</tr>)}
      </tbody></Table>}
      {!loading && !data.calls.length && <div className="text-center text-muted py-5">تماسی مطابق فیلترها یافت نشد.</div>}
      {!loading && data.calls.length > 0 && <>
        <div className="table-responsive">
          <Table bordered hover className="table-nowrap align-middle mb-0">
            <thead><tr>
              {sortableCallHeaders.map(([field, label]) => {
                const active = query.sortBy === field
                return <th key={field}>
                  <button type="button" className="btn btn-link text-reset text-decoration-none fw-semibold p-0 w-100"
                    onClick={() => changeCallSort(field)} aria-label={`مرتب‌سازی براساس ${label}`}>
                    {label}
                    <span className="ms-1" aria-hidden="true">
                      {active ? query.sortOrder === "ASC" ? "▲" : "▼" : "↕"}
                    </span>
                  </button>
                </th>
              })}
              <th>عملیات</th>
            </tr></thead>
            <tbody>{data.calls.map((call, index) => {
              const status = callStatus(call.status, call.statusLabel)
              const callId = getContactCallId(call)
              const rowKey = `${callId ?? "call"}-${call.historyId ?? "history"}-${index}`
              return <tr key={rowKey}>
                <td>{formatRecordDate(call.calledAt)}</td>
                <td>{text(call.formTitle)}</td>
                <td><Badge color={status.color}>{status.label}</Badge></td>
                <td>{formatDuration(call.durationSeconds)}</td>
                <td>{text(call.adviserName)}</td>
                <td>{text(call.headAdviserName)}</td>
                <td><button type="button" className="btn btn-sm btn-outline-primary"
                  onClick={(event) => openAnswersModal(event, call)}
                  aria-label={`مشاهده پاسخ‌های تماس ${callId || ""}`}>
                  <i className="bx bx-show me-1" aria-hidden="true" />مشاهده پاسخ‌ها
                </button></td>
              </tr>
            })}</tbody>
          </Table>
        </div>
        <div className="mt-3"><Paginations perPageData={data.meta.limit || query.limit} data={data.calls}
          totalRecords={data.meta.total || 0} currentPage={data.meta.page || query.page}
          setCurrentPage={(page) => updateQuery({ page })} isShowingPageLength
          paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" /></div>
      </>}
    </CardBody></Card>
    </div>

    <Modal key={getContactCallId(selectedCall) || "answers"} isOpen={answersModalOpen}
      toggle={closeAnswersModal} size="lg" centered scrollable fade={false} zIndex={2000}
      labelledBy="student-call-answers-title">
      <ModalHeader toggle={closeAnswersModal} id="student-call-answers-title">
        پاسخ‌های تماس — {text(selectedCall?.formTitle)}
      </ModalHeader>
      <ModalBody>
        {answersLoading && <div className="text-center py-5"><Spinner color="primary" />
          <div className="text-muted mt-3">در حال دریافت پاسخ‌نامه...</div></div>}
        {!answersLoading && answersError && <div className="alert alert-danger text-center mb-0">{answersError}</div>}
        {!answersLoading && !answersError && selectedCall?.resolvedAnswers?.length > 0 &&
          <Answers answers={selectedCall.resolvedAnswers} />}
        {!answersLoading && !answersError && !selectedCall?.resolvedAnswers?.length &&
          <div className="text-center text-muted py-5">
            <i className="bx bx-file-find display-5 d-block mb-2" aria-hidden="true" />
            پاسخ‌نامه‌ای برای این تماس یافت نشد.
          </div>}
      </ModalBody>
    </Modal>
  </div></div>
}

export default StudentContactRecordDetail
