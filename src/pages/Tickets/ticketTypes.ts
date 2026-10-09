export type TicketStatus = "باز" | "در حال بررسی" | "حل‌شده" | "بسته";
export const TICKET_STATUS_FLOW: TicketStatus[] = ["باز", "در حال بررسی", "حل‌شده", "بسته"];

export interface TicketTaxonomy { id: number | string; name: string }
export interface TicketAttachment { id: number | string; ticketId: number | string; messageId?: number | string; fileName: string; fileSize?: number; fileType?: string; model: "App\\Models\\Ticket" | "App\\Models\\TicketMessage"; modelId: number | string; downloadUrl: string; createdAt: string }
export interface TicketMessage { id: number | string; message: string; createdAt: string; sender?: { id?: number | string; name?: string; fullName?: string } }
export interface Ticket {
  id: number | string; ticketNumber: string; schoolId: number | string; creatorUserId: number | string;
  title: string; description: string; status: TicketStatus; category?: TicketTaxonomy; result?: TicketTaxonomy;
  resolvedAt?: string; createdAt: string; messages?: TicketMessage[]; attachments?: TicketAttachment[];
}
export interface TicketListRequest { schoolId?: number | string; search?: string; status?: TicketStatus; categoryId?: number | string; resultId?: number | string; from?: string; to?: string; page?: number; limit?: number }
export interface TicketCreateRequest { schoolId: number | string; categoryId: number | string; title: string; description: string }
export interface TicketPage { items: Ticket[]; meta: { page: number; limit: number; total: number; lastPage: number } }
export interface TicketDashboardData { total: number; byStatus: Record<TicketStatus, number>; byCategory: Array<{ name: string; count: number }>; byResult: Array<{ name: string; count: number }>; trend: Array<{ date: string; count: number }> }
