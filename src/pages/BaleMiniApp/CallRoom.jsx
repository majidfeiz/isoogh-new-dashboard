import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert, Button, Card, CardBody, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap";
import { createBaleAdapter, createIdempotencyKey } from "./baleAdapter.js";
import { getBaleCallDraft, getBaleCallStatus, saveBaleCallDraft, startBaleCall, submitBaleCall } from "../../services/baleService.jsx";
import { logBaleClientEvent } from "./baleTelemetry.js";
import { baleCallErrorText, isCallReady, shouldRotateCallKey, validateCallPayload } from "./callRoomUtils.js";
import { buildCallAnswerPayload, normalizeCallDraftAnswers } from "../../services/baleCallMapper.js";

const terminal = new Set(["ended", "failed", "completed"]);
const labels = { pending: "در صف برقراری", initiated: "تماس برقرار شده", ended: "تماس پایان یافته", failed: "تماس ناموفق" };

function Question({ question, value, onChange }) {
  const options = question.options || [];
  const title = question.text || question.title || "سؤال بدون عنوان";
  if (question.type !== 0) return <fieldset><legend>{title}{question.required && " *"}</legend>{options.map((option) => {
    const inputId = `question-${question.id}-option-${option.id}`;
    const current = Array.isArray(value) ? value : [];
    return <Label className="bale-question-option" for={inputId} key={option.id}><Input id={inputId} type={question.multiChoice ? "checkbox" : "radio"} name={question.multiChoice ? undefined : `question-${question.id}`} checked={question.multiChoice ? current.includes(option.id) : value === option.id} onChange={(event) => onChange(question.multiChoice ? (event.target.checked ? [...current, option.id] : current.filter((item) => item !== option.id)) : option.id)} /><span>{option.label || "گزینه بدون عنوان"}</span></Label>;
  })}</fieldset>;
  return <div><Label for={`question-${question.id}`}>{title}{question.required && " *"}</Label><Input id={`question-${question.id}`} type="textarea" value={value || ""} onChange={(event) => onChange(event.target.value)} /></div>;
}

export default function CallRoom({ bootstrap }) {
  const location = useLocation(); const navigate = useNavigate(); const context = location.state || {}; const bale = useMemo(() => createBaleAdapter(), []);
  const [call, setCall] = useState(context.call || null); const [status, setStatus] = useState(call?.progress || "idle");
  const [answers, setAnswers] = useState({}); const [version, setVersion] = useState(0); const [dirty, setDirty] = useState(false);
  const [successful, setSuccessful] = useState(null); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [complete, setComplete] = useState(false);
  const [confirmingCall, setConfirmingCall] = useState(false);
  const callKey = useRef(createIdempotencyKey()); const submitKey = useRef(createIdempotencyKey()); const saveTimer = useRef();
  const questions = useMemo(() => context.questions || context.form?.questions || [], [context.questions, context.form?.questions]);
  const payload = useMemo(() => ({ schoolId: context.schoolId || bootstrap.activeSchoolId, supportFormId: context.supportFormId || context.form?.id, studentId: context.studentId || context.student?.id, voipLineId: context.voipLineId }), [context, bootstrap.activeSchoolId]);
  useEffect(() => { const before = (event) => { if (dirty && !complete) { event.preventDefault(); event.returnValue = ""; } }; window.addEventListener("beforeunload", before); if (dirty) bale.enableClosingConfirmation(); return () => { window.removeEventListener("beforeunload", before); bale.disableClosingConfirmation(); }; }, [dirty, complete, bale]);
  useEffect(() => { if (!call?.voipCallId) return; getBaleCallDraft(call.voipCallId).then((draft) => { setVersion(draft.version || 0); setAnswers(normalizeCallDraftAnswers(draft.answers, questions)); }).catch(() => {}); }, [call?.voipCallId, questions]);
  useEffect(() => { if (questions.some((question) => question.options?.some((option) => option.labelMissing))) logBaleClientEvent("question_option_label_missing", { level: "error", message: "A call question option has no label", context: { stage: "call", route: "/call-room" } }); }, [questions]);
  useEffect(() => { if (!call?.voipCallId || terminal.has(status)) return; let stopped = false; let timer; let delay = 1500; const controller = new AbortController(); const poll = async () => { if (document.hidden) { timer = setTimeout(poll, delay); return; } try { const next = await getBaleCallStatus(call.voipCallId, controller.signal); if (stopped) return; setStatus(next.status || next.progress); if (!terminal.has(next.status || next.progress)) { delay = Math.min(10000, Math.round(delay * 1.5)); timer = setTimeout(poll, delay); } } catch { if (!stopped) timer = setTimeout(poll, Math.min(10000, delay * 2)); } }; poll(); return () => { stopped = true; clearTimeout(timer); controller.abort(); }; }, [call?.voipCallId, status]);
  useEffect(() => { if (!dirty || !call?.voipCallId) return; clearTimeout(saveTimer.current); saveTimer.current = setTimeout(async () => { try { const draft = await saveBaleCallDraft(call.voipCallId, { schoolId: payload.schoolId, supportFormId: payload.supportFormId, studentId: payload.studentId, version, answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId: Number(questionId), answer })) }); setVersion(draft.version); setDirty(false); } catch (caught) { if (caught?.response?.status === 409) { const latest = await getBaleCallDraft(call.voipCallId); setError("پیش‌نویس در دستگاه دیگری تغییر کرده است. نسخه جدید دریافت شد؛ تغییرات را بررسی کنید."); setVersion(latest.version); setAnswers(normalizeCallDraftAnswers(latest.answers, questions)); } } }, 800); return () => clearTimeout(saveTimer.current); }, [answers, dirty, call?.voipCallId, payload, questions, version]);
  const start = async () => {
    const missing = validateCallPayload(payload);
    if (missing.length) { setError(`اطلاعات لازم تماس ناقص است: ${missing.join("، ")}`); return; }
    if (!isCallReady(context.readiness)) { setError(context.readiness?.message || "وضعیت آمادگی خط دریافت نشده است؛ صفحه دانش‌آموز را دوباره باز کنید."); return; }
    setBusy(true); setError("");
    logBaleClientEvent("call_start_clicked", { context: { stage: "call", route: "/call-room" } });
    try {
      const next = await startBaleCall(payload, callKey.current);
      if (!next?.callGroupId) { const invalid = new Error("invalid-call-response"); invalid.response = { status: 502, data: { data: { message: "پاسخ سرویس تماس معتبر نبود.", traceId: next?.traceId, correlationId: next?.correlationId } } }; throw invalid; }
      setCall(next); setStatus(next.progress || "initiated"); setConfirmingCall(false);
      logBaleClientEvent("call_start_succeeded", { context: { stage: "call", route: "/call-room" } });
    } catch (caught) {
      const failure = baleCallErrorText(caught, "تماس برقرار نشد. آمادگی خط و شماره‌ها را بررسی کنید.");
      const references = [failure.traceId && `Trace: ${failure.traceId}`, failure.correlationId && `Correlation: ${failure.correlationId}`].filter(Boolean).join(" · ");
      setError(references ? `${failure.text} (${references})` : failure.text);
      if (shouldRotateCallKey(caught)) callKey.current = createIdempotencyKey();
      logBaleClientEvent("call_start_failed", { level: "error", message: failure.text, context: { stage: "call", route: "/call-room", status: caught?.response?.status || 0 } });
    } finally { setBusy(false); }
  };
  const submit = async () => { if (successful == null) { setError("نتیجه تماس را مشخص کنید."); return; } const missing = questions.filter((question) => question.required && (answers[question.id] == null || answers[question.id] === "" || answers[question.id]?.length === 0)); if (successful && missing.length) { setError("پاسخ سؤال‌های الزامی را کامل کنید."); return; } setBusy(true); try { await submitBaleCall(call.voipCallId, { ...payload, voipLineId: undefined, callSuccessful: successful, answers: buildCallAnswerPayload(questions, answers) }, submitKey.current); setDirty(false); setComplete(true); } catch (caught) { setError(caught?.response?.data?.message || "ثبت نهایی انجام نشد؛ دوباره تلاش کنید."); } finally { setBusy(false); } };
  if (complete) return <main className="bale-center"><i className="bx bx-check-circle bale-success" /><h1>نتیجه ثبت شد</h1><Button color="primary" onClick={() => navigate(-1)}>دانش‌آموز بعدی</Button></main>;
  return <main><h1>اتاق تماس</h1><div className="bale-breadcrumb">{context.school?.name} ← {context.form?.title} ← {context.student?.name}</div><Card><CardBody><h2>{context.student?.name || "دانش‌آموز"}</h2><p>{context.student?.maskedPhone || "شماره پنهان"} · {context.student?.shift || "شیفت نامشخص"}</p><p>وضعیت: {context.student?.status ?? "—"} · آخرین تماس: {context.student?.lastCallAt ? new Date(context.student.lastCallAt).toLocaleString("fa-IR") : "بدون تماس"}</p>{Array.isArray(context.contacts) && context.contacts.length > 0 && <div className="mb-3"><strong>شماره‌های مجاز</strong>{context.contacts.map((contact) => <div key={contact.id || contact.maskedPhone}>{contact.title || "تماس"}: {contact.maskedPhone || "پنهان"}{contact.isDefault ? " (پیش‌فرض)" : ""}</div>)}</div>}<p className={isCallReady(context.readiness) ? "text-success" : "text-danger"}>آمادگی خط: {context.readiness?.message || "وضعیت آمادگی خط دریافت نشده است"}</p>{!call && <Button color="primary" block disabled={busy || !isCallReady(context.readiness)} onClick={() => setConfirmingCall(true)}>{busy ? <Spinner size="sm" /> : "برقراری تماس"}</Button>}{call && <Alert color="info"><strong>{labels[status] || status || call.message}</strong>{call.traceId && <small className="d-block">Trace: {call.traceId}</small>}{call.correlationId && <small className="d-block">Correlation: {call.correlationId}</small>}</Alert>}</CardBody></Card>{error && <Alert color="danger">{String(error)}</Alert>}{call && <section className="bale-questions">{questions.map((question) => <Question key={question.id} question={question} value={answers[question.id]} onChange={(value) => { setAnswers((old) => ({ ...old, [question.id]: value })); setDirty(true); }} />)}<fieldset><legend>نتیجه تماس *</legend><Label check><Input type="radio" checked={successful === true} onChange={() => setSuccessful(true)} /> موفق</Label><Label check className="ms-4"><Input type="radio" checked={successful === false} onChange={() => setSuccessful(false)} /> ناموفق</Label></fieldset><Button color="success" block disabled={busy} onClick={submit}>ثبت نهایی</Button></section>}<Modal isOpen={confirmingCall} toggle={() => !busy && setConfirmingCall(false)} centered><ModalHeader toggle={() => !busy && setConfirmingCall(false)}>تأیید برقراری تماس</ModalHeader><ModalBody>تماس با «{context.student?.name || "دانش‌آموز"}» از طریق خط مجموعه برقرار شود؟{error && <Alert color="danger" className="mt-3 mb-0">{String(error)}</Alert>}</ModalBody><ModalFooter><Button outline disabled={busy} onClick={() => setConfirmingCall(false)}>انصراف</Button><Button color="primary" disabled={busy} onClick={start}>{busy ? <Spinner size="sm" /> : "شروع تماس"}</Button></ModalFooter></Modal></main>;
}
