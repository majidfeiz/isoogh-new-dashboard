import { downloadOutboundExcel, outboundExcelFilename } from "./outboundCallHistoryExcelUtils.js"

test("reads UTF-8 and regular Excel filenames with the required fallback", () => {
  expect(outboundExcelFilename("attachment; filename*=UTF-8''%DA%AF%D8%B2%D8%A7%D8%B1%D8%B4.xlsx")).toBe("گزارش.xlsx")
  expect(outboundExcelFilename("attachment; filename=custom.xlsx")).toBe("custom.xlsx")
  expect(outboundExcelFilename("")).toBe("outbound-call-histories.xlsx")
})

test("downloads the xlsx blob and revokes its object URL", () => {
  const link = { click: jest.fn(), remove: jest.fn() }
  const documentRef = { createElement: jest.fn(() => link), body: { appendChild: jest.fn() } }
  const urlApi = { createObjectURL: jest.fn(() => "blob:xlsx"), revokeObjectURL: jest.fn() }
  const blob = new Blob(["xlsx"], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  downloadOutboundExcel(blob, "calls.xlsx", documentRef, urlApi)
  expect(link).toEqual(expect.objectContaining({ href: "blob:xlsx", download: "calls.xlsx" }))
  expect(link.click).toHaveBeenCalled()
  expect(link.remove).toHaveBeenCalled()
  expect(urlApi.revokeObjectURL).toHaveBeenCalledWith("blob:xlsx")
})
