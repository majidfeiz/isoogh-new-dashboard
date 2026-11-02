import React from "react";
import { render, screen } from "@testing-library/react";
import ActiveCallBanner from "./ActiveCallBanner.jsx";
import { useActiveCall } from "../../context/ActiveCallContext.jsx";

jest.mock("../../context/ActiveCallContext.jsx", () => ({ useActiveCall: jest.fn() }));

const state = (overrides = {}) => ({
  activeCall: { queueJobId: 1, studentId: 7, supportFormId: 3, queueStatus: "pending", progress: 42, queuePosition: 2, estimatedWaitSeconds: 70, navigationLocked: true, ...overrides },
  recovering: false,
  countdown: overrides.estimatedWaitSeconds === undefined ? 70 : overrides.estimatedWaitSeconds,
  blockedOpen: false,
  setBlockedOpen: jest.fn(),
  returnToCall: jest.fn(),
});

test("shows real progress, queue position and approximate wait", () => {
  useActiveCall.mockReturnValue(state());
  render(<ActiveCallBanner />);
  expect(screen.getAllByRole("progressbar")[0]).toHaveAttribute("aria-valuenow", "42");
  expect(screen.getByText(/نفر ۲ در صف/)).toBeInTheDocument();
  expect(screen.getByText(/انتظار تقریبی/)).toBeInTheDocument();
});

test("shows retry attempts without inventing progress", () => {
  useActiveCall.mockReturnValue(state({ queueStatus: "retry", progress: 0, attempts: 2, maxAttempts: 5 }));
  render(<ActiveCallBanner />);
  expect(screen.getAllByRole("progressbar")[0]).toHaveAttribute("aria-valuenow", "0");
  expect(screen.getByText(/تلاش ۲ از ۵/)).toBeInTheDocument();
});

test("keeps the snapshot visible while recovering", () => {
  useActiveCall.mockReturnValue({ ...state(), recovering: true });
  render(<ActiveCallBanner />);
  expect(screen.getByText("در حال بازیابی وضعیت تماس…")).toBeInTheDocument();
  expect(screen.getByText(/دانش‌آموز شماره ۷/)).toBeInTheDocument();
});

test("omits unavailable queue estimates", () => {
  useActiveCall.mockReturnValue(state({ queuePosition: null, estimatedWaitSeconds: null }));
  render(<ActiveCallBanner />);
  expect(screen.queryByText(/^نفر .* در صف$/)).not.toBeInTheDocument();
  expect(screen.queryByText(/انتظار تقریبی/)).not.toBeInTheDocument();
  expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
});
