import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import VoipWebhookList from "./VoipWebhookList.jsx";
import { getVoipWebhooks, testVoipWebhook } from "../../services/voipWebhookService.jsx";

jest.mock("../../components/Common/Breadcrumb", () => () => null);
jest.mock("../../components/Common/TableContainer", () => (props) => (
  <div>{props.data.map((row) => <div key={row.id}>{props.columns.map((column) => <span key={column.id}>{column.cell ? column.cell({ row: { original: row }, getValue: () => row[column.accessorKey] }) : row[column.accessorKey]}</span>)}</div>)}</div>
));
jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: () => ({ hasPermission: () => true }) }));
jest.mock("../../services/voipWebhookService.jsx", () => ({
  getVoipWebhooks: jest.fn(),
  testVoipWebhook: jest.fn(),
  deleteVoipWebhook: jest.fn(),
}));
jest.mock("react-toastify", () => ({ toast: { success: jest.fn(), warning: jest.fn(), error: jest.fn() } }));

test("queues a test for an audit webhook and displays its type and school", async () => {
  getVoipWebhooks.mockResolvedValue([{ id: 8, name: "Audit Hook", event_type: "audit_log", school_id: 3 }]);
  testVoipWebhook.mockResolvedValue({ enqueued: 1 });
  render(<MemoryRouter><VoipWebhookList /></MemoryRouter>);
  expect(await screen.findByText("تغییرات")).toBeInTheDocument();
  expect(screen.getByText("#3")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "ثبت در صف تست" }));
  await waitFor(() => expect(testVoipWebhook).toHaveBeenCalledWith(8));
});
