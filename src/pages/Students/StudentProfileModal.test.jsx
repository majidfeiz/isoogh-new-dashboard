import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import StudentProfileModal from "./StudentProfileModal.jsx";
import { getStudentProfile } from "../../services/studentService.jsx";

jest.mock("../../services/studentService.jsx", () => ({ getStudentProfile: jest.fn() }));

const student = { id: 12, schools: [{ id: 7, name: "مدرسه امید" }] };
const profile = {
  student: { id: 12, name: "علی رضایی", code: "ST-12", city: "تهران", gpa: 19, schools: student.schools, tags: [{ id: 1, name: "کنکوری" }] },
  identity: { name: "علی رضایی", username: "ali12", phone: "09121234567", email: "a@test.ir", ssn: "0012345678", gender: "مرد" },
  workShift: { id: 2, name: "صبح" },
  contacts: [{ id: 5, title: "پدر", phoneNumber: "09120000000", isDefault: true }],
  defaultContact: { id: 5, title: "پدر", phoneNumber: "09120000000" },
  advisers: [{ id: 9, name: "مشاور نمونه", code: "A9", isSupervisor: true }],
  calls: { total: 8, successful: 6, unsuccessful: 2, lastCallAt: null },
  supportForms: { total: 4, pending: 1, completed: 3 },
};

beforeEach(() => getStudentProfile.mockReset());

test("requests the selected student profile and renders every section and default contact", async () => {
  getStudentProfile.mockResolvedValue(profile);
  render(<StudentProfileModal isOpen student={student} activeSchoolId="7" onClose={jest.fn()} />);

  expect(await screen.findByText("اطلاعات فردی")).toBeInTheDocument();
  expect(getStudentProfile).toHaveBeenCalledWith({ studentId: 12, schoolId: "7", signal: expect.any(AbortSignal) });
  ["محل سکونت و تحصیل", "تلفن‌ها", "مشاوران", "مدارس و تگ‌ها"].forEach((title) => expect(screen.getByText(title)).toBeInTheDocument());
  expect(screen.getByText("پیش‌فرض")).toBeInTheDocument();
  expect(screen.getByText("مشاور نمونه")).toBeInTheDocument();
  expect(screen.getByText("صبح")).toBeInTheDocument();
});

test("asks for school context before requesting a multi-school student", async () => {
  getStudentProfile.mockResolvedValue(profile);
  const multiSchoolStudent = { id: 12, schools: [{ id: 7, name: "امید" }, { id: 8, name: "دانش" }] };
  render(<StudentProfileModal isOpen student={multiSchoolStudent} onClose={jest.fn()} />);

  expect(getStudentProfile).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("مدرسه"), { target: { value: "8" } });
  fireEvent.click(screen.getByRole("button", { name: "مشاهده پرونده" }));

  await waitFor(() => expect(getStudentProfile).toHaveBeenCalledWith({ studentId: 12, schoolId: "8", signal: expect.any(AbortSignal) }));
});

test("shows skeleton while loading", () => {
  getStudentProfile.mockReturnValue(new Promise(() => {}));
  render(<StudentProfileModal isOpen student={student} activeSchoolId="7" onClose={jest.fn()} />);
  expect(screen.getByLabelText("در حال بارگذاری پرونده دانش‌آموز")).toBeInTheDocument();
});

test.each([
  [403, "دسترسی ندارید"],
  [404, "یافت نشد"],
])("shows a specific %s error and retries", async (status, message) => {
  getStudentProfile.mockRejectedValueOnce({ response: { status } }).mockResolvedValueOnce(profile);
  render(<StudentProfileModal isOpen student={student} activeSchoolId="7" onClose={jest.fn()} />);

  const alert = await screen.findByRole("alert");
  expect(within(alert).getByText(new RegExp(message))).toBeInTheDocument();
  fireEvent.click(within(alert).getByRole("button", { name: "تلاش مجدد" }));
  expect(await screen.findByText("اطلاعات فردی")).toBeInTheDocument();
  expect(getStudentProfile).toHaveBeenCalledTimes(2);
});

test("renders null shift, default contact and adviser states", async () => {
  getStudentProfile.mockResolvedValue({ ...profile, workShift: null, contacts: [], defaultContact: null, advisers: [], identity: {}, student: { ...profile.student, phone: null } });
  render(<StudentProfileModal isOpen student={student} activeSchoolId="7" onClose={jest.fn()} />);

  expect(await screen.findByText("اطلاعات فردی")).toBeInTheDocument();
  expect(screen.getByText("مشاوری متصل نشده است.")).toBeInTheDocument();
  expect(screen.getByText("مخاطب یا شماره تلفنی ثبت نشده است.")).toBeInTheDocument();
  const shiftLabel = screen.getByText("شیفت کاری").parentElement;
  expect(within(shiftLabel).getByText("—")).toBeInTheDocument();
  expect(screen.getByText("مخاطب پیش‌فرض:").parentElement).toHaveTextContent("—");
});
