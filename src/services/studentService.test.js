import { apiDelete, apiGet, apiPatch, apiPost } from "../helpers/httpClient.jsx"
import {
  getStudents,
  getStudentRegistrationAvailability,
  getStudentContactSubjects,
  getStudentContacts,
  createStudentContact,
  updateStudentContact,
  setDefaultStudentContact,
  deleteStudentContact,
} from "./studentService.jsx"

jest.mock("../helpers/httpClient.jsx", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPatch: jest.fn(),
  apiDelete: jest.fn(),
}))

beforeEach(() => {
  apiGet.mockReset()
  apiPost.mockReset()
  apiPatch.mockReset()
  apiDelete.mockReset()
})

test("checks exact registration availability and passes the abort signal", async () => {
  const data = {
    phone: { available: false, existingUser: { id: 15, isArchived: false } },
    username: { available: true, existingUser: null },
  }
  const controller = new AbortController()
  apiGet.mockResolvedValue({ data: { data } })

  await expect(getStudentRegistrationAvailability({
    phone: "09121234567",
    username: "ali.mohammadi",
    signal: controller.signal,
  })).resolves.toEqual(data)

  expect(apiGet).toHaveBeenCalledWith(
    "http://127.0.0.1:8040/students/registration-availability",
    expect.objectContaining({
      params: { phone: "09121234567", username: "ali.mohammadi" },
      signal: controller.signal,
    })
  )
})

test("passes list filters and abort signal and maps items/meta", async () => {
  const controller = new AbortController()
  apiGet.mockResolvedValue({
    data: { data: { items: [{ id: 1 }], meta: { page: 2, limit: 20, total: 21, lastPage: 2 } } },
  })

  await expect(getStudents({
    page: 2,
    limit: 20,
    search: "علی",
    schoolId: 4,
    archiveStatus: "all",
    signal: controller.signal,
  })).resolves.toEqual({
    items: [{ id: 1 }],
    pagination: { page: 2, limit: 20, total: 21, lastPage: 2 },
  })

  expect(apiGet.mock.calls[0][1]).toEqual(expect.objectContaining({
    signal: controller.signal,
    params: expect.objectContaining({ schoolId: 4, archiveStatus: "all" }),
  }))
})

test("uses public student contact endpoints for CRUD and default selection", async () => {
  const subject = { id: 2, subject: "والد" }
  const contact = { id: 8, userId: 5, phoneNumber: "09121234567", subjectId: 2 }
  apiGet
    .mockResolvedValueOnce({ data: { data: [subject] } })
    .mockResolvedValueOnce({ data: { data: [contact] } })
  apiPost.mockResolvedValue({ data: { data: contact } })
  apiPatch.mockResolvedValue({ data: { data: contact } })
  apiDelete.mockResolvedValue({ data: { data: { deleted: true } } })

  await expect(getStudentContactSubjects({ force: true })).resolves.toEqual([subject])
  await expect(getStudentContacts(12)).resolves.toEqual([contact])
  await createStudentContact(12, { phoneNumber: contact.phoneNumber, subjectId: 2, setAsDefault: true })
  await updateStudentContact(12, 8, { subjectId: 2 })
  await setDefaultStudentContact(12, 8)
  await deleteStudentContact(12, 8)

  expect(apiGet.mock.calls[0][0]).toBe("http://127.0.0.1:8040/students/contact-subjects")
  expect(apiGet.mock.calls[1][0]).toBe("http://127.0.0.1:8040/students/12/contacts")
  expect(apiPost.mock.calls[0][0]).toBe("http://127.0.0.1:8040/students/12/contacts")
  expect(apiPatch.mock.calls[0][0]).toBe("http://127.0.0.1:8040/students/12/contacts/8")
  expect(apiPatch.mock.calls[1][0]).toBe("http://127.0.0.1:8040/students/12/contacts/8/set-default")
  expect(apiDelete.mock.calls[0][0]).toBe("http://127.0.0.1:8040/students/12/contacts/8")
})
