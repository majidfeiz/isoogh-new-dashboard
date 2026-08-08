import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import ProtectedRoute from "../../../components/Access/ProtectedRoute.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";

jest.mock("../../../context/AuthContext.jsx", () => ({ useAuth: jest.fn() }));

const renderRoute = () => render(<MemoryRouter initialEntries={["/voip/call-queue"]}><Routes>
  <Route path="/voip/call-queue" element={<ProtectedRoute permission="voip.call-queue.index"><div>صف تماس</div></ProtectedRoute>} />
  <Route path="/403" element={<div>دسترسی غیرمجاز</div>} />
</Routes></MemoryRouter>);

test("call queue page is only visible with voip.call-queue.index", () => {
  useAuth.mockReturnValue({ hasPermission: (permission) => permission === "voip.call-queue.index" });
  renderRoute();
  expect(screen.getByText("صف تماس")).toBeInTheDocument();
});

test("call queue page redirects users without permission", () => {
  useAuth.mockReturnValue({ hasPermission: () => false });
  renderRoute();
  expect(screen.getByText("دسترسی غیرمجاز")).toBeInTheDocument();
});
