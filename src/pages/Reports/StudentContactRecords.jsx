import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Badge, Button, Card, CardBody, CardHeader, Col, Input, Label, Row, Table } from "reactstrap"

import Breadcrumbs from "../../components/Common/Breadcrumb.jsx"
import Paginations from "../../components/Common/Paginations.jsx"
import TableContainer from "../../components/Common/TableContainer.jsx"
import AccessDenied from "../DynamicReports/AccessDenied.jsx"
import { useAuth } from "../../context/AuthContext.jsx"
import { getParentTags } from "../../services/parentTagService.jsx"
import { getSchools } from "../../services/schoolService.jsx"
import { getSupportForms } from "../../services/supportFormService.jsx"
import {
  exportStudentContactRecords,
  getStudentContactRecords,
} from "../../services/studentContactRecordService.jsx"
import {
  globalRowNumber,
  getStudentRecordId,
  isAdminReportUser,
  isAllowedReportUser,
  parseRecordQuery,
  resetRecordQuery,
  saveRecordBlob,
  serializeRecordQuery,
  toggleRecordSort,
} from "./studentContactRecordUtils.js"

const valueOrDash = (value) => value == null || value === "" ? "—" : value
const optionLabel = (item) => item?.name || item?.title || item?.label || `#${item?.id}`

const StudentContactRecords = () => {
  document.title = "لیست دانش‌آموزان | داشبورد آیسوق"
  const { user, hasPermission } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = useMemo(() => parseRecordQuery(new URLSearchParams(searchParams.toString())), [searchParams])
  const [draft, setDraft] = useState(query)
  const [data, setData] = useState({ items: [], meta: {} })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [exporting, setExporting] = useState(false)
  const [tags, setTags] = useState([])
  const [forms, setForms] = useState([])
  const [schools, setSchools] = useState([])
  const isAdmin = isAdminReportUser(user)
  const canView = isAllowedReportUser(user) && hasPermission("reports.student-contact-records.index")
  const canShow = hasPermission("reports.student-contact-records.show")
  const canExport = hasPermission("reports.student-contact-records.export")

  useEffect(() => { setDraft(query) }, [query])

  const load = useCallback((signal) => {
    setLoading(true)
    setError("")
    const params = { ...query, schoolId: isAdmin ? query.schoolId : "" }
    return getStudentContactRecords(params, signal)
      .then(setData)
      .catch((requestError) => {
        if (signal?.aborted || requestError?.code === "ERR_CANCELED") return
        setError(requestError?.response?.status === 403 ? "403" : "دریافت لیست دانش‌آموزان با خطا مواجه شد.")
      })
      .finally(() => { if (!signal?.aborted) setLoading(false) })
  }, [isAdmin, query])

  useEffect(() => {
    if (!canView) return
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [canView, load])

  useEffect(() => {
    if (!canView) return
    getParentTags({ page: 1, limit: 100 }).then((result) => setTags(result.items || [])).catch(() => setTags([]))
    getSupportForms({ page: 1, limit: 100 }).then((result) => setForms(result.items || [])).catch(() => setForms([]))
    if (isAdmin) getSchools({ page: 1, limit: 100 }).then((result) => setSchools(result.items || [])).catch(() => setSchools([]))
  }, [canView, isAdmin])

  const applyFilters = () => setSearchParams(serializeRecordQuery({ ...query, ...draft, page: 1 }))
  const showAll = () => setSearchParams(serializeRecordQuery(resetRecordQuery()))
  const updateQuery = (updates) => setSearchParams(serializeRecordQuery({ ...query, ...updates }))

  const handleExport = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const blob = await exportStudentContactRecords({ ...query, schoolId: isAdmin ? query.schoolId : "" })
      saveRecordBlob(blob)
    } catch {
      // The shared HTTP client displays the API error.
    } finally {
      setExporting(false)
    }
  }

  const columns = [
    {
      id: "rowNumber", header: "شماره", enableSorting: false,
      cell: ({ row }) => globalRowNumber(query.page, query.limit, row.index).toLocaleString("fa-IR"),
    },
    { id: "studentName", accessorKey: "studentName", header: "نام", cell: ({ getValue }) => valueOrDash(getValue()) },
    { id: "ssn", accessorKey: "ssn", header: "کد ملی", cell: ({ getValue }) => valueOrDash(getValue()) },
    { id: "phone", accessorKey: "phone", header: "تلفن", cell: ({ getValue }) => valueOrDash(getValue()) },
    {
      id: "tags", accessorKey: "tags", header: "تگ‌ها",
      cell: ({ getValue }) => {
        const values = getValue()
        return Array.isArray(values) && values.length
          ? <div className="d-flex flex-wrap gap-1">{values.map((tag, index) => <Badge color="info" pill key={`${tag}-${index}`}>{tag}</Badge>)}</div>
          : "—"
      },
    },
    {
      id: "actions", header: "عملیات", enableSorting: false,
      cell: ({ row }) => {
        const studentRecordId = getStudentRecordId(row.original)
        if (!canShow || studentRecordId == null) return "—"
        return <Button tag={Link} color="primary" outline size="sm" type="button"
          to={`/reports/student-contact-records/${encodeURIComponent(studentRecordId)}`}
          state={{ listSearch: searchParams.toString() }}
          title="مشاهده پرونده تماس" aria-label={`مشاهده پرونده تماس ${row.original.studentName || ""}`}>
          <i className="bx bx-line-chart" aria-hidden="true" />
        </Button>
      },
    },
  ]

  if (!canView || error === "403") return <AccessDenied />

  return <div className="page-content"><div className="container-fluid">
    <Breadcrumbs title="گزارش‌ها / گزارش جامع ویپ دانش‌آموزان" breadcrumbItem="لیست دانش‌آموزان" />
    <Card className="mb-4"><CardHeader className="bg-white"><h5 className="mb-0">لیست دانش‌آموزان</h5></CardHeader>
      <CardBody><form onSubmit={(event) => { event.preventDefault(); applyFilters() }}>
        <Row className="g-3 align-items-end">
          <Col xl="3" md="6"><Label for="student-record-search">جستجو</Label><Input id="student-record-search"
            value={draft.search} onChange={(event) => setDraft((current) => ({ ...current, search: event.target.value }))}
            placeholder="نام، کد ملی، شماره تماس یا تگ" /></Col>
          <Col xl="2" md="6"><Label for="student-record-tag">تگ دانش‌آموز</Label><Input id="student-record-tag" type="select"
            value={draft.tagId} onChange={(event) => setDraft((current) => ({ ...current, tagId: event.target.value }))}>
            <option value="">همه تگ‌ها</option>{tags.map((item) => <option key={item.id} value={item.id}>{optionLabel(item)}</option>)}
          </Input></Col>
          <Col xl="2" md="6"><Label for="student-record-form">فرم تماس</Label><Input id="student-record-form" type="select"
            value={draft.formId} onChange={(event) => setDraft((current) => ({ ...current, formId: event.target.value }))}>
            <option value="">همه فرم‌ها</option>{forms.map((item) => <option key={item.id} value={item.id}>{optionLabel(item)}</option>)}
          </Input></Col>
          {isAdmin && <Col xl="2" md="6"><Label for="student-record-school">مدرسه</Label><Input id="student-record-school" type="select"
            value={draft.schoolId} onChange={(event) => setDraft((current) => ({ ...current, schoolId: event.target.value }))}>
            <option value="">همه مدارس</option>{schools.map((item) => <option key={item.id} value={item.id}>{optionLabel(item)}</option>)}
          </Input></Col>}
          <Col xl="auto" className="d-flex gap-2 flex-wrap">
            <Button color="primary" type="submit"><i className="bx bx-search me-1" />جستجو</Button>
            <Button color="secondary" outline type="button" onClick={showAll}>نمایش همه</Button>
            {canExport && <Button color="success" type="button" onClick={handleExport} disabled={exporting}>
              <i className={`mdi ${exporting ? "mdi-loading mdi-spin" : "mdi-file-excel-outline"} me-1`} />
              {exporting ? "در حال دریافت..." : "خروجی Excel"}
            </Button>}
          </Col>
        </Row>
      </form></CardBody>
    </Card>

    {error && <Card><CardBody className="text-center py-5 text-danger">{error}<div className="mt-3">
      <Button color="danger" outline onClick={() => load(new AbortController().signal)}>تلاش مجدد</Button></div></CardBody></Card>}
    {!error && loading && <Card><CardBody><Table bordered responsive><tbody>{Array.from({ length: 6 }).map((_, row) =>
      <tr key={row}>{Array.from({ length: 6 }).map((__, cell) => <td key={cell}><span className="placeholder col-8" /></td>)}</tr>)}
    </tbody></Table></CardBody></Card>}
    {!error && !loading && !data.items.length && <Card><CardBody className="text-center py-5 text-muted">
      <i className="bx bx-search-alt display-5 d-block mb-2" />دانش‌آموزی مطابق فیلترها یافت نشد
      <div className="mt-3"><Button color="primary" outline onClick={showAll}>نمایش همه</Button></div>
    </CardBody></Card>}
    {!error && !loading && data.items.length > 0 && <Card><CardHeader className="bg-white d-flex justify-content-between align-items-center">
      <span>تعداد کل: <strong>{Number(data.meta.total || 0).toLocaleString("fa-IR")}</strong></span>
      <div className="d-flex align-items-center gap-2"><Label for="student-record-limit" className="mb-0">تعداد در صفحه</Label>
        <Input id="student-record-limit" type="select" value={query.limit} onChange={(event) => updateQuery({ limit: Number(event.target.value), page: 1 })} style={{ width: 85 }}>
          {[10, 25, 50, 100].map((limit) => <option key={limit}>{limit}</option>)}
        </Input></div>
    </CardHeader><CardBody>
      <TableContainer columns={columns} data={data.items} isGlobalFilter={false} isPagination={false} manualSorting
        sortingState={[{ id: query.sortBy, desc: query.sortOrder === "DESC" }]}
        onSortingChange={(next) => setSearchParams(serializeRecordQuery(toggleRecordSort(query, next?.[0]?.id || query.sortBy)))}
        tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline" />
      <div className="mt-3"><Paginations perPageData={data.meta.limit || query.limit} data={data.items}
        totalRecords={data.meta.total || 0} currentPage={data.meta.page || query.page}
        setCurrentPage={(page) => updateQuery({ page })} isShowingPageLength
        paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" /></div>
    </CardBody></Card>}
  </div></div>
}

export default StudentContactRecords
