import React, { useEffect, useState } from "react"
import { Alert, Badge, Button, Card, CardBody, CardHeader, Col, Form, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Progress, Row, Spinner, Table } from "reactstrap"
import { toast } from "react-toastify"
import Breadcrumbs from "../../../components/Common/Breadcrumb"
import Paginations from "../../../components/Common/Paginations"
import { useAuth } from "../../../context/AuthContext"
import { executeDurationProcessing, updateDurationProcessingSettings } from "../../../services/voipDurationProcessingService"
import { errorText, faNumber, formatDate, formatEta, validateSettings } from "./durationProcessingUtils"
import { useDurationProcessingLogs, useDurationProcessingStatus } from "./useDurationProcessingQueries"

const statusAppearance = (status) => ({ completed: ["success", "موفق"], success: ["success", "موفق"], running: ["info", "در حال اجرا"], failed: ["danger", "ناموفق"], error: ["danger", "خطا"], partial: ["warning", "ناقص"] }[String(status).toLowerCase()] || ["secondary", status || "نامشخص"])

const LoadingSkeleton = () => <div className="placeholder-glow" aria-label="در حال بارگذاری"><Row className="g-3 mb-4">{[1, 2, 3, 4].map((item) => <Col md="6" xl="3" key={item}><span className="placeholder col-12 rounded" style={{ height: 105 }} /></Col>)}</Row><span className="placeholder col-12 rounded d-block" style={{ height: 220 }} /></div>

const StatCard = ({ label, value, color = "primary", help }) => <Col md="6" xl="3"><Card className={`h-100 border-${color}`}><CardBody><div className="text-muted mb-2">{label}</div><div className={`fs-3 fw-bold text-${color}`}>{value}</div>{help && <small className="text-muted">{help}</small>}</CardBody></Card></Col>

const LogsTable = ({ items, loading, error, onRetry, onSelect }) => {
  if (loading) return <div className="placeholder-glow" aria-label="در حال بارگذاری لاگ‌ها">{Array.from({ length: 6 }).map((_, index) => <span key={index} className="placeholder col-12 d-block mb-3" style={{ height: 32 }} />)}</div>
  if (error) return <Alert color="danger">{error} <Button size="sm" color="danger" outline className="me-2" onClick={onRetry}>تلاش مجدد</Button></Alert>
  if (!items.length) return <div className="text-center text-muted py-5"><i className="bx bx-history fs-1 d-block mb-2" />هنوز لاگی ثبت نشده است.</div>
  return <div className="table-responsive"><Table bordered hover className="align-middle mb-0"><thead><tr><th>Worker</th><th>وضعیت</th><th>بررسی‌شده</th><th>محاسبه‌شده</th><th>نامعتبر</th><th>بازه شناسه</th><th>مدت</th><th>شروع</th><th><span className="visually-hidden">جزئیات</span></th></tr></thead><tbody>{items.map((item, index) => { const appearance = statusAppearance(item.status); return <tr key={item.id ?? `${item.worker_id}-${item.started_at}-${index}`}><td>{item.worker_id ?? "—"}</td><td><Badge color={appearance[0]}>{appearance[1]}</Badge></td><td>{faNumber(item.scanned_count)}</td><td>{faNumber(item.calculated_count)}</td><td className={Number(item.invalid_count) ? "text-warning fw-semibold" : ""}>{faNumber(item.invalid_count)}</td><td dir="ltr" className="text-nowrap">{item.lowest_history_id ?? "—"} – {item.highest_history_id ?? "—"}</td><td>{item.duration_ms == null ? "—" : `${faNumber(item.duration_ms)} ms`}</td><td className="text-nowrap">{formatDate(item.started_at)}</td><td><Button size="sm" color="link" onClick={() => onSelect(item)} aria-label={`مشاهده جزئیات worker ${item.worker_id ?? ""}`}>جزئیات</Button></td></tr> })}</tbody></Table></div>
}

const DurationProcessing = () => {
  document.title = "محاسبه مدت تماس‌های VoIP | داشبورد آیسوق"
  const { hasPermission } = useAuth()
  const canUpdate = hasPermission("voip.duration-processing.update")
  const canExecute = hasPermission("voip.duration-processing.execute")
  const statusQuery = useDurationProcessingStatus()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const logsQuery = useDurationProcessingLogs(page, limit)
  const [form, setForm] = useState({ enabled: false, workerCount: 1, concurrency: 1 })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [confirmEnabled, setConfirmEnabled] = useState(null)
  const [selectedLog, setSelectedLog] = useState(null)
  const [actionError, setActionError] = useState("")

  useEffect(() => { if (statusQuery.data?.settings) setForm({ enabled: Boolean(statusQuery.data.settings.enabled), workerCount: statusQuery.data.settings.workerCount, concurrency: statusQuery.data.settings.concurrency }) }, [statusQuery.data?.settings])

  const status = statusQuery.data
  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = validateSettings(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSaving(true); setActionError("")
    try {
      await updateDurationProcessingSettings({ enabled: Boolean(form.enabled), workerCount: Number(form.workerCount), concurrency: Number(form.concurrency) })
      toast.success("تنظیمات پردازش ذخیره شد.")
      await statusQuery.refetch({ background: true })
    } catch (caught) { setActionError(errorText(caught, "ذخیره تنظیمات ناموفق بود.")) } finally { setSaving(false) }
  }
  const runNow = async () => {
    setExecuting(true); setActionError("")
    try {
      const result = await executeDurationProcessing()
      if (result?.accepted) toast.success(`دور فوری پذیرفته شد؛ ${faNumber(result.processed ?? 0)} رکورد پردازش شد.`)
      else toast.info(result?.reason === "busy" ? "پردازش دیگری در حال اجرا است." : "پردازش در حال حاضر غیرفعال است.")
      await Promise.all([statusQuery.refetch({ background: true }).catch(() => {}), logsQuery.refetch()])
    } catch (caught) { setActionError(errorText(caught, "اجرای فوری ناموفق بود.")) } finally { setExecuting(false) }
  }
  const changeEnabled = (value) => setConfirmEnabled(value)
  const confirmEnabledChange = () => { setForm((old) => ({ ...old, enabled: confirmEnabled })); setConfirmEnabled(null) }
  const progress = Math.min(100, Math.max(0, Number(status?.progressPercent || 0)))

  return <div className="page-content" dir="rtl"><div className="container-fluid"><Breadcrumbs title="سرویس وویپ" breadcrumbItem="محاسبه مدت تماس‌ها" />
    <Card className="mb-4"><CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-3"><div><h4 className="mb-1">محاسبه مدت تماس‌های VoIP</h4><div className="d-flex flex-wrap align-items-center gap-2"><Badge color={status?.effectiveEnabled ? "success" : "secondary"}>{status?.effectiveEnabled ? "فعال" : "متوقف"}</Badge><span className="text-muted">آخرین اجرا: {formatDate(status?.lastRunAt)}</span></div></div><div className="d-flex gap-2"><Button color="secondary" outline onClick={() => { statusQuery.refetch({ background: true }).catch(() => {}); logsQuery.refetch() }} disabled={statusQuery.refreshing} aria-label="به‌روزرسانی وضعیت و لاگ‌ها">{statusQuery.refreshing ? <Spinner size="sm" /> : <i className="bx bx-refresh" />} <span className="d-none d-sm-inline">به‌روزرسانی</span></Button>{canExecute && <Button color="primary" onClick={runNow} disabled={executing || !status?.environmentEnabled || !status?.settings?.enabled}>{executing ? <Spinner size="sm" /> : <i className="bx bx-play" />} اجرای فوری</Button>}</div></CardHeader></Card>
    {actionError && <Alert color="danger">{actionError}</Alert>}
    {status && !status.environmentEnabled && <Alert color="warning"><i className="bx bx-server ms-1" />قابلیت توسط تنظیمات سرور غیرفعال است</Alert>}
    {statusQuery.loading ? <LoadingSkeleton /> : statusQuery.error && !status ? <Alert color="danger">{statusQuery.error} <Button size="sm" color="danger" outline className="me-2" onClick={() => statusQuery.refetch().catch(() => {})}>تلاش مجدد</Button></Alert> : status && <>
      {statusQuery.error && <Alert color="warning">آخرین به‌روزرسانی وضعیت ناموفق بود؛ داده قبلی نمایش داده می‌شود.</Alert>}
      <Card className="mb-4"><CardBody><div className="d-flex justify-content-between mb-2"><strong>پیشرفت پردازش</strong><span>{faNumber(status.progressPercent, { maximumFractionDigits: 2 })}٪</span></div><Progress value={progress} color={status.effectiveEnabled ? "success" : "secondary"} aria-label={`پیشرفت ${status.progressPercent} درصد`} /><small className="text-muted d-block mt-2">با ورود تماس‌های جدید، تعداد کل و در انتظار ممکن است افزایش یابد و درصد پیشرفت کمی کاهش پیدا کند.</small></CardBody></Card>
      <Row className="g-3 mb-4"><StatCard label="کل رکوردها" value={faNumber(status.total)} /><StatCard label="پردازش‌شده" value={faNumber(status.processed)} color="info" /><StatCard label="محاسبه‌شده" value={faNumber(status.calculated)} color="success" /><StatCard label="نامعتبر" value={faNumber(status.invalid)} color="warning" help="عمداً نهایی شده‌اند تا بی‌نهایت retry نشوند." /><StatCard label="در انتظار" value={faNumber(status.pending)} color="secondary" /><StatCard label="سرعت پردازش" value={`${faNumber(status.recordsPerSecond, { maximumFractionDigits: 2 })} رکورد/ثانیه`} color="info" /><StatCard label="زمان تخمینی باقی‌مانده" value={formatEta(status.estimatedRemainingSeconds)} color="primary" /></Row>
      <Card className="mb-4"><CardHeader><strong>تنظیمات پردازش</strong></CardHeader><CardBody><Form onSubmit={submit}><fieldset disabled={!canUpdate || saving || !status.environmentEnabled}><Row className="g-3 align-items-end"><Col md="4"><FormGroup switch><Input id="duration-enabled" type="switch" checked={form.enabled} onChange={(event) => changeEnabled(event.target.checked)} /><Label for="duration-enabled" check>فعال‌بودن پردازش زمان‌بندی‌شده</Label></FormGroup></Col><Col md="4"><Label for="worker-count">تعداد worker</Label><Input id="worker-count" type="number" min="1" max="20" value={form.workerCount} invalid={Boolean(errors.workerCount)} onChange={(event) => setForm((old) => ({ ...old, workerCount: event.target.value }))} /><FormFeedback>{errors.workerCount}</FormFeedback></Col><Col md="4"><Label for="concurrency">Concurrency هر worker</Label><Input id="concurrency" type="number" min="1" max="500" value={form.concurrency} invalid={Boolean(errors.concurrency)} onChange={(event) => setForm((old) => ({ ...old, concurrency: event.target.value }))} /><FormFeedback>{errors.concurrency}</FormFeedback></Col></Row></fieldset><Alert color="info" className="mt-3">ظرفیت تقریبی هر دور: <strong>{faNumber(Number(form.workerCount || 0) * Number(form.concurrency || 0))} رکورد در هر دقیقه</strong>. تغییرات از دور بعدی worker اعمال می‌شوند.</Alert>{canUpdate && <Button type="submit" color="success" disabled={saving || !status.environmentEnabled}>{saving ? <><Spinner size="sm" className="ms-1" />در حال ذخیره</> : "ذخیره تنظیمات"}</Button>}</Form></CardBody></Card>
    </>}
    <Card><CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2"><strong>تاریخچه اجرا (جدیدترین ابتدا)</strong><div className="d-flex align-items-center gap-2"><Label for="logs-limit" className="mb-0">تعداد در صفحه</Label><Input id="logs-limit" type="select" value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setPage(1) }} style={{ width: 85 }}><option value="10">۱۰</option><option value="20">۲۰</option><option value="50">۵۰</option></Input></div></CardHeader><CardBody><LogsTable {...logsQuery} onRetry={logsQuery.refetch} onSelect={setSelectedLog} />{!logsQuery.loading && !logsQuery.error && <div className="mt-3"><Paginations perPageData={logsQuery.meta.limit} data={logsQuery.items} totalRecords={logsQuery.meta.total} currentPage={logsQuery.meta.page} setCurrentPage={setPage} isShowingPageLength paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" /></div>}</CardBody></Card>
    <Modal isOpen={confirmEnabled !== null} toggle={() => !saving && setConfirmEnabled(null)} centered><ModalHeader toggle={() => setConfirmEnabled(null)}>تأیید تغییر وضعیت</ModalHeader><ModalBody>{confirmEnabled ? "پردازش زمان‌بندی‌شده از دور بعدی فعال شود؟" : "پردازش متوقف شود؟ توقف فقط دورهای زمان‌بندی بعدی را متوقف می‌کند و دور جاری ادامه می‌یابد."}</ModalBody><ModalFooter><Button color="light" onClick={() => setConfirmEnabled(null)}>انصراف</Button><Button color={confirmEnabled ? "success" : "warning"} onClick={confirmEnabledChange}>تأیید</Button></ModalFooter></Modal>
    <Modal isOpen={Boolean(selectedLog)} toggle={() => setSelectedLog(null)} size="lg" scrollable><ModalHeader toggle={() => setSelectedLog(null)}>جزئیات اجرای worker</ModalHeader><ModalBody>{selectedLog && <dl className="row mb-0"><dt className="col-sm-4">Worker</dt><dd className="col-sm-8">{selectedLog.worker_id ?? "—"}</dd><dt className="col-sm-4">شروع / پایان</dt><dd className="col-sm-8">{formatDate(selectedLog.started_at)} / {formatDate(selectedLog.finished_at)}</dd><dt className="col-sm-4">بالاترین / پایین‌ترین شناسه</dt><dd className="col-sm-8" dir="ltr">{selectedLog.highest_history_id ?? "—"} / {selectedLog.lowest_history_id ?? "—"}</dd><dt className="col-sm-4">خطای کامل</dt><dd className="col-sm-8 text-break"><pre className="text-wrap bg-light border rounded p-3 mb-0">{selectedLog.error_message || "خطایی ثبت نشده است."}</pre></dd></dl>}</ModalBody><ModalFooter><Button color="light" onClick={() => setSelectedLog(null)}>بستن</Button></ModalFooter></Modal>
  </div></div>
}

export default DurationProcessing
