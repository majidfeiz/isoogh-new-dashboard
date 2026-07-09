import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Navigate, useSearchParams } from "react-router-dom"
import { Badge, Button, Card, CardBody, CardHeader, Col, Input, Label, Row, Table } from "reactstrap"

import Breadcrumbs from "../../components/Common/Breadcrumb"
import Paginations from "../../components/Common/Paginations.jsx"
import TableContainer from "../../components/Common/TableContainer.jsx"
import { useAuth } from "../../context/AuthContext.jsx"
import {
  exportInactiveAdvisersReport,
  getInactiveAdvisersReport,
} from "../../services/reportService.jsx"
import { getSchools } from "../../services/schoolService.jsx"
import {
  canExportInactiveAdvisers,
  canViewInactiveAdvisers,
  formatInactiveHours,
  formatJalaliDateTime,
  hasNoCallHistory,
  inactiveAdvisersViewState,
  isAdminUser,
  parseInactiveAdvisersQuery,
  saveInactiveAdvisersBlob,
  scheduleInactiveAdvisersSearch,
  serializeInactiveAdvisersQuery,
  toggleInactiveAdvisersSort,
} from "./inactiveAdvisersUtils.js"

const fa = (value) => value == null || value === "" ? "—" : Number(value).toLocaleString("fa-IR")
const text = (value) => value == null || value === "" ? "—" : value

const InactiveAdvisers = () => {
  document.title = "لیست مشاوران غیرفعال | داشبورد آیسوق"
  const { permissions, user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryString = searchParams.toString()
  const query = useMemo(() => parseInactiveAdvisersQuery(new URLSearchParams(queryString)), [queryString])
  const [data, setData] = useState({ generatedAt: null, cutoffAt: null, items: [], meta: {} })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState(query.search)
  const [schools, setSchools] = useState([])
  const [exporting, setExporting] = useState(false)
  const isAdmin = isAdminUser(user)
  const canExport = canExportInactiveAdvisers(permissions)

  const updateQuery = useCallback((updates) => {
    setSearchParams(serializeInactiveAdvisersQuery({ ...query, ...updates }))
  }, [query, setSearchParams])

  const activeParams = useMemo(() => ({
    ...query,
    schoolId: isAdmin ? query.schoolId : "",
  }), [isAdmin, query])

  const loadReport = useCallback((signal) => {
    setLoading(true)
    setError("")
    return getInactiveAdvisersReport(activeParams, signal)
      .then(setData)
      .catch((requestError) => {
        if (requestError?.code === "ERR_CANCELED" || requestError?.name === "CanceledError" || signal?.aborted) return
        setError("دریافت لیست مشاوران غیرفعال با خطا مواجه شد.")
      })
      .finally(() => { if (!signal?.aborted) setLoading(false) })
  }, [activeParams])

  useEffect(() => {
    const controller = new AbortController()
    loadReport(controller.signal)
    return () => controller.abort()
  }, [loadReport])

  useEffect(() => {
    if (!isAdmin) return
    getSchools({ page: 1, limit: 100 }).then((result) => setSchools(result.items || [])).catch(() => setSchools([]))
  }, [isAdmin])

  useEffect(() => { setSearch(query.search) }, [query.search])
  useEffect(() => {
    if (search === query.search) return
    return scheduleInactiveAdvisersSearch((value) => updateQuery({ search: value.trim(), page: 1 }), search)
  }, [search, query.search, updateQuery])

  const clearFilters = () => {
    setSearch("")
    updateQuery({ search: "", schoolId: "", page: 1 })
  }

  const handleExport = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const blob = await exportInactiveAdvisersReport(activeParams)
      saveInactiveAdvisersBlob(blob)
    } catch {
      // httpClient shows the standard API error toast
    } finally {
      setExporting(false)
    }
  }

  const columns = useMemo(() => [
    { id: "adviserName", accessorKey: "adviserName", header: "نام مشاور", cell: ({ getValue }) => text(getValue()) },
    { id: "adviserNumber", accessorKey: "adviserNumber", header: "شماره مشاور", cell: ({ getValue }) => text(getValue()) },
    { id: "phone", accessorKey: "phone", header: "شماره تماس", cell: ({ getValue }) => text(getValue()) },
    { id: "headAdviserName", accessorKey: "headAdviserName", header: "نام سرمشاور", cell: ({ getValue }) => text(getValue()) },
    { id: "assignedStudents", accessorKey: "assignedStudents", header: "دانش‌آموزان تخصیص‌یافته", cell: ({ getValue }) => fa(getValue()) },
    { id: "lastCallAt", accessorKey: "lastCallAt", header: "آخرین تماس", cell: ({ getValue }) => formatJalaliDateTime(getValue()) },
    { id: "inactiveHours", accessorKey: "inactiveHours", header: "مدت غیرفعال‌بودن", cell: ({ getValue, row }) => formatInactiveHours(getValue(), row.original.lastCallAt) },
  ], [])

  const state = inactiveAdvisersViewState({ loading, error, itemCount: data.items.length })
  if (!canViewInactiveAdvisers(permissions)) return <Navigate to="/" replace />

  return <div className="page-content"><div className="container-fluid">
    <Breadcrumbs title="گزارش‌های مدیریتی" breadcrumbItem="لیست مشاوران غیرفعال" />
    <Card className="mb-4"><CardHeader className="bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div><h5 className="mb-1">لیست مشاوران غیرفعال</h5><span className="text-muted">فاقد تماس در ۷۲ ساعت گذشته</span></div>
      {data.generatedAt && <Badge color="light" className="text-dark border px-3 py-2"
        title={data.cutoffAt ? `مرز محاسبه: ${formatJalaliDateTime(data.cutoffAt)}` : ""}>
        <i className="mdi mdi-clock-outline me-1" />آخرین بروزرسانی: {formatJalaliDateTime(data.generatedAt)}
      </Badge>}
    </CardHeader><CardBody>
      <Row className="g-3 align-items-end">
        <Col xl="4" md="6"><Label>جستجو</Label><Input value={search} onChange={(event) => setSearch(event.target.value)}
          placeholder="جستجو در همه ستون‌ها" /></Col>
        {isAdmin && <Col xl="3" md="6"><Label>مدرسه</Label><Input type="select" value={query.schoolId}
          onChange={(event) => updateQuery({ schoolId: event.target.value, page: 1 })}><option value="">همه مدارس</option>
          {schools.map((school) => <option key={school.id} value={school.id}>{school.name || school.title}</option>)}</Input></Col>}
        <Col xl="auto" className="d-flex gap-2 flex-wrap"><Button color="secondary" outline onClick={clearFilters}>
          <i className="mdi mdi-filter-remove-outline me-1" />پاک‌کردن فیلتر</Button>
          {canExport && <Button color="success" onClick={handleExport} disabled={exporting}>
            <i className={`mdi ${exporting ? "mdi-loading mdi-spin" : "mdi-file-excel-outline"} me-1`} />دانلود Excel</Button>}
        </Col>
      </Row>
    </CardBody></Card>

    {state === "error" && <div className="alert alert-danger text-center py-4">{error}<div className="mt-2">
      <Button color="danger" outline onClick={() => loadReport(new AbortController().signal)}>تلاش مجدد</Button></div></div>}
    {state === "empty" && <Card><CardBody className="text-center text-muted py-5">
      <i className="mdi mdi-check-circle-outline text-success fs-1 d-block mb-2" />همه مشاوران در ۷۲ ساعت اخیر فعال بوده‌اند.
    </CardBody></Card>}
    {state === "loading" && <Card><CardBody><Table bordered responsive><tbody>{Array.from({ length: 7 }).map((_, row) =>
      <tr key={row}>{columns.map((column) => <td key={column.id}><span className="placeholder col-8" /></td>)}</tr>)}</tbody></Table></CardBody></Card>}
    {state === "ready" && <Card><CardHeader className="bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div>تعداد کل مشاوران غیرفعال: <strong>{fa(data.meta.total || 0)}</strong></div>
      <div className="d-flex align-items-center gap-2"><Label className="mb-0">تعداد در صفحه</Label><Input type="select" value={query.limit}
        onChange={(event) => updateQuery({ limit: Number(event.target.value), page: 1 })} style={{ width: 85 }}>
        {[10, 25, 50, 100].map((limit) => <option key={limit}>{limit}</option>)}</Input></div>
    </CardHeader><CardBody>
      <TableContainer columns={columns} data={data.items} isGlobalFilter={false} isPagination={false} manualSorting
        sortingState={[{ id: query.sortBy, desc: query.sortOrder === "DESC" }]}
        onSortingChange={(next) => { const field = next?.[0]?.id || query.sortBy; setSearchParams(serializeInactiveAdvisersQuery(toggleInactiveAdvisersSort(query, field))) }}
        rowClassName={(row) => hasNoCallHistory(row.original) ? "table-warning" : ""}
        tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline" />
      <div className="mt-3"><Paginations perPageData={data.meta.limit || query.limit} data={data.items}
        totalRecords={data.meta.total || 0} currentPage={data.meta.page || query.page} setCurrentPage={(page) => updateQuery({ page })}
        isShowingPageLength paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" /></div>
    </CardBody></Card>}
  </div></div>
}

export default InactiveAdvisers
