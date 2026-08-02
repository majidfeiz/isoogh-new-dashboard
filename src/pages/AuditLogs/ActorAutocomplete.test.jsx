import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import ActorAutocomplete from "./ActorAutocomplete.jsx";
import { getAuditActors } from "../../services/auditLogService.jsx";

jest.mock("../../services/auditLogService.jsx", () => ({ getAuditActors: jest.fn() }));

describe("ActorAutocomplete", () => {
  beforeEach(() => { jest.useFakeTimers(); getAuditActors.mockResolvedValue([{ id: 12, name: "علی رضایی", activityCount: 7 }]); });
  afterEach(() => jest.useRealTimers());

  test("debounces actor lookup and selects only the user id", async () => {
    const onChange = jest.fn();
    render(<ActorAutocomplete onChange={onChange} />);
    const input = screen.getByLabelText("جست‌وجوی کاربر");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "علی" } });
    act(() => jest.advanceTimersByTime(399));
    expect(getAuditActors).not.toHaveBeenCalled();
    await act(async () => { jest.advanceTimersByTime(1); await Promise.resolve(); });
    expect(getAuditActors).toHaveBeenCalledWith({ search: "علی", limit: 20 });
    fireEvent.click(await screen.findByText(/علی رضایی/));
    expect(onChange).toHaveBeenLastCalledWith({ actorUserId: 12, actorSearch: undefined, label: "علی رضایی" });
  });

  test("clear removes both actor query values", () => {
    const onChange = jest.fn();
    render(<ActorAutocomplete value="12" initialText="علی" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("پاک کردن کاربر"));
    expect(onChange).toHaveBeenCalledWith({ actorUserId: undefined, actorSearch: undefined, label: "" });
  });
});
