// src/pages/Voip/Analytics/components/UnansweredAnswersSection.jsx
import React, { useState } from "react"
import { Badge, Card, CardBody, CardHeader, Col, Row, Spinner } from "reactstrap"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import moment from "moment-jalaali"
import { API_ROUTES } from "../../../../helpers/apiRoutes.jsx"
import { downloadVoipAnalyticsCsv } from "../../../../services/voipAnalyticsService.jsx"

const faNum = (v) => (v == null ? "—" : Number(v).toLocaleString("fa-IR"))

const toJalali = (d) => {
  try { return moment(d).format("jMM/jDD") } catch { return d }
}

const EmptyState = () => (
  <div className="text-center py-4 text-muted">
    <i className="mdi mdi-file-question-outline fs-1 d-block mb-2 opacity-25" />
    داده‌ای برای نمایش وجود ندارد
  </div>
)

const UnansweredAnswersSection = ({ data, loading, error, exportParams, canExport }) => {
  const [downloading, setDownloading] = useState(false)
  const [downloadingId, setDownloadingId] = useState(null)

  const handleExportAll = async () => {
    if (downloading) return
    setDownloading(true)
    try {
      await downloadVoipAnalyticsCsv(
        API_ROUTES.voipAnalytics.exportUnansweredAnswers,
        exportParams,
        "unanswered-answers.csv"
      )
    } catch {
      /* httpClient shows toast */
    } finally {
      setDownloading(false)
    }
  }

  const handleExportRow = async (schoolId) => {
    if (downloadingId != null) return
    setDownloadingId(schoolId)
    try {
      const params = { ...exportParams, school_id: String(schoolId) }
      await downloadVoipAnalyticsCsv(
        API_ROUTES.voipAnalytics.exportUnansweredAnswers,
        params,
        `unanswered-answers-${schoolId}.csv`
      )
    } catch {
      /* httpClient shows toast */
    } finally {
      setDownloadingId(null)
    }
  }

  const byForm = data?.by_form || []
  const totals = data?.totals || {}
  const dailyTrend = data?.daily_trend || []

  return (
    <Card className="shadow-sm mb-4">
      <CardHeader className="bg-white border-bottom">
        <div className="d-flex align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-start gap-2 flex-grow-1">
            <div
              className="rounded-2 d-flex align-items-center justify-content-center text-white"
              style={{ width: 32, height: 32, backgroundColor: "#7b5ea7", flexShrink: 0, marginTop: 2 }}
            >
              <i className="mdi mdi-file-question-outline fs-6" />
            </div>
            <div>
              <h6 className="mb-1 fw-semibold">پاسخنامه‌های بدون تماس ثبت‌شده</h6>
              <p className="mb-0 text-muted" style={{ fontSize: "0.8rem" }}>
                هنگامی که مشاور یک پاسخنامه پر می‌کند باید یک تماس در سیستم VoIP ثبت شده باشد.
                اگر لاگ تماسی وجود نداشته باشد، داده‌های کیفی آن تماس قابل اعتماد نیستند.
              </p>
            </div>
          </div>
          {canExport && (
            <button
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 flex-shrink-0"
              style={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}
              onClick={handleExportAll}
              disabled={downloading || !totals.total_answer_sheets}
            >
              {downloading ? <Spinner size="sm" /> : <i className="mdi mdi-download" />}
              دانلود CSV
              {totals.total_answer_sheets > 0 && (
                <span className="badge bg-secondary ms-1">{faNum(totals.total_answer_sheets)} ردیف</span>
              )}
            </button>
          )}
        </div>
      </CardHeader>
      <CardBody>
        {loading && (
          <div className="text-center py-5">
            <Spinner style={{ color: "#7b5ea7" }} />
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
            {/* Line chart: daily trend */}
            {dailyTrend.length > 0 && (
              <Row className="g-4 mb-4">
                <Col lg="12">
                  <p className="fw-medium mb-2" style={{ fontSize: "0.85rem" }}>روند روزانه</p>
                  <ResponsiveContainer width="100%" height={200}>
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
                        stroke="#7b5ea7"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Col>
              </Row>
            )}

            {/* Table: by form */}
            <p className="fw-medium mb-2" style={{ fontSize: "0.85rem" }}>تفکیک به تفکیک فرم پشتیبانی</p>

            {byForm.length === 0 ? <EmptyState /> : (
              <div className="table-responsive">
                <table className="table table-bordered table-hover table-nowrap align-middle mb-0">
                  <thead className="table-light">
                    <tr className="text-center">
                      <th className="text-end">فرم پشتیبانی</th>
                      <th>مجموعه</th>
                      <th>کل پاسخنامه‌های مشکل‌دار</th>
                      <th>بدون voip_call</th>
                      <th>بدون تاریخچه</th>
                      {canExport && <th></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {byForm.map((row) => (
                      <tr key={`${row.support_form_id}-${row.school_id}`}>
                        <td>{row.support_form_title || `فرم ${row.support_form_id}`}</td>
                        <td>{row.school_name || `مجموعه ${row.school_id}`}</td>
                        <td className="text-center fw-semibold">{faNum(row.total_answer_sheets)}</td>
                        <td className="text-center">
                          {row.missing_voip_call > 0 ? (
                            <Badge color="danger" pill>{faNum(row.missing_voip_call)}</Badge>
                          ) : (
                            <Badge color="success" pill>۰</Badge>
                          )}
                        </td>
                        <td className="text-center">
                          {row.missing_call_history > 0 ? (
                            <Badge color="warning" pill>{faNum(row.missing_call_history)}</Badge>
                          ) : (
                            <Badge color="success" pill>۰</Badge>
                          )}
                        </td>
                        {canExport && (
                          <td className="text-center">
                            <button
                              className="btn btn-outline-secondary btn-sm px-2 py-0"
                              title="دانلود CSV این مجموعه"
                              onClick={() => handleExportRow(row.school_id)}
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
                  {totals.total_answer_sheets != null && (
                    <tfoot className="table-secondary fw-bold">
                      <tr>
                        <td>مجموع</td>
                        <td></td>
                        <td className="text-center">{faNum(totals.total_answer_sheets)}</td>
                        <td className="text-center">{faNum(totals.missing_voip_call)}</td>
                        <td className="text-center">{faNum(totals.missing_call_history)}</td>
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

export default UnansweredAnswersSection
