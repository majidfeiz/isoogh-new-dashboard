import React from "react";
import { render, screen } from "@testing-library/react";
import { ProgressCell, TraceTimeline } from "./CallTraceComponents.jsx";

test("failed progress keeps the backend percentage and renders the Simotel error", () => {
  render(<ProgressCell progress={63} status="failed" errorMessage="Simotel timeout" />);
  expect(screen.getByText("۶۳٪")).toBeInTheDocument();
  expect(screen.queryByText("۱۰۰٪")).not.toBeInTheDocument();
  expect(screen.getByText("Simotel timeout")).toBeInTheDocument();
});

test("timeline renders translated Simotel error event and technical badges", () => {
  render(
    <TraceTimeline
      events={[{
        id: 1,
        sequence: 1,
        step: "simotel_failed",
        progress: 45,
        level: "error",
        title: "",
        message: "پاسخ نامعتبر بود",
        payload: null,
        response: null,
        httpStatus: 502,
        durationMs: 1250,
        createdAt: "2026-07-30T10:00:00Z",
      }]}
    />
  );
  expect(screen.getAllByText("پاسخ نامعتبر سیموتل").length).toBeGreaterThan(0);
  expect(screen.getByText("HTTP 502")).toBeInTheDocument();
  expect(screen.getByText("۱٬۲۵۰ ms")).toBeInTheDocument();
});
