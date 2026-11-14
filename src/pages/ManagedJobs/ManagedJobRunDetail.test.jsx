import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ManagedJobRunDetail from "./ManagedJobRunDetail.jsx";
import { getManagedJobRun } from "../../services/managedJobService.jsx";

jest.mock("../../services/managedJobService.jsx", () => ({ getManagedJobRun: jest.fn() }));

test("polls a running run and stops after it becomes terminal", async () => {
  jest.useFakeTimers();
  getManagedJobRun
    .mockResolvedValueOnce({ id: 5, job_key: "job", status: "running", logs: [] })
    .mockResolvedValueOnce({ id: 5, job_key: "job", status: "succeeded", logs: [] });
  render(<MemoryRouter initialEntries={["/managed-jobs/runs/5"]}><Routes><Route path="/managed-jobs/runs/:id" element={<ManagedJobRunDetail />} /></Routes></MemoryRouter>);
  expect(await screen.findByText("در حال اجرا")).toBeInTheDocument();
  await act(async () => { jest.advanceTimersByTime(5000); });
  await waitFor(() => expect(getManagedJobRun).toHaveBeenCalledTimes(2));
  expect(await screen.findByText("موفق")).toBeInTheDocument();
  await act(async () => { jest.advanceTimersByTime(10000); });
  expect(getManagedJobRun).toHaveBeenCalledTimes(2);
  jest.useRealTimers();
});
