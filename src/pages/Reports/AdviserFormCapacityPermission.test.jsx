import React from "react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import ProtectedRoute from "../../components/Access/ProtectedRoute.jsx"
import { useAuth } from "../../context/AuthContext.jsx"

jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: jest.fn() }))
const renderRoute = () => render(<MemoryRouter initialEntries={["/reports/adviser-form-capacity"]}><Routes>
  <Route path="/reports/adviser-form-capacity" element={<ProtectedRoute permission="reports.adviser-form-capacity.index"><div>گزارش ظرفیت</div></ProtectedRoute>} />
  <Route path="/403" element={<div>دسترسی غیرمجاز</div>} />
</Routes></MemoryRouter>)

test("capacity report is visible with its permission", () => { useAuth.mockReturnValue({ hasPermission: (permission) => permission === "reports.adviser-form-capacity.index" }); renderRoute(); expect(screen.getByText("گزارش ظرفیت")).toBeInTheDocument() })
test("capacity report is hidden without its permission", () => { useAuth.mockReturnValue({ hasPermission: () => false }); renderRoute(); expect(screen.getByText("دسترسی غیرمجاز")).toBeInTheDocument() })
