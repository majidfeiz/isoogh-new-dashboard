import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import OutboundExportActions from "./OutboundExportActions.jsx"

const renderActions = (permissions, props = {}) => render(<OutboundExportActions
  hasPermission={(permission) => permissions.includes(permission)}
  excelBusy={false} onExport={jest.fn()} onCancel={jest.fn()} {...props} />)

test("Excel visibility uses only its independent permission", () => {
  const { rerender } = renderActions(["voip.outbound.index.export-excel"])
  expect(screen.getByRole("button", { name: /خروجی Excel/ })).toBeInTheDocument()
  expect(screen.queryByRole("button", { name: /خروجی CSV/ })).not.toBeInTheDocument()
  rerender(<OutboundExportActions hasPermission={(permission) => permission === "voip.outbound.index.export"}
    excelBusy={false} onExport={jest.fn()} onCancel={jest.fn()} />)
  expect(screen.getByRole("button", { name: /خروجی CSV/ })).toBeInTheDocument()
  expect(screen.queryByRole("button", { name: /خروجی Excel/ })).not.toBeInTheDocument()
})

test("Excel loading prevents repeated clicks and exposes cancel", () => {
  const onExport = jest.fn()
  const { rerender } = renderActions(["voip.outbound.index.export-excel"], { onExport })
  fireEvent.click(screen.getByTestId("excel-export-button"))
  expect(onExport).toHaveBeenCalledWith("xlsx")
  rerender(<OutboundExportActions hasPermission={() => true} excelBusy
    onExport={onExport} onCancel={jest.fn()} />)
  expect(screen.getByTestId("excel-export-button")).toBeDisabled()
  expect(screen.getByRole("button", { name: /خروجی CSV/ })).toBeEnabled()
  expect(screen.getByRole("button", { name: /لغو/ })).toBeInTheDocument()
})

test("CSV remains an independent action", () => {
  const onExport = jest.fn()
  renderActions(["voip.outbound.index.export", "voip.outbound.index.export-excel"], { onExport })
  fireEvent.click(screen.getByRole("button", { name: /خروجی CSV/ }))
  expect(onExport).toHaveBeenCalledWith("csv")
})
