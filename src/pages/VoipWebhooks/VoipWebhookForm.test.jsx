import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import VoipWebhookForm from "./VoipWebhookForm.jsx";
import { createVoipWebhook } from "../../services/voipWebhookService.jsx";
import { getSchools } from "../../services/schoolService.jsx";

jest.mock("../../components/Common/Breadcrumb", () => () => null);
jest.mock("../../services/schoolService.jsx", () => ({
  getSchools: jest.fn(),
}));
jest.mock("../../services/voipWebhookService.jsx", () => ({
  createVoipWebhook: jest.fn(),
  getVoipWebhook: jest.fn(),
  updateVoipWebhook: jest.fn(),
}));
jest.mock("react-toastify", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const renderForm = () => render(<MemoryRouter><VoipWebhookForm /></MemoryRouter>);

describe("VoipWebhookForm event type", () => {
  beforeEach(() => {
    createVoipWebhook.mockReset().mockResolvedValue({});
    getSchools.mockReset().mockResolvedValue({ items: [{ id: 3, name: "مجموعه آزمایشی" }] });
  });

  test("switches required fields between call and audit modes", async () => {
    const { container } = renderForm();
    expect(container.querySelector('input[name="src"]')).toBeInTheDocument();
    fireEvent.change(container.querySelector('select[name="event_type"]'), { target: { value: "audit_log" } });
    expect(container.querySelector('input[name="src"]')).not.toBeInTheDocument();
    expect(container.querySelector('select[name="school_id"]')).toBeInTheDocument();
    expect(screen.getByLabelText("ماژول‌های Audit")).toBeInTheDocument();
    expect(screen.getByLabelText("نوع عملیات Audit")).toBeInTheDocument();
  });

  test("validates src for calls and school for audit", () => {
    const { container } = renderForm();
    fireEvent.click(screen.getByRole("button", { name: "ایجاد" }));
    expect(screen.getByText(/شماره src برای وب‌هوک تماس الزامی است/)).toBeInTheDocument();
    fireEvent.change(container.querySelector('select[name="event_type"]'), { target: { value: "audit_log" } });
    fireEvent.click(screen.getByRole("button", { name: "ایجاد" }));
    expect(screen.getByText(/انتخاب مجموعه برای وب‌هوک Audit الزامی است/)).toBeInTheDocument();
  });

  test("submits optional multi-select audit filters", async () => {
    const { container } = renderForm();
    fireEvent.change(container.querySelector('input[name="name"]'), { target: { value: "Audit Hook" } });
    fireEvent.change(container.querySelector('select[name="event_type"]'), { target: { value: "audit_log" } });
    await waitFor(() => expect(screen.getByText("مجموعه آزمایشی")).toBeInTheDocument());
    fireEvent.change(container.querySelector('select[name="school_id"]'), { target: { value: "3" } });
    fireEvent.change(container.querySelector('input[name="webhook_url"]'), { target: { value: "https://example.com/audit" } });
    await userEvent.selectOptions(screen.getByLabelText("ماژول‌های Audit"), ["students", "users"]);
    await userEvent.selectOptions(screen.getByLabelText("نوع عملیات Audit"), ["update"]);
    fireEvent.click(screen.getByRole("button", { name: "ایجاد" }));
    await waitFor(() => expect(createVoipWebhook).toHaveBeenCalledWith(expect.objectContaining({
      event_type: "audit_log", school_id: 3, src: undefined,
      audit_modules: expect.arrayContaining(["students", "users"]), audit_action_types: ["update"],
    })));
  });

  test("shows replay backfill warning", () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: "از امروز" }));
    expect(screen.getByText(/تعداد زیادی job/)).toBeInTheDocument();
  });
});
