import React from "react";
import { Alert, Card, CardBody } from "reactstrap";
import { useSearchParams } from "react-router-dom";
import { getPendingPayment } from "./billingPayment.js";
import BillingPaymentCallback from "./BillingPaymentCallback.jsx";
import BillingWalletCallback from "./BillingWalletCallback.jsx";
import { callbackPaymentType, getPendingWalletTopup, INVOICE_PAYMENT_TYPE, WALLET_TOPUP_PAYMENT_TYPE } from "./walletPayment.js";

export const resolveBillingCallbackTarget = (params, walletContext, invoiceContext) => {
  const paymentType = callbackPaymentType(params, walletContext, invoiceContext);
  if (paymentType === WALLET_TOPUP_PAYMENT_TYPE) return WALLET_TOPUP_PAYMENT_TYPE;
  if (paymentType === INVOICE_PAYMENT_TYPE) return INVOICE_PAYMENT_TYPE;
  return "unknown";
};

export default function BillingCallbackRouter() {
  const [params] = useSearchParams();
  const target = resolveBillingCallbackTarget(params, getPendingWalletTopup(), getPendingPayment());
  if (target === WALLET_TOPUP_PAYMENT_TYPE) return <BillingWalletCallback />;
  if (target === INVOICE_PAYMENT_TYPE) return <BillingPaymentCallback />;
  return <div className="page-content" dir="rtl"><div className="container-fluid"><Card className="mx-auto" style={{ maxWidth: 640 }}><CardBody className="py-5"><Alert color="danger" className="mb-0 text-center">نوع پرداخت callback مشخص نیست. اطلاعات پرداخت ناقص است.</Alert></CardBody></Card></div></div>;
}
