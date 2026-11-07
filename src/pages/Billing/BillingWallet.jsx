import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Badge, Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner, Table } from "reactstrap";
import { useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import DeleteModal from "../../components/Common/DeleteModal.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { createWalletAdjustment, exportWalletTransactions, getBillingWallet, getWalletTopups, requestWalletTopup } from "../../services/billingService.jsx";
import { SchoolPicker } from "../IncomingCalls/IncomingCallsCommon.jsx";
import { billingErrorMessage, formatIntegerInput, formatJalali, formatRial, getUserSchoolId, invalidateBillingCache, normalizePositiveIntegerInput, numberToPersianWords, subscribeBillingCache } from "./billingUtils.js";
import { savePendingWalletTopup } from "./walletPayment.js";

const emptyWallet = { wallet: {}, transactions: [], pagination: { page: 1, lastPage: 1, total: 0 } };
const transactionView = (type) => type === "deposit" ? ["واریز", "success", "bx-down-arrow-alt"] : ["برداشت", "danger", "bx-up-arrow-alt"];
const metaDescription = (value) => value?.description || value?.note || value?.title || "—";
const TOPUP_STATUS = { pending: ["در انتظار", "warning"], succeeded: ["موفق", "success"], failed: ["ناموفق", "danger"], canceled: ["لغوشده", "secondary"] };

export default function BillingWallet() {
  const { user, selectedSchoolId, setSelectedSchoolId, hasPermission } = useAuth();
  const [params, setParams] = useSearchParams();
  const fixedSchoolId = getUserSchoolId(user) || "";
  const inferredSchoolId = fixedSchoolId || selectedSchoolId || "";
  const schoolId = String(fixedSchoolId || params.get("schoolId") || inferredSchoolId || "");
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = [10, 20, 50].includes(Number(params.get("limit"))) ? Number(params.get("limit")) : 20;
  const [data, setData] = useState(emptyWallet);
  const [topups, setTopups] = useState({ items: [], pagination: { page: 1, lastPage: 1, total: 0 } });
  const [activeTab, setActiveTab] = useState("ledger");
  const [topupStatus, setTopupStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [topup, setTopup] = useState("");
  const [topupConfirmOpen, setTopupConfirmOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manual, setManual] = useState({ type: "deposit", amount: "", reference: "", reason: "" });
  const controllerRef = useRef(null);

  const update = useCallback((changes, options) => setParams((current) => {
    const next = new URLSearchParams(current);
    Object.entries(changes).forEach(([key, value]) => value ? next.set(key, String(value)) : next.delete(key));
    return next;
  }, options), [setParams]);

  useEffect(() => {
    if (!params.get("schoolId") && inferredSchoolId) update({ schoolId: inferredSchoolId, page: 1 }, { replace: true });
  }, [inferredSchoolId, params, update]);

  const load = useCallback(async () => {
    if (!schoolId) { setData(emptyWallet); return; }
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true); setError("");
    try {
      const [result, topupResult] = await Promise.all([getBillingWallet({ schoolId, page, limit, signal: controller.signal }), getWalletTopups({ schoolId, status: topupStatus, page, limit, signal: controller.signal })]);
      if (!controller.signal.aborted) { setData(result); setTopups(topupResult); }
    } catch (caught) {
      if (!controller.signal.aborted && caught?.code !== "ERR_CANCELED") { setData(emptyWallet); setError(billingErrorMessage(caught)); }
    } finally { if (!controller.signal.aborted) setLoading(false); }
  }, [schoolId, page, limit, topupStatus]);

  useEffect(() => {
    load();
    const unsubscribe = subscribeBillingCache(load);
    return () => { controllerRef.current?.abort(); unsubscribe(); };
  }, [load]);

  const openTopupConfirmation = () => {
    const amount = Number(topup);
    if (busy || amount <= 0) return;
    setTopupConfirmOpen(true);
  };

  const startTopup = async () => {
    const amount = Number(topup);
    if (busy || amount <= 0) return;
    setBusy("topup"); setError("");
    try {
      const result = await requestWalletTopup({ schoolId, amount });
      if (!result?.paymentUrl || !result?.topupId) throw new Error("پاسخ درگاه کامل نیست.");
      savePendingWalletTopup({ topupId: result.topupId, schoolId: Number(schoolId), verifyPath: result.verifyPath, authority: result.authority || "", paymentType: result.paymentType, provider: result.provider });
      window.location.assign(result.paymentUrl);
    } catch (caught) { setError(caught?.response ? billingErrorMessage(caught) : caught.message); setBusy(""); setTopupConfirmOpen(false); }
  };

  const submitManual = async (event) => {
    event.preventDefault();
    if (busy || Number(manual.amount) <= 0) return;
    setBusy("manual"); setError("");
    try {
      await createWalletAdjustment({ schoolId, type: manual.type, amount: manual.amount, reference: manual.reference.trim(), reason: manual.reason.trim() });
      setManualOpen(false); setManual({ type: "deposit", amount: "", reference: "", reason: "" }); invalidateBillingCache();
    } catch (caught) { setError(billingErrorMessage(caught)); } finally { setBusy(""); }
  };

  const balance = Number(data.wallet?.balance || 0);
  const negative = data.wallet?.isNegative === true || balance < 0;
  const changeSchool = (value) => { setSelectedSchoolId(value); update({ schoolId: value, page: 1 }); };
  const downloadCsv = async () => {
    if (!schoolId || busy) return;
    setBusy("export"); setError("");
    try { const file = await exportWalletTransactions(schoolId); const url = URL.createObjectURL(file.blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = file.filename; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 0); }
    catch (caught) { setError(billingErrorMessage(caught)); } finally { setBusy(""); }
  };

  return <div className="page-content" dir="rtl"><div className="container-fluid">
    <Breadcrumbs title="مالی و اشتراک" breadcrumbItem="کیف پول" />

    <Card className="billing-wallet-filter mb-4"><CardBody className="p-4"><Row className="g-3 align-items-end">
      <Col xl={6} lg={7}>{fixedSchoolId ? <div><Label for="wallet-fixed-school">مجموعه</Label><div id="wallet-fixed-school" className="form-control bg-light d-flex align-items-center gap-2" aria-readonly="true"><i className="bx bx-buildings text-primary" /><strong>{user?.schoolName || user?.school_name || user?.school?.name || user?.school?.title || "مجموعه من"}</strong><Badge color="primary" className="me-auto">انتخاب خودکار</Badge></div></div> : <SchoolPicker value={schoolId} onChange={changeSchool} />}</Col>
      <Col xl={2} lg={3} sm={6}><Label for="wallet-limit">تعداد در صفحه</Label><Input id="wallet-limit" type="select" value={limit} onChange={(event) => update({ limit: event.target.value, page: 1 })}>{[10, 20, 50].map((value) => <option key={value} value={value}>{value.toLocaleString("fa-IR")}</option>)}</Input></Col>
    </Row></CardBody></Card>

    {error && <Alert color="danger" className="d-flex align-items-center justify-content-between"><span><i className="bx bx-error-circle ms-2" />{error}</span><Button color="link" onClick={load}>تلاش دوباره</Button></Alert>}

    {schoolId && <>
      <Card className={`billing-wallet-summary mb-4 ${negative ? "billing-wallet-summary--negative" : ""}`}><CardBody className="p-4"><div className="billing-wallet-summary__row">
        <div className="billing-wallet-summary__balance">
          <span className="billing-wallet-summary__icon"><i className="bx bx-wallet" /></span>
          <div><small className="text-muted d-block mb-1">موجودی فعلی کیف پول</small>{loading && data.wallet?.balance == null ? <Spinner size="sm" /> : <><strong className={negative ? "text-danger" : "text-dark"} dir="ltr">{formatRial(balance)}</strong><Badge color={negative ? "danger" : balance === 0 ? "secondary" : "success"} className="me-2">{negative ? "بدهکار" : balance === 0 ? "بدون موجودی" : "دارای موجودی"}</Badge></>}</div>
        </div>
        {hasPermission("billing.wallet.topup") && <FormGroup className="billing-wallet-summary__amount mb-0"><Label for="wallet-topup">مبلغ افزایش موجودی (ریال)</Label><Input id="wallet-topup" type="text" inputMode="numeric" autoComplete="off" placeholder="مثلاً ۵٬۰۰۰٬۰۰۰" value={formatIntegerInput(topup)} onChange={(event) => setTopup(normalizePositiveIntegerInput(event.target.value))} /><small className={`amount-in-words ${topup && Number(topup) > 0 ? "is-visible" : ""}`} aria-live="polite">{topup && Number(topup) > 0 ? `${numberToPersianWords(topup)} ریال` : "مبلغ را وارد کنید"}</small></FormGroup>}
        <div className="billing-wallet-summary__actions">{hasPermission("billing.wallet.topup") && <Button color="success" disabled={busy || Number(topup) <= 0} onClick={openTopupConfirmation}><i className="bx bx-plus-circle ms-1" />شارژ از درگاه</Button>}{hasPermission("billing.wallet.adjust") && <Button color="light" onClick={() => setManualOpen(true)} disabled={!!busy}><i className="bx bx-edit ms-1" />شارژ دستی</Button>}</div>
      </div>{negative && <div className="text-danger small mt-3"><i className="bx bx-error-circle ms-1" />موجودی منفی است و مجموعه بدهکار محسوب می‌شود.</div>}</CardBody></Card>

      <Card className="billing-wallet-transactions"><CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2"><div><h5 className="mb-1">گزارش کیف پول</h5><small className="text-muted">گردش قطعی مالی از تلاش‌های شارژ تفکیک شده است.</small></div><div className="d-flex gap-2"><Button size="sm" outline color="primary" onClick={downloadCsv} disabled={busy === "export"}><i className="bx bx-download ms-1" />دریافت گزارش CSV</Button><Badge color="light" className="text-dark px-3 py-2">{Number((activeTab === "ledger" ? data : topups).pagination.total || 0).toLocaleString("fa-IR")} رکورد</Badge></div></CardHeader><CardBody className="p-0">
        <div className="d-flex flex-wrap gap-2 p-3 border-bottom"><Button size="sm" color={activeTab === "ledger" ? "primary" : "light"} onClick={() => setActiveTab("ledger")}>گردش قطعی</Button><Button size="sm" color={activeTab === "topups" ? "primary" : "light"} onClick={() => setActiveTab("topups")}>تلاش‌های شارژ</Button>{activeTab === "topups" && <Input type="select" bsSize="sm" value={topupStatus} onChange={(event) => { setTopupStatus(event.target.value); update({ page: 1 }); }} style={{ maxWidth: 180 }}><option value="">همه وضعیت‌ها</option>{Object.entries(TOPUP_STATUS).map(([value, view]) => <option key={value} value={value}>{view[0]}</option>)}</Input>}</div>
        {loading && !(activeTab === "ledger" ? data.transactions : topups.items).length ? <div className="p-4 placeholder-glow"><span className="placeholder col-12 d-block mb-3 py-2" /><span className="placeholder col-12 d-block mb-3 py-2" /><span className="placeholder col-12 d-block py-2" /></div> : activeTab === "ledger" ? data.transactions.length ? <div className="table-responsive"><Table hover className="align-middle mb-0"><thead><tr><th>UUID</th><th>وضعیت</th><th>نوع</th><th>مبلغ</th><th>مانده قبل</th><th>مانده بعد</th><th>فاکتور/مشاور</th><th>مرجع</th><th>شرح</th><th>تاریخ</th></tr></thead><tbody>{data.transactions.map((item) => { const view = transactionView(item.type); return <tr key={item.id || item.uuid}><td className="text-break">{item.uuid || item.id || "—"}</td><td><Badge color="success">قطعی</Badge></td><td><span className={`text-${view[1]} fw-semibold`}>{view[0]}</span></td><td className={`fw-bold text-${view[1]}`} dir="ltr">{item.type === "withdraw" ? "− " : "+ "}{formatRial(Math.abs(Number(item.amount || 0)))}</td><td dir="ltr">{formatRial(item.balanceBefore)}</td><td dir="ltr" className="fw-semibold">{formatRial(item.balanceAfter)}</td><td>{item.invoiceId ? `فاکتور #${item.invoiceId}` : item.adviserId ? `مشاور #${item.adviserId}` : "—"}</td><td>{item.reference || item.referenceType || "—"}</td><td>{item.description || metaDescription(item.meta)}</td><td className="text-nowrap">{formatJalali(item.createdAt)}</td></tr>; })}</tbody></Table></div> : <div className="billing-wallet-empty text-muted"><i className="bx bx-receipt" /><h5>هنوز تراکنشی ثبت نشده است</h5></div> : topups.items.length ? <div className="table-responsive"><Table hover className="align-middle mb-0"><thead><tr><th>شناسه</th><th>مبلغ</th><th>درگاه</th><th>وضعیت</th><th>مرجع</th><th>تاریخ</th></tr></thead><tbody>{topups.items.map((item) => { const status = TOPUP_STATUS[item.status] || [item.status || "نامشخص", "secondary"]; return <tr key={item.id || item.topupId}><td>{item.id || item.topupId}</td><td>{formatRial(item.amount)}</td><td>{item.provider || "—"}</td><td><Badge color={status[1]}>{status[0]}</Badge></td><td>{item.reference || item.transactionReference || "—"}</td><td>{formatJalali(item.createdAt)}</td></tr>; })}</tbody></Table></div> : <div className="billing-wallet-empty text-muted"><i className="bx bx-time-five" /><h5>تلاش شارژی ثبت نشده است</h5></div>}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 border-top p-3 px-4"><small aria-live="polite">صفحه {page.toLocaleString("fa-IR")} از {Number((activeTab === "ledger" ? data : topups).pagination.lastPage || 1).toLocaleString("fa-IR")}</small><div className="d-flex gap-2"><Button outline color="secondary" size="sm" disabled={page <= 1 || loading} onClick={() => update({ page: page - 1 })}>قبلی</Button><Button outline color="secondary" size="sm" disabled={page >= (activeTab === "ledger" ? data : topups).pagination.lastPage || loading} onClick={() => update({ page: page + 1 })}>بعدی</Button></div></div>
      </CardBody></Card>
    </>}

    {!schoolId && <Alert color="info"><i className="bx bx-buildings ms-2" />برای مشاهده کیف پول، مجموعه را انتخاب کنید.</Alert>}

    <DeleteModal show={topupConfirmOpen} onCloseClick={() => !busy && setTopupConfirmOpen(false)} onDeleteClick={startTopup} loading={busy === "topup"} message={`آیا از افزایش موجودی کیف پول به مبلغ ${formatRial(Number(topup) || 0)} (${numberToPersianWords(topup) || "صفر"} ریال) مطمئن هستید؟ پس از تأیید به درگاه پرداخت منتقل می‌شوید.`} confirmText="تأیید و انتقال به درگاه" loadingText="در حال ایجاد پرداخت…" cancelText="انصراف" confirmColor="success" icon="bx bx-wallet" />

    <Modal isOpen={manualOpen} toggle={() => !busy && setManualOpen(false)} centered dir="rtl"><form onSubmit={submitManual}><ModalHeader toggle={() => !busy && setManualOpen(false)}>اصلاح حسابداری کیف پول</ModalHeader><ModalBody><Alert color="warning" className="small">تراکنش‌ها قابل ویرایش یا حذف نیستند؛ اصلاح با سند مستقل ثبت می‌شود.</Alert><FormGroup><Label>نوع اصلاح</Label><Input type="select" value={manual.type} onChange={(event) => setManual({ ...manual, type: event.target.value })}><option value="deposit">افزایش موجودی</option><option value="withdraw">کاهش موجودی</option></Input></FormGroup><FormGroup><Label for="manual-wallet-amount">مبلغ (ریال)</Label><Input id="manual-wallet-amount" type="number" min="1" value={manual.amount} onChange={(event) => setManual({ ...manual, amount: event.target.value })} required />{manual.amount && Number(manual.amount) > 0 && <small className="amount-in-words is-visible" aria-live="polite">{numberToPersianWords(manual.amount)} ریال</small>}</FormGroup><FormGroup><Label for="manual-wallet-reference">مرجع</Label><Input id="manual-wallet-reference" value={manual.reference} onChange={(event) => setManual({ ...manual, reference: event.target.value })} required /></FormGroup><FormGroup><Label for="manual-wallet-reason">دلیل اصلاح</Label><Input id="manual-wallet-reason" type="textarea" rows="3" value={manual.reason} onChange={(event) => setManual({ ...manual, reason: event.target.value })} required /></FormGroup></ModalBody><ModalFooter><Button type="button" color="light" onClick={() => setManualOpen(false)}>انصراف</Button><Button color="warning" type="submit" disabled={busy || Number(manual.amount) <= 0}>{busy === "manual" && <Spinner size="sm" className="ms-1" />}ثبت سند اصلاحی</Button></ModalFooter></form></Modal>
  </div></div>;
}
