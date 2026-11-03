import { apiGet, apiPost } from "../helpers/httpClient.jsx";
import { getTicket, getTickets, replyToTicket } from "./ticketService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn(), apiPatch: jest.fn(), apiPost: jest.fn() }));
beforeEach(() => jest.clearAllMocks());

test("keeps school and creator identity from the ticket list response", async () => {
  const item = { id: 1, schoolId: 94, schoolName: "مدرسه دانا", creatorUserId: 7, creatorName: "علی مدیر", creatorOrganizationName: "مدرسه دانا" };
  apiGet.mockResolvedValue({ data: { data: { items: [item], meta: {} } } });
  const result = await getTickets({ page: 1, limit: 10 });
  expect(result.items[0]).toBe(item);
});

test("detail request carries school scope and abort signal", async () => {
  const controller = new AbortController();
  apiGet.mockResolvedValue({ data: { data: { id: 2 } } });
  await getTicket(2, 94, controller.signal);
  expect(apiGet).toHaveBeenCalledWith(expect.stringMatching(/\/tickets\/2$/), { params: { schoolId: 94 }, signal: controller.signal });
});

test("returns the authoritative reply identity without client-side mapping", async () => {
  const payload = { schoolId: 94, message: "پاسخ" };
  const created = { id: 9, senderUserId: 4, senderName: "کارشناس", senderOrganizationName: "آیسوق", senderSide: "isoogh", message: "پاسخ", createdAt: "2026-11-03T10:00:00+03:30" };
  apiPost.mockResolvedValue({ data: { data: created } });
  await expect(replyToTicket(2, payload)).resolves.toBe(created);
  expect(apiPost).toHaveBeenCalledWith(expect.stringMatching(/\/tickets\/2\/messages$/), payload);
});

