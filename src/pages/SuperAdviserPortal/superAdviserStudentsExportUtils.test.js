import {
  saveSuperAdviserStudentsBlob,
  superAdviserStudentsFilename,
} from "./superAdviserStudentsExportUtils.js";

test("reads the Excel filename from Content-Disposition with fallback", () => {
  expect(superAdviserStudentsFilename("attachment; filename=students-1405.xlsx")).toBe("students-1405.xlsx");
  expect(superAdviserStudentsFilename("attachment; filename*=UTF-8''students%20export.xlsx")).toBe("students export.xlsx");
  expect(superAdviserStudentsFilename("")).toBe("super-adviser-students.xlsx");
});

test("downloads the Blob and revokes its object URL", () => {
  const link = { click: jest.fn(), remove: jest.fn() };
  const documentRef = { createElement: jest.fn(() => link), body: { appendChild: jest.fn() } };
  const urlApi = { createObjectURL: jest.fn(() => "blob:students"), revokeObjectURL: jest.fn() };
  const blob = new Blob(["xlsx"]);

  expect(saveSuperAdviserStudentsBlob(blob, "", documentRef, urlApi)).toBe("super-adviser-students.xlsx");
  expect(urlApi.createObjectURL).toHaveBeenCalledWith(blob);
  expect(link.click).toHaveBeenCalled();
  expect(urlApi.revokeObjectURL).toHaveBeenCalledWith("blob:students");
});
