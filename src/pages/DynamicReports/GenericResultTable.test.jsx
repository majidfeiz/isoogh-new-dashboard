import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GenericResultTable from "./GenericResultTable.jsx";

const commonProps = {
  loading: false,
  error: "",
  page: 1,
  limit: 25,
  search: "",
  onSearch: jest.fn(),
  onPage: jest.fn(),
  onLimit: jest.fn(),
};

test("renders datetime from displayRows without exposing or converting raw Simotel timestamp", () => {
  const finalText = "1405/04/19 11:05:37";
  render(
    <MemoryRouter>
      <GenericResultTable
        {...commonProps}
        result={{
          schema: [
            {
              id: "call.started_at",
              label: "زمان شروع",
              type: "datetime",
              dateEncoding: "simotel_unix",
            },
          ],
          rows: [{ "call.started_at": 1783656337 }],
          displayRows: [{ "call.started_at": finalText }],
          pagination: { total: 1 },
        }}
      />
    </MemoryRouter>
  );

  expect(screen.getByText(finalText)).toBeInTheDocument();
  expect(screen.queryByText("1783656337")).not.toBeInTheDocument();
});

test("falls back to rows for responses from the previous backend contract", () => {
  render(
    <MemoryRouter>
      <GenericResultTable
        {...commonProps}
        result={{
          schema: [{ id: "title", label: "عنوان", type: "text" }],
          rows: [{ title: "مقدار قدیمی" }],
          pagination: { total: 1 },
        }}
      />
    </MemoryRouter>
  );

  expect(screen.getByText("مقدار قدیمی")).toBeInTheDocument();
});

test("uses meta total and lastPage instead of the current displayRows length", () => {
  render(
    <MemoryRouter>
      <GenericResultTable
        {...commonProps}
        result={{
          schema: [{ id: "title", label: "عنوان", type: "text" }],
          displayRows: [{ title: "تنها ردیف صفحه" }],
          meta: { page: 1, limit: 20, total: 53, lastPage: 3 },
          pagination: { page: 1, limit: 20, total: 1, lastPage: 1 },
        }}
      />
    </MemoryRouter>
  );

  expect(screen.getByText("53")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
});
