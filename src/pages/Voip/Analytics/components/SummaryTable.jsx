// src/pages/Voip/Analytics/components/SummaryTable.jsx
import React, { useMemo } from "react"
import { Badge, Card, CardBody, CardHeader, Spinner } from "reactstrap"

const faNum = (v) => (v == null ? "—" : Number(v).toLocaleString("fa-IR"))
const faPct = (v) => (v == null ? "—" : `${Number(v).toFixed(1)}٪`)

function healthScore(row) {
  const score =
    100 -
    (row.duration_mismatch_percent ?? 0) * 5 -
    (row.failed_file_percent ?? 0) * 3 -
    (row.orphaned_call_percent ?? 0) * 2 -
    (row.null_call_group_percent ?? 0) * 2
  return Math.max(0, Math.round(score))
}

function pctBadge(pct) {
  if (pct == null) return <span className="text-muted">—</span>
  const v = Number(pct)
  let color = "success"
  if (v > 5) color = "danger"
  else if (v > 2) color = "warning"
  return (
    <Badge color={color} className="bg-opacity-15 fw-semibold" pill>
      {faPct(pct)}
    </Badge>
  )
}

function scoreBadge(score) {
  let color = "success"
  if (score < 60) color = "danger"
  else if (score < 80) color = "warning"
  return (
    <Badge color={color} className="fw-bold">
      {score}/۱۰۰
    </Badge>
  )
}

const SummaryTable = ({ data, loading, error, onSchoolClick }) => {
  const rows = useMemo(() => {
    const bySchool = data?.by_school || []
    return bySchool.map((r) => ({ ...r, _score: healthScore(r) }))
  }, [data])

  return (
    <Card className="shadow-sm mb-4">
      <CardHeader className="bg-white border-bottom d-flex align-items-center gap-2">
        <div
          className="rounded-2 d-flex align-items-center justify-content-center text-white"
          style={{ width: 32, height: 32, backgroundColor: "#556ee6", flexShrink: 0 }}
        >
          <i className="mdi mdi-table-check fs-6" />
        </div>
        <h6 className="mb-0 fw-semibold">مقایسه کلی مجموعه‌ها</h6>
        <small className="text-muted me-auto">کلیک روی مجموعه برای فیلتر</small>
      </CardHeader>
      <CardBody className="p-0">
        {loading && (
          <div className="text-center py-5">
            <Spinner color="primary" />
          </div>
        )}
        {error && !loading && (
          <div className="text-center py-4 text-danger">
            <i className="mdi mdi-alert-circle-outline fs-3 d-block mb-2" />
            <small>{error}</small>
          </div>
        )}
        {!loading && !error && rows.length === 0 && (
          <div className="text-center py-5 text-muted">
            <i className="mdi mdi-table-off fs-1 d-block mb-2 opacity-25" />
            داده‌ای برای نمایش وجود ندارد
          </div>
        )}
        {!loading && !error && rows.length > 0 && (
          <div className="table-responsive">
            <table className="table table-hover table-bordered table-nowrap mb-0 align-middle">
              <thead className="table-light">
                <tr className="text-center">
                  <th className="text-end">مجموعه</th>
                  <th>تماس ANSWERED</th>
                  <th>اختلاف Duration</th>
                  <th>فایل ناموفق</th>
                  <th>بی‌تاریخچه</th>
                  <th>Null Group ID</th>
                  <th>امتیاز سلامت</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.school_id}>
                    <td>
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 text-primary text-decoration-none fw-medium"
                        onClick={() => onSchoolClick && onSchoolClick(row.school_id)}
                        title="فیلتر بر اساس این مجموعه"
                      >
                        {row.school_name || `مجموعه ${row.school_id}`}
                      </button>
                    </td>
                    <td className="text-center">{faNum(row.total_answered_calls)}</td>
                    <td className="text-center">{pctBadge(row.duration_mismatch_percent)}</td>
                    <td className="text-center">{pctBadge(row.failed_file_percent)}</td>
                    <td className="text-center">{pctBadge(row.orphaned_call_percent)}</td>
                    <td className="text-center">{pctBadge(row.null_call_group_percent)}</td>
                    <td className="text-center">{scoreBadge(row._score)}</td>
                  </tr>
                ))}
              </tbody>
              {data?.totals && (
                <tfoot className="table-secondary fw-bold">
                  <tr>
                    <td>مجموع</td>
                    <td className="text-center">{faNum(data.totals.total_answered_calls)}</td>
                    <td className="text-center">{pctBadge(data.totals.duration_mismatch_percent)}</td>
                    <td className="text-center">{pctBadge(data.totals.failed_file_percent)}</td>
                    <td className="text-center">{pctBadge(data.totals.orphaned_call_percent)}</td>
                    <td className="text-center">{pctBadge(data.totals.null_call_group_percent)}</td>
                    <td className="text-center">—</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default SummaryTable
