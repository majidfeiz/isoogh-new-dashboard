import { normalizeOutboundCallItem } from "./voipService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn() }));

test("uses only the backend talk duration and does not fall back to legacy duration", () => {
  expect(normalizeOutboundCallItem({ duration: "00:02:40", talk_duration_seconds: 160 }).talk_duration_seconds).toBe(160);
  expect(normalizeOutboundCallItem({ duration: "00:02:40", talk_duration_seconds: 0 }).talk_duration_seconds).toBe(0);
  expect(normalizeOutboundCallItem({ duration: "00:02:40", talk_duration_seconds: null }).talk_duration_seconds).toBeNull();
  expect(normalizeOutboundCallItem({ duration: "00:02:40" }).talk_duration_seconds).toBeNull();
});

test("maps outbound student profile fields without deriving the student name", () => {
  const item = normalizeOutboundCallItem({
    student_name: "علی محمدی",
    student_full_name: "نام قدیمی",
    firstname: "علی",
    lastname: "محمدی",
    student_gender: "مرد",
    student_city: "شیراز",
    student_province: "فارس",
  });

  expect(item).toEqual(expect.objectContaining({
    student_name: "علی محمدی",
    student_gender: "مرد",
    student_city: "شیراز",
    student_province: "فارس",
  }));
});

test("normalizes missing outbound student profile fields to null", () => {
  expect(normalizeOutboundCallItem({})).toEqual(expect.objectContaining({
    student_name: null,
    student_gender: null,
    student_city: null,
    student_province: null,
  }));
});
