import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import ChartWidget from "./ChartWidget.jsx";

jest.mock("react-apexcharts", () => ({ series }) => (
  <div data-testid="apex-series">{JSON.stringify(series)}</div>
));

test("renders positive and zero values instead of filtering zero", () => {
  render(
    <ChartWidget
      widgetKey="students_by_grade"
      widgetName="پایه‌ها"
      chartData={{ data: [{ label: "دهم", value: 5 }, { label: "یازدهم", value: 0 }] }}
    />
  );
  expect(screen.getByTestId("apex-series")).toHaveTextContent('"data":[5,0]');
});

test("shows empty state only for a successful all-zero result", () => {
  render(
    <ChartWidget
      widgetKey="students_by_shift"
      widgetName="شیفت‌ها"
      chartData={{ data: [{ label: "صبح", value: 0 }] }}
    />
  );
  expect(screen.getByText("داده‌ای برای نمایش وجود ندارد")).toBeInTheDocument();
  expect(screen.queryByText("خطا در پردازش داده نمودار")).not.toBeInTheDocument();
});

test("shows retryable error state for an invalid successful payload", () => {
  const onRetry = jest.fn();
  render(
    <ChartWidget
      widgetKey="students_by_province"
      widgetName="استان‌ها"
      chartData={{ data: [{ label: "تهران", value: "not-a-number" }] }}
      onRetry={onRetry}
    />
  );
  expect(screen.getByText("خطا در پردازش داده نمودار")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "تلاش دوباره" }));
  expect(onRetry).toHaveBeenCalledTimes(1);
  expect(screen.queryByText("داده‌ای برای نمایش وجود ندارد")).not.toBeInTheDocument();
});

test("renders support-form status from stats without a chart endpoint payload", () => {
  render(
    <ChartWidget
      widgetKey="support_forms_by_status"
      widgetName="وضعیت فرم‌ها"
      stats={{ supportForms: { total: 10, active: 4, pendingAssignments: 2 } }}
    />
  );
  expect(screen.getByTestId("apex-series")).toHaveTextContent("[4,2,4]");
});
