import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import VoipWebhookLogs from "./VoipWebhookLogs.jsx";
import { getVoipWebhookLogs, getVoipWebhooks } from "../../services/voipWebhookService.jsx";

jest.mock("../../components/Common/Breadcrumb", () => () => null);
jest.mock("../../components/Common/Paginations.jsx", () => () => null);
jest.mock("../../services/voipWebhookService.jsx", () => ({
  getVoipWebhooks: jest.fn(),
  getVoipWebhookLogs: jest.fn(),
}));

test("renders audit delivery id, attempt, response, retry and pending status", async () => {
  getVoipWebhooks.mockResolvedValue([{ id: 8, name: "Audit Hook", event_type: "audit_log" }]);
  getVoipWebhookLogs.mockResolvedValue({
    items: [{ id: 2, webhook_id: 8, audit_log_id: 1042, voip_call_history_id: null, payload: { event: "audit_log.created" }, attempt_number: 2, next_attempt_at: "2026-08-02T12:00:00.000Z", final_failure: false, response_status: 500, response_body: "failed", success: false, sent_at: "2026-08-02T11:50:00.000Z", error_message: "HTTP 500" }],
    pagination: { page: 1, per_page: 30, total: 1, lastPage: 1 },
  });
  render(<MemoryRouter><VoipWebhookLogs /></MemoryRouter>);
  expect(await screen.findByText("#1042")).toBeInTheDocument();
  expect(screen.getByText("تغییرات")).toBeInTheDocument();
  expect(screen.getByText("500")).toBeInTheDocument();
  expect(screen.getByText("در انتظار تلاش بعدی")).toBeInTheDocument();
  expect(screen.getByText("2")).toBeInTheDocument();
});
