import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdviserSubordinatesModal from "./AdviserSubordinatesModal.jsx";
import {
  detachAdviserSubordinate,
  getAdvisers,
  getAdviserSubordinates,
  syncAdviserSubordinates,
} from "../../services/adviserService.jsx";

jest.mock("../../services/adviserService.jsx", () => ({
  detachAdviserSubordinate: jest.fn(),
  exportAdviserSubordinates: jest.fn(),
  getAdvisers: jest.fn(),
  getAdviserSubordinates: jest.fn(),
  syncAdviserSubordinates: jest.fn(),
}));

const emptyPage = {
  items: [],
  pagination: { page: 1, limit: 10, total: 0, lastPage: 1 },
};

beforeEach(() => {
  jest.clearAllMocks();
  getAdviserSubordinates.mockResolvedValue(emptyPage);
  getAdvisers.mockResolvedValue(emptyPage);
  syncAdviserSubordinates.mockResolvedValue({ assigned: 0, detached: 2, total: 0 });
  detachAdviserSubordinate.mockResolvedValue({ detached: true });
});

test("syncs an empty selection and refreshes both subordinate and main lists", async () => {
  const onChanged = jest.fn();
  render(
    <AdviserSubordinatesModal
      isOpen
      adviser={{ id: 7, is_super: true, user: { name: "سرمشاور" } }}
      schoolId="12"
      grades={[]}
      canUpdate
      onClose={jest.fn()}
      onChanged={onChanged}
    />
  );

  fireEvent.click(await screen.findByText("مدیریت زیرمجموعه‌ها"));
  fireEvent.click(await screen.findByText("ذخیره (0)"));

  await waitFor(() => {
    expect(syncAdviserSubordinates).toHaveBeenCalledWith(7, {
      schoolId: "12",
      adviserIds: [],
    });
    expect(onChanged).toHaveBeenCalledTimes(1);
  });
  expect(getAdviserSubordinates.mock.calls.length).toBeGreaterThanOrEqual(3);
});

test("selects and deselects an adviser from the picker", async () => {
  getAdvisers.mockResolvedValue({
    ...emptyPage,
    items: [{ id: 25, code: "AD-25", user: { name: "مشاور تست" } }],
  });
  render(
    <AdviserSubordinatesModal
      isOpen
      adviser={{ id: 7, is_super: true }}
      schoolId="12"
      grades={[]}
      canUpdate
      onClose={jest.fn()}
      onChanged={jest.fn()}
    />
  );

  fireEvent.click(await screen.findByText("مدیریت زیرمجموعه‌ها"));
  const checkbox = await screen.findByRole("checkbox");
  fireEvent.click(checkbox);
  expect(checkbox).toBeChecked();
  expect(screen.getByText("ذخیره (1)")).toBeInTheDocument();
  fireEvent.click(checkbox);
  expect(checkbox).not.toBeChecked();
  expect(screen.getByText("ذخیره (0)")).toBeInTheDocument();
});

test("includes super advisers in candidates and detaches a row after confirmation", async () => {
  window.confirm = jest.fn(() => true);
  getAdviserSubordinates.mockResolvedValue({
    ...emptyPage,
    items: [{ id: 25, code: "AD-25", is_super: true, user: { name: "سرمشاور دوم" } }],
    pagination: { page: 1, limit: 10, total: 1, lastPage: 1 },
  });
  getAdvisers.mockResolvedValue({
    ...emptyPage,
    items: [
      { id: 7, is_super: true },
      { id: 25, code: "AD-25", is_super: true, user: { name: "سرمشاور دوم" } },
    ],
  });
  const onChanged = jest.fn();
  render(
    <MemoryRouter>
      <AdviserSubordinatesModal
        isOpen
        adviser={{ id: 7, is_super: true }}
        schoolId="12"
        grades={[]}
        canUpdate
        onClose={jest.fn()}
        onChanged={onChanged}
      />
    </MemoryRouter>
  );

  fireEvent.click(await screen.findByText("مدیریت زیرمجموعه‌ها"));
  expect(await screen.findByText("سرمشاور", { selector: ".badge" })).toBeInTheDocument();
  fireEvent.click(screen.getByText("حذف از زیرمجموعه"));
  await waitFor(() => expect(detachAdviserSubordinate).toHaveBeenCalledWith(7, 25, "12"));
  expect(onChanged).toHaveBeenCalled();
  expect(getAdvisers).toHaveBeenCalledWith(expect.not.objectContaining({ isSuper: expect.anything() }));
});
