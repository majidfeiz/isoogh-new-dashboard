import React, { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import UsernameAsPhoneSwitch from "./UsernameAsPhoneSwitch.jsx";
import { DEFAULT_USE_USERNAME_AS_PHONE } from "./studentImportUtils.js";

const Harness = ({ disabled = false }) => {
  const [checked, setChecked] = useState(DEFAULT_USE_USERNAME_AS_PHONE);
  return <UsernameAsPhoneSwitch checked={checked} disabled={disabled} onChange={setChecked} />;
};

test("starts off and lets the user enable username as phone", () => {
  render(<Harness />);
  const input = screen.getByRole("switch", { name: "ثبت نام کاربری به‌عنوان شماره تلفن" });
  expect(input).toHaveAttribute("aria-checked", "false");
  expect(screen.getByText("غیرفعال")).toBeInTheDocument();
  fireEvent.click(input);
  expect(input).toHaveAttribute("aria-checked", "true");
  expect(screen.getByText("فعال")).toBeInTheDocument();
  expect(screen.getByText(/شماره تلفن تکراری/)).toBeInTheDocument();
});

test("is disabled while import is loading", () => {
  render(<Harness disabled />);
  expect(screen.getByRole("switch", { name: "ثبت نام کاربری به‌عنوان شماره تلفن" })).toBeDisabled();
});
