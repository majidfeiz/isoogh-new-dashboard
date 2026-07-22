import React, { useEffect, useState } from "react";
import { Button, Modal, ModalBody, ModalHeader, Spinner } from "reactstrap";
import { getAnswerSheetCall } from "../../services/answerSheetService.jsx";
import { formatDuration, formatJalaliDateTime, getErrorMessage } from "./answerSheetUtils.js";

const field = (label, value) => <div className="col-md-4"><small className="text-muted d-block">{label}</small><strong>{value ?? "—"}</strong></div>;
const isAudio = (file) => String(file?.type || file?.mimeType || file?.url || "").toLowerCase().match(/audio|mp3|wav|ogg|m4a/);

const AnswerSheetCallModal = ({ sessionId, isOpen, toggle }) => {
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!isOpen || !sessionId) return undefined;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    getAnswerSheetCall(sessionId, { signal: controller.signal })
      .then(setCall)
      .catch((err) => { if (err?.code !== "ERR_CANCELED") setError(getErrorMessage(err, "اطلاعات تماس")); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [isOpen, retry, sessionId]);

  const files = Array.isArray(call?.files) ? call.files : [];
  return <Modal isOpen={isOpen} toggle={toggle} size="lg" centered scrollable>
    <ModalHeader toggle={toggle}>مشاهده تماس</ModalHeader>
    <ModalBody>
      {loading && <div className="text-center py-5"><Spinner color="primary" /></div>}
      {!loading && error && <div className="alert alert-danger text-center">{error}<div><Button color="danger" outline size="sm" className="mt-3" onClick={() => setRetry((x) => x + 1)}>تلاش دوباره</Button></div></div>}
      {!loading && !error && !call && <div className="text-center text-muted py-5">اطلاعات CDR برای این نوبت تماس موجود نیست.</div>}
      {!loading && !error && call && <>
        <div className="row g-3 bg-light rounded p-3 mb-4">
          {field("شماره مبدا", call.source || call.src || call.from)}
          {field("شماره مقصد", call.destination || call.dst || call.to)}
          {field("وضعیت تماس", call.disposition || "—")}
          {field("شروع", formatJalaliDateTime(call.startedAt || call.startAt || call.start))}
          {field("پایان", formatJalaliDateTime(call.endedAt || call.endAt || call.end))}
          {field("مدت", formatDuration(call.duration ?? call.durationSeconds))}
          {field("زمان انتظار", formatDuration(call.waitTime ?? call.waitTimeSeconds))}
          {field("زمان پخش", formatDuration(call.playtime ?? call.playTime ?? call.playtimeSeconds))}
        </div>
        <h6 className="mb-3">فایل‌های مکالمه</h6>
        {!files.length ? <div className="text-muted border rounded p-4 text-center">فایل ضبطی برای این تماس موجود نیست.</div> :
          <div className="d-grid gap-3">{files.map((file, index) => <div className="border rounded p-3" key={file.id ?? file.url ?? index}>
            <div className="fw-semibold mb-2">{file.title || file.name || `فایل ${index + 1}`}</div>
            {isAudio(file) && file.url ? <audio controls preload="metadata" src={file.url} className="w-100">مرورگر شما پخش صوت را پشتیبانی نمی‌کند.</audio> : <span className="text-muted">پیش‌نمایش صوتی موجود نیست.</span>}
            {file.url && <div className="mt-2"><a href={file.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">دریافت فایل مجاز</a></div>}
          </div>)}</div>}
      </>}
    </ModalBody>
  </Modal>;
};

export default AnswerSheetCallModal;
