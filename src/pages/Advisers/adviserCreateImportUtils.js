export const ADVISER_IMPORT_HEADERS = Object.freeze(["name", "phone", "username", "email", "password", "grades"]);

export const ADVISER_IMPORT_SAMPLE_ROW = Object.freeze({
  name: "علی احمدی",
  phone: "09121234567",
  username: "ali.ahmadi",
  email: "ali@example.com",
  password: "secret123",
  grades: "دهم|یازدهم",
});

export const adviserImportSampleRows = () => [
  ADVISER_IMPORT_HEADERS,
  ADVISER_IMPORT_HEADERS.map((header) => ADVISER_IMPORT_SAMPLE_ROW[header]),
];

export const buildAdviserImportFormData = ({ file, schoolId, defaultPassword } = {}) => {
  const formData = new FormData();
  if (file) formData.append("file", file, file.name || "advisers.xlsx");
  if (schoolId) formData.append("schoolId", String(schoolId));
  if (defaultPassword?.trim()) formData.append("defaultPassword", defaultPassword.trim());
  return formData;
};

const FIELD_PREFIX = /^\[(name|phone|username|email|password|grades)\]\s*/i;

export const adviserFieldErrors = (error) => {
  const raw = error?.response?.data?.message ?? error?.response?.data?.error ?? error?.message;
  const messages = (Array.isArray(raw) ? raw : [raw]).filter(Boolean).map(String);
  return messages.reduce((result, message) => {
    const match = message.match(FIELD_PREFIX);
    if (match) result[match[1].toLowerCase()] = message.replace(FIELD_PREFIX, "");
    else result.general = result.general ? `${result.general}، ${message}` : message;
    return result;
  }, {});
};
