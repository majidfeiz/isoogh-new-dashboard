import React, { useEffect, useRef } from "react";
import { Alert, Button, Modal, ModalBody, ModalFooter, ModalHeader, Progress } from "reactstrap";
import { useActiveCall } from "../../context/ActiveCallContext.jsx";

const labels = {
  pending: ["bx-time-five", "تماس با دانش‌آموز در صف است"],
  retry: ["bx-refresh", "ارسال تماس موقتاً ناموفق بود؛ تلاش مجدد خودکار انجام می‌شود"],
  processing: ["bx-loader-alt", "در حال ارسال درخواست تماس به مرکز تماس…"],
};

const waitText = (seconds) => {
  if (seconds == null) return null;
  if (seconds < 60) return `${seconds.toLocaleString("fa-IR")} ثانیه`;
  return `${Math.ceil(seconds / 60).toLocaleString("fa-IR")} دقیقه`;
};

export default function ActiveCallBanner() {
  const { activeCall, recovering, countdown, blockedOpen, setBlockedOpen, returnToCall } = useActiveCall();
  const headingRef = useRef(null);
  const focusedRef = useRef(null);
  useEffect(() => {
    if (activeCall?.queueJobId && focusedRef.current !== activeCall.queueJobId) {
      focusedRef.current = activeCall.queueJobId;
      headingRef.current?.focus({ preventScroll: true });
    }
  }, [activeCall?.queueJobId]);
  if (!activeCall) return null;
  const [icon, label] = labels[activeCall.queueStatus] || labels.pending;
  const progress = Math.min(100, Math.max(0, Number(activeCall.progress) || 0));
  const studentName = activeCall.studentName || `دانش‌آموز شماره ${Number(activeCall.studentId).toLocaleString("fa-IR")}`;
  return <>
    <Alert color={activeCall.queueStatus === "retry" ? "warning" : "info"} className="active-call-banner rounded-0 mb-0" dir="rtl">
      <div className="container-fluid py-1">
        <div className="d-flex flex-wrap align-items-center gap-3">
          <i className={`bx ${icon} font-size-24`} aria-hidden="true" />
          <div className="flex-grow-1">
            <h6 ref={headingRef} tabIndex="-1" className="mb-1" aria-live="polite">{recovering ? "در حال بازیابی وضعیت تماس…" : label}</h6>
            <div className="small">{studentName}{activeCall.formTitle ? ` — ${activeCall.formTitle}` : ""}</div>
            <div className="d-flex flex-wrap gap-3 small mt-1">
              {activeCall.queuePosition != null && <span>نفر {Number(activeCall.queuePosition).toLocaleString("fa-IR")} در صف</span>}
              {countdown != null && <span>انتظار تقریبی: {waitText(countdown)}</span>}
              {activeCall.queueStatus === "retry" && <span className="badge bg-warning text-dark">تلاش {Number(activeCall.attempts || 0).toLocaleString("fa-IR")} از {Number(activeCall.maxAttempts || 0).toLocaleString("fa-IR")}</span>}
            </div>
          </div>
          <div style={{ minWidth: 180 }}>
            <div className="d-flex justify-content-between small"><span>پیشرفت واقعی</span><span>{progress.toLocaleString("fa-IR")}٪</span></div>
            <Progress value={progress} role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100" />
          </div>
          <Button color="primary" size="sm" onClick={returnToCall}>بازگشت به پرونده تماس</Button>
        </div>
      </div>
    </Alert>
    <Modal isOpen={blockedOpen} toggle={() => setBlockedOpen(false)} centered dir="rtl">
      <ModalHeader toggle={() => setBlockedOpen(false)}>تماس در حال انتظار است</ModalHeader>
      <ModalBody>تماس قبلی هنوز در صف است. برای جلوگیری از برقراری تماس خارج از پرونده، در همین صفحه بمانید.</ModalBody>
      <ModalFooter><Button color="primary" onClick={() => { setBlockedOpen(false); returnToCall(); }}>بازگشت به پرونده تماس</Button></ModalFooter>
    </Modal>
  </>;
}
