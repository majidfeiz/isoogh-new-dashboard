import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import OutboundExportActions from "./OutboundExportActions.jsx"

const renderActions = (permissions, props = {}) => render(<OutboundExportActions
  hasPermission={(permission) => permissions.includes(permission)} csvBusy={false} excelLoading={false}
  tableLoading={false} onCsv={jest.fn()} onExcel={jest.fn()} onCancelCsv={jest.fn()} {...props} />)

test("Excel visibility uses only its independent permission", () => {
  const { rerender } = renderActions(["voip.outbound.index.export-excel"])
  expect(screen.getByRole("button", { name: /خروجی Excel/ })).toBeInTheDocument()
  expect(screen.queryByRole("button", { name: /خروجی مدت/ })).not.toBeInTheDocument()
  rerender(<OutboundExportActions hasPermission={(permission) => permission === "voip.outbound.index.export"}
    csvBusy={false} excelLoading={false} tableLoading={false} onCsv={jest.fn()} onExcel={jest.fn()} onCancelCsv={jest.fn()} />)
  expect(screen.queryByRole("button", { name: /خروجی Excel/ })).not.toBeInTheDocument()
  expect(screen.getByRole("button", { name: /خروجی مدت/ })).toBeInTheDocument()
})

test("Excel has independent loading and prevents repeated clicks", () => {
  const onExcel = jest.fn()
  const { rerender } = renderActions(["voip.outbound.index.export-excel", "voip.outbound.index.export"], { onExcel })
  fireEvent.click(screen.getByTestId("excel-export-button"))
  expect(onExcel).toHaveBeenCalledTimes(1)
  rerender(<OutboundExportActions hasPermission={() => true} csvBusy={false} excelLoading tableLoading={false}
    onCsv={jest.fn()} onExcel={onExcel} onCancelCsv={jest.fn()} />)
  expect(screen.getByTestId("excel-export-button")).toBeDisabled()
  expect(screen.getByRole("button", { name: /خروجی مدت/ })).not.toBeDisabled()
})
