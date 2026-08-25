import React from "react";

const SourceSelectionCard = ({ source, selected, disabled = false, onSelect }) => (
  <button
    type="button"
    className={`dynamic-report-source-card ${selected ? "is-selected" : ""}`}
    aria-pressed={selected}
    disabled={disabled}
    onClick={() => onSelect(source.id)}
  >
    <span className="dynamic-report-source-card__icon" aria-hidden="true">
      <i className={selected ? "bx bx-check" : "bx bx-data"} />
    </span>
    <span className="dynamic-report-source-card__content">
      <span className="dynamic-report-source-card__title">{source.label || source.name}</span>
      <span className="dynamic-report-source-card__description">{source.description || "منبع داده گزارش"}</span>
    </span>
    <span className="dynamic-report-source-card__status" aria-hidden="true">
      {selected ? "انتخاب‌شده" : "انتخاب"}
    </span>
    <span className="visually-hidden">{selected ? "این منبع در حال حاضر فعال است" : "برای انتخاب این منبع کلیک کنید"}</span>
  </button>
);

export default SourceSelectionCard;
