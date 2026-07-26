import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import DynamicReportPagination from "./DynamicReportPagination.jsx";

test("renders three pages from backend meta and navigates next, previous and page number", () => {
  const onPage = jest.fn();
  const { rerender } = render(
    <DynamicReportPagination
      meta={{ page: 2, limit: 20, total: 53, lastPage: 3 }}
      onPage={onPage}
      onLimit={jest.fn()}
    />
  );

  expect(screen.getByText("53")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "2" })).toHaveAttribute("aria-current", "page");
  fireEvent.click(screen.getByRole("button", { name: "صفحه بعدی" }));
  expect(onPage).toHaveBeenCalledWith(3);
  fireEvent.click(screen.getByRole("button", { name: "صفحه قبلی" }));
  expect(onPage).toHaveBeenCalledWith(1);
  fireEvent.click(screen.getByRole("button", { name: "3" }));
  expect(onPage).toHaveBeenCalledWith(3);

  rerender(<DynamicReportPagination meta={{ page: 1, limit: 20, total: 53, lastPage: 3 }} onPage={onPage} onLimit={jest.fn()} />);
  expect(screen.getByRole("button", { name: "صفحه قبلی" })).toBeDisabled();
  rerender(<DynamicReportPagination meta={{ page: 3, limit: 20, total: 53, lastPage: 3 }} onPage={onPage} onLimit={jest.fn()} />);
  expect(screen.getByRole("button", { name: "صفحه بعدی" })).toBeDisabled();
});

test("page size options stop at 100 and return the selected numeric value", () => {
  const onLimit = jest.fn();
  render(
    <DynamicReportPagination
      meta={{ page: 1, limit: 20, total: 53, lastPage: 3 }}
      onPage={jest.fn()}
      onLimit={onLimit}
    />
  );

  const select = screen.getByLabelText("تعداد نتایج در صفحه");
  expect([...select.options].map((option) => Number(option.value))).toEqual([20, 25, 50, 100]);
  fireEvent.change(select, { target: { value: "50" } });
  expect(onLimit).toHaveBeenCalledWith(50);
});
