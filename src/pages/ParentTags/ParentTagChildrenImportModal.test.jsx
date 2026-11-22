import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ParentTagChildrenImportModal from "./ParentTagChildrenImportModal.jsx";
import {
  downloadParentTagChildrenTemplate,
  importParentTagChildren,
} from "../../services/parentTagService.jsx";

jest.mock("../../services/parentTagService.jsx", () => ({
  downloadParentTagChildrenTemplate: jest.fn(),
  importParentTagChildren: jest.fn(),
}));

const parentTag = { id: 12, name: "دروس", parent_id: 0, school_id: 94, school: { id: 94, name: "مجموعه تهران" } };

beforeEach(() => {
  jest.clearAllMocks();
  window.URL.createObjectURL = jest.fn(() => "blob:template");
  window.URL.revokeObjectURL = jest.fn();
});

const chooseFile = (name = "children.xlsx", content = "xlsx") => {
  const file = new File([content], name, { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  fireEvent.change(screen.getByLabelText(/فایل اکسل/), { target: { files: [file] } });
  return file;
};

test("shows parent and school and downloads the API template blob", async () => {
  downloadParentTagChildrenTemplate.mockResolvedValue({
    blob: new Blob(["xlsx"]),
    headers: { "content-disposition": "attachment; filename=children-template.xlsx" },
  });
  render(<ParentTagChildrenImportModal isOpen toggle={jest.fn()} parentTag={parentTag} />);

  expect(screen.getByText(/سر‌تگ: دروس/)).toBeInTheDocument();
  expect(screen.getByText(/مجموعه: مجموعه تهران/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "دانلود فایل نمونه" }));
  await waitFor(() => expect(downloadParentTagChildrenTemplate).toHaveBeenCalledWith(12, 94));
  expect(window.URL.createObjectURL).toHaveBeenCalled();
});

test("submits once, renders success and skipped duplicates, then refetches", async () => {
  const onImported = jest.fn().mockResolvedValue(undefined);
  importParentTagChildren.mockResolvedValue({
    totalRows: 4,
    createdCount: 2,
    skippedCount: 2,
    skippedRows: [{ rowNumber: 3, name: "ریاضی", reason: "تگ تکراری است" }],
  });
  render(<ParentTagChildrenImportModal isOpen toggle={jest.fn()} parentTag={parentTag} onImported={onImported} />);
  const file = chooseFile();
  const submit = screen.getByRole("button", { name: "ایمپورت زیرتگ‌ها" });
  fireEvent.click(submit);
  fireEvent.click(submit);

  await waitFor(() => expect(importParentTagChildren).toHaveBeenCalledTimes(1));
  expect(importParentTagChildren).toHaveBeenCalledWith(12, { file, schoolId: 94 });
  expect(await screen.findByText("تگ تکراری است")).toBeInTheDocument();
  expect(screen.getByText(/ایجادشده:/)).toBeInTheDocument();
  expect(onImported).toHaveBeenCalledWith({ parentTagId: 12, schoolId: 94 });
});

test("keeps the modal open and renders structured 400 validation rows", async () => {
  importParentTagChildren.mockRejectedValue({
    response: { status: 400, data: { message: { errors: [{ rowNumber: 2, name: "", reason: "header نام تگ یافت نشد" }] } } },
  });
  render(<ParentTagChildrenImportModal isOpen toggle={jest.fn()} parentTag={parentTag} />);
  chooseFile();
  fireEvent.click(screen.getByRole("button", { name: "ایمپورت زیرتگ‌ها" }));

  expect(await screen.findByText("header نام تگ یافت نشد")).toBeInTheDocument();
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});

test("rejects non-xlsx files and files larger than ten megabytes", () => {
  render(<ParentTagChildrenImportModal isOpen toggle={jest.fn()} parentTag={parentTag} />);
  chooseFile("children.xls");
  expect(screen.getByText("فقط فایل با پسوند .xlsx قابل قبول است.")).toBeInTheDocument();

  const large = new File(["x"], "large.xlsx");
  Object.defineProperty(large, "size", { value: 10 * 1024 * 1024 + 1 });
  fireEvent.change(screen.getByLabelText(/فایل اکسل/), { target: { files: [large] } });
  expect(screen.getByText("حجم فایل نباید بیشتر از ۱۰ مگابایت باشد.")).toBeInTheDocument();
});
