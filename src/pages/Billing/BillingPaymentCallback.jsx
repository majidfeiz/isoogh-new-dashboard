import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button, Card, CardBody, Spinner } from "reactstrap";
import { Link, useSearchParams } from "react-router-dom";
import { getBillingInvoice, verifyBillingPayment } from "../../services/billingService.jsx";
import { billingErrorMessage, invalidateBillingCache, invalidateCapacityReport, moneyDisplay } from "./billingUtils.js";
import { clearPendingPayment, getPendingPayment, isCanceledCallback, parseProviderCallback, sanitizeCallbackUrl } from "./billingPayment.js";

const initialState = { type: "verifying", message: "در حال بررسی نتیجه پرداخت...", result: null, invoice: null };

export default function BillingPaymentCallback() {
  const [searchParams] = useSearchParams();
  const contextRef = useRef(null);
  const callbackRef = useRef(null);
  const verifyStartedRef = useRef(false);
  const [state, setState] = useState(initialState);

  const verify = useCallback(async () => {
    const context = contextRef.current;
    const callback = callbackRef.current;
    if (!context || !callback || verifyStartedRef.current) return;
    verifyStartedRef.current = true;
    setState(initialState);
    try {
      const result = await verifyBillingPayment(context.invoiceId, {
        schoolId: context.schoolId,
        authority: callback.authority,
        status: callback.status,
      });
      invalidateBillingCache();
      invalidateCapacityReport();
      const invoice = await getBillingInvoice(context.invoiceId, context.schoolId);
      clearPendingPayment();
      setState({ type: "success", message: "پرداخت توسط سرور تأیید شد.", result, invoice });
    } catch (error) {
      setState({ type: "failed", message: billingErrorMessage(error), result: null, invoice: null });
    }
  }, []);

  useEffect(() => {
    if (contextRef.current || callbackRef.current) return;
    const context = getPendingPayment();
    if (!context) {
      sanitizeCallbackUrl();
      setState({ type: "missing-context", message: "اطلاعات فاکتور برای اعتبارسنجی پرداخت پیدا نشد.", result: null, invoice: null });
      return;
    }
    const callback = parseProviderCallback(context.provider, searchParams);
    contextRef.current = context;
    callbackRef.current = callback;
    sanitizeCallbackUrl();
    if (!callback.authority || callback.authority !== context.authority || isCanceledCallback(context.provider, callback.status)) {
      setState({ type: "canceled", message: "پرداخت لغو شد یا تکمیل نشد.", result: null, invoice: null });
      return;
    }
    verify();
  }, [searchParams, verify]);

  const retry = () => { verifyStartedRef.current = false; verify(); };
  const invoice = state.invoice || state.result?.invoice || {};
  const invoiceNumber = invoice.invoiceNumber || state.result?.invoiceNumber || contextRef.current?.invoiceId;
  const amount = invoice.totalAmount ?? state.result?.amount;
  const reference = state.result?.reference ?? invoice.paymentReference;
  const detailUrl = contextRef.current ? `/billing/invoices/${contextRef.current.invoiceId}?schoolId=${contextRef.current.schoolId}` : "/billing/invoices";

  return <div className="page-content" dir="rtl"><div className="container-fluid"><Card className="mx-auto" style={{ maxWidth: 640 }}><CardBody className="text-center py-5">
    {state.type === "verifying" && <><Spinner className="mb-3" /><p>{state.message}</p></>}
    {state.type === "success" && <><Alert color="success">{state.message}</Alert><dl className="row text-start"><dt className="col-5">شماره فاکتور</dt><dd className="col-7">{invoiceNumber || "—"}</dd><dt className="col-5">مبلغ</dt><dd className="col-7">{moneyDisplay(amount)}</dd><dt className="col-5">شماره پیگیری</dt><dd className="col-7">{reference || "—"}</dd><dt className="col-5">وضعیت</dt><dd className="col-7">{invoice.status === "paid" ? "پرداخت‌شده" : invoice.status || "تأییدشده"}</dd></dl><Button tag={Link} color="primary" to={detailUrl}>بازگشت به جزئیات فاکتور</Button></>}
    {state.type === "canceled" && <><Alert color="warning">{state.message}</Alert><Button tag={Link} to={detailUrl}>بازگشت به فاکتور</Button></>}
    {state.type === "missing-context" && <><Alert color="danger">{state.message}</Alert><Button tag={Link} to="/billing/invoices">بازگشت به فاکتورها</Button></>}
    {state.type === "failed" && <><Alert color="danger">{state.message}</Alert><p className="text-muted">موفقیت پرداخت فقط پس از تأیید سرور مشخص می‌شود.</p><Button color="primary" onClick={retry}>تلاش دوباره</Button> <Button tag={Link} to={detailUrl}>بازگشت</Button></>}
  </CardBody></Card></div></div>;
}
