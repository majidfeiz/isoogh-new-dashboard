import React from "react";
import { render, screen, within } from "@testing-library/react";
import { adviserProfileGender, StudentInfoTab } from "./StudentProfile.jsx";

jest.mock("../../services/adviserPortalService.jsx", () => ({}));
jest.mock("../../services/voipService.jsx", () => ({ getCallTrace: jest.fn() }));
jest.mock("../../context/ActiveCallContext.jsx", () => ({ useActiveCall: () => ({}) }));
jest.mock("react-toastify", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const education = {
  schoolName: "مجموعه نمونه",
  grade: "دوازدهم",
  major: "ریاضی فیزیک",
  sexuality: "female",
  instituteType: "دولتی",
  instituteName: "دبیرستان نمونه",
  gpa: "12.37",
  decile: "4",
  scholarshipType: "نیمه‌بورسیه",
};

test("renders all education labels and values without rounding GPA", () => {
  render(<StudentInfoTab profile={{ name: "دانش‌آموز نمونه", totalCalls: 3, ...education }} loading={false} />);

  expect(screen.getByRole("heading", { name: "اطلاعات تحصیلی و حمایتی" })).toBeInTheDocument();
  const expected = {
    "اسم مجموعه": "مجموعه نمونه",
    "پایه تحصیلی": "دوازدهم",
    "رشته تحصیلی": "ریاضی فیزیک",
    "جنسیت": "زن",
    "نوع مدرسه": "دولتی",
    "نام مدرسه": "دبیرستان نمونه",
    "معدل": "12.37",
    "دهک": "4",
    "نوع بورسیه": "نیمه‌بورسیه",
  };
  Object.entries(expected).forEach(([label, value]) => {
    expect(within(screen.getByText(label).parentElement).getByText(value)).toBeInTheDocument();
  });
});

test("renders placeholders for absent education fields while preserving numeric zero", () => {
  render(<StudentInfoTab profile={{ name: "نمونه", ...Object.fromEntries(Object.keys(education).map((key) => [key, null])), gpa: 0 }} loading={false} />);

  ["اسم مجموعه", "پایه تحصیلی", "رشته تحصیلی", "جنسیت", "نوع مدرسه", "نام مدرسه", "دهک", "نوع بورسیه"].forEach((label) => {
    expect(within(screen.getByText(label).parentElement).getByText("—")).toBeInTheDocument();
  });
  expect(within(screen.getByText("معدل").parentElement).getByText("0")).toBeInTheDocument();
});

test.each([["male", "مرد"], ["female", "زن"], ["unknown", "unknown"], [null, "—"]])(
  "maps profile gender %p safely",
  (value, expected) => expect(adviserProfileGender(value)).toBe(expected)
);
