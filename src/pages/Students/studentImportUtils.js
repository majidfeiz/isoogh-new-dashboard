export const DEFAULT_USE_USERNAME_AS_PHONE = false;

export const STUDENT_IMPORT_HEADERS = Object.freeze([
  "username", "name", "password", "phone", "ssn", "email", "birthday", "point",
  "phone_2", "phone_3", "shift", "city", "province", "region", "institute_type",
  "institute_name", "grade", "major", "decile", "scholarship_type", "gpa",
  "emergency_phone", "village", "religion", "relationship", "group_id",
  "voip_phone", "work_shift_id", "sexuality",
]);

export const STUDENT_IMPORT_SAMPLE_ROW = Object.freeze({
  username: "student.sample",
  name: "دانش‌آموز نمونه",
  password: "Pass1234",
  phone: "09120000000",
  ssn: "0012345678",
  email: "student.sample@example.com",
  birthday: "1385/01/01",
  point: "",
  phone_2: "",
  phone_3: "",
  shift: "صبح",
  city: "تهران",
  province: "تهران",
  region: "",
  institute_type: "دولتی",
  institute_name: "دبیرستان نمونه",
  grade: "دوازدهم",
  major: "ریاضی فیزیک",
  decile: "4",
  scholarship_type: "نیمه‌بورسیه",
  gpa: "12.37",
  emergency_phone: "",
  village: "",
  religion: "",
  relationship: "",
  group_id: "",
  voip_phone: "",
  work_shift_id: "",
  sexuality: "female",
});

export const studentImportSampleRows = () => [
  STUDENT_IMPORT_HEADERS,
  STUDENT_IMPORT_HEADERS.map((header) => STUDENT_IMPORT_SAMPLE_ROW[header] ?? ""),
];

export const appendStudentCreateImportFields = (
  formData,
  { schoolId, defaultPassword, useUsernameAsPhone = DEFAULT_USE_USERNAME_AS_PHONE } = {}
) => {
  if (schoolId) formData.append("schoolId", schoolId);
  if (defaultPassword) formData.append("defaultPassword", defaultPassword);
  formData.append("useUsernameAsPhone", String(Boolean(useUsernameAsPhone)));
  return formData;
};
