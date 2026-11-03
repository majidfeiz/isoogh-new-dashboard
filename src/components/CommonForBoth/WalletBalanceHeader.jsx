import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getBillingWallet } from "../../services/billingService.jsx";
import { formatRial, getUserSchoolId, subscribeBillingCache } from "../../pages/Billing/billingUtils.js";

export default function WalletBalanceHeader() {
  const { user, selectedSchoolId, hasPermission } = useAuth();
  const schoolId = selectedSchoolId || getUserSchoolId(user);
  const [state, setState] = useState({ loading: true, balance: null, negative: false });
  const controllerRef = useRef(null);

  const load = useCallback(async () => {
    if (!hasPermission("billing.wallet.show")) return;
    if (!schoolId) { setState({ loading: false, balance: 0, negative: false }); return; }
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState((current) => ({ ...current, loading: true }));
    try {
      const result = await getBillingWallet({ schoolId, page: 1, limit: 1, signal: controller.signal });
      const balance = Number(result.wallet?.balance || 0);
      if (!controller.signal.aborted) setState({ loading: false, balance, negative: result.wallet?.isNegative === true || balance < 0 });
    } catch (error) {
      if (!controller.signal.aborted && error?.code !== "ERR_CANCELED") setState({ loading: false, balance: null, negative: false });
    }
  }, [hasPermission, schoolId]);

  useEffect(() => {
    load();
    const unsubscribe = subscribeBillingCache(load);
    return () => { controllerRef.current?.abort(); unsubscribe(); };
  }, [load]);

  if (!hasPermission("billing.wallet.show")) return null;

  return <Link
    to={schoolId ? `/billing/wallet?schoolId=${encodeURIComponent(schoolId)}` : "/billing/wallet"}
    className={`wallet-header-widget ${state.negative ? "wallet-header-widget--negative" : ""}`}
    aria-label={state.loading ? "در حال دریافت موجودی کیف پول" : `موجودی کیف پول: ${formatRial(state.balance)}`}
    title="مشاهده کیف پول"
  >
    <span className="wallet-header-widget__icon"><i className="bx bx-wallet" /></span>
    <span className="wallet-header-widget__amount" dir="rtl">{state.loading ? "۰ ریال" : formatRial(state.balance ?? 0)}</span>
    {state.negative && <span className="wallet-header-widget__debt">بدهکار</span>}
  </Link>;
}
