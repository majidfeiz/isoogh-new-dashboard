import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Alert, Badge, Button, Card, CardBody, CardHeader, Col, Form, Input, Label, Row } from "reactstrap";
import { toast } from "react-toastify";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import Can from "../../components/Access/Can.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { classifyTicket, downloadTicketAttachment, getTicket, getTicketTaxonomy, replyToTicket, updateTicketStatus, uploadTicketAttachment } from "../../services/ticketService.jsx";
import TicketMessageItem from "./TicketMessageItem.jsx";
import TicketStatus from "./TicketStatus.jsx";
import { appendTicketMessage, formatTicketDate, isMessageAttachment, isTicketAttachment, isTicketAdmin, nextTicketStatus, taxonomyName, ticketDetailQueryKey, ticketOrganizationName, ticketUserName, TICKET_STATUSES, TICKET_STATUS_LABELS, validateTicketFile } from "./ticketUtils.js";

const isCanceled = (error) => error?.code === "ERR_CANCELED" || error?.name === "CanceledError";

function TicketDetailSkeleton() {
  return <div className="page-content"><div className="container-fluid"><div className="ticket-detail-skeleton" aria-label="در حال دریافت تیکت">
    <Card><CardBody><div className="placeholder-glow"><span className="placeholder col-4 mb-3" style={{ height: 28 }} /><span className="placeholder col-7 d-block mb-4" /><div className="d-flex gap-3"><span className="placeholder rounded-circle" style={{ width: 38, height: 38 }} /><div className="flex-grow-1"><span className="placeholder col-4 d-block mb-2" /><span className="placeholder col-3 d-block mb-3" /><span className="placeholder col-12 d-block" style={{ height: 70 }} /></div></div></div></CardBody></Card>
    <Card><CardBody><div className="placeholder-glow"><span className="placeholder col-5 d-block mb-3" /><span className="placeholder col-8 d-block mb-2" /><span className="placeholder col-7 d-block" /></div></CardBody></Card>
  </div></div></div>;
}

export default function TicketDetail() {
  const { id } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const { hasPermission, user } = useAuth();
  const canClassifyTicket = hasPermission("tickets.manage") && isTicketAdmin(user);
  const schoolId = search.get("schoolId") || "";
  const detailKey = ticketDetailQueryKey(id, schoolId).join(":");
  const requestRef = useRef(null);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [taxonomy, setTaxonomy] = useState({ categories: [], results: [] });

  const load = useCallback(async () => {
    if (!schoolId) { setTicket(null); setError("برای مشاهده تیکت، مجموعه مشخص نیست."); setLoading(false); return; }
    requestRef.current?.controller.abort();
    const controller = new AbortController();
    const request = { controller, key: detailKey };
    requestRef.current = request;
    setTicket(null); setLoading(true); setError("");
    try {
      const result = await getTicket(id, schoolId, controller.signal);
      if (requestRef.current === request) setTicket(result);
    } catch (caught) {
      if (isCanceled(caught) || controller.signal.aborted || requestRef.current !== request) return;
      if (caught?.response?.status === 403) navigate("/403", { replace: true });
      else setError(caught?.response?.status === 404 ? "تیکت یافت نشد یا دسترسی ندارید." : "دریافت اطلاعات تیکت ناموفق بود.");
    } finally { if (requestRef.current === request) setLoading(false); }
  }, [detailKey, id, schoolId, navigate]);

  useEffect(() => { load(); return () => requestRef.current?.controller.abort(); }, [load]);
  useEffect(() => { if (canClassifyTicket) Promise.all([getTicketTaxonomy("categories"), getTicketTaxonomy("results")]).then(([categories, results]) => setTaxonomy({ categories, results })).catch(() => {}); }, [canClassifyTicket]);

  const send = async (event) => {
    event.preventDefault();
    if (!message.trim() || ticket.status === "بسته" || (file && !validateTicketFile(file))) return;
    setSending(true);
    try {
      const created = await replyToTicket(id, { schoolId, message: message.trim() });
      const uploaded = file && hasPermission("tickets.attachments.upload");
      if (uploaded) await uploadTicketAttachment(id, schoolId, file, created?.id);
      setMessage(""); setFile(null);
      if (uploaded || !created?.id) await load();
      else setTicket((current) => appendTicketMessage(current, created));
      toast.success("پاسخ شما ارسال شد");
    } catch {} finally { setSending(false); }
  };
  const advance = async () => { const next = nextTicketStatus(ticket.status); if (!next) return; if (next === "بسته" && !window.confirm("پس از بستن تیکت، امکان ارسال پاسخ وجود ندارد. تیکت بسته شود؟")) return; setActionLoading(true); try { await updateTicketStatus(id, schoolId, next); await load(); toast.success("وضعیت تیکت به‌روزرسانی شد"); } finally { setActionLoading(false); } };
  const classify = async (type, valueId) => { if (!canClassifyTicket || !valueId) return; setActionLoading(true); try { await classifyTicket(id, schoolId, type, valueId); await load(); } finally { setActionLoading(false); } };
  const chooseReplyFile = (event) => { const selected = event.target.files?.[0]; if (!validateTicketFile(selected)) { toast.error("حداکثر حجم مجاز هر فایل ۱۰ مگابایت است"); event.target.value = ""; return; } setFile(selected || null); };
  const download = (attachment) => downloadTicketAttachment(attachment.id, schoolId, attachment.fileName || attachment.name);

  if (loading) return <TicketDetailSkeleton />;
  if (error || !ticket) return <div className="page-content"><div className="container-fluid"><Alert color="danger">{error || "اطلاعات تیکت در دسترس نیست."}</Alert><Button tag={Link} to="/tickets" color="primary">بازگشت به تیکت‌ها</Button></div></div>;

  document.title = `${ticket.title} | تیکت‌ها`;
  const allMessages = [{ id: "description", message: ticket.description, createdAt: ticket.createdAt, initial: true }, ...(ticket.messages || [])];
  const unattached = (ticket.attachments || []).filter((item) => isTicketAttachment(item, ticket.id));
  return <div className="page-content"><div className="container-fluid">
    <Breadcrumbs title="تیکت‌ها" breadcrumbItem={`#${ticket.ticketNumber || ticket.id}`} />
    <Row><Col xl="8"><Card>
      <CardHeader className="d-flex flex-wrap justify-content-between align-items-start gap-3"><div><div className="d-flex flex-wrap align-items-center gap-2 mb-2"><span className="text-muted">#{ticket.ticketNumber || ticket.id}</span><TicketStatus status={ticket.status} /><Badge color="light" className="text-dark border">{ticketOrganizationName(ticket.schoolName)}</Badge></div><h4 className="card-title mb-0">{ticket.title}</h4></div><Button tag={Link} to="/tickets" color="light" size="sm">بازگشت</Button></CardHeader>
      <CardBody><div className="ticket-timeline">{allMessages.map((item) => <TicketMessageItem key={item.id} item={item} ticket={ticket} attachments={(ticket.attachments || []).filter((attachment) => isMessageAttachment(attachment, item.id))} canDownload={hasPermission("tickets.attachments.download")} onDownload={download} />)}</div>
        {hasPermission("tickets.attachments.download") && unattached.length > 0 && <div className="border-top pt-3 mt-3"><h6>فایل‌های پیوست</h6><div className="d-flex flex-wrap gap-2">{unattached.map((attachment) => <Button key={attachment.id} color="soft-primary" size="sm" onClick={() => download(attachment)}><i className="bx bx-download ms-1" />{attachment.fileName || attachment.name || "دریافت فایل"}</Button>)}</div></div>}
        <Can permission="tickets.reply"><Form className="border-top pt-4 mt-4" onSubmit={send}><Label htmlFor="ticket-reply">پاسخ شما</Label><Input id="ticket-reply" type="textarea" rows="4" value={message} maxLength={3000} disabled={ticket.status === "بسته"} placeholder={ticket.status === "بسته" ? "این تیکت بسته شده است." : "پاسخ خود را بنویسید..."} onChange={(event) => setMessage(event.target.value)} /><div className="d-flex flex-wrap justify-content-between gap-2 mt-3">{hasPermission("tickets.attachments.upload") && <Input type="file" className="ticket-file-input" disabled={ticket.status === "بسته"} onChange={chooseReplyFile} aria-label="افزودن فایل به پاسخ" />}<Button type="submit" color="primary" disabled={sending || !message.trim() || ticket.status === "بسته"}>{sending ? "در حال ارسال..." : "ارسال پاسخ"}</Button></div>{ticket.status === "بسته" && <div className="text-muted small mt-2" aria-live="polite">امکان پاسخ‌گویی به تیکت بسته وجود ندارد.</div>}</Form></Can>
      </CardBody></Card></Col>
      <Col xl="4"><Card><CardHeader><h5 className="card-title mb-0">اطلاعات تیکت</h5></CardHeader><CardBody><dl className="ticket-meta">
        <div><dt>مجموعه</dt><dd title={ticket.schoolId ? `شناسه مجموعه: ${ticket.schoolId}` : undefined}>{ticketOrganizationName(ticket.schoolName)}</dd></div>
        <div><dt>ثبت‌کننده</dt><dd><strong className="d-block">{ticketUserName(ticket.creatorName)}</strong><small className="text-muted">{ticketOrganizationName(ticket.creatorOrganizationName)}</small></dd></div>
        <div><dt>وضعیت</dt><dd><TicketStatus status={ticket.status} /></dd></div><div><dt>دسته</dt><dd>{taxonomyName(ticket.category)}</dd></div><div><dt>نتیجه</dt><dd>{taxonomyName(ticket.result)}</dd></div><div><dt>تاریخ ثبت</dt><dd>{formatTicketDate(ticket.createdAt)}</dd></div>{ticket.resolvedAt && <div><dt>تاریخ حل</dt><dd>{formatTicketDate(ticket.resolvedAt)}</dd></div>}
      </dl><div className="ticket-progress" aria-label="پیشرفت وضعیت تیکت">{TICKET_STATUSES.map((status, index) => <div key={status} className={`ticket-progress-step ${index <= TICKET_STATUSES.indexOf(ticket.status) ? "is-done" : ""}`}><span /><small>{TICKET_STATUS_LABELS[status]}</small></div>)}</div></CardBody></Card>
      <Can permission="tickets.manage"><Card><CardHeader><h5 className="card-title mb-0">مدیریت تیکت</h5></CardHeader><CardBody>{canClassifyTicket && <><Label htmlFor="manage-category">دسته</Label><Input id="manage-category" type="select" value={ticket.category?.id || ""} disabled={actionLoading} onChange={(event) => classify("category", event.target.value)}><option value="">انتخاب دسته</option>{taxonomy.categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Input><Label htmlFor="manage-result" className="mt-3">نتیجه</Label><Input id="manage-result" type="select" value={ticket.result?.id || ""} disabled={actionLoading} onChange={(event) => classify("result", event.target.value)}><option value="">انتخاب نتیجه</option>{taxonomy.results.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Input></>}{nextTicketStatus(ticket.status) && <Button className={`w-100 ${canClassifyTicket ? "mt-4" : ""}`} color={nextTicketStatus(ticket.status) === "بسته" ? "danger" : "primary"} disabled={actionLoading} onClick={advance}>تغییر وضعیت به «{TICKET_STATUS_LABELS[nextTicketStatus(ticket.status)]}»</Button>}</CardBody></Card></Can>
      </Col></Row>
  </div></div>;
}
