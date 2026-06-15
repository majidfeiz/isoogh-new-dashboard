// src/pages/Reports/components/CallsByAdviserTable.jsx
import React, { useCallback, useEffect, useState } from "react"
import { Badge, Button, Card, CardBody, CardHeader, Spinner, Table } from "reactstrap"
import Paginations from "../../../components/Common/Paginations.jsx"
import { getReportsCallsByAdviser } from "../../../services/reportService.jsx"
import { API_ROUTES, getApiUrl } from "../../../helpers/apiRoutes.jsx"
import { getAccessToken } from "../../../helpers/authStorage.jsx"

const faNum = (v) => (v == null ? "—" : Number(v).toLocaleString("fa-IR"))

const fmtSec = (sec) => {
  if (sec == null) return "—"
  const total = Math.round(sec)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${m}:${String(s).padStart(2, "0")}`
}

const SORT_COLS = [
  { key: "totalCalls", label: "تماس‌ها" },
  { key: "uniqueStudents", label: "دانش‌آموزان" },
  { key: "totalDurationSeconds", label: "مدت کل" },
  { key: "avgDurationSeconds", label: "میانگین مدت" },
  { key: "completedForms", label: "فرم تکمیل‌شده" },
  { key: "formCompletionPercent", label: "درصد تکمیل" },
]

const CallsByAdviserTable = ({ period, schoolId, hasExportPerm }) => {
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, lastPage: 1 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState("totalCalls")
  const [sortOrder, setSortOrder] = useState("DESC")
  const [exporting, setExporting] = useState(false)

  const fetchData = useCallback(
    async (page = 1, by = sortBy, order = sortOrder) => {
      setLoading(true)
      setError(null)
      try {
        const res = await getReportsCallsByAdviser({
          from: period?.from,
          to: period?.to,
          schoolId,
          page,
          limit: meta.limit,
          sortBy: by,
          sortOrder: order,
        })
        setItems(res?.items || [])
        setMeta((prev) => ({
          ...prev,
          page: res?.meta?.page ?? page,
          total: res?.meta?.total ?? 0,
          lastPage: res?.meta?.lastPage ?? 1,
        }))
      } catch (e) {
        setError("خطا در بارگذاری جدول مشاوران")
        setItems([])
      } finally {
        setLoading(false)
      }
    },
    [period, schoolId, meta.limit, sortBy, sortOrder]
  )

  useEffect(() => {
    fetchData(1, sortBy, sortOrder)
  }, [period, schoolId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSort = (col) => {
    const newOrder = sortBy === col && sortOrder === "DESC" ? "ASC" : "DESC"
    setSortBy(col)
    setSortOrder(newOrder)
    fetchData(1, col, newOrder)
  }

  const handlePage = (page) => fetchData(page, sortBy, sortOrder)

  const handleExport = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const params = new URLSearchParams()
      if (period?.from) params.append("from", period.from)
      if (period?.to) params.append("to", period.to)
      if (schoolId) params.append("schoolId", String(schoolId))
      const url = `${getApiUrl(API_ROUTES.reports.callsByAdviserExport)}?${params.toString()}`
      const token = getAccessToken()
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error("خطا در دانلود")
      const blob = await res.blob()
      const objectUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = objectUrl
      a.download = "calls-by-adviser.csv"
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1200)
    } catch {
      // toast is shown by httpClient; no double error needed
    } finally {
      setExporting(false)
    }
  }

  const sortIcon = (col) => {
    if (sortBy !== col) return <i className="mdi mdi-unfold-more-horizontal text-muted ms-1" />
    return sortOrder === "DESC"
      ? <i className="mdi mdi-arrow-down text-primary ms-1" />
      : <i className="mdi mdi-arrow-up text-primary ms-1" />
  }

  return (
    <Card className="shadow-sm mb-4">
      <CardHeader className="bg-white border-bottom d-flex align-items-center justify-content-between gap-2 flex-wrap">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-2 d-flex align-items-center justify-content-center text-white"
            style={{ width: 32, height: 32, backgroundColor: "#74788d", flexShrink: 0 }}
          >
            <i className="mdi mdi-account-tie fs-6" />
          </div>
          <h6 className="mb-0 fw-semibold">تماس‌ها بر اساس مشاور</h6>
          {meta.total > 0 && (
            <Badge color="secondary" pill>
              {faNum(meta.total)}
            </Badge>
          )}
        </div>
        {hasExportPerm && (
          <Button
            color="success"
            size="sm"
            outline
            onClick={handleExport}
            disabled={exporting}
            className="d-flex align-items-center gap-1"
          >
            <i className={`mdi ${exporting ? "mdi-loading mdi-spin" : "mdi-file-download-outline"}`} />
            دانلود CSV
          </Button>
        )}
      </CardHeader>
      <CardBody className="p-0">
        {loading && (
          <div className="text-center py-5">
            <Spinner color="primary" />
          </div>
        )}
        {error && !loading && (
          <div className="text-center py-4 text-danger p-3">
            <i className="mdi mdi-alert-circle-outline fs-3 d-block mb-2" />
            <small>{error}</small>
          </div>
        )}
        {!loading && !error && (
          <div className="table-responsive">
            <Table className="table-bordered table-hover align-middle mb-0" size="sm">
              <thead className="table-light">
                <tr>
                  <th>نام مشاور</th>
                  {SORT_COLS.map((c) => (
                    <th
                      key={c.key}
                      className="cursor-pointer"
                      style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                      onClick={() => handleSort(c.key)}
                    >
                      {c.label}
                      {sortIcon(c.key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      داده‌ای موجود نیست
                    </td>
                  </tr>
                ) : (
                  items.map((row) => (
                    <tr key={row.adviserId}>
                      <td className="fw-medium">{row.adviserName || "—"}</td>
                      <td>{faNum(row.totalCalls)}</td>
                      <td>{faNum(row.uniqueStudents)}</td>
                      <td>{fmtSec(row.totalDurationSeconds)}</td>
                      <td>{fmtSec(row.avgDurationSeconds)}</td>
                      <td>{faNum(row.completedForms)}</td>
                      <td>
                        {row.formCompletionPercent != null
                          ? `${Number(row.formCompletionPercent).toFixed(1).toLocaleString("fa-IR")}٪`
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        )}
        {!loading && meta.total > 0 && (
          <div className="px-3 py-2 border-top bg-light">
            <Paginations
              perPageData={meta.limit}
              data={items}
              totalRecords={meta.total}
              currentPage={meta.page}
              setCurrentPage={handlePage}
              isShowingPageLength={true}
              paginationDiv="col-sm-auto"
              paginationClass="pagination pagination-sm mb-0"
            />
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default CallsByAdviserTable
