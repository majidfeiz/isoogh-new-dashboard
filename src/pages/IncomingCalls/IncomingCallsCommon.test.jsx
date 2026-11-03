import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { SchoolPicker } from "./IncomingCallsCommon.jsx";
import { getSchools } from "../../services/schoolService.jsx";

const mockSetSelectedSchoolId = jest.fn();

jest.mock("../../context/AuthContext.jsx", () => ({
  useAuth: () => ({
    user: { role: "manager" },
    hasPermission: (permission) => permission === "schools.index",
    setSelectedSchoolId: mockSetSelectedSchoolId,
  }),
}));

jest.mock("../../services/schoolService.jsx", () => ({
  getSchools: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test("automatically selects the manager's only permitted school", async () => {
  const onChange = jest.fn();
  getSchools.mockResolvedValue({ items: [{ id: 94, name: "مجموعه مدیر" }] });

  render(<SchoolPicker value="" onChange={onChange} />);

  await waitFor(() => expect(onChange).toHaveBeenCalledWith("94"));
  expect(mockSetSelectedSchoolId).toHaveBeenCalledWith("94");
  expect(screen.getByRole("option", { name: "مجموعه مدیر" })).toBeInTheDocument();
});

test("does not replace an existing school selection", async () => {
  const onChange = jest.fn();
  getSchools.mockResolvedValue({ items: [{ id: 94, name: "مجموعه مدیر" }] });

  render(<SchoolPicker value="12" onChange={onChange} />);

  await screen.findByRole("option", { name: "مجموعه مدیر" });
  expect(onChange).not.toHaveBeenCalled();
  expect(mockSetSelectedSchoolId).not.toHaveBeenCalled();
});
