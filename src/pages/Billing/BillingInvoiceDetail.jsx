import React, { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner, Table } from "reactstrap";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useAuth } from "../../context/AuthContext.jsx";
import { createManualBillingPayment, downloadBillingInvoice, getBillingInvoice, getBillingWallet, payBillingInvoiceFromWallet, requestBillingPayment, requestWalletTopup } from "../../services/billingService.jsx";
import { billingErrorMessage, formatIntegerInput, formatJalali, formatRial, getUserSchoolId, insufficientWalletBalance, invalidateBillingCache, invalidateCapacityReport, INVOICE_TYPE_LABELS, moneyDisplay, normalizePositiveIntegerInput, numberToPersianWords, STATUS_LABELS, subscribeBillingCache, walletPaymentSummary } from "./billingUtils.js";
import { savePendingPayment, validatePaymentRequestResult } from "./billingPayment.js";
import { savePendingWalletTopup } from "./walletPayment.js";
import PricingRuleSummary from "./PricingRuleSummary.jsx";
import InvoicePeriodBreakdown from "./InvoicePeriodBreakdown.jsx";
import { formatBillingDateOnlyLabel, formatBillingPeriodRange, parseBillingDateOnly } from "./billingPeriodDate.js";

const formatInvoiceHeaderDate = (value) => parseBillingDateOnly(value) ? formatBillingDateOnlyLabel(value) : formatJalali(value);

export default function BillingInvoiceDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { user, hasPermission } = useAuth();
  const schoolId = params.get("schoolId") || getUserSchoolId(user) || "";
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [manual, setManual] = useState({ reference: "", note: "" });
  const [walletOpen, setWalletOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [serverShortfall, setServerShortfall] = useState(null);
  const [topupOpen, setTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    if (!schoolId) { setError("برای مشاهده فاکتور، مجموعه مشخص نیست."); setLoading(false); return; }
    setLoading(true); setError("");
    try { setInvoice(await getBillingInvoice(id, schoolId)); } catch (e) { setError(billingErrorMessage(e)); } finally { setLoading(false); }
  }, [id, schoolId]);
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
  const openWallet = async () => { setBusy("wallet-load"); setError(""); setServerShortfall(null); try { const result = await getBillingWallet({ schoolId: schoolId || invoice.schoolId, page: 1, limit: 1 }); const balance = Number(result.wallet?.balance || 0); setWalletBalance(balance); setWalletOpen(true); const summary = walletPaymentSummary(balance, invoice.totalAmount); if (!summary.canPay) setTopupAmount(String(summary.shortfall)); } catch (caught) { setError(billingErrorMessage(caught)); } finally { setBusy(""); } };
  const payWallet = async () => {
    const summary = walletPaymentSummary(walletBalance, invoice.totalAmount);
    if (busy || !summary.canPay) return;
    setBusy("wallet-pay"); setError(""); setServerShortfall(null);
    try { await payBillingInvoiceFromWallet(id, schoolId || invoice.schoolId); setWalletOpen(false); setNotice("فاکتور با موفقیت از کیف پول پرداخت شد"); invalidateBillingCache(); invalidateCapacityReport(); await load(); }
    catch (caught) {
      const shortage = insufficientWalletBalance(caught);
      if (shortage) { setWalletBalance(shortage.balance); setServerShortfall(shortage.shortfall || Math.max(0, shortage.requiredAmount - shortage.balance)); setTopupAmount(String(shortage.shortfall || Math.max(0, shortage.requiredAmount - shortage.balance))); setError(shortage.message); await load(); }
      else setError(billingErrorMessage(caught));
    } finally { setBusy(""); }
  };
  const startWalletTopup = async () => {
    const amount = Number(topupAmount); if (busy || !Number.isInteger(amount) || amount <= 0) return;
    setBusy("wallet-topup"); setError("");
    try { const result = await requestWalletTopup({ schoolId: Number(schoolId || invoice.schoolId), amount }); savePendingWalletTopup({ ...result, schoolId: Number(schoolId || invoice.schoolId), returnTo: `/billing/invoices/${id}?schoolId=${schoolId || invoice.schoolId}` }); window.location.assign(result.paymentUrl); }
    catch (caught) { setError(caught?.response ? billingErrorMessage(caught) : caught.message); setBusy(""); }
  };

  if (loading) return <div className="page-content text-center py-5"><Spinner /><span className="visually-hidden">در حال بارگذاری</span></div>;
  const walletSummary = walletPaymentSummary(walletBalance, invoice?.totalAmount);
  return <div className="page-content" dir="rtl"><div className="container-fluid"><Breadcrumbs title="مالی و اشتراک" breadcrumbItem="جزئیات فاکتور" />
    {error && <Alert color="danger">{error}</Alert>}
    {notice && <Alert color="success" aria-live="polite">{notice}</Alert>}
    {!invoice ? <Card><CardBody className="text-center">اطلاعات فاکتور در دسترس نیست.</CardBody></Card> : <>
      <Card><CardHeader className="d-flex flex-wrap justify-content-between gap-2"><div><strong>فاکتور {invoice.number || invoice.invoiceNumber || invoice.id}</strong> <Badge color={invoice.status === "paid" ? "success" : invoice.status === "expired" ? "danger" : "warning"}>{STATUS_LABELS[invoice.status] || invoice.status}</Badge> <Badge color="info">{INVOICE_TYPE_LABELS[invoice.type] || "فاکتور"}</Badge></div><div className="d-flex gap-2 flex-wrap">
        {hasPermission("billing.invoices.download") && <Button size="sm" onClick={download} disabled={!!busy}>دانلود نسخه چاپی</Button>}
        {hasPermission("billing.payments.request") && <Button size="sm" color="success" onClick={pay} disabled={!!busy || invoice.status === "paid"}>پرداخت آنلاین</Button>}
        {hasPermission("billing.wallet.pay") && <Button size="sm" color="primary" onClick={openWallet} disabled={!!busy || invoice.status === "paid"}>پرداخت از کیف پول</Button>}
        {hasPermission("billing.payments.create") && <Button size="sm" color="warning" onClick={() => setManualOpen(true)} disabled={!!busy || invoice.status === "paid"}>ثبت پرداخت دستی</Button>}
      </div></CardHeader><CardBody><Row className="g-3"><Col md={4}><b>مجموعه:</b> {invoice.school?.name || invoice.schoolName || "—"}</Col><Col md={4}><b>نوع مشتری:</b> {invoice.customerType === "legal" ? "حقوقی" : "حقیقی"}</Col><Col md={4}><b>تاریخ صدور:</b> {formatInvoiceHeaderDate(invoice.issuedAt)}</Col><Col md={4}><b>سررسید:</b> {formatInvoiceHeaderDate(invoice.dueAt)}</Col><Col md={4}><b>جمع ردیف‌ها:</b> {moneyDisplay(invoice.subtotalAmount)}</Col><Col md={4}><b>تخفیف:</b> {moneyDisplay(invoice.discountAmount)}</Col><Col md={4}><b>مبلغ قابل پرداخت:</b> {moneyDisplay(invoice.totalAmount)}</Col><Col xs={12}><b>هویت صورتحساب:</b> {Object.values(invoice.customerSnapshot || {}).filter(Boolean).join("، ") || "—"}</Col>{invoice.adjustmentNote && <><Col md={8}><b>دلیل قیمت‌گذاری/تخفیف:</b> {invoice.adjustmentNote}</Col><Col md={4}><b>اعمال‌کننده:</b> {invoice.adjustedBy?.name || invoice.adjustedBy?.fullName || invoice.adjustedByName || "—"}</Col></>}</Row></CardBody></Card>
      <Card><CardHeader><strong>ردیف‌های فاکتور</strong></CardHeader><CardBody><div className="table-responsive"><Table bordered hover className="align-middle"><thead><tr><th>شرح / مشاور</th><th>تعداد</th><th>مبلغ واحد</th><th>ظرفیت/مصرف</th><th>دوره</th><th>تخفیف</th><th>مبلغ نهایی</th><th>وضعیت</th></tr></thead><tbody>{(invoice.items || invoice.lines || []).map((line) => <tr key={line.id}><td>{line.description || line.adviser?.fullName || line.adviserName || "—"}</td><td>{line.quantity ?? 1}</td><td>{moneyDisplay(line.unitAmount ?? line.baseAmount)}</td><td>{line.adviserId ? `${line.studentCount ?? "—"} / ${line.targetStudentCapacity ?? "—"}` : "—"}</td><td>{line.periodStart ? formatBillingPeriodRange(line.periodStart, line.periodEnd) : "—"}</td><td>{moneyDisplay(line.discountAmount)}</td><td><strong>{moneyDisplay(line.finalAmount ?? (Number(line.quantity || 1) * Number(line.unitAmount || 0)))}</strong></td><td>{line.adviserId ? invoice.status === "paid" ? "فعال" : STATUS_LABELS[invoice.status] : "ردیف عمومی"}</td></tr>)}{!(invoice.items || invoice.lines || []).length && <tr><td colSpan="8" className="text-center">ردیفی وجود ندارد.</td></tr>}</tbody></Table></div>{(invoice.items || []).some((line) => line.adviserId) && <div className="mt-4"><h5 className="mb-3">تفکیک دوره‌ای ردیف‌های مشاور</h5>{invoice.items.filter((line) => line.adviserId).map((line) => <div key={`breakdown-${line.id}`} className="border rounded p-3 mb-3"><h6>{line.adviser?.fullName || line.adviserName || "مشاور"}</h6><PricingRuleSummary snapshot={line.pricingSnapshot} /><InvoicePeriodBreakdown line={line} /></div>)}</div>}</CardBody></Card>
      <Card><CardHeader><strong>تاریخچه پرداخت</strong></CardHeader><CardBody><div className="table-responsive"><Table><thead><tr><th>روش</th><th>وضعیت</th><th>مرجع</th><th>توضیح</th><th>زمان</th></tr></thead><tbody>{(invoice.payments || []).map((payment) => <tr key={payment.id}><td>{payment.method || "—"}</td><td>{payment.status || "—"}</td><td>{payment.reference || "—"}</td><td>{payment.note || "—"}</td><td>{formatJalali(payment.createdAt)}</td></tr>)}{!invoice.payments?.length && <tr><td colSpan="5" className="text-center">پرداختی ثبت نشده است.</td></tr>}</tbody></Table></div></CardBody></Card>
    </>}
    <Button tag={Link} to="/billing/invoices" color="link">بازگشت به فهرست</Button>
    <Modal isOpen={manualOpen} toggle={() => !busy && setManualOpen(false)} centered><form onSubmit={submitManual}><ModalHeader>ثبت پرداخت دستی</ModalHeader><ModalBody><Alert color="warning">این عملیات برگشت‌ناپذیر است و بلافاصله اشتراک و ظرفیت تمام ردیف‌های فاکتور را فعال می‌کند.</Alert><FormGroup><Label for="manualReference">شماره مرجع</Label><Input id="manualReference" value={manual.reference} onChange={(e) => setManual({ ...manual, reference: e.target.value })} required /></FormGroup><FormGroup><Label for="manualNote">توضیح</Label><Input id="manualNote" type="textarea" minLength={3} value={manual.note} onChange={(e) => setManual({ ...manual, note: e.target.value })} invalid={manual.note.length > 0 && manual.note.trim().length < 3} required /><small className="text-muted">حداقل ۳ کاراکتر</small></FormGroup></ModalBody><ModalFooter><Button type="button" onClick={() => setManualOpen(false)} disabled={!!busy}>انصراف</Button><Button color="warning" type="submit" disabled={!!busy || !manual.reference.trim() || manual.note.trim().length < 3}>{busy === "manual" && <Spinner size="sm" />} ثبت قطعی</Button></ModalFooter></form></Modal>
    <Modal isOpen={walletOpen} toggle={() => !busy && setWalletOpen(false)} centered><ModalHeader>پرداخت از کیف پول</ModalHeader><ModalBody><Row className="g-3"><Col xs={12}><div className="border rounded p-3 d-flex justify-content-between"><span>موجودی کیف پول</span><strong className={walletSummary.balance < 0 ? "text-danger" : ""} dir="ltr">{moneyDisplay(walletSummary.balance)}</strong></div></Col><Col xs={12}><div className="border rounded p-3 d-flex justify-content-between"><span>مبلغ فاکتور</span><strong dir="ltr">{moneyDisplay(walletSummary.invoiceAmount)}</strong></div></Col><Col xs={12}><div className={`border rounded p-3 d-flex justify-content-between ${walletSummary.canPay ? "border-success" : "border-danger"}`}><span>{walletSummary.canPay ? "موجودی پس از پرداخت" : "کسری موجودی"}</span><strong className={walletSummary.canPay ? "text-success" : "text-danger"} dir="ltr">{moneyDisplay(walletSummary.canPay ? walletSummary.balanceAfter : (serverShortfall ?? walletSummary.shortfall))}</strong></div></Col></Row>{!walletSummary.canPay && <Alert color="danger" className="mt-3 mb-0">برای پرداخت این فاکتور، کیف پول خود را به مبلغ {formatRial(serverShortfall ?? walletSummary.shortfall)} افزایش دهید.</Alert>}</ModalBody><ModalFooter><Button onClick={() => setWalletOpen(false)} disabled={!!busy}>انصراف</Button>{!walletSummary.canPay && hasPermission("billing.wallet.topup") && <Button color="success" onClick={() => { setTopupAmount(String(serverShortfall ?? walletSummary.shortfall)); setTopupOpen(true); }} disabled={!!busy}>افزایش موجودی</Button>}<Button color="primary" onClick={payWallet} disabled={!!busy || !walletSummary.canPay}>{busy === "wallet-pay" && <Spinner size="sm" className="ms-1" />}پرداخت قطعی</Button></ModalFooter></Modal>
    <Modal isOpen={topupOpen} toggle={() => !busy && setTopupOpen(false)} centered><ModalHeader>افزایش موجودی کیف پول</ModalHeader><ModalBody><FormGroup><Label for="invoice-wallet-topup">مبلغ شارژ (ریال)</Label><Input id="invoice-wallet-topup" type="text" inputMode="numeric" value={formatIntegerInput(topupAmount)} onChange={(event) => setTopupAmount(normalizePositiveIntegerInput(event.target.value))} /><small className="amount-in-words is-visible">{numberToPersianWords(topupAmount) || "صفر"} ریال</small></FormGroup><Alert color="info" className="mb-0">مبلغ پیشنهادی براساس کسری فعلی است؛ می‌توانید مبلغ بیشتری وارد کنید. پس از شارژ، پرداخت فاکتور خودکار انجام نمی‌شود.</Alert></ModalBody><ModalFooter><Button onClick={() => setTopupOpen(false)} disabled={!!busy}>انصراف</Button><Button color="success" onClick={startWalletTopup} disabled={!!busy || Number(topupAmount) < walletSummary.shortfall}>{busy === "wallet-topup" && <Spinner size="sm" className="ms-1" />}تأیید و انتقال به درگاه</Button></ModalFooter></Modal>
  </div></div>;
}
