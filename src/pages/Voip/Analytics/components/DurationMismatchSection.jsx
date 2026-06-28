// src/pages/Voip/Analytics/components/DurationMismatchSection.jsx
import React, { useState } from "react"
import { Badge, Card, CardBody, CardHeader, Col, Row, Spinner } from "reactstrap"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import moment from "moment-jalaali"
import { API_ROUTES } from "../../../../helpers/apiRoutes.jsx"
import { downloadVoipAnalyticsCsv } from "../../../../services/voipAnalyticsService.jsx"

const faNum = (v) => (v == null ? "—" : Number(v).toLocaleString("fa-IR"))
const faPct = (v) => (v == null ? "—" : `${Number(v).toFixed(1)}٪`)
const faSec = (v) => (v == null ? "—" : `${Number(v).toFixed(1)} ثانیه`)

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

// color thresholds for net_avg_diff_seconds: ±5s green, ±15s orange, beyond red
function netBiasVariant(net) {
  if (net == null) return "secondary"
  const abs = Math.abs(Number(net))
  if (abs <= 5) return "success"
  if (abs <= 15) return "warning"
  return "danger"
}

function netBiasColor(net) {
  if (net == null) return "#6c757d"
  const abs = Math.abs(Number(net))
  if (abs <= 5) return "#34c38f"
  if (abs <= 15) return "#f1b44c"
  return "#f46a6a"
}

function netBiasLabel(net) {
  if (net == null) return "—"
  const v = Number(net)
  const sign = v >= 0 ? "+" : ""
  return `${sign}${v.toFixed(1)} ثانیه`
}

const DIST_SLICES = [
  { key: "range_0_10", label: "۰–۱۰ ثانیه (طبیعی)", color: "#34c38f" },
  { key: "range_11_30", label: "۱۱–۳۰ ثانیه", color: "#f1b44c" },
  { key: "range_31_60", label: "۳۱–۶۰ ثانیه", color: "#f46a6a" },
  { key: "range_over_60", label: "بیش از ۶۰ ثانیه", color: "#c0392b" },
]

const EmptyState = () => (
  <div className="text-center py-5 text-muted">
    <i className="mdi mdi-chart-donut fs-1 d-block mb-2 opacity-25" />
    داده‌ای برای نمایش وجود ندارد
  </div>
)

// Directional bias cards showing which direction the error goes
const DirectionalBiasCards = ({ totals }) => {
  const net = totals.net_avg_diff_seconds
  const biasColor = netBiasColor(net)

  return (
    <div className="mb-4">
      <p className="fw-medium mb-2" style={{ fontSize: "0.85rem" }}>جهت اختلاف (تأثیر بر حقوق مشاور)</p>
      <Row className="g-3 mb-3">
        {/* Card 1: Simotel over-reports */}
        <Col md="6">
          <div
            className="p-3 rounded-3 h-100"
            style={{ background: "#fff8f0", border: "1px solid #f1b44c" }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="mdi mdi-arrow-up-circle text-warning fs-4" />
              <span className="fw-semibold" style={{ fontSize: "0.9rem" }}>سیموتل بیشتر گزارش داده</span>
            </div>
            <p className="text-muted mb-2" style={{ fontSize: "0.78rem" }}>
              مشاور اضافه‌کردیت می‌گیرد
            </p>
            <div className="d-flex align-items-baseline gap-2">
              <span className="fw-bold fs-4 text-warning">
                {faNum(totals.simotel_over_count)}
              </span>
              <span className="text-muted" style={{ fontSize: "0.82rem" }}>تماس</span>
            </div>
            {totals.simotel_over_avg_seconds != null && (
              <small className="text-muted">
                میانگین اضافه: <strong>{faSec(totals.simotel_over_avg_seconds)}</strong>
              </small>
            )}
          </div>
        </Col>

        {/* Card 2: Playtime over-reports */}
        <Col md="6">
          <div
            className="p-3 rounded-3 h-100"
            style={{ background: "#f0f4ff", border: "1px solid #556ee6" }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="mdi mdi-arrow-down-circle text-primary fs-4" />
              <span className="fw-semibold" style={{ fontSize: "0.9rem" }}>فایل صوتی طولانی‌تر از سیموتل</span>
            </div>
            <p className="text-muted mb-2" style={{ fontSize: "0.78rem" }}>
              مشاور کم‌کردیت می‌گیرد
            </p>
            <div className="d-flex align-items-baseline gap-2">
              <span className="fw-bold fs-4 text-primary">
                {faNum(totals.playtime_over_count)}
              </span>
              <span className="text-muted" style={{ fontSize: "0.82rem" }}>تماس</span>
            </div>
            {totals.playtime_over_avg_seconds != null && (
              <small className="text-muted">
                میانگین کمبود: <strong>{faSec(totals.playtime_over_avg_seconds)}</strong>
              </small>
            )}
          </div>
        </Col>
      </Row>

      {/* Net bias banner */}
      <div
        className="p-3 rounded-3 d-flex align-items-center gap-3"
        style={{ background: "#f8f9fa", border: `1px solid ${biasColor}` }}
        title="اگر مثبت باشد، سیموتل زمان تماس را بیشتر از واقع گزارش می‌دهد. اگر منفی باشد، مشاور کمتر از زمان واقعی کردیت می‌گیرد."
      >
        <div
          className="rounded-circle d-flex align-items-center justify-content-center text-white"
          style={{ width: 36, height: 36, backgroundColor: biasColor, flexShrink: 0 }}
        >
          <i className="mdi mdi-sigma fs-6" />
        </div>
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="fw-semibold" style={{ fontSize: "0.88rem" }}>اریب سیستماتیک (net_avg_diff):</span>
            <span className="fw-bold" style={{ fontSize: "1rem", color: biasColor }}>
              {netBiasLabel(net)}
            </span>
          </div>
          <small className="text-muted" style={{ fontSize: "0.78rem" }}>
            {net == null
              ? "داده کافی موجود نیست"
              : Number(net) > 0
              ? "به‌طور میانگین سیموتل هر تماس را بیشتر از واقع گزارش می‌دهد ← مشاور اضافه‌کردیت می‌گیرد"
              : Number(net) < 0
              ? "به‌طور میانگین سیموتل هر تماس را کمتر از واقع گزارش می‌دهد ← مشاور کم‌کردیت می‌گیرد"
              : "اریب صفر — اشتباهات یکدیگر را خنثی کرده‌اند"}
          </small>
        </div>
      </div>
    </div>
  )
}

const DurationMismatchSection = ({ data, loading, error, exportParams, canExport }) => {
  const [downloadingId, setDownloadingId] = useState(null)

  const handleExport = async (schoolId) => {
    const key = schoolId ?? "all"
    if (downloadingId != null) return
    setDownloadingId(key)
    try {
      const params = schoolId
        ? { ...exportParams, school_id: String(schoolId) }
        : exportParams
      await downloadVoipAnalyticsCsv(
        API_ROUTES.voipAnalytics.exportDurationMismatch,
        params,
        `duration-mismatch${schoolId ? `-${schoolId}` : ""}.csv`
      )
    } catch {
      /* httpClient shows toast */
    } finally {
      setDownloadingId(null)
    }
  }

  const bySchool = data?.by_school || []
  const totals = data?.totals || {}
  const distribution = data?.distribution || {}
  const dailyTrend = data?.daily_trend || []

  const pieData = DIST_SLICES
    .map((s) => ({ name: s.label, value: distribution[s.key] ?? 0, color: s.color }))
    .filter((d) => d.value > 0)

  const hasDirectionalData = totals.simotel_over_count != null || totals.playtime_over_count != null

  return (
    <Card className="shadow-sm mb-4">
      <CardHeader className="bg-white border-bottom">
        <div className="d-flex align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-start gap-2 flex-grow-1">
            <div
              className="rounded-2 d-flex align-items-center justify-content-center text-white"
              style={{ width: 32, height: 32, backgroundColor: "#f46a6a", flexShrink: 0, marginTop: 2 }}
            >
              <i className="mdi mdi-timer-alert-outline fs-6" />
            </div>
            <div>
              <h6 className="mb-1 fw-semibold">اختلاف مدت تماس سیموتل در مقابل فایل صوتی</h6>
              <p className="mb-0 text-muted" style={{ fontSize: "0.8rem" }}>
                هنگامی که اختلاف مدت تماس ارسال‌شده از سیموتل با مدت محاسبه‌شده از فایل صوتی بیش از ۱۰ ثانیه باشد،
                احتمال خطا در گزارش‌دهی سیموتل وجود دارد.
              </p>
            </div>
          </div>
          {canExport && (
            <button
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 flex-shrink-0"
              style={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}
              onClick={() => handleExport(null)}
              disabled={downloadingId != null || !totals.mismatched}
            >
              {downloadingId === "all" ? <Spinner size="sm" /> : <i className="mdi mdi-download" />}
              دانلود CSV
              {totals.mismatched > 0 && (
                <span className="badge bg-secondary ms-1">{faNum(totals.mismatched)} ردیف</span>
              )}
            </button>
          )}
        </div>
      </CardHeader>
      <CardBody>
        {loading && (
          <div className="text-center py-5">
            <Spinner color="danger" />
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
            {/* Row 1: Doughnut + Line */}
            <Row className="g-4 mb-4">
              <Col lg="5">
                <p className="fw-medium mb-2" style={{ fontSize: "0.85rem" }}>توزیع بازه‌های اختلاف</p>
                {pieData.length === 0 ? <EmptyState /> : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => faNum(v)} />
                      <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: "0.78rem" }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Col>
              <Col lg="7">
                <p className="fw-medium mb-2" style={{ fontSize: "0.85rem" }}>روند روزانه اختلاف</p>
                {dailyTrend.length === 0 ? <EmptyState /> : (
                  <ResponsiveContainer width="100%" height={260}>
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
                        name="تعداد تماس مشکل‌دار"
                        stroke="#f46a6a"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Col>
            </Row>

            {/* Row 2: Directional Bias Cards */}
            {hasDirectionalData && <DirectionalBiasCards totals={totals} />}

            {/* Row 3: Table */}
            <p className="fw-medium mb-2" style={{ fontSize: "0.85rem" }}>تفکیک به تفکیک مجموعه</p>
            {bySchool.length === 0 ? <EmptyState /> : (
              <div className="table-responsive">
                <table className="table table-bordered table-hover table-nowrap align-middle mb-0">
                  <thead className="table-light">
                    <tr className="text-center">
                      <th className="text-end">مجموعه</th>
                      <th>کل تماس</th>
                      <th>تطابق</th>
                      <th>اختلاف</th>
                      <th>درصد</th>
                      <th>میانگین |diff|</th>
                      <th>سیموتل بیشتر</th>
                      <th>فایل بیشتر</th>
                      <th>اریب net</th>
                      {canExport && <th></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {bySchool.map((row) => (
                      <tr key={row.school_id}>
                        <td>{row.school_name || `مجموعه ${row.school_id}`}</td>
                        <td className="text-center">{faNum(row.total_answered)}</td>
                        <td className="text-center">{faNum(row.matched)}</td>
                        <td className="text-center">{faNum(row.mismatched)}</td>
                        <td className="text-center">
                          <Badge color={pctBadgeVariant(row.mismatch_percent)} pill>
                            {faPct(row.mismatch_percent)}
                          </Badge>
                        </td>
                        <td className="text-center">{faSec(row.avg_diff_seconds)}</td>
                        <td className="text-center">
                          {row.simotel_over_count != null ? (
                            <span>
                              {faNum(row.simotel_over_count)}
                              {row.simotel_over_avg_seconds != null && (
                                <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                                  avg +{Number(row.simotel_over_avg_seconds).toFixed(1)}s
                                </small>
                              )}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="text-center">
                          {row.playtime_over_count != null ? (
                            <span>
                              {faNum(row.playtime_over_count)}
                              {row.playtime_over_avg_seconds != null && (
                                <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                                  avg +{Number(row.playtime_over_avg_seconds).toFixed(1)}s
                                </small>
                              )}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="text-center">
                          {row.net_avg_diff_seconds != null ? (
                            <Badge color={netBiasVariant(row.net_avg_diff_seconds)} pill>
                              {netBiasLabel(row.net_avg_diff_seconds)}
                            </Badge>
                          ) : "—"}
                        </td>
                        {canExport && (
                          <td className="text-center">
                            <button
                              className="btn btn-outline-secondary btn-sm px-2 py-0"
                              title="دانلود CSV این مجموعه"
                              onClick={() => handleExport(row.school_id)}
                              disabled={downloadingId != null}
                            >
                              {downloadingId === row.school_id ? (
                                <Spinner size="sm" />
                              ) : (
                                <i className="mdi mdi-download-outline" />
                              )}
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  {totals.total_answered != null && (
                    <tfoot className="table-secondary fw-bold">
                      <tr>
                        <td>مجموع</td>
                        <td className="text-center">{faNum(totals.total_answered)}</td>
                        <td className="text-center">{faNum(totals.matched)}</td>
                        <td className="text-center">{faNum(totals.mismatched)}</td>
                        <td className="text-center">
                          <Badge color={pctBadgeVariant(totals.mismatch_percent)} pill>
                            {faPct(totals.mismatch_percent)}
                          </Badge>
                        </td>
                        <td className="text-center">{faSec(totals.avg_diff_seconds)}</td>
                        <td className="text-center">
                          {totals.simotel_over_count != null ? (
                            <span>
                              {faNum(totals.simotel_over_count)}
                              {totals.simotel_over_avg_seconds != null && (
                                <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                                  avg +{Number(totals.simotel_over_avg_seconds).toFixed(1)}s
                                </small>
                              )}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="text-center">
                          {totals.playtime_over_count != null ? (
                            <span>
                              {faNum(totals.playtime_over_count)}
                              {totals.playtime_over_avg_seconds != null && (
                                <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                                  avg +{Number(totals.playtime_over_avg_seconds).toFixed(1)}s
                                </small>
                              )}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="text-center">
                          {totals.net_avg_diff_seconds != null ? (
                            <Badge color={netBiasVariant(totals.net_avg_diff_seconds)} pill>
                              {netBiasLabel(totals.net_avg_diff_seconds)}
                            </Badge>
                          ) : "—"}
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

export default DurationMismatchSection
