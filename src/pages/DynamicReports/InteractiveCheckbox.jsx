import React from "react";

const InteractiveCheckbox = ({ checked, disabled = false, label, onToggle, className = "" }) => {
  return <button
    type="button"
    className={`dynamic-report-checkbox d-flex align-items-center gap-2 mb-2 ${checked ? "is-checked" : ""} ${className}`}
    disabled={disabled}
    aria-pressed={checked}
    onClick={() => onToggle(!checked)}
  >
    <input
      type="checkbox"
      className="form-check-input mt-0 flex-shrink-0"
      checked={checked}
      readOnly
      tabIndex={-1}
      aria-hidden="true"
    />
    <span>{label}</span>
  </button>;
};

export default InteractiveCheckbox;
