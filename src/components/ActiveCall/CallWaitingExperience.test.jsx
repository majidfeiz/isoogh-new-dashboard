import React from "react";
import { render, screen } from "@testing-library/react";
import CallWaitingExperience from "./CallWaitingExperience.jsx";

test("renders a prominent queued call experience with real server values", () => {
  render(<CallWaitingExperience call={{ queueStatus: "pending", progress: 37, queuePosition: 3, attempts: 1, maxAttempts: 4 }} countdown={85} studentName="علی رضایی" />);
  expect(screen.getByRole("heading", { name: "درخواست تماس شما در صف است" })).toBeInTheDocument();
  expect(screen.getByText(/تماس با علی رضایی/)).toBeInTheDocument();
  expect(screen.getByText("نفر ۳")).toBeInTheDocument();
  expect(screen.getByText("۲ دقیقه")).toBeInTheDocument();
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "37");
  expect(screen.getByText(/این صفحه را ترک نکنید/)).toBeInTheDocument();
});

test("explains automatic retries and displays attempts", () => {
  render(<CallWaitingExperience call={{ queueStatus: "retry", progress: 12, queuePosition: null, attempts: 2, maxAttempts: 5 }} countdown={null} />);
  expect(screen.getByRole("heading", { name: "در حال تلاش مجدد برای برقراری تماس" })).toBeInTheDocument();
  expect(screen.getByText("۲ از ۵")).toBeInTheDocument();
  expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
});

test("shows immediate feedback while the POST is pending", () => {
  render(<CallWaitingExperience submitting />);
  expect(screen.getByRole("heading", { name: "در حال ثبت درخواست تماس…" })).toBeInTheDocument();
  expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
});

test("keeps a clear final phase after the job leaves the active queue", () => {
  render(<CallWaitingExperience call={{ queueStatus: "dispatched", progress: 100 }} studentName="علی رضایی" />);
  expect(screen.getByRole("heading", { name: "درخواست تماس با موفقیت ارسال شد" })).toBeInTheDocument();
  expect(screen.getByText("ارسال‌شده")).toBeInTheDocument();
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  expect(screen.getByText(/گوشی خود را در دسترس نگه دارید/)).toBeInTheDocument();
});

test("shows a terminal failure without pretending that the phone will ring", () => {
  render(<CallWaitingExperience call={{ queueStatus: "failed", progress: 100 }} />);
  expect(screen.getByRole("heading", { name: "ارسال درخواست تماس ناموفق بود" })).toBeInTheDocument();
  expect(screen.getByText(/می‌توانید دوباره تلاش کنید/)).toBeInTheDocument();
});
