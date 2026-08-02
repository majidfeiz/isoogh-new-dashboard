import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuditDateFilter from "./AuditDateFilter.jsx";
import AuditStats from "./AuditStats.jsx";
import Paginations from "../../components/Common/Paginations.jsx";
import Can from "../../components/Access/Can.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

jest.mock("react-apexcharts", () => () => <div data-testid="chart" />);
jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: jest.fn() }));

test("statistics permission hides and reveals its content", () => {
  useAuth.mockReturnValue({ hasPermission: () => false, hasAnyPermission: () => false, hasAllPermissions: () => false });
  const { rerender } = render(<Can permission="audit-logs.statistics"><span>آمار محرمانه</span></Can>);
  expect(screen.queryByText("آمار محرمانه")).not.toBeInTheDocument();
  useAuth.mockReturnValue({ hasPermission: () => true, hasAnyPermission: () => true, hasAllPermissions: () => true });
  rerender(<Can permission="audit-logs.statistics"><span>آمار محرمانه</span></Can>);
  expect(screen.getByText("آمار محرمانه")).toBeInTheDocument();
});

test("date preset emits an exclusive ISO range", () => {
  const onChange = jest.fn();
  render(<AuditDateFilter onChange={onChange} />);
  fireEvent.click(screen.getByText("امروز"));
  const range = onChange.mock.calls[0][0];
  expect(Date.parse(range.to)).toBeGreaterThan(Date.parse(range.from));
});

test("server pagination reports and requests the next page", () => {
  const setCurrentPage = jest.fn();
  render(<MemoryRouter><Paginations perPageData={20} data={[]} totalRecords={45} currentPage={1} setCurrentPage={setCurrentPage} isShowingPageLength paginationDiv="x" paginationClass="pagination" /></MemoryRouter>);
  fireEvent.click(screen.getByText("2"));
  expect(setCurrentPage).toHaveBeenCalledWith(2);
});

test("stats supports error retry and mapped chart rendering", () => {
  const retry = jest.fn();
  const { rerender } = render(<AuditStats error="failed" onRetry={retry} />);
  fireEvent.click(screen.getByText("تلاش مجدد"));
  expect(retry).toHaveBeenCalled();
  rerender(<AuditStats data={{ summary: { total: 4, failed: 1 }, timeline: [], byModule: [], byAction: [], byUser: [] }} />);
  expect(screen.getByText("۴")).toBeInTheDocument();
  expect(screen.getAllByTestId("chart")).toHaveLength(3);
});
