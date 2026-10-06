import { isGlobalTicketRole, isMessageAttachment, isTicketAttachment, MAX_TICKET_FILE_SIZE, nextTicketStatus, sanitizeTicketStatus, validateTicketFile } from "./ticketUtils.js";

describe("ticket rules", () => {
  test("only allows the next status in the workflow", () => {
    expect(nextTicketStatus("باز")).toBe("در حال بررسی");
    expect(nextTicketStatus("در حال بررسی")).toBe("حل‌شده");
    expect(nextTicketStatus("حل‌شده")).toBe("بسته");
    expect(nextTicketStatus("بسته")).toBeNull();
  });

  test("enforces the 10MB attachment limit", () => {
    expect(validateTicketFile({ size: MAX_TICKET_FILE_SIZE })).toBe(true);
    expect(validateTicketFile({ size: MAX_TICKET_FILE_SIZE + 1 })).toBe(false);
  });

  test("rejects unknown status values", () => {
    expect(sanitizeTicketStatus("نامعتبر")).toBe("");
    expect(sanitizeTicketStatus("در حال بررسی")).toBe("در حال بررسی");
  });

  test("allows the all-schools scope only for global roles", () => {
    expect(isGlobalTicketRole({ roles: [{ slug: "super_manager" }] })).toBe(true);
    expect(isGlobalTicketRole({ roles: [{ slug: "manager" }] })).toBe(false);
  });

  test("maps polymorphic attachments to their ticket or message", () => {
    expect(isMessageAttachment({ model: "App\\Models\\TicketMessage", modelId: 7 }, 7)).toBe(true);
    expect(isTicketAttachment({ model: "App\\Models\\Ticket", modelId: 3 }, 3)).toBe(true);
  });
});
