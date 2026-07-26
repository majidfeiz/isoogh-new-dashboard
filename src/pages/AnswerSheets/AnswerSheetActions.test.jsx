import React, { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import AnswerSheetActions from "./AnswerSheetActions.jsx";

const Harness = () => {
  const [activeAction, setActiveAction] = useState(null);
  return (
    <>
      <AnswerSheetActions sessionId="session-1" activeAction={activeAction} canShow canShowCall onSelect={setActiveAction} />
      <AnswerSheetActions sessionId="session-2" activeAction={activeAction} canShow canShowCall onSelect={setActiveAction} />
    </>
  );
};

test("moves the selected state between operations and rows", () => {
  render(<Harness />);
  const answerButtons = screen.getAllByRole("button", { name: "مشاهده پاسخ‌ها" });
  const callButtons = screen.getAllByRole("button", { name: "مشاهده تماس" });

  expect(answerButtons[0]).toHaveAttribute("aria-pressed", "false");
  fireEvent.click(answerButtons[0]);
  expect(answerButtons[0]).toHaveAttribute("aria-pressed", "true");
  expect(answerButtons[0]).toHaveClass("is-active");

  fireEvent.click(callButtons[0]);
  expect(answerButtons[0]).toHaveAttribute("aria-pressed", "false");
  expect(callButtons[0]).toHaveAttribute("aria-pressed", "true");

  fireEvent.click(answerButtons[1]);
  expect(callButtons[0]).toHaveAttribute("aria-pressed", "false");
  expect(answerButtons[1]).toHaveAttribute("aria-pressed", "true");
});
