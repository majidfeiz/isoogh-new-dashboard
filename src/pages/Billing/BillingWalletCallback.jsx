import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Card, CardBody, Spinner } from "reactstrap";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { verifyWalletTopup } from "../../services/billingService.jsx";
import { billingErrorMessage, formatRial, invalidateBillingCache } from "./billingUtils.js";
import { clearPendingWalletTopup, getPendingWalletTopup, isWalletCallbackCanceled, parseWalletCallback, walletCallbackIsComplete } from "./walletPayment.js";

const verifyingState = { type: "verifying", message: "در حال تأیید شارژ کیف پول...", result: null };

export default function BillingWalletCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const storedRef = useRef(getPendingWalletTopup());
  const runningRef = useRef(false);
  const redirectTimerRef = useRef(null);
  const callback = useMemo(() => parseWalletCallback(params, storedRef.current || {}), [params]);
  const [state, setState] = useState(verifyingState);
  const walletUrl = callback.schoolId ? `/billing/wallet?schoolId=${callback.schoolId}` : "/billing/wallet";
  const successUrl = storedRef.current?.returnTo?.startsWith("/billing/") ? storedRef.current.returnTo : walletUrl;

  const verify = useCallback(async () => {
    if (runningRef.current) return;
    if (isWalletCallbackCanceled(callback)) {
      setState({ type: "canceled", message: "پرداخت توسط کاربر لغو شد", result: null });
      return;
    }
    if (!walletCallbackIsComplete(callback)) {
      setState({ type: "missing", message: "اطلاعات callback شارژ کیف پول کامل نیست. لطفاً دوباره از صفحه کیف پول اقدام کنید.", result: null });
      return;
    }
    runningRef.current = true;
    setState(verifyingState);
    try {
      const result = await verifyWalletTopup(callback.topupId, { schoolId: callback.schoolId, authority: callback.authority, status: callback.status });
      clearPendingWalletTopup();
      invalidateBillingCache();
      setState({ type: "success", message: "افزایش موجودی کیف پول با موفقیت انجام شد", result });
      redirectTimerRef.current = window.setTimeout(() => navigate(successUrl, { replace: true }), 1400);
    } catch (error) {
      const retryable = !error?.response || Number(error?.response?.status) >= 500;
      setState({ type: retryable ? "network-error" : "failed", message: error?.response?.data?.message || billingErrorMessage(error), result: null });
    } finally { runningRef.current = false; }
  }, [callback, navigate, successUrl]);

  useEffect(() => { verify(); }, [verify]);
  useEffect(() => () => window.clearTimeout(redirectTimerRef.current), []);
  const retry = () => { runningRef.current = false; verify(); };
  const returnedBalance = state.result?.wallet?.balance ?? state.result?.balance;
  const verifying = state.type === "verifying";

  return <div className="page-content" dir="rtl"><div className="container-fluid"><Card className="mx-auto" style={{ maxWidth: 620 }}><CardBody className="text-center py-5 px-4">
    {verifying && <><div className="avatar-md mx-auto mb-4"><div className="avatar-title rounded-circle bg-primary bg-opacity-10 text-primary"><Spinner size="sm" /></div></div><h5>{state.message}</h5><p className="text-muted mb-0">لطفاً این صفحه را نبندید.</p></>}
    {state.type === "success" && <><div className="avatar-md mx-auto mb-4"><div className="avatar-title rounded-circle bg-success bg-opacity-10 text-success"><i className="bx bx-check font-size-24" /></div></div><Alert color="success" aria-live="polite">{state.message}</Alert>{returnedBalance != null && <p className="mb-4">موجودی جدید: <strong dir="ltr">{formatRial(returnedBalance)}</strong></p>}<p className="text-muted">در حال انتقال به کیف پول…</p></>}
    {state.type === "canceled" && <><Alert color="warning" aria-live="polite">{state.message}</Alert><Button tag={Link} to={walletUrl} color="primary">بازگشت به کیف پول</Button></>}
    {state.type === "missing" && <><Alert color="danger" aria-live="polite">{state.message}</Alert><Button tag={Link} to={walletUrl}>بازگشت به کیف پول</Button></>}
    {state.type === "network-error" && <><Alert color="danger" aria-live="polite">{state.message}</Alert><Button color="primary" onClick={retry}>تلاش مجدد برای تأیید</Button> <Button tag={Link} to={walletUrl}>بازگشت به کیف پول</Button></>}
    {state.type === "failed" && <><Alert color="danger" aria-live="polite">{state.message}</Alert><Button tag={Link} to={walletUrl}>بازگشت به کیف پول</Button></>}
    {verifying && <Button color="secondary" disabled className="mt-4">بازگشت به کیف پول</Button>}
  </CardBody></Card></div></div>;
}
