// src/pages/Reports/components/UncontactedStudentsTable.jsx
import React, { useCallback, useEffect, useState } from "react"
import { Badge, Button, Card, CardBody, CardHeader, Spinner, Table } from "reactstrap"
import moment from "moment-jalaali"
import Paginations from "../../../components/Common/Paginations.jsx"
import { getReportsUncontactedStudents } from "../../../services/reportService.jsx"
import { API_ROUTES, getApiUrl } from "../../../helpers/apiRoutes.jsx"
import { getAccessToken } from "../../../helpers/authStorage.jsx"

const faNum = (v) => (v == null ? "—" : Number(v).toLocaleString("fa-IR"))

const toJalali = (d) => {
  if (!d) return "هیچ‌وقت"
  try {
    return moment(d).format("jYYYY/jMM/jDD")
  } catch {
    return String(d)
  }
}

const UncontactedStudentsTable = ({ period, schoolId, hasExportPerm }) => {
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, lastPage: 1 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [exporting, setExporting] = useState(false)

  const fetchData = useCallback(
    async (page = 1) => {
      setLoading(true)
      setError(null)
      try {
        const res = await getReportsUncontactedStudents({
          from: period?.from,
          to: period?.to,
          schoolId,
          page,
          limit: meta.limit,
        })
        setItems(res?.items || [])
        setMeta((prev) => ({
          ...prev,
          page: res?.meta?.page ?? page,
          total: res?.meta?.total ?? 0,
          lastPage: res?.meta?.lastPage ?? 1,
        }))
      } catch {
        setError("خطا در بارگذاری لیست دانش‌آموزان تماس‌نگرفته")
        setItems([])
      } finally {
        setLoading(false)
      }
    },
    [period, schoolId, meta.limit]
  )

  useEffect(() => {
    fetchData(1)
  }, [period, schoolId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleExport = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const params = new URLSearchParams()
      if (period?.from) params.append("from", period.from)
      if (period?.to) params.append("to", period.to)
      if (schoolId) params.append("schoolId", String(schoolId))
      const url = `${getApiUrl(API_ROUTES.reports.uncontactedStudentsExport)}?${params.toString()}`
      const token = getAccessToken()
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error("خطا در دانلود")
      const blob = await res.blob()
      const objectUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = objectUrl
      a.download = "uncontacted-students.csv"
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1200)
    } catch {
      // toast shown by httpClient
    } finally {
      setExporting(false)
    }
  }

  return (
    <Card className="shadow-sm mb-4">
      <CardHeader className="bg-white border-bottom d-flex align-items-center justify-content-between gap-2 flex-wrap">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-2 d-flex align-items-center justify-content-center text-white"
            style={{ width: 32, height: 32, backgroundColor: "#f46a6a", flexShrink: 0 }}
          >
            <i className="mdi mdi-account-off-outline fs-6" />
          </div>
          <h6 className="mb-0 fw-semibold">دانش‌آموزان تماس‌نگرفته</h6>
          {meta.total > 0 && (
            <Badge color="danger" pill>
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
                  <th>نام دانش‌آموز</th>
                  <th>پایه</th>
                  <th>آخرین تماس</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-muted py-4">
                      داده‌ای موجود نیست
                    </td>
                  </tr>
                ) : (
                  items.map((row) => (
                    <tr key={row.studentId}>
                      <td className="fw-medium">{row.studentName || "—"}</td>
                      <td>{row.gradeTitle || (row.gradeId ? `پایه ${row.gradeId}` : "—")}</td>
                      <td>
                        <span
                          className={row.lastContactedAt ? "" : "text-muted fst-italic"}
                          style={{ fontSize: "0.82rem" }}
                        >
                          {toJalali(row.lastContactedAt)}
                        </span>
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
              setCurrentPage={fetchData}
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

export default UncontactedStudentsTable
