import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import IncomingSupporterPanel from "./IncomingSupporterPanel.jsx";
import { getIncomingAvailability, setIncomingAvailability } from "../../services/incomingCallService.jsx";

const mockRefreshMe = jest.fn();
const mockSetSelectedSchoolId = jest.fn();
jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: () => ({
  hasPermission: (permission) => permission === "incoming-calls.realtime.subscribe",
  refreshMe: mockRefreshMe,
  setSelectedSchoolId: mockSetSelectedSchoolId,
}) }));
jest.mock("../../services/incomingCallService.jsx", () => ({
  getIncomingAvailability: jest.fn(),
  setIncomingAvailability: jest.fn(),
  incomingCallErrorMessage: (error) => error?.response?.data?.message || "خطا",
}));
jest.mock("./IncomingCallsCommon.jsx", () => ({
  SchoolPicker: ({ value, onChange, disabled }) => <select aria-label="مجموعه" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}><option value="146">مدرسه</option><option value="147">مدرسه دوم</option></select>,
}));
jest.mock("react-toastify", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.setItem("incoming_calls_school_id", "146");
  global.fetch = jest.fn().mockResolvedValue({ ok: true });
  getIncomingAvailability.mockResolvedValue({ actorType: "consultant", schoolId: 146, isAvailable: true });
});

afterEach(() => sessionStorage.clear());

test("shows consultant availability but keeps effective receiving disabled until socket ACK", async () => {
  render(<MemoryRouter><IncomingSupporterPanel /></MemoryRouter>);
  const toggle = await screen.findByRole("switch", { name: "آماده دریافت تماس" });

  expect(getIncomingAvailability).toHaveBeenCalledWith("146", expect.any(AbortSignal));
  expect(await screen.findByText("مشاور")).toBeInTheDocument();
  expect(toggle).toBeChecked();
  expect(toggle).toBeDisabled();
  expect(screen.getAllByText(/اتصال زنده برقرار نیست/).length).toBeGreaterThan(0);

  fireEvent(window, new CustomEvent("incoming-calls:connection", { detail: { schoolId: 146, status: "subscribed" } }));
  await waitFor(() => expect(toggle).toBeEnabled());
  expect(screen.getByText("آماده")).toBeInTheDocument();
});

test("sends the exact PATCH body through the service and blocks double submit", async () => {
  getIncomingAvailability.mockResolvedValue({ actorType: "consultant", schoolId: 146, isAvailable: false });
  let resolvePatch;
  setIncomingAvailability.mockImplementation(() => new Promise((resolve) => { resolvePatch = resolve; }));
  render(<MemoryRouter><IncomingSupporterPanel /></MemoryRouter>);
  const toggle = await screen.findByRole("switch", { name: "آماده دریافت تماس" });
  fireEvent(window, new CustomEvent("incoming-calls:connection", { detail: { schoolId: 146, status: "subscribed" } }));
  await waitFor(() => expect(toggle).toBeEnabled());

  fireEvent.click(toggle);
  fireEvent.click(toggle);
  expect(setIncomingAvailability).toHaveBeenCalledTimes(1);
  expect(setIncomingAvailability).toHaveBeenCalledWith("146", true);
  expect(toggle).toBeDisabled();
  resolvePatch({ actorType: "consultant", schoolId: 146, isAvailable: true });
  await waitFor(() => expect(toggle).toBeChecked());
});

test("resets and refetches availability when school changes", async () => {
  getIncomingAvailability
    .mockResolvedValueOnce({ actorType: "consultant", schoolId: 146, isAvailable: false })
    .mockResolvedValueOnce({ actorType: "consultant", schoolId: 147, isAvailable: false });
  render(<MemoryRouter><IncomingSupporterPanel /></MemoryRouter>);
  await screen.findByRole("switch", { name: "آماده دریافت تماس" });
  fireEvent.change(screen.getByRole("combobox", { name: "مجموعه" }), { target: { value: "147" } });
  await waitFor(() => expect(getIncomingAvailability).toHaveBeenLastCalledWith("147", expect.any(AbortSignal)));
  expect(mockSetSelectedSchoolId).toHaveBeenLastCalledWith("147");
});
