import React from "react";
import { render, screen } from "@testing-library/react";
import TicketMessageItem from "./TicketMessageItem.jsx";

test.each([
  [{ senderName: "مریم پشتیبان", senderOrganizationName: "آیسوق", senderSide: "isoogh", message: "پاسخ پشتیبانی" }, "مریم پشتیبان", "آیسوق"],
  [{ senderName: "رضا مدیر", senderOrganizationName: "مدرسه دانا", senderSide: "school", message: "پاسخ مدرسه" }, "رضا مدیر", "مدرسه دانا"],
])("renders the real backend sender and accessible organization badge", (item, sender, badge) => {
  render(<TicketMessageItem item={{ id: 1, createdAt: null, ...item }} ticket={{}} />);
  expect(screen.getByText(sender)).toBeInTheDocument();
  expect(screen.getByText(badge, { selector: ".badge" })).toBeInTheDocument();
  expect(screen.getByText(item.message)).toBeInTheDocument();
});

test("renders null legacy identity safely", () => {
  render(<TicketMessageItem item={{ id: 1, senderName: null, senderOrganizationName: null, senderSide: "school", message: "قدیمی", createdAt: null }} ticket={{}} />);
  expect(screen.getByText("کاربر نامشخص")).toBeInTheDocument();
  expect(screen.getAllByText("مجموعه نامشخص").length).toBeGreaterThan(0);
});

