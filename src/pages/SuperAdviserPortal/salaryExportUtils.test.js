import { salaryExportErrorMessage, salaryExportFilename, saveSalaryExportBlob } from "./salaryExportUtils.js";

test("reads salary filename from Content-Disposition and falls back to Jalali year/month", () => {
  expect(salaryExportFilename("attachment; filename=salary-1405.xlsx", 1405, 5)).toBe("salary-1405.xlsx");
  expect(salaryExportFilename("attachment; filename*=UTF-8''salary%20report.xlsx", 1405, 5)).toBe("salary report.xlsx");
  expect(salaryExportFilename("", 1405, 5)).toBe("super-adviser-salary-1405-05.xlsx");
});

test("downloads salary Blob and revokes the temporary URL", () => {
  const link = { click: jest.fn(), remove: jest.fn() };
  const documentRef = { createElement: jest.fn(() => link), body: { appendChild: jest.fn() } };
  const urlApi = { createObjectURL: jest.fn(() => "blob:salary"), revokeObjectURL: jest.fn() };
  const blob = new Blob(["xlsx"]);
  expect(saveSalaryExportBlob(blob, "", 1405, 5, documentRef, urlApi)).toBe("super-adviser-salary-1405-05.xlsx");
  expect(urlApi.createObjectURL).toHaveBeenCalledWith(blob);
  expect(link.click).toHaveBeenCalled();
  expect(urlApi.revokeObjectURL).toHaveBeenCalledWith("blob:salary");
});

test("extracts an API message from a Blob error", async () => {
  const error = { response: { data: new Blob([JSON.stringify({ message: "گزارش قابل دریافت نیست" })], { type: "application/json" }) } };
  await expect(salaryExportErrorMessage(error)).resolves.toBe("گزارش قابل دریافت نیست");
});
