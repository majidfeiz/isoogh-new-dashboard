import React from "react";
import PropTypes from "prop-types";

const statusContent = {
  pending: {
    icon: "bx-time-five",
    title: "درخواست تماس شما در صف است",
    description: "درخواست ثبت شده و به‌صورت خودکار در نوبت ارسال به مرکز تماس قرار دارد.",
  },
  retry: {
    icon: "bx-refresh",
    title: "در حال تلاش مجدد برای برقراری تماس",
    description: "ارسال قبلی موقتاً موفق نبود؛ سامانه بدون نیاز به اقدام شما دوباره تلاش می‌کند.",
  },
  processing: {
    icon: "bx-phone-call",
    title: "در حال ارسال تماس به مرکز تماس",
    description: "نوبت شما رسیده است؛ چند لحظه دیگر تلفن شما زنگ می‌خورد.",
  },
  dispatched: {
    icon: "bx-check-circle",
    title: "درخواست تماس با موفقیت ارسال شد",
    description: "صف تمام شده است؛ اکنون منتظر زنگ تلفن خود باشید.",
  },
  failed: {
    icon: "bx-error-circle",
    title: "ارسال درخواست تماس ناموفق بود",
    description: "فرایند ارسال به پایان رسید اما مرکز تماس درخواست را نپذیرفت. دوباره تلاش کنید.",
  },
};

const formatWait = (seconds) => {
  if (seconds == null) return null;
  const safe = Math.max(0, Number(seconds) || 0);
  return safe < 60 ? `${safe.toLocaleString("fa-IR")} ثانیه` : `${Math.ceil(safe / 60).toLocaleString("fa-IR")} دقیقه`;
};

export default function CallWaitingExperience({ call, countdown, recovering, submitting, studentName }) {
  if (!call && !submitting) return null;
  const status = call?.queueStatus || "pending";
  const content = submitting ? {
    icon: "bx-loader-alt bx-spin",
    title: "در حال ثبت درخواست تماس…",
    description: "لطفاً چند لحظه صبر کنید و دوباره روی دکمه تماس نزنید.",
  } : statusContent[status] || statusContent.pending;
  const progress = Math.min(100, Math.max(0, Number(call?.progress) || 0));
  const dispatched = status === "dispatched";
  const failed = status === "failed";
  const stages = [
    { label: "ثبت درخواست", done: Boolean(call), active: submitting },
    { label: "انتظار در صف", done: status === "processing" || dispatched || failed, active: Boolean(call) && !["processing", "dispatched", "failed"].includes(status) },
    { label: "ارسال به مرکز تماس", done: dispatched, active: status === "processing" || failed, failed },
    { label: "زنگ تلفن", done: false, active: dispatched },
  ];

  return (
    <section className={`call-waiting-experience mb-4 ${status === "retry" ? "call-waiting-experience--retry" : ""} ${dispatched ? "call-waiting-experience--dispatched" : ""} ${failed ? "call-waiting-experience--failed" : ""}`} aria-labelledby="call-waiting-title" dir="rtl">
      <div className="call-waiting-experience__glow" aria-hidden="true" />
      <div className="call-waiting-experience__body">
        <div className="call-waiting-experience__status-icon" aria-hidden="true"><i className={`bx ${content.icon}`} /></div>
        <div className="flex-grow-1 min-w-0">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
            <h4 id="call-waiting-title" className="mb-0" aria-live="polite">{recovering ? "در حال به‌روزرسانی وضعیت تماس…" : content.title}</h4>
            {!submitting && !dispatched && !failed && <span className="call-waiting-experience__live"><span /> فعال</span>}
            {dispatched && <span className="badge bg-success">ارسال‌شده</span>}
            {failed && <span className="badge bg-danger">ناموفق</span>}
          </div>
          <p className="mb-0 call-waiting-experience__description">{studentName ? `تماس با ${studentName}: ` : ""}{content.description}</p>
        </div>
        {!submitting && <div className="call-waiting-experience__metrics">
          {call?.queuePosition != null && <div><small>جایگاه شما</small><strong>نفر {Number(call.queuePosition).toLocaleString("fa-IR")}</strong></div>}
          {countdown != null && <div><small>انتظار تقریبی</small><strong>{formatWait(countdown)}</strong></div>}
          {status === "retry" && <div><small>تلاش خودکار</small><strong>{Number(call?.attempts || 0).toLocaleString("fa-IR")} از {Number(call?.maxAttempts || 0).toLocaleString("fa-IR")}</strong></div>}
        </div>}
      </div>

      {!submitting && <div className="call-waiting-experience__progress-wrap">
        <div className="d-flex justify-content-between mb-2"><span>پیشرفت ارسال تماس</span><strong>{progress.toLocaleString("fa-IR")}٪</strong></div>
        <div className="call-waiting-experience__progress" role="progressbar" aria-label="پیشرفت ارسال تماس" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>}

      <ol className="call-waiting-experience__steps">
        {stages.map((stage, index) => <li key={stage.label} className={`${stage.done ? "is-done" : ""} ${stage.active ? "is-active" : ""} ${stage.failed ? "failed" : ""}`}>
          <span>{stage.done ? <i className="bx bx-check" /> : index + 1}</span><small>{stage.label}</small>
        </li>)}
      </ol>

      <div className="call-waiting-experience__notice"><i className={`bx ${dispatched ? "bx-phone-call" : failed ? "bx-error" : "bx-info-circle"}`} /> {dispatched ? "درخواست از صف خارج شده است؛ گوشی خود را در دسترس نگه دارید." : failed ? "قفل پرونده برداشته شد و می‌توانید دوباره تلاش کنید." : "این صفحه را ترک نکنید و تماس دیگری شروع نکنید؛ فرایند کاملاً خودکار است."}</div>
    </section>
  );
}

CallWaitingExperience.propTypes = {
  call: PropTypes.object,
  countdown: PropTypes.number,
  recovering: PropTypes.bool,
  submitting: PropTypes.bool,
  studentName: PropTypes.string,
};
