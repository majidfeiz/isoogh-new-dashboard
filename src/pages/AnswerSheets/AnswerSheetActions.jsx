import React from "react";
import { Button } from "reactstrap";
import "./answer-sheets.scss";

const isSelected = (activeAction, sessionId, type) =>
  String(activeAction?.sessionId) === String(sessionId) && activeAction?.type === type;

const AnswerSheetActions = ({ sessionId, activeAction, canShow, canShowCall, onSelect }) => {
  const answersSelected = isSelected(activeAction, sessionId, "answers");
  const callSelected = isSelected(activeAction, sessionId, "call");

  return (
    <div className="answer-sheet-row-actions d-flex flex-wrap gap-2" role="group" aria-label="عملیات ردیف پاسخ‌نامه">
      {canShow && (
        <Button
          type="button"
          color="primary"
          outline={!answersSelected}
          size="sm"
          className={`answer-sheet-action-button ${answersSelected ? "is-active" : ""}`}
          aria-pressed={answersSelected}
          onClick={() => onSelect({ sessionId, type: "answers" })}
        >
          <i className="bx bx-show me-1" aria-hidden="true" />
          مشاهده پاسخ‌ها
        </Button>
      )}
      {canShowCall && (
        <Button
          type="button"
          color={callSelected ? "primary" : "info"}
          outline={!callSelected}
          size="sm"
          className={`answer-sheet-action-button ${callSelected ? "is-active" : ""}`}
          aria-pressed={callSelected}
          onClick={() => onSelect({ sessionId, type: "call" })}
        >
          <i className="bx bx-phone-call me-1" aria-hidden="true" />
          مشاهده تماس
        </Button>
      )}
    </div>
  );
};

export default AnswerSheetActions;
