// src/pages/Voip/Analytics/components/AnalyticsKpiCards.jsx
import React, { useState } from "react"
import { Card, CardBody, Col, Row, Spinner } from "reactstrap"
import { API_ROUTES } from "../../../../helpers/apiRoutes.jsx"
import { downloadVoipAnalyticsCsv } from "../../../../services/voipAnalyticsService.jsx"

const faNum = (v) => (v == null ? "—" : Number(v).toLocaleString("fa-IR"))
const faPct = (v) => (v == null ? "—" : `${Number(v).toFixed(1)}٪`)

function pctColor(pct) {
  if (pct == null) return "#6c757d"
  if (pct <= 2) return "#34c38f"
  if (pct <= 5) return "#f1b44c"
  return "#f46a6a"
}

function pctBadgeClass(pct) {
  if (pct == null) return "secondary"
  if (pct <= 2) return "success"
  if (pct <= 5) return "warning"
  return "danger"
}

const KPI_DEFS = [
  {
    key: "durationMismatch",
    label: "اختلاف Duration",
    countField: "duration_mismatch_count",
    pctField: "duration_mismatch_percent",
    icon: "mdi-timer-alert-outline",
    color: "#f46a6a",
    exportPath: "exportDurationMismatch",
    exportFile: "duration-mismatch.csv",
  },
  {
    key: "failedFiles",
    label: "فایل‌های ناموفق",
    countField: "failed_file_count",
    pctField: "failed_file_percent",
    icon: "mdi-file-remove-outline",
    color: "#f1b44c",
    exportPath: "exportFailedFiles",
    exportFile: "failed-files.csv",
  },
  {
    key: "orphanedCalls",
    label: "تماس بی‌تاریخچه",
    countField: "orphaned_call_count",
    pctField: "orphaned_call_percent",
    icon: "mdi-phone-missed",
    color: "#e8a325",
    exportPath: "exportOrphanedCalls",
    exportFile: "orphaned-calls.csv",
  },
  {
    key: "nullCallGroup",
    label: "Call Group Null",
    countField: "null_call_group_count",
    pctField: "null_call_group_percent",
    icon: "mdi-link-variant-off",
    color: "#556ee6",
    exportPath: "exportNullCallGroup",
    exportFile: "null-call-group.csv",
  },
]

const SkeletonCard = () => (
  <Card className="shadow-sm h-100">
    <CardBody>
      <div className="placeholder-glow">
        <span className="placeholder col-7 mb-2" />
        <span className="placeholder col-10 mb-2" style={{ height: 28 }} />
        <span className="placeholder col-5 mb-1" style={{ height: 18 }} />
        <span className="placeholder col-8" style={{ height: 14 }} />
      </div>
    </CardBody>
  </Card>
)

const AnalyticsKpiCards = ({
  data,
  loading,
  error,
  unansweredData,
  unansweredLoading,
  exportParams,
  canExport,
}) => {
  const [downloadingKey, setDownloadingKey] = useState(null)

  const handleDownload = async (key, exportPath, exportFile) => {
    if (downloadingKey) return
    setDownloadingKey(key)
    try {
      await downloadVoipAnalyticsCsv(API_ROUTES.voipAnalytics[exportPath], exportParams, exportFile)
    } catch {
      /* httpClient shows toast on error */
    } finally {
      setDownloadingKey(null)
    }
  }

  if (loading) {
    return (
      <Row className="g-3 mb-4">
        {[...KPI_DEFS, { key: "answeredCalls" }, { key: "unanswered" }].map((d) => (
          <Col key={d.key} xs="12" sm="6" xl="auto" style={{ flex: "1 1 0" }}>
            <SkeletonCard />
          </Col>
        ))}
      </Row>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger mb-4" role="alert">
        <i className="mdi mdi-alert-circle-outline me-2" />
        خطا در بارگذاری شاخص‌ها: {error}
      </div>
    )
  }

  const totals = data?.totals || {}
  const totalCalls = totals.total_answered_calls
  const unansweredTotals = unansweredData?.totals || {}

  return (
    <Row className="g-3 mb-4">
      {KPI_DEFS.map((def) => {
        const count = totals[def.countField]
        const pct = totals[def.pctField]
        const badgeClass = pctBadgeClass(pct)
        const color = pctColor(pct)
        const isDownloading = downloadingKey === def.key

        return (
          <Col key={def.key} xs="12" sm="6" xl="auto" style={{ flex: "1 1 0" }}>
            <Card className="shadow-sm h-100">
              <CardBody>
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <div>
                    <p className="text-muted mb-1" style={{ fontSize: "0.82rem" }}>
                      {def.label}
                    </p>
                    <h3 className="mb-0 fw-bold" style={{ color }}>
                      {faNum(count)}
                      <small className="text-muted fw-normal" style={{ fontSize: "0.85rem" }}>
                        {" "}مورد
                      </small>
                    </h3>
                  </div>
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white"
                    style={{ width: 42, height: 42, backgroundColor: def.color, flexShrink: 0 }}
                  >
                    <i className={`mdi ${def.icon} fs-5`} />
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className={`badge bg-${badgeClass} bg-opacity-10 text-${badgeClass} fw-semibold`}>
                    {faPct(pct)} از کل
                  </span>
                  {totalCalls != null && (
                    <small className="text-muted" style={{ fontSize: "0.78rem" }}>
                      از {faNum(totalCalls)} تماس
                    </small>
                  )}
                </div>

                {canExport && (
                  <button
                    className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                    style={{ fontSize: "0.75rem" }}
                    onClick={() => handleDownload(def.key, def.exportPath, def.exportFile)}
                    disabled={!!downloadingKey}
                  >
                    {isDownloading ? (
                      <Spinner size="sm" />
                    ) : (
                      <i className="mdi mdi-download" />
                    )}
                    دانلود CSV
                  </button>
                )}
              </CardBody>
            </Card>
          </Col>
        )
      })}

      {/* Card 5: Answered Calls */}
      <Col xs="12" sm="6" xl="auto" style={{ flex: "1 1 0" }}>
        <Card className="shadow-sm h-100">
          <CardBody>
            <div className="d-flex align-items-start justify-content-between mb-2">
              <div>
                <p className="text-muted mb-1" style={{ fontSize: "0.82rem" }}>
                  تماس‌های پاسخ‌داده‌شده
                </p>
                <h3 className="mb-0 fw-bold" style={{ color: "#34c38f" }}>
                  {faNum(totalCalls)}
                  <small className="text-muted fw-normal" style={{ fontSize: "0.85rem" }}>
                    {" "}تماس
                  </small>
                </h3>
              </div>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white"
                style={{ width: 42, height: 42, backgroundColor: "#34c38f", flexShrink: 0 }}
              >
                <i className="mdi mdi-phone-check-outline fs-5" />
              </div>
            </div>

            <div className="mb-2" style={{ fontSize: "0.78rem", minHeight: 22 }} />

            {canExport && (
              <button
                className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                style={{ fontSize: "0.75rem" }}
                onClick={() =>
                  handleDownload("answeredCalls", "exportAnsweredCalls", "answered-calls.csv")
                }
                disabled={!!downloadingKey || !totalCalls}
              >
                {downloadingKey === "answeredCalls" ? (
                  <Spinner size="sm" />
                ) : (
                  <i className="mdi mdi-download" />
                )}
                دانلود CSV
              </button>
            )}
          </CardBody>
        </Card>
      </Col>

      {/* Card 6: Unanswered Answers */}
      <Col xs="12" sm="6" xl="auto" style={{ flex: "1 1 0" }}>
        <Card className="shadow-sm h-100">
          <CardBody>
            {unansweredLoading ? (
              <div className="placeholder-glow">
                <span className="placeholder col-7 mb-2" />
                <span className="placeholder col-10 mb-2" style={{ height: 28 }} />
                <span className="placeholder col-8" style={{ height: 14 }} />
              </div>
            ) : (
              <>
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <div>
                    <p className="text-muted mb-1" style={{ fontSize: "0.82rem" }}>
                      پاسخنامه بدون تماس
                    </p>
                    <h3 className="mb-0 fw-bold" style={{ color: "#7b5ea7" }}>
                      {faNum(unansweredTotals.total_answer_sheets)}
                      <small className="text-muted fw-normal" style={{ fontSize: "0.85rem" }}>
                        {" "}مورد
                      </small>
                    </h3>
                  </div>
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white"
                    style={{ width: 42, height: 42, backgroundColor: "#7b5ea7", flexShrink: 0 }}
                  >
                    <i className="mdi mdi-file-question-outline fs-5" />
                  </div>
                </div>

                <div className="mb-2" style={{ fontSize: "0.78rem" }}>
                  <span className="text-muted me-2">
                    بدون voip_call: <strong>{faNum(unansweredTotals.missing_voip_call)}</strong>
                  </span>
                  <span className="text-muted">
                    بدون تاریخچه: <strong>{faNum(unansweredTotals.missing_call_history)}</strong>
                  </span>
                </div>

                {canExport && (
                  <button
                    className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                    style={{ fontSize: "0.75rem" }}
                    onClick={() =>
                      handleDownload(
                        "unansweredAnswers",
                        "exportUnansweredAnswers",
                        "unanswered-answers.csv"
                      )
                    }
                    disabled={!!downloadingKey}
                  >
                    {downloadingKey === "unansweredAnswers" ? (
                      <Spinner size="sm" />
                    ) : (
                      <i className="mdi mdi-download" />
                    )}
                    دانلود CSV
                  </button>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default AnalyticsKpiCards
