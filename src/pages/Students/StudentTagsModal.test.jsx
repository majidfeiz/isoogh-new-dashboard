import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import StudentTagsModal from "./StudentTagsModal.jsx";
import { getStudentParentTags, syncStudentParentTags } from "../../services/parentTagService.jsx";

jest.mock("../../services/parentTagService.jsx", () => ({
  getStudentParentTags: jest.fn(),
  syncStudentParentTags: jest.fn(),
}));
jest.mock("react-toastify", () => ({ toast: { success: jest.fn() } }));

const student = { id: 1001, name: "دانش‌آموز تست", schools: [{ id: 10, name: "مدرسه تست" }] };
const response = {
  studentId: 1001,
  schoolId: 10,
  availableTags: [
    { id: 12, name: "پیگیری ویژه", parent_id: 0 },
    { id: 18, name: "فرزند ویژه", parent_id: 12 },
    { id: 20, name: "بدون والد", parent_id: 999 },
  ],
  selectedTagIds: [12],
};

beforeEach(() => {
  getStudentParentTags.mockReset();
  syncStudentParentTags.mockReset();
  getStudentParentTags.mockResolvedValue(response);
});

test("loads grouped tags and current selections", async () => {
  render(<StudentTagsModal open student={student} canEdit activeSchoolId="10" onClose={jest.fn()} />);
  expect(screen.getByText("در حال بارگذاری...", { exact: false })).toBeInTheDocument();
  expect(await screen.findByText("پیگیری ویژه")).toBeInTheDocument();
  expect(screen.getByText("فرزند ویژه")).toBeInTheDocument();
  expect(screen.getByText("سایر")).toBeInTheDocument();
  expect(screen.getByRole("checkbox", { name: /پیگیری ویژه/ })).toBeChecked();
});

test("adds and removes tags and saves the exact snapshot", async () => {
  const onSaved = jest.fn();
  render(<StudentTagsModal open student={student} canEdit activeSchoolId="10" onClose={jest.fn()} onSaved={onSaved} />);
  const parent = await screen.findByRole("checkbox", { name: /پیگیری ویژه/ });
  fireEvent.click(parent);
  fireEvent.click(screen.getByRole("checkbox", { name: /فرزند ویژه/ }));
  syncStudentParentTags.mockResolvedValue({ selectedTagIds: [18] });
  fireEvent.click(screen.getByRole("button", { name: "ذخیره" }));
  await waitFor(() => expect(syncStudentParentTags).toHaveBeenCalledWith(1001, { schoolId: 10, tagIds: [18] }));
  expect(onSaved).toHaveBeenCalledTimes(1);
});

test("keeps a checkbox selection when the student row object is recreated", async () => {
  const { rerender } = render(<StudentTagsModal open student={student} canEdit activeSchoolId="10" onClose={jest.fn()} />);
  const child = await screen.findByRole("checkbox", { name: /فرزند ویژه/ });
  fireEvent.click(screen.getByText("فرزند ویژه"));
  expect(child).toBeChecked();

  rerender(<StudentTagsModal open student={{ ...student }} canEdit activeSchoolId="10" onClose={jest.fn()} />);

  expect(child).toBeChecked();
  expect(getStudentParentTags).toHaveBeenCalledTimes(1);
});

test("toggles a tag from the full row and keyboard like the working question checkbox", async () => {
  render(<StudentTagsModal open student={student} canEdit activeSchoolId="10" onClose={jest.fn()} />);
  const child = await screen.findByRole("checkbox", { name: /فرزند ویژه/ });
  const row = child.closest('[role="button"]');

  fireEvent.click(row);
  expect(child).toBeChecked();

  fireEvent.keyDown(row, { key: "Enter" });
  expect(child).not.toBeChecked();

  fireEvent.keyDown(row, { key: " " });
  expect(child).toBeChecked();
});

test("sends an empty snapshot and prevents a duplicate submit", async () => {
  let resolveSave;
  syncStudentParentTags.mockReturnValue(new Promise((resolve) => { resolveSave = resolve; }));
  render(<StudentTagsModal open student={student} canEdit activeSchoolId="10" onClose={jest.fn()} />);
  fireEvent.click(await screen.findByRole("checkbox", { name: /پیگیری ویژه/ }));
  const save = screen.getByRole("button", { name: "ذخیره" });
  fireEvent.click(save);
  fireEvent.click(save);
  expect(syncStudentParentTags).toHaveBeenCalledTimes(1);
  expect(syncStudentParentTags).toHaveBeenCalledWith(1001, { schoolId: 10, tagIds: [] });
  await act(async () => resolveSave({ selectedTagIds: [] }));
});

test("keeps the modal and selection open after an API error", async () => {
  syncStudentParentTags.mockRejectedValue({ response: { status: 403 } });
  render(<StudentTagsModal open student={student} canEdit activeSchoolId="10" onClose={jest.fn()} />);
  const child = await screen.findByRole("checkbox", { name: /فرزند ویژه/ });
  fireEvent.click(child);
  fireEvent.click(screen.getByRole("button", { name: "ذخیره" }));
  expect(await screen.findByText(/اجازه مشاهده یا ویرایش/)).toBeInTheDocument();
  expect(child).toBeChecked();
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});

test("renders read-only controls without a save action", async () => {
  render(<StudentTagsModal open student={student} canEdit={false} activeSchoolId="10" onClose={jest.fn()} />);
  expect(await screen.findByRole("checkbox", { name: /پیگیری ویژه/ })).toBeDisabled();
  expect(screen.queryByRole("button", { name: "ذخیره" })).not.toBeInTheDocument();
});
