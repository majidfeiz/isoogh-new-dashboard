import { appendTicketMessage, formatTicketChartDate, formatTicketDate, isGlobalTicketRole, isMessageAttachment, isTicketAdmin, isTicketAttachment, MAX_TICKET_FILE_SIZE, nextTicketStatus, sanitizeTicketStatus, ticketDetailQueryKey, ticketMessageIdentity, ticketOrganizationName, ticketUserName, validateTicketFile } from "./ticketUtils.js";

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
    expect(isGlobalTicketRole({ roles: [{ slug: "support" }] })).toBe(true);
    expect(isGlobalTicketRole({ roles: [{ slug: "manager" }] })).toBe(false);
  });

  test("allows ticket classification only for the exact admin role", () => {
    expect(isTicketAdmin({ roles: ["admin"] })).toBe(true);
    expect(isTicketAdmin({ roles: [{ name: "ADMIN" }] })).toBe(true);
    expect(isTicketAdmin({ roles: [{ slug: "support" }] })).toBe(false);
    expect(isTicketAdmin({ roles: [{ name: "super_manager" }] })).toBe(false);
    expect(isTicketAdmin({ roles: [{ name: "manager" }] })).toBe(false);
  });

  test("formats ticket dates with Persian calendar and digits", () => {
    expect(formatTicketChartDate("2026-10-09")).toBe("۱۴۰۵/۰۷/۱۷");
    expect(formatTicketDate("2026-10-09T12:30:00Z")).toMatch(/^[۰-۹]{4}\/[\u06f0-\u06f9]{2}\/[\u06f0-\u06f9]{2}/);
    expect(formatTicketDate(null)).toBe("—");
  });

  test("maps polymorphic attachments to their ticket or message", () => {
    expect(isMessageAttachment({ model: "App\\Models\\TicketMessage", modelId: 7 }, 7)).toBe(true);
    expect(isTicketAttachment({ model: "App\\Models\\Ticket", modelId: 3 }, 3)).toBe(true);
  });

  test("uses only backend sender fields for message identity", () => {
    expect(ticketMessageIdentity({ senderName: "سارا پشتیبان", senderOrganizationName: "آیسوق", senderSide: "isoogh" })).toEqual({ name: "سارا پشتیبان", organization: "آیسوق", badge: "آیسوق", side: "isoogh" });
    expect(ticketMessageIdentity({ senderName: "علی مدیر", senderOrganizationName: "مدرسه دانا", senderSide: "school" })).toEqual({ name: "علی مدیر", organization: "مدرسه دانا", badge: "مدرسه دانا", side: "school" });
  });

  test("uses readable legacy fallbacks without inferring sender side", () => {
    expect(ticketUserName(null)).toBe("کاربر نامشخص");
    expect(ticketOrganizationName(null)).toBe("مجموعه نامشخص");
    expect(ticketMessageIdentity({ senderName: null, senderOrganizationName: null, senderSide: null })).toEqual({ name: "کاربر نامشخص", organization: "مجموعه نامشخص", badge: "مجموعه نامشخص", side: "unknown" });
    expect(ticketMessageIdentity({ initial: true }, { creatorName: "ثبت‌کننده", creatorOrganizationName: "مدرسه دانا" })).toEqual({ name: "ثبت‌کننده", organization: "مدرسه دانا", badge: "مدرسه دانا", side: "initial" });
  });

  test("detail key contains ticket and school and reply keeps the exact backend payload", () => {
    expect(ticketDetailQueryKey(8, 94)).toEqual(["tickets", "detail", "8", "94"]);
    const created = { id: 11, senderUserId: 3, senderName: "کارشناس واقعی", senderOrganizationName: "آیسوق", senderSide: "isoogh", message: "پاسخ", createdAt: null };
    const next = appendTicketMessage({ id: 8, messages: [] }, created);
    expect(next.messages[0]).toBe(created);
  });
});
