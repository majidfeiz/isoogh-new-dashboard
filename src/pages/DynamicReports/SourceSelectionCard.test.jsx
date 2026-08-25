import React, { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import SourceSelectionCard from "./SourceSelectionCard.jsx";

const sources = [
  { id: "support.questionnaires", label: "مشاهده پاسخ‌نامه‌ها", description: "گزارش پاسخ فرم‌ها" },
  { id: "voip.calls", label: "تماس خروجی", description: "گزارش تماس‌ها" },
];

const Harness = () => {
  const [selected, setSelected] = useState(sources[0].id);
  return sources.map((source) => (
    <SourceSelectionCard
      key={source.id}
      source={source}
      selected={selected === source.id}
      onSelect={setSelected}
    />
  ));
};

test("moves the active state to the newly selected source", () => {
  render(<Harness />);
  const questionnaires = screen.getByRole("button", { name: /مشاهده پاسخ‌نامه‌ها/ });
  const calls = screen.getByRole("button", { name: /تماس خروجی/ });

  expect(questionnaires).toHaveAttribute("aria-pressed", "true");
  expect(questionnaires).toHaveClass("is-selected");
  expect(calls).toHaveAttribute("aria-pressed", "false");

  fireEvent.click(calls);

  expect(questionnaires).toHaveAttribute("aria-pressed", "false");
  expect(questionnaires).not.toHaveClass("is-selected");
  expect(calls).toHaveAttribute("aria-pressed", "true");
  expect(calls).toHaveClass("is-selected");
});

test("exposes and preserves the disabled state", () => {
  const onSelect = jest.fn();
  render(<SourceSelectionCard source={sources[0]} selected={false} disabled onSelect={onSelect} />);

  const button = screen.getByRole("button", { name: /مشاهده پاسخ‌نامه‌ها/ });
  expect(button).toBeDisabled();
  fireEvent.click(button);
  expect(onSelect).not.toHaveBeenCalled();
});
