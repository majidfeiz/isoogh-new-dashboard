import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Alert, Badge, Button, Card, CardBody, Col, Input, Label, Row, Table } from "reactstrap"
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx"
import Paginations from "../../components/Common/Paginations.jsx"
import { useAuth } from "../../context/AuthContext.jsx"
import { getSupportForms } from "../../services/supportFormService.jsx"
import { exportIncomingCalls, getIncomingCalls, incomingCallErrorMessage, saveIncomingCallsExport } from "../../services/incomingCallService.jsx"
import { formatDateTime, formatDuration, RequestState, SchoolPicker } from "./IncomingCallsCommon.jsx"
import { incomingCallRangeError, parseIncomingCallQuery, serializeIncomingCallQuery, statusView } from "./incomingCallReportUtils.js"

const display = (input) => input == null || input === "" ? "—" : input
const personName = (person, unknown = false) => person ? display(person.name) : unknown ? "شناسایی نشده" : "—"
const sortHeaders = [["status", "وضعیت"], ["durationSeconds", "مدت مکالمه"], ["startedAt", "شروع"], ["endedAt", "پایان"]]

const IncomingCallList = () => {
  document.title = "گزارش تماس‌های ورودی | آیسوق"
  const { hasPermission } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = useMemo(() => parseIncomingCallQuery(new URLSearchParams(searchParams.toString())), [searchParams])
  const [draftSearch, setDraftSearch] = useState(query.search)
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, lastPage: 1 })
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [exporting, setExporting] = useState("")
  const requestRef = useRef(null)
  const rangeError = incomingCallRangeError(query)
  const updateQuery = useCallback((updates) => setSearchParams(serializeIncomingCallQuery({ ...query, ...updates })), [query, setSearchParams])

  useEffect(() => { setDraftSearch(query.search) }, [query.search])
  useEffect(() => {
    const timer = setTimeout(() => { const search = draftSearch.trim(); if (search !== query.search) updateQuery({ search, page: 1 }) }, 450)
    return () => clearTimeout(timer)
  }, [draftSearch, query.search, updateQuery])

  const load = useCallback(async () => {
    if (!query.schoolId || rangeError) return
    requestRef.current?.abort()
    const controller = new AbortController(); requestRef.current = controller
    setLoading(true); setError("")
    try {
      const result = await getIncomingCalls({ ...query, signal: controller.signal })
      if (!controller.signal.aborted) { setItems(result.items); setMeta(result.pagination) }
    } catch (requestError) {
      if (controller.signal.aborted || requestError?.code === "ERR_CANCELED") return
      setItems([]); setMeta((current) => ({ ...current, total: 0, page: query.page })); setError(incomingCallErrorMessage(requestError))
    } finally { if (!controller.signal.aborted) setLoading(false) }
  }, [query, rangeError])
  useEffect(() => { load(); return () => requestRef.current?.abort() }, [load])

  useEffect(() => {
    if (!query.schoolId) { setForms([]); return }
    const controller = new AbortController()
    getSupportForms({ schoolId: query.schoolId, page: 1, limit: 100, signal: controller.signal }).then((result) => setForms(result.items || [])).catch((requestError) => { if (requestError?.code !== "ERR_CANCELED") setForms([]) })
    return () => controller.abort()
  }, [query.schoolId])

  const changeSort = (sortBy) => updateQuery({ sortBy, sortOrder: query.sortBy === sortBy && query.sortOrder === "ASC" ? "DESC" : "ASC", page: 1 })
  const sortButton = ([sortBy, label]) => <th key={sortBy}><button type="button" className="btn btn-link text-reset p-0 fw-semibold text-nowrap" onClick={() => changeSort(sortBy)}>{label} {query.sortBy === sortBy ? query.sortOrder === "ASC" ? "▲" : "▼" : "↕"}</button></th>
  const download = async (format) => {
    if (!query.schoolId || rangeError) return
    setExporting(format); setError("")
    try { saveIncomingCallsExport(await exportIncomingCalls(format, query)) } catch (requestError) { setError(incomingCallErrorMessage(requestError)) } finally { setExporting("") }
  }

  return <div className="page-content"><div className="container-fluid">
    <Breadcrumbs title="تماس‌های ورودی" breadcrumbItem="گزارش تماس‌ها" />
    <Card><CardBody>
      <Row className="g-3 align-items-end">
        <Col xl="3" md="6"><SchoolPicker value={query.schoolId} onChange={(schoolId) => { setItems([]); updateQuery({ schoolId, page: 1 }) }} /></Col>
        <Col xl="3" md="6"><Label>جستجوی عمومی</Label><Input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="شماره یا نام" /></Col>
        <Col xl="2" md="4"><Label>وضعیت</Label><Input type="select" value={query.status} onChange={(event) => updateQuery({ status: event.target.value, page: 1 })}><option value="">همه</option>{["routing", "answered", "missed", "voice", "ended"].map((status) => <option key={status} value={status}>{statusView(status)[0]}</option>)}</Input></Col>
        <Col xl="2" md="4"><Label>کد ملی دقیق</Label><Input value={query.ssn} onChange={(event) => updateQuery({ ssn: event.target.value.trim(), page: 1 })} /></Col>
        <Col xl="2" md="4"><Label>نام کاربری دقیق</Label><Input value={query.username} onChange={(event) => updateQuery({ username: event.target.value.trim(), page: 1 })} /></Col>
        <Col xl="3" md="4"><Label>فرم تماس</Label><Input type="select" value={query.formId} disabled={!query.schoolId} onChange={(event) => updateQuery({ formId: event.target.value, page: 1 })}><option value="">همه فرم‌ها</option>{forms.map((form) => <option key={form.id} value={form.id}>{form.title || form.name || `فرم ${form.id}`}</option>)}</Input></Col>
        <Col xl="2" md="4"><Label>از تاریخ</Label><Input type="date" value={query.from} onChange={(event) => updateQuery({ from: event.target.value, page: 1 })} /></Col>
        <Col xl="2" md="4"><Label>تا پایان روز</Label><Input type="date" value={query.to} min={query.from || undefined} onChange={(event) => updateQuery({ to: event.target.value, page: 1 })} /></Col>
        <Col xl="2" md="4"><Label>تعداد در صفحه</Label><Input type="select" value={query.limit} onChange={(event) => updateQuery({ limit: Number(event.target.value), page: 1 })}>{[10, 20, 50, 100].map((limit) => <option key={limit}>{limit}</option>)}</Input></Col>
        {hasPermission("incoming-calls.export") && <Col xl="3" md="8" className="d-flex gap-2"><Button color="success" outline disabled={!!exporting || !query.schoolId || !!rangeError} onClick={() => download("csv")}>{exporting === "csv" ? "در حال دریافت..." : "خروجی CSV"}</Button><Button color="success" disabled={!!exporting || !query.schoolId || !!rangeError} onClick={() => download("xlsx")}>{exporting === "xlsx" ? "در حال دریافت..." : "خروجی Excel"}</Button></Col>}
      </Row>
      {rangeError && <Alert color="warning" className="mt-3 mb-0">{rangeError}</Alert>}
      {!query.schoolId ? <div className="text-muted text-center py-5">مجموعه را انتخاب کنید.</div> : !rangeError && <RequestState loading={loading} error={error} empty={!items.length} onRetry={load} emptyText="تماسی مطابق فیلترها یافت نشد." />}
      {!!items.length && !loading && !rangeError && <><div className="table-responsive mt-4"><Table bordered hover className="table-nowrap align-middle"><thead><tr>
        <th>شماره مبدأ</th><th>شماره مقصد</th>{sortButton(sortHeaders[0])}<th>دانش‌آموز</th><th>نام کاربری</th><th>کد ملی</th><th>مشاور</th><th>پشتیبان</th><th>فرم تماس</th>{sortButton(sortHeaders[1])}{sortButton(sortHeaders[2])}{sortButton(sortHeaders[3])}<th>فایل صوتی</th>
      </tr></thead><tbody>{items.map((item) => { const status = statusView(item.status); return <tr key={item.id}>
        <td dir="ltr" className="text-end">{display(item.callerNumber)}</td><td dir="ltr" className="text-end">{display(item.destination)}</td><td><Badge color={status[1]}>{status[0]}</Badge></td>
        <td>{personName(item.student, true)}</td><td>{display(item.student?.username)}</td><td>{display(item.student?.ssn)}</td><td>{personName(item.adviser)}</td><td>{personName(item.supporter)}</td><td>{display(item.supportForm?.title)}</td>
        <td>{formatDuration(item.durationSeconds)}</td><td>{formatDateTime(item.startedAt)}</td><td>{formatDateTime(item.endedAt)}</td><td>{item.audioFiles.length ? <div className="d-grid gap-2">{item.audioFiles.map((audio) => <div key={audio.id || audio.url}><audio controls preload="none" src={audio.url} aria-label={audio.name || "فایل صوتی"} /><a href={audio.url} download={audio.name || true} className="small d-block">دانلود {audio.name || "فایل صوتی"}</a></div>)}</div> : "—"}</td>
      </tr> })}</tbody></Table></div><Paginations perPageData={meta.limit} data={items} totalRecords={meta.total} currentPage={meta.page} setCurrentPage={(page) => updateQuery({ page })} isShowingPageLength paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" /></>}
    </CardBody></Card>
  </div></div>
}
export default IncomingCallList
