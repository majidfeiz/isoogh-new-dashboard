import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
  Spinner,
  TabContent,
  TabPane,
  Table,
} from "reactstrap";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import moment from "moment-jalaali";
import { getVoipCallDateDisplay } from "../../helpers/voipTime.js";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Paginations from "../../components/Common/Paginations.jsx";
import CallTrackingWarningModal from "./CallTrackingWarningModal.jsx";
import { getCallTrace } from "../../services/voipService.jsx";
import { isQueuedCallResponse, normalizeQueuedCall, pollQueuedCallTrace } from "./queuedCallUtils.js";
import {
  getStudentProfile,
  getStudentCallLogs,
  getStudentAnswers,
  getAdviserSupportFormDetail,
  makeCall,
  submitAnswers,
  getContactSubjects,
  getStudentContacts,
  addStudentContact,
  setDefaultContact,
  deleteStudentContact,
} from "../../services/adviserPortalService.jsx";
import { buildAnswerPayload, createAnswerCallContext, getAnswerDisplayText, getAnswerRequestError, getAnswerSubmitMessage, getSessionForVoipCall, getUnansweredQuestions, hydrateAnswers } from "./answerFormUtils.js";
import { getAdviserStudentListPath } from "./formDetailSortUtils.js";
import { closeSupportForm, isSupportFormEndedError, SUPPORT_FORM_READ_ONLY_MESSAGE } from "./supportFormAvailability.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatJalali = (value, withTime = false) => {
  if (!value) return "—";
  const numeric = Number(value);
  const date =
    !Number.isNaN(numeric) && numeric
      ? new Date(numeric < 1_000_000_000_000 ? numeric * 1000 : numeric)
      : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return moment(date).format(withTime ? "jYYYY/jMM/jDD HH:mm" : "jYYYY/jMM/jDD");
};

const getInitials = (name = "") => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return parts[0][0] + parts[1][0];
  return name[0] || "؟";
};

const dispositionConfig = {
  ANSWERED: { label: "پاسخ داده شد", color: "success" },
  "NO ANSWER": { label: "پاسخ داده نشد", color: "danger" },
  BUSY: { label: "مشغول", color: "warning" },
  FAILED: { label: "ناموفق/ناقص", color: "secondary" },
};

const hasValidCallGroupId = (value) => {
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized !== "" && normalized !== "null";
};

const CALL_COOLDOWN_SECONDS = 20;

const PreviousAnswersCard = ({ items, className = "" }) => {
  if (!items?.length) return null;
  return <div className={`border rounded p-3 ${className}`} data-testid="student-previous-answers">
    <h5 className="mb-3"><i className="bx bx-history me-1" />اطلاعات سابق دانش‌آموز</h5>
    <div className="vstack gap-3">
      {items.map((item, index) => (
        <div className="bg-light rounded p-3" key={`${item.sourceFormId}-${item.questionId}-${index}`}>
          <div className="fw-semibold">{item.sourceFormTitle || "فرم تماس قبلی"}</div>
          <div className="text-muted small mb-2">{item.questionTitle || "سؤال"}</div>
          {item.hasAnswer ? <>
            <div className="text-break">{item.answerText || "—"}</div>
            {item.updatedAt && <small className="text-muted d-block mt-2">آخرین بروزرسانی: {formatJalali(item.updatedAt, true)}</small>}
          </> : <div className="text-muted">پاسخی از تماس‌های قبلی ثبت نشده است</div>}
        </div>
      ))}
    </div>
  </div>;
};

const TagValuesCard = ({ items, className = "" }) => {
  if (!items?.length) return null;
  return <div className={`border rounded p-3 ${className}`} data-testid="student-tag-values">
    <h5 className="mb-3"><i className="bx bx-info-circle me-1" />اطلاعات تکمیلی دانش‌آموز</h5>
    <Row className="g-3">
      {items.map((item) => (
        <Col lg="4" md="6" key={item.tagId}>
          <div className="bg-light rounded p-3 h-100">
            <div className="text-muted small mb-1">{item.title}</div>
            <div className="fw-semibold text-break">{item.value}</div>
          </div>
        </Col>
      ))}
    </Row>
  </div>;
};

// ─── Answer Drawer ────────────────────────────────────────────────────────────

const AnswerDrawer = ({ open, onClose, studentName, studentPhone, previousAnswers, form, callContext, onSubmitted, canEdit = true, onFormEnded }) => {
  const { studentId, voipCallId } = callContext || {};
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [answersLoading, setAnswersLoading] = useState(false);
  const [answersReady, setAnswersReady] = useState(false);
  const [answerError, setAnswerError] = useState("");
  const submittingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setAnswers({});
    setAnswersReady(false);
    setConfirmationOpen(false);
    setAnswerError("");
    setAnswersLoading(false);
    if (!open) return undefined;
    if (!voipCallId) {
      setAnswerError("تماس معتبر پیدا نشد");
      return undefined;
    }
    setAnswersLoading(true);
    getStudentAnswers(callContext.formId, studentId, voipCallId)
      .then((sessions) => {
        if (cancelled) return;
        const session = getSessionForVoipCall(sessions, voipCallId);
        setAnswers(hydrateAnswers(form?.questions || [], session));
        setAnswersReady(true);
      })
      .catch((error) => {
        if (cancelled) return;
        setAnswerError(getAnswerRequestError(error));
      })
      .finally(() => { if (!cancelled) setAnswersLoading(false); });
    return () => { cancelled = true; };
  }, [open, studentId, callContext?.formId, form?.questions, voipCallId]);

  const setAnswer = (qId, value) => setAnswers((p) => ({ ...p, [qId]: value }));
  const clearAnswer = (qId) => setAnswers((current) => {
    const next = { ...current };
    delete next[qId];
    return next;
  });
  const toggleCheckbox = (qId, optId) =>
    setAnswers((p) => {
      const cur = p[qId] || [];
      return { ...p, [qId]: cur.includes(optId) ? cur.filter((x) => x !== optId) : [...cur, optId] };
    });

  const questions = form?.questions || [];
  const unansweredCount = getUnansweredQuestions(questions, answers).length;
  const isComplete = unansweredCount === 0;

  const handleSubmit = async (callSuccessful) => {
    if (!canEdit || submittingRef.current) return;
    submittingRef.current = true;
    setSubmittingAction(callSuccessful ? "success" : "incomplete");
    setSubmitting(true);
    setAnswerError("");
    try {
      const result = await submitAnswers({
        formId: callContext.formId,
        studentId,
        answers: buildAnswerPayload(questions, answers),
        voipCallId,
        callSuccessful,
      });
      if (Number(result?.voipCallId) !== Number(voipCallId)) throw new Error("شناسه تماس پاسخ ذخیره‌شده با تماس انتخاب‌شده مطابقت ندارد");
      const refreshedSessions = await getStudentAnswers(callContext.formId, studentId, voipCallId);
      getSessionForVoipCall(refreshedSessions, voipCallId);
      toast.success(getAnswerSubmitMessage(result));
      setConfirmationOpen(false);
      onSubmitted?.(result);
      onClose();
    } catch (error) {
      if (isSupportFormEndedError(error)) {
        onFormEnded?.(error);
        setAnswerError(SUPPORT_FORM_READ_ONLY_MESSAGE);
      } else {
        setAnswerError(getAnswerRequestError(error));
      }
      setConfirmationOpen(false);
    } finally {
      submittingRef.current = false;
      setSubmittingAction(null);
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={open} toggle={() => !submitting && onClose()} size="lg" scrollable>
      <ModalHeader toggle={() => !submitting && onClose()}>
        <div>
          <div className="fw-semibold">تکمیل فرم تماس</div>
          {studentName && (
            <small className="text-muted fw-normal">
              {studentName} — {studentPhone}
            </small>
          )}
        </div>
      </ModalHeader>
      <ModalBody className="p-4">
        {!canEdit ? <Alert color="warning">{SUPPORT_FORM_READ_ONLY_MESSAGE}</Alert> : null}
        {answerError ? <Alert color="danger">{answerError}</Alert> : null}
        {answersLoading ? <div className="text-center py-5"><Spinner color="primary" /><div className="text-muted mt-2">در حال دریافت پاسخنامه تماس...</div></div> : null}
        {!answersLoading && <>
        <PreviousAnswersCard items={previousAnswers} className="mb-4" />
        <div className="vstack gap-4">
          {(form?.questions || []).map((q, idx) => (
            <FormGroup key={q.id} className="mb-0">
              <Label className="fw-semibold">
                {idx + 1}. {q.text}
                {q.required && <span className="text-danger ms-1">*</span>}
              </Label>
              {q.type === 0 && (
                <Input type="textarea" rows={3} value={answers[q.id] || ""} disabled={!canEdit} onChange={(e) => setAnswer(q.id, e.target.value)} placeholder="پاسخ خود را بنویسید..." />
              )}
              {q.type !== 0 && !q.multiChoice && (
                <div className="vstack gap-2 mt-1">
                  {q.options.map((opt) => (
                    <div
                      key={opt.id}
                      className="form-check"
                      role="button"
                      tabIndex={canEdit ? 0 : -1}
                      style={{ cursor: canEdit ? "pointer" : "default" }}
                      onClick={() => canEdit && setAnswer(q.id, Number(opt.id))}
                      onKeyDown={(e) => { if (canEdit && (e.key === " " || e.key === "Enter")) { e.preventDefault(); setAnswer(q.id, Number(opt.id)); } }}
                    >
                      <input className="form-check-input" type="radio" name={`q-${q.id}`} id={`opt-${q.id}-${opt.id}`} value={opt.id} checked={Number(answers[q.id]) === Number(opt.id)} disabled={!canEdit} readOnly />
                      <label className="form-check-label" htmlFor={`opt-${q.id}-${opt.id}`} style={{ pointerEvents: "none" }}>{opt.label}</label>
                    </div>
                  ))}
                  {canEdit && !q.required && answers[q.id] != null && answers[q.id] !== "" && (
                    <div>
                      <Button type="button" color="secondary" outline size="sm" onClick={() => clearAnswer(q.id)}>
                        <i className="bx bx-reset me-1" />
                        پاک کردن انتخاب
                      </Button>
                    </div>
                  )}
                </div>
              )}
              {q.type !== 0 && q.multiChoice && (
                <div className="vstack gap-2 mt-1">
                  {q.options.map((opt) => (
                    <div
                      key={opt.id}
                      className="form-check"
                      role="button"
                      tabIndex={canEdit ? 0 : -1}
                      style={{ cursor: canEdit ? "pointer" : "default" }}
                      onClick={() => canEdit && toggleCheckbox(q.id, Number(opt.id))}
                      onKeyDown={(e) => { if (canEdit && (e.key === " " || e.key === "Enter")) { e.preventDefault(); toggleCheckbox(q.id, Number(opt.id)); } }}
                    >
                      <input className="form-check-input" type="checkbox" id={`opt-${q.id}-${opt.id}`} checked={(answers[q.id] || []).some((id) => Number(id) === Number(opt.id))} disabled={!canEdit} readOnly />
                      <label className="form-check-label" htmlFor={`opt-${q.id}-${opt.id}`} style={{ pointerEvents: "none" }}>{opt.label}</label>
                    </div>
                  ))}
                </div>
              )}
            </FormGroup>
          ))}
        </div>
        <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
          <Button color="light" onClick={onClose} disabled={submitting}>انصراف</Button>
          <Button color="primary" onClick={() => isComplete ? handleSubmit(true) : setConfirmationOpen(true)} disabled={!canEdit || submitting || !answersReady}>
            {submitting ? <Spinner size="sm" className="me-2" /> : <i className="bx bx-save me-2" />}
            ثبت پاسخ‌ها
          </Button>
        </div>
        </>}
      </ModalBody>
      <Modal isOpen={confirmationOpen} toggle={() => !submitting && setConfirmationOpen(false)} centered>
        <ModalHeader toggle={() => !submitting && setConfirmationOpen(false)}>نتیجه تماس</ModalHeader>
        <ModalBody>
          <p className="mb-2 fw-semibold">پاسخنامه کامل نیست. آیا با این حال تماس موفق ثبت شود؟</p>
          <div className="alert alert-warning py-2 small">تعداد سؤال‌های بی‌پاسخ: {unansweredCount}</div>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button color="light" onClick={() => setConfirmationOpen(false)} disabled={submitting}>انصراف</Button>
            <Button color="danger" onClick={() => handleSubmit(false)} disabled={!canEdit || submitting}>
              {submittingAction === "incomplete" && <Spinner size="sm" className="me-2" />}
              ثبت ناموفق/ناقص
            </Button>
            <Button color="success" onClick={() => handleSubmit(true)} disabled={!canEdit || submitting}>
              {submittingAction === "success" && <Spinner size="sm" className="me-2" />}
              ثبت تماس موفق
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </Modal>
  );
};

// ─── Info Card ────────────────────────────────────────────────────────────────

const InfoCard = ({ label, value, icon }) => (
  <Col xs={12} sm={6} xl={4}>
    <div className="d-flex align-items-center gap-3 p-3 rounded border bg-white h-100" style={{ transition: "box-shadow .15s" }}>
      <div className="flex-shrink-0 rounded-2 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, background: "rgba(80,120,255,.08)" }}>
        <i className={`bx ${icon} font-size-18 text-primary`} />
      </div>
      <div className="overflow-hidden flex-grow-1">
        <div className="text-muted" style={{ fontSize: 11 }}>{label}</div>
        <div className="fw-semibold text-truncate" style={{ fontSize: 14 }}>{value || "—"}</div>
      </div>
    </div>
  </Col>
);

// ─── Tab 1: Student Info ──────────────────────────────────────────────────────

const StudentInfoTab = ({ profile, loading }) => {
  if (loading) return <div className="text-center py-5"><Spinner color="primary" /></div>;
  if (!profile) return <div className="text-center py-5 text-muted">اطلاعاتی یافت نشد</div>;

  const fields = [
    { label: "نام کامل", value: profile.name, icon: "bx-user" },
    { label: "تلفن اول", value: profile.phone, icon: "bx-phone" },
    profile.phone2 && { label: "تلفن دوم", value: profile.phone2, icon: "bx-phone" },
    profile.phone3 && { label: "تلفن سوم", value: profile.phone3, icon: "bx-phone" },
    { label: "کد ملی", value: profile.ssn, icon: "bx-id-card" },
    { label: "تلفن VoIP", value: profile.voipPhone, icon: "bx-headphone" },
    { label: "کد دانش‌آموزی", value: profile.code, icon: "bx-barcode" },
    { label: "تاریخ تولد", value: profile.birthday, icon: "bx-cake" },
    { label: "استان", value: profile.province, icon: "bx-map" },
    { label: "شهر", value: profile.city, icon: "bx-buildings" },
    profile.region && { label: "منطقه", value: profile.region, icon: "bx-map-pin" },
    { label: "نوبت", value: profile.shift, icon: "bx-sun" },
    { label: "نام موسسه", value: profile.instituteName, icon: "bx-building-house" },
    profile.instituteType && { label: "نوع موسسه", value: profile.instituteType, icon: "bx-category" },
    { label: "معدل", value: profile.gpa, icon: "bx-trophy" },
    { label: "تلفن اضطراری", value: profile.emergencyPhone, icon: "bx-phone-incoming" },
  ].filter(Boolean);

  return (
    <>
      <Row className="g-3">
        {fields.map((f) => (
          <InfoCard key={f.label} {...f} />
        ))}
      </Row>
    </>
  );
};

// ─── Tab 2: Call Logs ─────────────────────────────────────────────────────────

const isAudioCallFile = (file = {}) => {
  const type = String(file?.type || "").trim().toLowerCase();
  if (type === "voice" || type === "audio" || type.startsWith("audio/")) return true;
  return /\.(wav|mp3|ogg|m4a)(?:[?#].*)?$/i.test(String(file?.url || ""));
};

const CallAudioPlayer = ({ file, index, registerAudio, onPlay }) => {
  const [failed, setFailed] = useState(false);
  const label = file?.title?.trim?.() || file?.name?.trim?.() || file?.code?.trim?.() || `فایل صوتی ${index + 1}`;

  useEffect(() => setFailed(false), [file?.url]);

  return (
    <div className="border rounded-3 p-3 bg-white shadow-sm">
      <div className="d-flex align-items-start justify-content-between gap-3 mb-3 flex-wrap">
        <div className="d-flex align-items-center gap-2 overflow-hidden">
          <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 40, height: 40 }}>
            <i className="bx bx-volume-full font-size-20" />
          </div>
          <div className="overflow-hidden">
            <div className="fw-semibold text-truncate" title={label}>{label}</div>
            {file?.description && <div className="small text-muted text-break mt-1">{file.description}</div>}
          </div>
        </div>
        <div className="d-flex gap-1 flex-wrap">
          {file?.time && <Badge color="light" className="text-dark border"><i className="bx bx-time-five me-1" />{file.time}</Badge>}
          {file?.size && <Badge color="light" className="text-dark border">{file.size}</Badge>}
        </div>
      </div>
      {!file?.url || !isAudioCallFile(file) || failed ? (
        <Alert color="warning" className="py-2 mb-0 d-flex align-items-center gap-2">
          <i className="bx bx-error-circle font-size-18" />
          فایل صوتی قابل دسترس نیست
        </Alert>
      ) : (
        <audio
          ref={registerAudio}
          controls
          preload="metadata"
          src={file.url}
          className="w-100 d-block"
          style={{ height: 44 }}
          onPlay={onPlay}
          onError={() => setFailed(true)}
        >
          مرورگر شما پخش صوت را پشتیبانی نمی‌کند.
        </audio>
      )}
    </div>
  );
};

const CallAudioFilesModal = ({ call, isOpen, toggle }) => {
  const audioElements = useRef(new Set());
  const files = Array.isArray(call?.files) ? call.files : [];

  const stopAudio = useCallback((except = null, reset = false) => {
    audioElements.current.forEach((audio) => {
      if (!audio || audio === except) return;
      audio.pause();
      if (reset) audio.currentTime = 0;
    });
  }, []);

  const closeModal = useCallback(() => {
    stopAudio(null, true);
    toggle();
  }, [stopAudio, toggle]);

  useEffect(() => {
    if (isOpen) return;
    stopAudio(null, true);
    audioElements.current.clear();
  }, [isOpen, stopAudio]);

  useEffect(() => () => stopAudio(null, true), [stopAudio]);

  return (
    <Modal isOpen={isOpen} toggle={closeModal} centered size="lg" scrollable>
      <ModalHeader toggle={closeModal} className="border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2">
            <i className="bx bx-headphone text-primary font-size-20" />
            فایل‌های صوتی تماس
          </div>
          {call && <small className="text-muted fw-normal">{getVoipCallDateDisplay(call)} · تماس #{call.id}</small>}
        </div>
      </ModalHeader>
      <ModalBody className="bg-light p-3 p-md-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <span className="text-muted small">برای هر فایل امکان پخش، توقف و جابه‌جایی در صوت وجود دارد.</span>
          <Badge color="primary" pill>{files.length.toLocaleString("fa-IR")} فایل</Badge>
        </div>
        <div className="d-flex flex-column gap-3">
          {files.map((file, index) => (
            <CallAudioPlayer
              key={file?.id ?? file?.url ?? index}
              file={file}
              index={index}
              registerAudio={(element) => {
                if (element) audioElements.current.add(element);
              }}
              onPlay={(event) => stopAudio(event.currentTarget)}
            />
          ))}
        </div>
      </ModalBody>
    </Modal>
  );
};

const CallLogsTab = ({ formId, studentId, refreshKey, onOpenAnswers }) => {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0, lastPage: 1 });
  const [loading, setLoading] = useState(false);
  const [selectedAudioCall, setSelectedAudioCall] = useState(null);

  const fetchLogs = useCallback(
    async (page = 1) => {
      setSelectedAudioCall(null);
      setLoading(true);
      try {
        const res = await getStudentCallLogs({ formId, studentId, page, limit: 15 });
        setData(res.items || []);
        setMeta(res.pagination || { page, limit: 15, total: 0, lastPage: 1 });
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [formId, studentId]
  );

  useEffect(() => { fetchLogs(1); }, [fetchLogs, refreshKey]);

  if (loading && data.length === 0) return <div className="text-center py-5"><Spinner color="primary" /></div>;

  if (!loading && data.length === 0)
    return (
      <div className="text-center py-5">
        <div className="mb-3">
          <div className="rounded-circle d-inline-flex align-items-center justify-content-center bg-secondary bg-opacity-10" style={{ width: 72, height: 72 }}>
            <i className="bx bx-phone-off font-size-28 text-secondary" />
          </div>
        </div>
        <h6 className="text-muted">هیچ تماسی ثبت نشده است</h6>
      </div>
    );

  return (
    <div>
      <div className="table-responsive">
        <Table className="table-hover align-middle mb-0" dir="rtl">
          <thead className="table-light">
            <tr>
              <th style={{ width: 50 }}>#</th>
              <th>تاریخ تماس</th>
              <th>وضعیت</th>
              <th>مدت زمان</th>
              <th>شماره مقصد</th>
              <th className="text-center">فایل صوتی</th>
              <th style={{ width: 80 }} className="text-center">پاسخنامه</th>
            </tr>
          </thead>
          <tbody>
            {data.map((log, idx) => {
              const disp = dispositionConfig[log.disposition] || { label: log.disposition, color: "secondary" };
              return (
                <tr key={log.id}>
                  <td className="text-muted small">{(meta.page - 1) * meta.limit + idx + 1}</td>
                  <td className="small">{getVoipCallDateDisplay(log)}</td>
                  <td>
                    <Badge color={disp.color} pill className="px-2 py-1">{disp.label}</Badge>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark font-monospace">{log.duration || "—"}</span>
                  </td>
                  <td className="text-muted small">{log.toPhone || "—"}</td>
                  <td className="text-center">
                    {log.files.length === 0 ? (
                      <span className="text-muted">-</span>
                    ) : (
                      <Button color="primary" outline size="sm" className="d-inline-flex align-items-center gap-1" onClick={() => setSelectedAudioCall(log)}>
                        <i className="bx bx-play-circle font-size-16" />
                        {log.files.length === 1 ? "پخش فایل" : `${log.files.length.toLocaleString("fa-IR")} فایل`}
                      </Button>
                    )}
                  </td>
                  <td className="text-center">
                    <Button color={log.hasAnswers ? "success" : "primary"} outline size="sm" disabled={!log.voipCallId} onClick={() => onOpenAnswers(log.voipCallId)}>
                      <i className={`bx ${log.hasAnswers ? "bx-edit" : "bx-plus"}`} />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
      {meta.total > meta.limit && (
        <div className="mt-3">
          <Paginations perPageData={meta.limit} data={data} totalRecords={meta.total} currentPage={meta.page} setCurrentPage={fetchLogs} isShowingPageLength paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0" />
        </div>
      )}
      <CallAudioFilesModal call={selectedAudioCall} isOpen={Boolean(selectedAudioCall)} toggle={() => setSelectedAudioCall(null)} />
    </div>
  );
};

// ─── Tab 3: Answers ───────────────────────────────────────────────────────────

const AnswersTab = ({ formId, studentId, form, previousAnswers, tagValues, refreshKey, onFillAnswers, canEdit }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState({});

  const fetchAnswers = useCallback(() => {
    setLoading(true);
    getStudentAnswers(formId, studentId)
      .then((d) => setSessions(Array.isArray(d) ? d : []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [formId, studentId]);

  useEffect(() => { fetchAnswers(); }, [fetchAnswers, refreshKey]);

  if (loading) return <div className="text-center py-5"><Spinner color="primary" /></div>;

  if (sessions.length === 0)
    return (
      <>
        <PreviousAnswersCard items={previousAnswers} className="mb-4" />
        <TagValuesCard items={tagValues} className="mb-4" />
        <div className="text-center py-5">
          <div className="mb-3">
            <div className="rounded-circle d-inline-flex align-items-center justify-content-center bg-warning bg-opacity-10" style={{ width: 72, height: 72 }}>
              <i className="bx bx-file-blank font-size-28 text-warning" />
            </div>
          </div>
          <h6 className="text-muted mb-3">هیچ پاسخنامه‌ای ثبت نشده است</h6>
          <Button color="primary" disabled={!canEdit} onClick={() => onFillAnswers()}>
            <i className="bx bx-edit me-2" />
            پر کردن پاسخنامه
          </Button>
        </div>
      </>
    );

  const toggle = (idx) => setOpen((p) => ({ ...p, [idx]: !p[idx] }));

  return (
    <div>
      <PreviousAnswersCard items={previousAnswers} className="mb-4" />
      <TagValuesCard items={tagValues} className="mb-4" />
      <div className="vstack gap-2">
      {sessions.map((session, idx) => (
        <div key={session.voipCallId ?? idx} className="border rounded overflow-hidden">
          <div
            className="d-flex align-items-center justify-content-between px-3 py-3 bg-light"
            style={{ cursor: "pointer" }}
            onClick={() => toggle(idx)}
          >
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" style={{ width: 28, height: 28 }}>
                <span className="text-white" style={{ fontSize: 11, fontWeight: 700 }}>{idx + 1}</span>
              </div>
              <span className="fw-semibold" style={{ fontSize: 14 }}>
                جلسه {idx + 1} — {formatJalali(session.sessionDate, true)}
              </span>
              <Badge color="primary" pill className="px-2">{session.answers?.length || 0} پاسخ</Badge>
              {session.voipCallId ? <Button size="sm" color="primary" outline onClick={(event) => { event.stopPropagation(); onFillAnswers(session.voipCallId); }}>{canEdit ? "ویرایش" : "مشاهده"}</Button> : null}
            </div>
            <i className={`bx bx-chevron-${open[idx] ? "up" : "down"} font-size-18 text-muted`} />
          </div>
          {open[idx] && (
            <div className="p-3 vstack gap-0">
              {(session.answers || []).length === 0 ? (
                <p className="text-muted small mb-0">پاسخی ثبت نشده</p>
              ) : (
                (session.answers || []).map((a, ai) => {
                  const question = (form?.questions || []).find((item) => Number(item.id) === Number(a.questionId ?? a.question_id)) || {};
                  return (
                  <div key={a.id} className={`py-2 d-flex gap-3 ${ai < session.answers.length - 1 ? "border-bottom" : ""}`}>
                    <div className="flex-shrink-0 text-muted" style={{ minWidth: 22 }}>
                      <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-circle" style={{ width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>{ai + 1}</span>
                    </div>
                    <div className="flex-grow-1">
                      <div className="text-muted" style={{ fontSize: 12 }}>{a.questionTitle}</div>
                      <div className="fw-semibold" style={{ fontSize: 14 }}>{getAnswerDisplayText(question, a)}</div>
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      ))}
      </div>
    </div>
  );
};

// ─── Tab 4: Phone Book ───────────────────────────────────────────────────────

export const PhoneBookTab = ({ formId, studentId, subjects, canEdit, onFormEnded }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [settingDefaultId, setSettingDefaultId] = useState(null);
  const [form, setForm] = useState({ phoneNumber: "", subjectId: "", setAsDefault: false });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchContacts = useCallback(() => {
    setLoading(true);
    getStudentContacts(formId, studentId)
      .then((d) => setContacts(Array.isArray(d) ? d : []))
      .catch(() => setContacts([]))
      .finally(() => setLoading(false));
  }, [formId, studentId]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);
  useEffect(() => {
    if (!canEdit) {
      setShowForm(false);
      setConfirmDelete(null);
    }
  }, [canEdit]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!canEdit) return;
    if (!form.phoneNumber.trim()) { toast.error("شماره تلفن الزامی است"); return; }
    if (!form.subjectId) { toast.error("نوع تماس را انتخاب کنید"); return; }
    setSubmitting(true);
    try {
      await addStudentContact(formId, studentId, {
        phoneNumber: form.phoneNumber.trim(),
        subjectId: Number(form.subjectId),
        setAsDefault: form.setAsDefault,
      });
      toast.success("شماره با موفقیت افزوده شد");
      setForm({ phoneNumber: "", subjectId: "", setAsDefault: false });
      setShowForm(false);
      fetchContacts();
    } catch (error) {
      onFormEnded?.(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (contactId) => {
    if (!canEdit) return;
    setSettingDefaultId(contactId);
    try {
      await setDefaultContact(formId, studentId, contactId);
      toast.success("شماره پیش‌فرض تغییر کرد");
      fetchContacts();
    } catch (error) {
      onFormEnded?.(error);
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleDelete = async (contactId) => {
    if (!canEdit) return;
    setDeletingId(contactId);
    try {
      await deleteStudentContact(formId, studentId, contactId);
      toast.success("شماره حذف شد");
      fetchContacts();
    } catch (error) {
      onFormEnded?.(error);
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="mb-0 fw-semibold text-muted">
          <i className="bx bx-phone-square me-2 text-primary" />
          شماره‌های ثبت‌شده
          {contacts.length > 0 && (
            <Badge color="primary" pill className="ms-2">{contacts.length}</Badge>
          )}
        </h6>
        <Button
          color={showForm ? "light" : "primary"}
          size="sm"
          disabled={!canEdit}
          onClick={() => setShowForm((v) => !v)}
          className="d-flex align-items-center gap-1"
        >
          <i className={`bx ${showForm ? "bx-x" : "bx-plus"}`} />
          {showForm ? "انصراف" : "افزودن شماره"}
        </Button>
      </div>

      {/* Inline Add Form */}
      {showForm && (
        <div className="border rounded-3 p-3 mb-3 bg-light">
          <form onSubmit={handleAdd}>
            <Row className="g-2 align-items-end">
              <Col xs={12} sm={4}>
                <Label className="fw-semibold small mb-1">نوع تماس</Label>
                <Input
                  type="select"
                  bsSize="sm"
                  value={form.subjectId}
                  onChange={(e) => setForm((p) => ({ ...p, subjectId: e.target.value }))}
                >
                  <option value="">انتخاب کنید...</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.subject}</option>
                  ))}
                </Input>
              </Col>
              <Col xs={12} sm={4}>
                <Label className="fw-semibold small mb-1">شماره تلفن</Label>
                <Input
                  type="text"
                  bsSize="sm"
                  placeholder="09xxxxxxxxx"
                  value={form.phoneNumber}
                  onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                  maxLength={11}
                />
              </Col>
              <Col xs={12} sm={3}>
                <div className="form-check mt-sm-4 pt-sm-1">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="setAsDefault"
                    checked={form.setAsDefault}
                    onChange={(e) => setForm((p) => ({ ...p, setAsDefault: e.target.checked }))}
                  />
                  <label className="form-check-label small" htmlFor="setAsDefault">
                    شماره پیش‌فرض
                  </label>
                </div>
              </Col>
              <Col xs={12} sm={1} className="d-flex align-items-end">
                <Button
                  type="submit"
                  color="success"
                  size="sm"
                  disabled={submitting}
                  className="w-100"
                  title="ذخیره"
                >
                  {submitting ? <Spinner size="sm" /> : <i className="bx bx-check font-size-16" />}
                </Button>
              </Col>
            </Row>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-5"><Spinner color="primary" /></div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-5">
          <div className="rounded-circle d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 mb-3" style={{ width: 72, height: 72 }}>
            <i className="bx bx-phone-square font-size-28 text-primary" />
          </div>
          <h6 className="text-muted">هنوز شماره‌ای اضافه نشده</h6>
          {!showForm && (
            <Button color="primary" size="sm" className="mt-2" disabled={!canEdit} onClick={() => setShowForm(true)}>
              <i className="bx bx-plus me-1" />افزودن اولین شماره
            </Button>
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <Table className="table-hover align-middle mb-0" dir="rtl">
            <thead className="table-light">
              <tr>
                <th style={{ width: 50 }}>#</th>
                <th>نوع تماس</th>
                <th>شماره تلفن</th>
                <th style={{ width: 100 }} className="text-center">وضعیت</th>
                <th style={{ width: 120 }} className="text-center">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c, idx) => (
                <tr key={c.id} className={c.isDefault ? "table-success bg-opacity-50" : ""}>
                  <td className="text-muted small">{idx + 1}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10" style={{ width: 28, height: 28 }}>
                        <i className="bx bx-user-circle text-primary" style={{ fontSize: 15 }} />
                      </div>
                      <span className="fw-semibold" style={{ fontSize: 14 }}>{c.subjectName || "—"}</span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {c.isDefault && (
                        <i className="bx bx-phone text-success font-size-16" title="شماره پیش‌فرض" />
                      )}
                      <span className="font-monospace" style={{ fontSize: 14, letterSpacing: 1 }}>
                        {c.phoneNumber}
                      </span>
                    </div>
                  </td>
                  <td className="text-center">
                    {c.isDefault ? (
                      <Badge color="success" pill className="px-3 py-1">
                        <i className="bx bx-star-full me-1" />پیش‌فرض
                      </Badge>
                    ) : (
                      <Badge color="light" pill className="text-muted px-3 py-1">عادی</Badge>
                    )}
                  </td>
                  <td className="text-center">
                    <div className="d-flex gap-1 justify-content-center">
                      {!c.isDefault && (
                        <Button
                          color="warning"
                          size="sm"
                          outline
                          disabled={!canEdit || settingDefaultId === c.id}
                          onClick={() => handleSetDefault(c.id)}
                          title="تنظیم به عنوان پیش‌فرض"
                        >
                          {settingDefaultId === c.id
                            ? <Spinner size="sm" />
                            : <i className="bx bx-star" />}
                        </Button>
                      )}
                      <Button
                        color="danger"
                        size="sm"
                        outline
                        disabled={!canEdit || deletingId === c.id}
                        onClick={() => setConfirmDelete(c)}
                        title="حذف شماره"
                      >
                        {deletingId === c.id
                          ? <Spinner size="sm" />
                          : <i className="bx bx-trash" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!confirmDelete} toggle={() => setConfirmDelete(null)} centered size="sm">
        <ModalHeader toggle={() => setConfirmDelete(null)}>تأیید حذف</ModalHeader>
        <ModalBody className="text-center py-4">
          <div className="rounded-circle d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 mb-3" style={{ width: 56, height: 56 }}>
            <i className="bx bx-trash text-danger font-size-24" />
          </div>
          <p className="mb-1">آیا می‌خواهید این شماره را حذف کنید؟</p>
          <p className="fw-bold font-monospace text-danger mb-4">{confirmDelete?.phoneNumber}</p>
          <div className="d-flex gap-2 justify-content-center">
            <Button color="light" onClick={() => setConfirmDelete(null)}>انصراف</Button>
            <Button
              color="danger"
              disabled={!canEdit || deletingId === confirmDelete?.id}
              onClick={() => handleDelete(confirmDelete.id)}
            >
              {deletingId === confirmDelete?.id ? <Spinner size="sm" className="me-1" /> : <i className="bx bx-trash me-1" />}
              حذف
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

// ─── Stat Mini Card ───────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon, color, pulse }) => (
  <Col xs={6} md={3}>
    <div className={`rounded-3 p-3 text-center h-100 position-relative overflow-hidden`} style={{ background: `linear-gradient(135deg, var(--bs-${color}-bg-subtle, rgba(0,0,0,.05)) 0%, rgba(255,255,255,.6) 100%)`, border: `1px solid rgba(0,0,0,.06)` }}>
      {pulse && (
        <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-success" style={{ fontSize: 8, padding: "3px 5px" }}>
          <span className="visually-hidden">فعال</span>
          ●
        </span>
      )}
      <i className={`bx ${icon} font-size-20 text-${color} mb-1 d-block`} />
      <div className="fw-bold" style={{ fontSize: 16 }}>{value}</div>
      <div className="text-muted" style={{ fontSize: 11 }}>{label}</div>
    </div>
  </Col>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const StudentProfile = () => {
  const { formId, studentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [subjects, setSubjects] = useState([]);

  const [activeTab, setActiveTab] = useState("info");
  const [refreshKey, setRefreshKey] = useState(0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [answerCallContext, setAnswerCallContext] = useState(null);
  const [callTrackingWarningOpen, setCallTrackingWarningOpen] = useState(false);
  const [queuedCall, setQueuedCall] = useState(null);
  const queuedTraceRequest = useRef(null);
  const [calling, setCalling] = useState(false);
  const [callCooldownSeconds, setCallCooldownSeconds] = useState(0);
  const cooldown = useRef(false);
  const accessDeniedHandled = useRef(false);

  const canEdit = form?.canEdit === true;
  const canCall = form?.canCall === true;
  const isReadOnly = Boolean(form) && (form.isClosed === true || !canEdit);

  const handleFormEnded = useCallback((error) => {
    if (!isSupportFormEndedError(error)) return false;
    setForm((current) => closeSupportForm(current, error));
    return true;
  }, []);

  document.title = "پروفایل دانش‌آموز | داشبورد آیسوق";

  const fetchProfile = useCallback(() => {
    setProfileLoading(true);
    setProfile(null);
    return getStudentProfile(formId, studentId)
      .then(setProfile)
      .catch((error) => {
        setProfile(null);
        if (error?.response?.status === 403 && !accessDeniedHandled.current) {
          accessDeniedHandled.current = true;
          setForm(null);
          toast.error("این فرم برای شما فعال نیست");
          const schoolId = location.state?.schoolId;
          navigate(schoolId ? `/adviser-calls/schools/${schoolId}/planned-calls` : "/adviser-calls", { replace: true });
        }
      })
      .finally(() => setProfileLoading(false));
  }, [formId, studentId, location.state?.schoolId, navigate]);

  useEffect(() => {
    fetchProfile();
    getAdviserSupportFormDetail(formId).then(setForm).catch((error) => {
      if (isSupportFormEndedError(error)) {
        setForm((current) => closeSupportForm(current, error));
        return;
      }
      if (error?.response?.status === 403 && !accessDeniedHandled.current) {
        accessDeniedHandled.current = true;
        setProfile(null);
        setForm(null);
        toast.error("این فرم برای شما فعال نیست");
        const schoolId = location.state?.schoolId;
        navigate(schoolId ? `/adviser-calls/schools/${schoolId}/planned-calls` : "/adviser-calls", { replace: true });
      }
    });
    getContactSubjects().then((d) => setSubjects(Array.isArray(d) ? d : [])).catch(() => {});
  }, [formId, studentId, fetchProfile]);

  useEffect(() => { accessDeniedHandled.current = false; }, [formId, studentId]);

  useEffect(() => () => queuedTraceRequest.current?.abort(), []);

  useEffect(() => {
    if (callCooldownSeconds <= 0) {
      cooldown.current = false;
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCallCooldownSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [callCooldownSeconds]);

  useEffect(() => {
    setAnswerCallContext(null);
    setDrawerOpen(false);
    setCallCooldownSeconds(0);
    cooldown.current = false;
  }, [formId, studentId]);

  const handleCall = async () => {
    if (!canCall || cooldown.current || calling) return;
    cooldown.current = true;
    setCallCooldownSeconds(CALL_COOLDOWN_SECONDS);
    setCalling(true);
    try {
      const result = await makeCall({ supportFormId: Number(formId), studentId: Number(studentId) });
      if (isQueuedCallResponse(result)) {
        const queued = normalizeQueuedCall(result);
        const context = createAnswerCallContext({ formId, studentId, voipCallId: queued.voipCallId, isNewCall: true });
        if (!context) throw new Error("voipCallId is required");
        setQueuedCall(queued);
        setAnswerCallContext(context);
        toast.success("درخواست تماس در صف قرار گرفت");
        queuedTraceRequest.current?.abort();
        const controller = new AbortController();
        queuedTraceRequest.current = controller;
        pollQueuedCallTrace({ traceId: queued.traceId, getTrace: getCallTrace, signal: controller.signal })
          .then((trace) => {
            if (controller.signal.aborted) return;
            fetchProfile();
            setRefreshKey((key) => key + 1);
            if (trace?.status === "completed") {
              setDrawerOpen(true);
            }
          })
          .catch(() => {});
        return;
      }
      if (!hasValidCallGroupId(result?.callGroupId)) {
        setCallTrackingWarningOpen(true);
        return;
      }
      toast.success("تماس برقرار شد");
      const context = createAnswerCallContext({ formId, studentId, voipCallId: result?.voipCallId, isNewCall: true });
      if (!context) throw new Error("voipCallId is required");
      setAnswerCallContext(context);
      setDrawerOpen(true);
    } catch (error) {
      handleFormEnded(error);
      // The cooldown intentionally remains active after failed attempts as well.
    } finally {
      setCalling(false);
    }
  };

  const handleAnswerSubmitted = () => {
    fetchProfile();
    setRefreshKey((k) => k + 1);
  };

  const handleFillAnswers = async (selectedVoipCallId = null) => {
    try {
      const requestedCallId = ["number", "string"].includes(typeof selectedVoipCallId) && Number(selectedVoipCallId) > 0
        ? Number(selectedVoipCallId)
        : null;
      const currentContext = !requestedCallId && answerCallContext?.formId === Number(formId) && answerCallContext?.studentId === Number(studentId)
        ? answerCallContext
        : null;
      const callId = requestedCallId || currentContext?.voipCallId || profile?.lastVoipCallId || (await getStudentCallLogs({
        formId: Number(formId),
        studentId: Number(studentId),
        page: 1,
        limit: 1,
      })).items?.[0]?.voipCallId;
      if (!callId) {
        toast.error("تماس معتبر پیدا نشد");
        return;
      }
      const context = currentContext || createAnswerCallContext({ formId, studentId, voipCallId: callId });
      if (!context) {
        toast.error("تماس معتبر پیدا نشد");
        return;
      }
      setAnswerCallContext(context);
      setDrawerOpen(true);
    } catch {
      // handled by httpClient
    }
  };

  const breadcrumbTitle = profile?.supportFormTitle || `فرم ${formId}`;
  const initials = profile ? getInitials(profile.name) : "؟";
  const studentListPath = getAdviserStudentListPath(formId, location.state?.returnTo);

  const tabs = [
    { id: "info",      label: "اطلاعات",       icon: "bx-user-circle"   },
    { id: "calls",     label: "لاگ تماس‌ها",   icon: "bx-phone-call"    },
    { id: "answers",   label: "پاسخنامه‌ها",   icon: "bx-notepad"       },
    { id: "phonebook", label: "دفترچه تلفن",   icon: "bx-phone-square"  },
  ];

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs
          title={breadcrumbTitle}
          breadcrumbItem={profile?.name || "پروفایل دانش‌آموز"}
          titleLink={studentListPath}
        />

        {isReadOnly && <Alert color="warning" className="d-flex align-items-center gap-2"><i className="bx bx-lock-alt font-size-18" />{SUPPORT_FORM_READ_ONLY_MESSAGE}</Alert>}

        {/* ── Hero Card ──────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm mb-4 overflow-hidden">
          <div style={{ background: "linear-gradient(135deg, #3b5de7 0%, #45b3e0 100%)", padding: "28px 28px 0" }}>
            <div className="d-flex align-items-end gap-4 flex-wrap">
              {/* Avatar */}
              <div className="flex-shrink-0 position-relative" style={{ marginBottom: -28 }}>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow"
                  style={{ width: 88, height: 88, fontSize: 28, background: "rgba(255,255,255,.25)", border: "4px solid rgba(255,255,255,.5)", letterSpacing: 1 }}
                >
                  {profileLoading ? <Spinner color="light" size="sm" /> : initials}
                </div>
              </div>

              {/* Name + meta */}
              <div className="flex-grow-1 text-white pb-4">
                {profileLoading ? (
                  <div className="placeholder-glow"><span className="placeholder col-4 rounded" style={{ height: 24 }} /></div>
                ) : (
                  <>
                    <h3 className="mb-1 fw-bold text-white">{profile?.name || "—"}</h3>
                    <div className="d-flex flex-wrap gap-3" style={{ opacity: .85, fontSize: 13 }}>
                      {profile?.phone && <span><i className="bx bx-phone me-1" />{profile.phone}</span>}
                      {profile?.code && <span><i className="bx bx-barcode me-1" />{profile.code}</span>}
                      {profile?.instituteName && <span><i className="bx bx-building me-1" />{profile.instituteName}</span>}
                      {profile?.city && <span><i className="bx bx-map me-1" />{profile.city}</span>}
                    </div>
                  </>
                )}
              </div>

              {/* Action buttons */}
              <div className="d-flex gap-2 pb-4 flex-shrink-0">
                <Button
                  color="light"
                  size="sm"
                  onClick={() => navigate(studentListPath)}
                  className="d-flex align-items-center gap-1"
                >
                  <i className="bx bx-arrow-back" />
                  بازگشت
                </Button>
                <Button
                  color="warning"
                  size="sm"
                  onClick={() => handleFillAnswers()}
                  disabled={profileLoading}
                  className="d-flex align-items-center gap-1"
                >
                  <i className={`bx ${canEdit ? "bx-edit" : "bx-show"}`} />
                  {canEdit ? "پاسخنامه" : "مشاهده پاسخنامه"}
                </Button>
                <Button
                  color="success"
                  onClick={handleCall}
                  disabled={!canCall || calling || profileLoading || callCooldownSeconds > 0}
                  className="d-flex align-items-center gap-2 px-4"
                  style={{ fontWeight: 600 }}
                >
                  {callCooldownSeconds > 0 ? (
                    <>
                      {calling ? <Spinner size="sm" /> : <i className="bx bx-time-five font-size-16" />}
                      تماس مجدد تا {callCooldownSeconds.toLocaleString("fa-IR")} ثانیه
                    </>
                  ) : (
                    <><i className="bx bx-phone-call font-size-16" />برقراری تماس</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <CardBody className="pt-4">
            <Row className="g-3">
              <StatCard label="تعداد تماس‌ها" value={profileLoading ? "…" : (profile?.totalCalls ?? 0)} icon="bx-phone" color="primary" />
              <StatCard label="آخرین تماس" value={profileLoading ? "…" : formatJalali(profile?.lastCallAt, false)} icon="bx-time-five" color="info" />
              <StatCard label="پاسخنامه" value={profileLoading ? "…" : (profile?.hasAnswers ? "دارد" : "ندارد")} icon="bx-notepad" color={profile?.hasAnswers ? "success" : "danger"} pulse={profile?.hasAnswers} />
              <StatCard label="فرم تماس" value={profileLoading ? "…" : (profile?.supportFormTitle || "—")} icon="bx-list-ul" color="secondary" />
            </Row>
          </CardBody>
        </Card>

        {/* ── Tabs ───────────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <div className="border-bottom px-4 pt-3">
            <Nav tabs className="nav-tabs-custom border-0 gap-1">
              {tabs.map(({ id, label, icon }) => (
                <NavItem key={id}>
                  <NavLink
                    className={`d-flex align-items-center gap-2 px-3 py-2 rounded-top ${activeTab === id ? "active fw-semibold" : "text-muted"}`}
                    onClick={() => setActiveTab(id)}
                    style={{ cursor: "pointer", fontSize: 14, border: "none", background: "none" }}
                  >
                    <i className={`bx ${icon} font-size-16`} />
                    {label}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
          </div>

          <CardBody className="p-4">
            <TabContent activeTab={activeTab}>
              <TabPane tabId="info">
                <StudentInfoTab profile={profile} loading={profileLoading} />
              </TabPane>
              <TabPane tabId="calls">
                {activeTab === "calls" && (
                    <CallLogsTab formId={formId} studentId={studentId} refreshKey={refreshKey} onOpenAnswers={handleFillAnswers} />
                )}
              </TabPane>
              <TabPane tabId="answers">
                {activeTab === "answers" && (
                  <AnswersTab
                    formId={formId}
                    studentId={studentId}
                    form={form}
                    previousAnswers={profile?.previousAnswers}
                    tagValues={profile?.tagValues}
                    refreshKey={refreshKey}
                    onFillAnswers={handleFillAnswers}
                    canEdit={canEdit}
                  />
                )}
              </TabPane>
              <TabPane tabId="phonebook">
                {activeTab === "phonebook" && (
                  <PhoneBookTab
                    formId={formId}
                    studentId={studentId}
                    subjects={subjects}
                    canEdit={canEdit}
                    onFormEnded={handleFormEnded}
                  />
                )}
              </TabPane>
            </TabContent>
          </CardBody>
        </Card>
      </div>

      {queuedCall ? <Alert color="info" className="mt-3">درخواست تماس در صف قرار دارد (شناسه صف: {queuedCall.queueJobId ?? "—"}، پیشرفت: {queuedCall.progress.toLocaleString("fa-IR")}٪). {queuedCall.traceId ? <Link to={`/voip/call-traces?traceId=${queuedCall.traceId}`}>مشاهده رهگیری</Link> : null}</Alert> : null}

      <AnswerDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        studentName={profile?.name}
        studentPhone={profile?.phone}
        previousAnswers={profile?.previousAnswers}
        form={form}
        callContext={answerCallContext}
        onSubmitted={handleAnswerSubmitted}
        canEdit={canEdit}
        onFormEnded={handleFormEnded}
      />
      <CallTrackingWarningModal
        open={callTrackingWarningOpen}
        onAcknowledge={() => setCallTrackingWarningOpen(false)}
      />
    </div>
  );
};

export default StudentProfile;
