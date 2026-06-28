// src/pages/Voip/Analytics/components/OrphanedCallsSection.jsx
import React, { useState } from "react"
import { Badge, Card, CardBody, CardHeader, Col, Row, Spinner } from "reactstrap"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts"
import moment from "moment-jalaali"
import { API_ROUTES } from "../../../../helpers/apiRoutes.jsx"
import { downloadVoipAnalyticsCsv } from "../../../../services/voipAnalyticsService.jsx"

const faNum = (v) => (v == null ? "—" : Number(v).toLocaleString("fa-IR"))
const faPct = (v) => (v == null ? "—" : `${Number(v).toFixed(1)}٪`)

const toJalali = (d) => {
  try { return moment(d).format("jMM/jDD") } catch { return d }
}

function pctBadgeVariant(pct) {
  if (pct == null) return "secondary"
  const v = Number(pct)
  if (v <= 2) return "success"
  if (v <= 5) return "warning"
  return "danger"
}

const EmptyState = () => (
  <div className="text-center py-4 text-muted">
    <i className="mdi mdi-chart-bar fs-1 d-block mb-2 opacity-25" />
    داده‌ای برای نمایش وجود ندارد
  </div>
)

const OrphanedCallsSection = ({ data, loading, error, exportParams, canExport }) => {
  const [downloadingId, setDownloadingId] = useState(null)

  const handleExport = async (schoolId) => {
    const key = schoolId ?? "all"
    if (downloadingId != null) return
    setDownloadingId(key)
    try {
      const params = schoolId ? { ...exportParams, school_id: String(schoolId) } : exportParams
      await downloadVoipAnalyticsCsv(
        API_ROUTES.voipAnalytics.exportOrphanedCalls,
        params,
        `orphaned-calls${schoolId ? `-${schoolId}` : ""}.csv`
      )
    } catch {
      /* httpClient shows toast */
    } finally {
      setDownloadingId(null)
    }
  }

  const bySchool = data?.by_school || []
  const totals = data?.totals || {}
  const dailyTrend = data?.daily_trend || []

  const countField = "orphaned_call_count"
  const pctField = "orphaned_call_percent"
  const totalField = "total_calls"

  const barData = bySchool.map((r) => ({
    name: r.school_name || `مجموعه ${r.school_id}`,
    count: r[countField] ?? 0,
    pct: r[pctField] ?? 0,
  }))

  return (
    <Card className="shadow-sm mb-4">
      <CardHeader className="bg-white border-bottom">
        <div className="d-flex align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-start gap-2 flex-grow-1">
            <div
              className="rounded-2 d-flex align-items-center justify-content-center text-white"
              style={{ width: 32, height: 32, backgroundColor: "#e8a325", flexShrink: 0, marginTop: 2 }}
            >
              <i className="mdi mdi-phone-missed fs-6" />
            </div>
            <div>
              <h6 className="mb-1 fw-semibold">تماس‌های شروع‌شده بدون اطلاعات تکمیلی</h6>
              <p className="mb-0 text-muted" style={{ fontSize: "0.8rem" }}>
                زمانی که کاربر روی دکمه تماس کلیک می‌کند یک ردیف ایجاد می‌شود. اگر پس از پایان تماس
                اطلاعات از سیموتل دریافت نشود، این تماس «بی‌تاریخچه» باقی می‌ماند.
                این معمولاً نشان‌دهنده قطع ارتباط با سیموتل است.
              </p>
            </div>
          </div>
          {canExport && (
            <button
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 flex-shrink-0"
              style={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}
              onClick={() => handleExport(null)}
              disabled={downloadingId != null || !totals[countField]}
            >
              {downloadingId === "all" ? <Spinner size="sm" /> : <i className="mdi mdi-download" />}
              دانلود CSV
              {totals[countField] > 0 && (
                <span className="badge bg-secondary ms-1">{faNum(totals[countField])} ردیف</span>
              )}
            </button>
          )}
        </div>
      </CardHeader>
      <CardBody>
        {loading && (
          <div className="text-center py-5">
            <Spinner style={{ color: "#e8a325" }} />
          </div>
        )}
        {error && !loading && (
          <div className="text-center py-4 text-danger">
            <i className="mdi mdi-alert-circle-outline fs-3 d-block mb-2" />
            <small>{error}</small>
          </div>
        )}

        {!loading && !error && (
          <>
            <Row className="g-4 mb-4">
              <Col lg="7">
                <p className="fw-medium mb-2" style={{ fontSize: "0.85rem" }}>مقایسه مجموعه‌ها</p>
                {barData.length === 0 ? <EmptyState /> : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        angle={-30}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis
                        tickFormatter={faNum}
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        orientation="right"
                      />
                      <Tooltip
                        formatter={(v, _n, props) => [
                          `${faNum(v)} (${faPct(props.payload?.pct)})`,
                          "تماس بی‌تاریخچه",
                        ]}
                      />
                      <Bar dataKey="count" name="تماس بی‌تاریخچه" fill="#e8a325" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Col>
              <Col lg="5">
                <p className="fw-medium mb-2" style={{ fontSize: "0.85rem" }}>روند روزانه</p>
                {dailyTrend.length === 0 ? <EmptyState /> : (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={dailyTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={toJalali}
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={faNum}
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        orientation="right"
                      />
                      <Tooltip formatter={(v) => [faNum(v), "تعداد"]} labelFormatter={toJalali} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#e8a325"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Col>
            </Row>

            <p className="fw-medium mb-2" style={{ fontSize: "0.85rem" }}>تفکیک به تفکیک مجموعه</p>
            {bySchool.length === 0 ? <EmptyState /> : (
              <div className="table-responsive">
                <table className="table table-bordered table-hover table-nowrap align-middle mb-0">
                  <thead className="table-light">
                    <tr className="text-center">
                      <th className="text-end">مجموعه</th>
                      <th>کل تماس</th>
                      <th>بدون تاریخچه</th>
                      <th>درصد</th>
                      {canExport && <th></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {bySchool.map((row) => (
                      <tr key={row.school_id}>
                        <td>{row.school_name || `مجموعه ${row.school_id}`}</td>
                        <td className="text-center">{faNum(row[totalField] ?? row.total_answered)}</td>
                        <td className="text-center">{faNum(row[countField])}</td>
                        <td className="text-center">
                          <Badge color={pctBadgeVariant(row[pctField])} pill>
                            {faPct(row[pctField])}
                          </Badge>
                        </td>
                        {canExport && (
                          <td className="text-center">
                            <button
                              className="btn btn-outline-secondary btn-sm px-2 py-0"
                              title="دانلود CSV این مجموعه"
                              onClick={() => handleExport(row.school_id)}
                              disabled={downloadingId != null}
                            >
                              {downloadingId === row.school_id ? <Spinner size="sm" /> : <i className="mdi mdi-download-outline" />}
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  {(totals[totalField] != null || totals.total_answered != null) && (
                    <tfoot className="table-secondary fw-bold">
                      <tr>
                        <td>مجموع</td>
                        <td className="text-center">{faNum(totals[totalField] ?? totals.total_answered)}</td>
                        <td className="text-center">{faNum(totals[countField])}</td>
                        <td className="text-center">
                          <Badge color={pctBadgeVariant(totals[pctField])} pill>
                            {faPct(totals[pctField])}
                          </Badge>
                        </td>
                        {canExport && <td />}
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
  )
}

export default OrphanedCallsSection
