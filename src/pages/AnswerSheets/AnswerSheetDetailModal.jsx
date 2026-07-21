import React, { useEffect, useState } from "react";
import { Badge, Button, Modal, ModalBody, ModalHeader, Spinner } from "reactstrap";
import { getAnswerSheet } from "../../services/answerSheetService.jsx";
import { formatJalaliDateTime, getErrorMessage } from "./answerSheetUtils.js";

const AnswerSheetDetailModal = ({ sessionId, isOpen, toggle }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!isOpen || !sessionId) return undefined;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    getAnswerSheet(sessionId, { signal: controller.signal })
      .then(setData)
      .catch((err) => { if (err?.code !== "ERR_CANCELED") setError(getErrorMessage(err, "پاسخ‌نامه")); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [isOpen, retry, sessionId]);

  const answerValue = (answer) => {
    const value = answer?.resolvedAnswer;
    if (Array.isArray(value)) return value;
    if (Array.isArray(answer?.resolvedAnswers)) return answer.resolvedAnswers;
    return value == null || String(value).trim() === "" ? [] : [String(value)];
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl" centered scrollable>
      <ModalHeader toggle={toggle}>مشاهده پاسخ‌ها</ModalHeader>
      <ModalBody>
        {loading && <div className="py-5 text-center"><Spinner color="primary" /><div className="placeholder-glow mt-3"><span className="placeholder col-8" /></div></div>}
        {!loading && error && <div className="alert alert-danger text-center">{error}<div><Button color="danger" outline size="sm" className="mt-3" onClick={() => setRetry((x) => x + 1)}>تلاش دوباره</Button></div></div>}
        {!loading && !error && data && <>
          <div className="bg-light rounded p-3 mb-4">
            <div className="row g-3">
              <div className="col-md-3"><small className="text-muted d-block">فرم تماس</small><strong>{data.session?.supportFormTitle || "—"}</strong></div>
              <div className="col-md-3"><small className="text-muted d-block">دانش‌آموز</small><strong>{data.session?.studentName || "—"}</strong></div>
              <div className="col-md-3"><small className="text-muted d-block">مشاور</small><strong>{data.session?.adviserName || "—"}</strong></div>
              <div className="col-md-3"><small className="text-muted d-block">زمان ثبت</small><strong>{formatJalaliDateTime(data.session?.submittedAt)}</strong></div>
            </div>
          </div>
          {!data.answers.length ? <div className="text-center text-muted py-5"><i className="bx bx-message-square-x fs-1 d-block mb-2" />پاسخی برای این نوبت ثبت نشده است.</div> :
            <div className="d-grid gap-3">{data.answers.map((answer, index) => {
              const values = answerValue(answer);
              return <div className="border rounded p-3" key={answer.questionId ?? index}>
                <div className="fw-semibold mb-2"><span className="text-muted me-1">{index + 1}.</span> {answer.question || "سؤال بدون عنوان"}</div>
                {!values.length ? <span className="text-muted">بدون پاسخ</span> :
                  <div className="d-flex flex-wrap gap-2">{values.map((value, valueIndex) => <Badge color="primary" pill key={`${value}-${valueIndex}`} className="fs-6 fw-normal">{value}</Badge>)}</div>}
              </div>;
            })}</div>}
        </>}
      </ModalBody>
    </Modal>
  );
};

export default AnswerSheetDetailModal;
