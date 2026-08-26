import React from "react";

const UsernameAsPhoneSwitch = ({ checked, disabled, onChange }) => <div className="border rounded p-3 h-100 bg-light">
  <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="ثبت نام کاربری به‌عنوان شماره تلفن"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="btn border-0 bg-transparent p-0 mb-2 d-flex align-items-center gap-2 w-100 text-start"
    >
      <span
        aria-hidden="true"
        className={`d-inline-flex align-items-center rounded-pill p-1 flex-shrink-0 ${checked ? "bg-success justify-content-end" : "bg-secondary justify-content-start"}`}
        style={{ width: 38, height: 22, transition: "background-color 150ms ease" }}
      >
        <span className="d-block bg-white rounded-circle shadow-sm" style={{ width: 14, height: 14 }} />
      </span>
      <span className="fw-semibold">ثبت نام کاربری به‌عنوان شماره تلفن</span>
      <span className={`badge me-auto ${checked ? "bg-success" : "bg-secondary"}`}>
        {checked ? "فعال" : "غیرفعال"}
      </span>
    </button>
  <div className="text-warning-emphasis small">
    <i className="bx bx-info-circle ms-1" aria-hidden="true" />
    برای فایل‌هایی که شماره تلفن تکراری دارند فعال کنید. نام کاربری هر ردیف باید یکتا باشد.
  </div>
</div>;

export default UsernameAsPhoneSwitch;
