import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert, Badge, Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Progress, Row, Spinner,
} from "reactstrap";
import { toast } from "react-toastify";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import { getSchools } from "../../services/schoolService.jsx";
import { backupController } from "../../services/backupController";
import { ensureDirectoryPermission, getBackupDirectory, saveBackupDirectory, supportsDirectoryPicker, verifyWritableDirectory } from "../../services/backupDirectoryStore";
import {
  executeBackup,
  getBackup,
  isTemporaryBackupError,
  mergeBackupProgress,
  normalizeBackupProgress,
  TEMPORARY_BACKUP_ERROR_MESSAGE,
  type BackupProgress,
  type BackupSection,
} from "../../services/backupService";

declare global {
  interface Window { showDirectoryPicker?: (options?: { mode?: "read" | "readwrite" }) => Promise<FileSystemDirectoryHandle>; }
}

const STORAGE_KEY = "isoogh-active-local-backup";
const sections: Array<{ id: BackupSection; label: string }> = [
  { id: "outbound_calls", label: "گزارش تماس‌های خروجی" },
  { id: "call_recordings", label: "فایل‌های صوتی تماس" },
  { id: "support_form_answers", label: "گزارش پاسخ فرم‌های پشتیبانی" },
];

const formatBytes = (bytes = 0) => {
  if (!bytes) return "۰ بایت";
  const units = ["بایت", "کیلوبایت", "مگابایت", "گیگابایت", "ترابایت"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} ${units[index]}`;
};

const formatDuration = (seconds: number | null) => {
  if (seconds == null) return "در حال محاسبه";
  if (seconds < 60) return `${seconds.toLocaleString("fa-IR")} ثانیه`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60).toLocaleString("fa-IR")} دقیقه`;
  return `${Math.ceil(seconds / 3600).toLocaleString("fa-IR")} ساعت`;
};

const loadSaved = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch { return null; }
};

const isTerminalStatus = (status: unknown) =>
  ["canceled", "cancelled", "completed", "failed"].includes(String(status || "").toLowerCase());

const apiErrorMessage = (error: any) => {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message.filter(Boolean).join("، ");
  return message || error?.response?.data?.error || error?.message || "اجرای بک‌آپ متوقف شد";
};

export default function BackupPage() {
  document.title = "بک‌آپ محلی | داشبورد آیسوق";
  const supported = supportsDirectoryPicker();
  const isMac = /Mac/i.test(navigator.platform || navigator.userAgent);
  const saved = useMemo(loadSaved, []);
  const [schools, setSchools] = useState<any[]>([]);
  const [schoolIds, setSchoolIds] = useState<number[]>(saved?.schoolIds || []);
  const [selectedSections, setSelectedSections] = useState<BackupSection[]>(saved?.sections || sections.map((item) => item.id));
  const [directory, setDirectory] = useState<FileSystemDirectoryHandle | null>(null);
  const [directoryStatus, setDirectoryStatus] = useState<"unknown" | "ready" | "missing" | "denied">("unknown");
  const [job, setJob] = useState<BackupProgress | null>(saved?.job ? normalizeBackupProgress(saved.job) : null);
  const [running, setRunning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [acknowledgeFailures, setAcknowledgeFailures] = useState(true);
  const [metrics, setMetrics] = useState({ bytesPerSecond: 0, etaSeconds: null as number | null });
  const [temporaryFailure, setTemporaryFailure] = useState<null | { phase: "execute" | "job" }>(null);
  const runningRef = useRef(false);

  useEffect(() => {
    getSchools({ page: 1, limit: 500, sortBy: "name", sortOrder: "ASC", managerId: undefined })
      .then((result) => setSchools(result.items || []))
      .catch(() => setSchools([]));
    const unsubscribe = backupController.subscribe((nextJob, nextMetrics) => {
      setJob((current) => current?.id === nextJob.id ? mergeBackupProgress(current, nextJob) : nextJob);
      setMetrics(nextMetrics);
    });
    return () => {
      unsubscribe();
      backupController.stopLocal();
    };
  }, []);

  useEffect(() => {
    if (!job?.id || (running && Number(job.totalFiles || 0) > 0)) return;
    const refresh = () => {
      getBackup(job.id).then((nextJob) => {
        setJob((current) => current?.id === nextJob.id ? mergeBackupProgress(current, nextJob) : nextJob);
      }).catch(() => undefined);
    };
    refresh();
    const poll = window.setInterval(() => {
      refresh();
    }, 4000);
    return () => window.clearInterval(poll);
  }, [job?.id, job?.totalFiles, running]);

  useEffect(() => {
    if (!job?.id) return;
    if (isTerminalStatus(job.status)) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ job, schoolIds, sections: selectedSections }));
  }, [job, schoolIds, selectedSections]);

  const chooseDirectory = async () => {
    if (!window.showDirectoryPicker) return;
    try {
      const handle = await window.showDirectoryPicker({ mode: "readwrite" });
      await verifyWritableDirectory(handle);
      setDirectory(handle);
      setDirectoryStatus("ready");
      if (job?.id) await saveBackupDirectory(job.id, handle);
    } catch (error: any) {
      if (error?.name !== "AbortError") {
        setDirectoryStatus(error?.name === "NotAllowedError" ? "denied" : "missing");
        toast.error("پوشه انتخاب‌شده قابل نوشتن نیست یا دسترسی آن لغو شده است");
      }
    }
  };

  const resolveDirectory = async (requestPermission = true) => {
    let handle = directory;
    if (!handle && job?.id) handle = (await getBackupDirectory(job.id)) || null;
    if (!handle) return null;
    const allowed = await ensureDirectoryPermission(handle, requestPermission);
    if (!allowed) {
      setDirectoryStatus("denied");
      return null;
    }
    await verifyWritableDirectory(handle);
    setDirectory(handle);
    setDirectoryStatus("ready");
    return handle;
  };

  const runController = async (nextJob: BackupProgress, handle: FileSystemDirectoryHandle, resume = false) => {
    runningRef.current = true;
    setRunning(true);
    setTemporaryFailure(null);
    try {
      await backupController.run({ job: nextJob, directory: handle, schoolIds, sections: selectedSections, acknowledgeFailures, resume });
      toast.success("بک‌آپ با موفقیت تکمیل شد");
    } catch (error: any) {
      if (isTemporaryBackupError(error)) {
        setTemporaryFailure({ phase: "job" });
      } else if (error?.name !== "AbortError" && (!error?.response || error?.backupAckError)) {
        toast.error(apiErrorMessage(error));
      }
    } finally {
      runningRef.current = false;
      setRunning(false);
    }
  };

  const start = async () => {
    if (!selectedSections.length) return toast.error("حداقل یک بخش را انتخاب کنید");
    if (!supported) return;
    setBusy(true);
    setTemporaryFailure(null);
    try {
      let handle = directory;
      if (!handle) {
        handle = await window.showDirectoryPicker!({ mode: "readwrite" });
        setDirectory(handle);
      }
      await verifyWritableDirectory(handle);
      setDirectoryStatus("ready");
      const payload = { sections: selectedSections, ...(schoolIds.length ? { school_ids: schoolIds } : {}) };
      const nextJob = await executeBackup(payload);
      await saveBackupDirectory(nextJob.id, handle);
      setJob(nextJob);
      setBusy(false);
      await runController(nextJob, handle);
    } catch (error: any) {
      if (isTemporaryBackupError(error)) {
        setTemporaryFailure({ phase: "execute" });
      } else if (error?.name !== "AbortError" && !error?.response) {
        toast.error(error?.message || "شروع بک‌آپ ممکن نشد");
      }
    } finally { setBusy(false); }
  };

  const resume = async () => {
    if (!job) return;
    setBusy(true);
    try {
      const handle = await resolveDirectory(true);
      if (!handle) {
        toast.info("همان پوشه مقصد قبلی را دوباره انتخاب کنید");
        return;
      }
      setBusy(false);
      await runController(job, handle, true);
    } catch {
      setDirectoryStatus("missing");
      toast.info("هارد یا پوشه قبلی در دسترس نیست؛ همان پوشه را دوباره انتخاب کنید");
    } finally { setBusy(false); }
  };

  const pause = async () => {
    setBusy(true);
    try { if (job) await backupController.pause(job.id); }
    finally { setBusy(false); }
  };

  const cancel = async () => {
    if (!job || !window.confirm("اجرای بک‌آپ لغو شود؟ فایل‌های ذخیره‌شده حذف نخواهند شد.")) return;
    setBusy(true);
    setTemporaryFailure(null);
    try {
      const canceledJob = await backupController.cancel(job.id);
      setJob(canceledJob);
      localStorage.removeItem(STORAGE_KEY);
      toast.success("بک‌آپ لغو شد؛ فایل‌های ذخیره‌شده روی هارد حذف نشدند");
    } catch (error: any) {
      if (isTemporaryBackupError(error)) setTemporaryFailure({ phase: "job" });
      else if (!error?.response) toast.error(apiErrorMessage(error));
    }
    finally { setBusy(false); }
  };

  const retryTemporaryFailure = async () => {
    if (!temporaryFailure) return;
    if (temporaryFailure.phase === "execute") {
      await start();
      return;
    }
    if (!job) return;
    setBusy(true);
    try {
      const handle = await resolveDirectory(true);
      if (!handle) {
        toast.info("همان پوشه مقصد قبلی را دوباره انتخاب کنید");
        return;
      }
      setBusy(false);
      await runController(job, handle, false);
    } catch (error: any) {
      if (isTemporaryBackupError(error)) setTemporaryFailure({ phase: "job" });
      else if (error?.name !== "AbortError") toast.error(apiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const toggleSection = (id: BackupSection) => setSelectedSections((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const percent = Math.max(0, Math.min(100, Number(job?.percent || 0)));
  const terminal = isTerminalStatus(job?.status);

  return <div className="page-content"><div className="container-fluid">
    <Breadcrumbs title="مدیریت داده" breadcrumbItem="بک‌آپ روی هارد کاربر" />
    {!supported && <Alert color="warning">
      بک‌آپ پوشه‌ای حجیم فقط در Chrome یا Edge دسکتاپ و روی HTTPS/localhost در دسترس است. این مرورگر امکان انتخاب امن پوشه را ندارد؛ برای خروجی‌های کوچک از دانلودهای دستی Excel صفحات گزارش استفاده کنید.
    </Alert>}
    {temporaryFailure && <Alert color="warning" className="d-flex flex-wrap align-items-center justify-content-between gap-2">
      <span>{TEMPORARY_BACKUP_ERROR_MESSAGE}</span>
      <Button color="warning" size="sm" onClick={retryTemporaryFailure} disabled={busy || running}>تلاش مجدد</Button>
    </Alert>}
    <Row className="g-3">
      <Col xl="5"><Card className="h-100"><CardHeader><h5 className="mb-0">تنظیمات بک‌آپ</h5></CardHeader><CardBody>
        <Alert color="info" className="small">مرورگر هیچ هاردی را خودکار شناسایی نمی‌کند. پوشه‌ای روی لپ‌تاپ یا هارد اکسترنال را خودتان انتخاب کنید؛ نام و مسیر پوشه به سرور ارسال نمی‌شود.</Alert>
        <FormGroup><Label>مدارس (خالی یعنی همه مدارس مجاز)</Label>
          <Input type="select" multiple value={schoolIds.map(String)} onChange={(event) => { const select = event.currentTarget as unknown as HTMLSelectElement; setSchoolIds(Array.from(select.selectedOptions).map((option) => Number(option.value))); }} style={{ minHeight: 150 }}>
            {schools.map((school) => <option key={school.id} value={school.id}>{school.name || school.title || `مدرسه ${school.id}`}</option>)}
          </Input>
        </FormGroup>
        <Label>بخش‌ها</Label>
        {sections.map((section) => <FormGroup check key={section.id} className="mb-2"><Input type="checkbox" id={section.id} checked={selectedSections.includes(section.id)} onChange={() => toggleSection(section.id)} /><Label check htmlFor={section.id}>{section.label}</Label></FormGroup>)}
        <FormGroup check className="mt-3"><Input type="checkbox" id="continue-failures" checked={acknowledgeFailures} onChange={(event) => setAcknowledgeFailures(event.target.checked)} /><Label check htmlFor="continue-failures">پس از ۳ تلاش ناموفق، خطا ثبت و صف ادامه داده شود</Label></FormGroup>
        <div className="d-flex flex-wrap gap-2 mt-4">
          <Button color="secondary" outline onClick={chooseDirectory} disabled={!supported || running}>انتخاب پوشه مقصد</Button>
          <Button color="primary" onClick={start} disabled={!supported || busy || running || !selectedSections.length}>{busy && <Spinner size="sm" className="ms-1" />}شروع بک‌آپ</Button>
        </div>
        {isMac && <Alert color="light" className="border mt-3 mb-0 small">
          اگر هارد در پنجره انتخاب پوشه دیده نمی‌شود، در همان پنجره کلیدهای <strong>⌘⇧G</strong> را بزنید و <code>/Volumes</code> را وارد کنید. همچنین در تنظیمات macOS، دسترسی Google Chrome به Removable Volumes را فعال و Chrome را کاملاً بسته و دوباره اجرا کنید.
        </Alert>}
        <div className="mt-3 small">وضعیت مقصد: <Badge color={directoryStatus === "ready" ? "success" : directoryStatus === "unknown" ? "secondary" : "danger"}>{directoryStatus === "ready" ? "آماده و قابل نوشتن" : directoryStatus === "denied" ? "دسترسی رد شده" : directoryStatus === "missing" ? "پوشه/هارد در دسترس نیست" : "انتخاب نشده"}</Badge></div>
      </CardBody></Card></Col>
      <Col xl="7"><Card className="h-100"><CardHeader><h5 className="mb-0">وضعیت اجرا</h5></CardHeader><CardBody>
        {!job ? <div className="text-muted py-5 text-center">هنوز بک‌آپی شروع نشده است.</div> : <>
          <div className="d-flex justify-content-between mb-2"><span>پیشرفت</span><strong>{percent.toLocaleString("fa-IR")}%</strong></div>
          <Progress value={percent} color={Number(job.failedFiles || 0) ? "warning" : "success"} className="mb-4" />
          <Row className="g-3">
            <Col sm="6"><div className="text-muted small">پردازش‌شده از کل</div><strong>{Number(job.processedFiles || 0).toLocaleString("fa-IR")} از {Number(job.totalFiles || 0).toLocaleString("fa-IR")}</strong></Col>
            <Col sm="6"><div className="text-muted small">حجم دریافت‌شده</div><strong>{formatBytes(Number(job.downloadedBytes || 0))}</strong></Col>
            <Col sm="6"><div className="text-muted small">سرعت میانگین متحرک</div><strong>{formatBytes(metrics.bytesPerSecond)}/ثانیه</strong></Col>
            <Col sm="6"><div className="text-muted small">زمان تقریبی باقی‌مانده</div><strong>{formatDuration(metrics.etaSeconds)}</strong></Col>
            <Col sm="6"><div className="text-muted small">فایل جاری</div><strong className="text-break">{String(job.currentFile || "—")}</strong></Col>
            <Col sm="6"><div className="text-muted small">خطاها</div><strong className={Number(job.failedFiles || 0) ? "text-danger" : ""}>{Number(job.failedFiles || 0).toLocaleString("fa-IR")}</strong></Col>
          </Row>
          <div className="d-flex flex-wrap gap-2 mt-4">
            {running && <Button color="warning" onClick={pause} disabled={busy}>توقف موقت پس از فایل جاری</Button>}
            {!running && !terminal && <Button color="success" onClick={resume} disabled={busy || !supported}>ادامه بک‌آپ</Button>}
            {!terminal && <Button color="danger" outline onClick={cancel} disabled={busy}>لغو کامل بک‌آپ</Button>}
          </div>
        </>}
      </CardBody></Card></Col>
    </Row>
  </div></div>;
}
