import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import StudentTagEditButton from "./StudentTagEditButton.jsx";

test("hides the tag action without view permission", () => {
  render(<StudentTagEditButton canView={false} onClick={jest.fn()} />);
  expect(screen.queryByRole("button", { name: /ویرایش تگ‌ها/ })).not.toBeInTheDocument();
});

test("shows and activates the tag action with view permission", () => {
  const onClick = jest.fn();
  render(<StudentTagEditButton canView onClick={onClick} />);
  fireEvent.click(screen.getByRole("button", { name: /ویرایش تگ‌ها/ }));
  expect(onClick).toHaveBeenCalledTimes(1);
});
