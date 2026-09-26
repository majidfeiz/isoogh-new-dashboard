import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import OutboundExportActions from "./OutboundExportActions.jsx"

const renderActions = (permissions, props = {}) => render(<OutboundExportActions
  hasPermission={(permission) => permissions.includes(permission)} exportBusy={false}
  tableLoading={false} onExport={jest.fn()} onCancel={jest.fn()} {...props} />)

test("Excel visibility uses only its independent permission", () => {
  const { rerender } = renderActions(["voip.outbound.index.export-excel"])
  expect(screen.getByRole("option", { name: "Excel (XLSX)" })).toBeInTheDocument()
  expect(screen.queryByRole("option", { name: "CSV" })).not.toBeInTheDocument()
  rerender(<OutboundExportActions hasPermission={(permission) => permission === "voip.outbound.index.export"}
    exportBusy={false} tableLoading={false} onExport={jest.fn()} onCancel={jest.fn()} />)
  expect(screen.getByRole("option", { name: "CSV" })).toBeInTheDocument()
  expect(screen.queryByRole("option", { name: "Excel (XLSX)" })).not.toBeInTheDocument()
})

test("Excel loading prevents repeated clicks and exposes cancel", () => {
  const onExport = jest.fn()
  const { rerender } = renderActions(["voip.outbound.index.export-excel"], { onExport })
  fireEvent.click(screen.getByTestId("export-button"))
  expect(onExport).toHaveBeenCalledWith("xlsx")
  rerender(<OutboundExportActions hasPermission={() => true} exportBusy tableLoading={false}
    onExport={onExport} onCancel={jest.fn()} />)
  expect(screen.getByTestId("export-button")).toBeDisabled()
  expect(screen.getByRole("button", { name: /لغو/ })).toBeInTheDocument()
})

test("user can choose CSV before exporting", () => {
  const onExport = jest.fn()
  renderActions(["voip.outbound.index.export", "voip.outbound.index.export-excel"], { onExport })
  fireEvent.change(screen.getByRole("combobox", { name: "فرمت خروجی" }), { target: { value: "xlsx" } })
  fireEvent.click(screen.getByTestId("export-button"))
  expect(onExport).toHaveBeenCalledWith("xlsx")
})
