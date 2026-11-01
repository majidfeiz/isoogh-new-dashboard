import React, { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner, Table } from "reactstrap";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useAuth } from "../../context/AuthContext.jsx";
import { createManualBillingPayment, downloadBillingInvoice, getBillingInvoice, requestBillingPayment } from "../../services/billingService.jsx";
import { BILLING_ADMIN_ROLES, billingErrorMessage, formatJalali, getUserSchoolId, hasBillingRole, invalidateBillingCache, invalidateCapacityReport, isBillingManager, moneyDisplay, STATUS_LABELS, subscribeBillingCache } from "./billingUtils.js";
import { savePendingPayment, validatePaymentRequestResult } from "./billingPayment.js";
import PricingRuleSummary from "./PricingRuleSummary.jsx";

export default function BillingInvoiceDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { user, hasPermission } = useAuth();
  const manager = isBillingManager(user);
  const schoolId = params.get("schoolId") || (manager ? getUserSchoolId(user) : "");
  const admin = hasBillingRole(user, BILLING_ADMIN_ROLES);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [manual, setManual] = useState({ reference: "", note: "" });

  const load = useCallback(async () => {
    if (manager && !schoolId) { setError("مجموعه مدیر مشخص نیست."); setLoading(false); return; }
    setLoading(true); setError("");
    try { setInvoice(await getBillingInvoice(id, schoolId)); } catch (e) { setError(billingErrorMessage(e)); } finally { setLoading(false); }
  }, [id, schoolId, manager]);
  useEffect(() => { load(); return subscribeBillingCache(load); }, [load]);

  const download = async () => {
    if (busy) return; setBusy("download");
    try { const file = await downloadBillingInvoice(id, schoolId); const url = URL.createObjectURL(file.blob); const a = document.createElement("a"); a.href = url; a.download = file.filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); } finally { setBusy(""); }
  };
  const pay = async () => {
    if (busy || invoice?.status === "paid") return; setBusy("pay");
    try {
      const result = validatePaymentRequestResult(await requestBillingPayment(id, schoolId));
      savePendingPayment({ invoiceId: id, schoolId, provider: result.provider, authority: result.authority });
      window.location.assign(result.paymentUrl);
    } catch (e) {
      setError(e?.response ? billingErrorMessage(e) : e.message || "شروع پرداخت ناموفق بود.");
      setBusy("");
    }
  };
  const submitManual = async (e) => {
    e.preventDefault();
    if (busy || invoice?.status === "paid" || !manual.reference.trim() || manual.note.trim().length < 3) return;
    if (!window.confirm("این عملیات برگشت‌ناپذیر است و بلافاصله اشتراک و ظرفیت تمام ردیف‌های فاکتور را فعال می‌کند. ادامه می‌دهید؟")) return;
    setBusy("manual"); setError("");
    try { await createManualBillingPayment(id, { schoolId: Number(schoolId || invoice.schoolId), reference: manual.reference.trim(), note: manual.note.trim() }); setManualOpen(false); setManual({ reference: "", note: "" }); invalidateBillingCache(); invalidateCapacityReport(); }
    catch (err) { setError(billingErrorMessage(err)); } finally { setBusy(""); }
  };

  if (loading) return <div className="page-content text-center py-5"><Spinner /><span className="visually-hidden">در حال بارگذاری</span></div>;
  return <div className="page-content" dir="rtl"><div className="container-fluid"><Breadcrumbs title="مالی و اشتراک" breadcrumbItem="جزئیات فاکتور" />
    {error && <Alert color="danger">{error}</Alert>}
    {!invoice ? <Card><CardBody className="text-center">اطلاعات فاکتور در دسترس نیست.</CardBody></Card> : <>
      <Card><CardHeader className="d-flex flex-wrap justify-content-between gap-2"><div><strong>فاکتور {invoice.number || invoice.invoiceNumber || invoice.id}</strong> <Badge color={invoice.status === "paid" ? "success" : invoice.status === "expired" ? "danger" : "warning"}>{STATUS_LABELS[invoice.status] || invoice.status}</Badge></div><div className="d-flex gap-2">
        {hasPermission("billing.invoices.download") && <Button size="sm" onClick={download} disabled={!!busy}>دانلود نسخه چاپی</Button>}
        {hasPermission("billing.payments.request") && <Button size="sm" color="success" onClick={pay} disabled={!!busy || invoice.status === "paid"}>پرداخت آنلاین</Button>}
        {admin && hasPermission("billing.payments.create") && <Button size="sm" color="warning" onClick={() => setManualOpen(true)} disabled={!!busy || invoice.status === "paid"}>ثبت پرداخت دستی</Button>}
      </div></CardHeader><CardBody><Row className="g-3"><Col md={4}><b>مجموعه:</b> {invoice.school?.name || invoice.schoolName || "—"}</Col><Col md={4}><b>نوع مشتری:</b> {invoice.customerType === "legal" ? "حقوقی" : "حقیقی"}</Col><Col md={4}><b>تاریخ صدور:</b> {formatJalali(invoice.issuedAt)}</Col><Col md={4}><b>سررسید:</b> {formatJalali(invoice.dueAt)}</Col><Col md={4}><b>جمع ردیف‌ها:</b> {moneyDisplay(invoice.subtotalAmount)}</Col><Col md={4}><b>تخفیف:</b> {moneyDisplay(invoice.discountAmount)}</Col><Col md={4}><b>مبلغ قابل پرداخت:</b> {moneyDisplay(invoice.totalAmount)}</Col><Col xs={12}><b>هویت صورتحساب:</b> {Object.values(invoice.customerSnapshot || {}).filter(Boolean).join("، ") || "—"}</Col>{invoice.adjustmentNote && <><Col md={8}><b>دلیل قیمت‌گذاری/تخفیف:</b> {invoice.adjustmentNote}</Col><Col md={4}><b>اعمال‌کننده:</b> {invoice.adjustedBy?.name || invoice.adjustedBy?.fullName || invoice.adjustedByName || "—"}</Col></>}</Row></CardBody></Card>
      <Card><CardHeader><strong>ردیف‌ها و وضعیت اشتراک مشاورها</strong></CardHeader><CardBody><div className="table-responsive"><Table bordered hover className="align-middle"><thead><tr><th>مشاور</th><th>دانش‌آموز فعلی</th><th>ظرفیت هدف</th><th>مدت</th><th>دوره</th><th>مبلغ پایه</th><th>قاعده قیمت</th><th>پله‌ها</th><th>مبالغ ردیف</th><th>اشتراک</th></tr></thead><tbody>{(invoice.items || invoice.lines || []).map((line) => <tr key={line.id}><td>{line.adviser?.fullName || line.adviserName || "—"}</td><td>{line.studentCount ?? "—"}</td><td>{line.targetStudentCapacity ?? "—"}</td><td>{line.durationMonths ? `${line.durationMonths} ماه` : "—"}</td><td>{formatJalali(line.periodStart)} تا {formatJalali(line.periodEnd)}</td><td>{moneyDisplay(line.baseAmount)}</td><td><PricingRuleSummary snapshot={line.pricingSnapshot} /></td><td>{line.calculatedSteps ?? "—"}</td><td><div className="d-flex flex-column gap-1"><span><small className="text-muted">محاسباتی: </small>{moneyDisplay(line.calculatedFinalAmount ?? line.finalAmount)}</span>{line.manualFinalAmount != null && <span className="text-warning"><small>دستی: </small><strong>{moneyDisplay(line.manualFinalAmount)}</strong></span>}<span className="text-success"><small>نهایی: </small><strong>{moneyDisplay(line.finalAmount)}</strong></span></div></td><td>{invoice.status === "paid" ? "فعال" : STATUS_LABELS[invoice.status]}</td></tr>)}{!(invoice.items || invoice.lines || []).length && <tr><td colSpan="10" className="text-center">ردیفی وجود ندارد.</td></tr>}</tbody></Table></div></CardBody></Card>
      <Card><CardHeader><strong>تاریخچه پرداخت</strong></CardHeader><CardBody><div className="table-responsive"><Table><thead><tr><th>روش</th><th>وضعیت</th><th>مرجع</th><th>توضیح</th><th>زمان</th></tr></thead><tbody>{(invoice.payments || []).map((payment) => <tr key={payment.id}><td>{payment.method || "—"}</td><td>{payment.status || "—"}</td><td>{payment.reference || "—"}</td><td>{payment.note || "—"}</td><td>{formatJalali(payment.createdAt)}</td></tr>)}{!invoice.payments?.length && <tr><td colSpan="5" className="text-center">پرداختی ثبت نشده است.</td></tr>}</tbody></Table></div></CardBody></Card>
    </>}
    <Button tag={Link} to="/billing/invoices" color="link">بازگشت به فهرست</Button>
    <Modal isOpen={manualOpen} toggle={() => !busy && setManualOpen(false)} centered><form onSubmit={submitManual}><ModalHeader>ثبت پرداخت دستی</ModalHeader><ModalBody><Alert color="warning">این عملیات برگشت‌ناپذیر است و بلافاصله اشتراک و ظرفیت تمام ردیف‌های فاکتور را فعال می‌کند.</Alert><FormGroup><Label for="manualReference">شماره مرجع</Label><Input id="manualReference" value={manual.reference} onChange={(e) => setManual({ ...manual, reference: e.target.value })} required /></FormGroup><FormGroup><Label for="manualNote">توضیح</Label><Input id="manualNote" type="textarea" minLength={3} value={manual.note} onChange={(e) => setManual({ ...manual, note: e.target.value })} invalid={manual.note.length > 0 && manual.note.trim().length < 3} required /><small className="text-muted">حداقل ۳ کاراکتر</small></FormGroup></ModalBody><ModalFooter><Button type="button" onClick={() => setManualOpen(false)} disabled={!!busy}>انصراف</Button><Button color="warning" type="submit" disabled={!!busy || !manual.reference.trim() || manual.note.trim().length < 3}>{busy === "manual" && <Spinner size="sm" />} ثبت قطعی</Button></ModalFooter></form></Modal>
  </div></div>;
}
