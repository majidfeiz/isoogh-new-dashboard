import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Alert, Badge, Button, Card, CardBody, Col, Input, Label, Progress, Row, Table } from "reactstrap"
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx"
import Paginations from "../../components/Common/Paginations.jsx"
import { SchoolPicker } from "../IncomingCalls/IncomingCallsCommon.jsx"
import { getSupportForms } from "../../services/supportFormService.jsx"
import { getAdvisers } from "../../services/adviserService.jsx"
import { getAdviserFormCapacity } from "../../services/adviserFormCapacityService.jsx"
import { capacityView, parseCapacityQuery, serializeCapacityQuery } from "./adviserFormCapacityUtils.js"

const headers = [
  ["schoolName", "نام کسب‌وکار"], ["formTitle", "نام فرم"], [null, "نام مشاور"], [null, "وضعیت اتصال مشاور به فرم"],
  ["activeStudents", "دانش‌آموز فعال"], [null, "ظرفیت مجاز"], ["remainingCapacity", "ظرفیت باقی‌مانده"],
]
const number = (value) => Math.max(0, Number(value) || 0).toLocaleString("fa-IR")

export default function AdviserFormCapacity() {
  document.title = "وضعیت اتصال دانش‌آموز، فرم و مشاور | داشبورد آیسوق"
  const [searchParams, setSearchParams] = useSearchParams()
  const queryString = searchParams.toString()
  const query = useMemo(() => parseCapacityQuery(new URLSearchParams(queryString)), [queryString])
  const [draftSearch, setDraftSearch] = useState(query.search)
  const [forms, setForms] = useState([])
  const [advisers, setAdvisers] = useState([])
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, lastPage: 1 })
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)
  const requestRef = useRef(null)
  const updateQuery = useCallback((updates) => setSearchParams(serializeCapacityQuery({ ...query, ...updates })), [query, setSearchParams])

  useEffect(() => { setDraftSearch(query.search) }, [query.search])
  useEffect(() => { const timer = setTimeout(() => { const search = draftSearch.trim(); if (search !== query.search) updateQuery({ search, page: 1 }) }, 400); return () => clearTimeout(timer) }, [draftSearch, query.search, updateQuery])

  useEffect(() => {
    setForms([]); setAdvisers([])
    if (!query.schoolId) return
    const controller = new AbortController(); setOptionsLoading(true)
    Promise.all([
      getSupportForms({ schoolId: query.schoolId, page: 1, limit: 100, sortBy: "title", sortOrder: "ASC", signal: controller.signal }),
      getAdvisers({ schoolId: query.schoolId, page: 1, limit: 100, sortBy: "name", sortOrder: "ASC", signal: controller.signal }),
    ]).then(([formResult, adviserResult]) => { setForms(formResult.items || []); setAdvisers(adviserResult.items || []) }).catch((requestError) => { if (requestError?.code !== "ERR_CANCELED") { setForms([]); setAdvisers([]) } }).finally(() => { if (!controller.signal.aborted) setOptionsLoading(false) })
    return () => controller.abort()
  }, [query.schoolId])

  const load = useCallback(async () => {
    requestRef.current?.abort(); const controller = new AbortController(); requestRef.current = controller
    setLoading(true); setError("")
    try { const result = await getAdviserFormCapacity(query, controller.signal); if (!controller.signal.aborted) { setItems(result.items); setMeta(result.pagination) } }
    catch (requestError) {
      if (controller.signal.aborted || requestError?.code === "ERR_CANCELED") return
      setItems([]); setMeta((current) => ({ ...current, page: query.page, total: 0 })); setError(requestError?.response?.status === 403 ? "به اطلاعات خارج از مجموعه انتخاب‌شده دسترسی ندارید." : requestError?.response?.status === 409 ? "اطلاعات ظرفیت تغییر کرده است؛ گزارش را دوباره دریافت کنید." : "دریافت گزارش ظرفیت با خطا مواجه شد.")
    } finally { if (!controller.signal.aborted) setLoading(false) }
  }, [query, retry])
  useEffect(() => { load(); return () => requestRef.current?.abort() }, [load])
  useEffect(() => { const refresh = () => setRetry((value) => value + 1); window.addEventListener("adviser-form-capacity:refresh", refresh); return () => window.removeEventListener("adviser-form-capacity:refresh", refresh) }, [])

  const changeSchool = (schoolId) => { setForms([]); setAdvisers([]); setItems([]); updateQuery({ schoolId, formId: "", adviserId: "", page: 1 }) }
  const changeSort = (sortBy) => updateQuery({ sortBy, sortOrder: query.sortBy === sortBy && query.sortOrder === "ASC" ? "DESC" : "ASC", page: 1 })

  return <div className="page-content"><div className="container-fluid"><Breadcrumbs title="گزارشات" breadcrumbItem="ظرفیت اتصال دانش‌آموز–فرم به مشاور" />
    <Card className="mb-4"><CardBody><Row className="g-3 align-items-end">
      <Col xl="3" md="6"><SchoolPicker value={query.schoolId} onChange={changeSchool} /></Col>
      <Col xl="3" md="6"><Label>فرم تماس</Label><Input type="select" value={query.formId} disabled={!query.schoolId || optionsLoading} onChange={(event) => updateQuery({ formId: event.target.value, page: 1 })}><option value="">همه فرم‌ها</option>{forms.map((item) => <option key={item.id} value={item.id}>{item.title || item.name}</option>)}</Input></Col>
      <Col xl="3" md="6"><Label>مشاور</Label><Input type="select" value={query.adviserId} disabled={!query.schoolId || optionsLoading} onChange={(event) => updateQuery({ adviserId: event.target.value, page: 1 })}><option value="">همه مشاوران</option>{advisers.map((item) => <option key={item.id} value={item.id}>{item.name || item.user?.name || `مشاور ${item.id}`}</option>)}</Input></Col>
      <Col xl="3" md="6"><Label>جستجو</Label><Input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="نام مجموعه، فرم یا مشاور" /></Col>
      <Col xl="2" md="4"><Label>تعداد در صفحه</Label><Input type="select" value={query.limit} onChange={(event) => updateQuery({ limit: Number(event.target.value), page: 1 })}>{[10, 20, 50, 100].map((limit) => <option key={limit}>{limit}</option>)}</Input></Col>
    </Row></CardBody></Card>
    {loading && <Card><CardBody className="text-center py-5"><span className="spinner-border text-primary" aria-label="در حال بارگذاری" /></CardBody></Card>}
    {!loading && error && <Alert color="danger" className="text-center">{error}<div className="mt-2"><Button color="danger" outline onClick={() => setRetry((value) => value + 1)}>تلاش مجدد</Button></div></Alert>}
    {!loading && !error && !items.length && <Card><CardBody className="text-center text-muted py-5">رکوردی مطابق فیلترها یافت نشد.</CardBody></Card>}
    {!loading && !error && items.length > 0 && <Card><CardBody><div className="table-responsive"><Table bordered hover className="table-nowrap align-middle mb-0"><thead><tr>{headers.map(([sortBy, label]) => <th key={label}>{sortBy ? <button type="button" className="btn btn-link text-reset text-decoration-none fw-semibold p-0" onClick={() => changeSort(sortBy)}>{label} {query.sortBy === sortBy ? query.sortOrder === "ASC" ? "▲" : "▼" : "↕"}</button> : label}</th>)}</tr></thead>
      <tbody>{items.map((item) => { const view = capacityView(item); return <tr key={`${item.schoolId}-${item.formId}-${item.adviserId}`}>
        <td>{item.schoolName || "—"}</td><td>{item.formTitle || "—"}</td><td>{item.adviserName || "—"}</td><td><Badge color={item.adviserFormActive ? "success" : "secondary"}>{item.adviserFormActive ? "فعال" : "غیرفعال"}</Badge></td>
        <td><strong>{number(item.activeStudents)}</strong>{item.overCapacity && <Badge color="danger" className="ms-2">بیش از ظرفیت</Badge>}</td><td>{number(item.capacity)}</td><td style={{ minWidth: 190 }}><div className="d-flex justify-content-between gap-2 mb-1"><Badge color={view.color}>{view.label}</Badge><span>{number(view.remaining)}</span></div><Progress value={view.percent} color={view.color} style={{ height: 7 }} /></td>
      </tr> })}</tbody></Table></div><div className="mt-3"><Paginations perPageData={meta.limit} data={items} totalRecords={meta.total} currentPage={meta.page} setCurrentPage={(page) => updateQuery({ page })} isShowingPageLength paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" /></div></CardBody></Card>}
  </div></div>
}
