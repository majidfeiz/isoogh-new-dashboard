import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Badge, Button, Card, CardBody, CardHeader, Input, Table } from "reactstrap";
import { Link, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import { SchoolPicker } from "../IncomingCalls/IncomingCallsCommon.jsx";
import { getBillingWallets } from "../../services/billingService.jsx";
import { billingErrorMessage, formatRial } from "./billingUtils.js";

export default function BillingWallets() {
  const [params, setParams] = useSearchParams();
  const schoolId = params.get("schoolId") || "";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = [20, 50, 100].includes(Number(params.get("limit"))) ? Number(params.get("limit")) : 20;
  const [result, setResult] = useState({ items: [], pagination: { page: 1, lastPage: 1, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const controllerRef = useRef(null);
  const update = (changes) => setParams((current) => { const next = new URLSearchParams(current); Object.entries(changes).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key)); return next; });
  const load = useCallback(async () => { controllerRef.current?.abort(); const controller = new AbortController(); controllerRef.current = controller; setLoading(true); setError(""); try { const data = await getBillingWallets({ schoolId, page, limit, signal: controller.signal }); if (!controller.signal.aborted) setResult(data); } catch (caught) { if (!controller.signal.aborted && caught?.code !== "ERR_CANCELED") setError(billingErrorMessage(caught)); } finally { if (!controller.signal.aborted) setLoading(false); } }, [schoolId, page, limit]);
  useEffect(() => { load(); return () => controllerRef.current?.abort(); }, [load]);
  return <div className="page-content" dir="rtl"><div className="container-fluid"><Breadcrumbs title="مالی و اشتراک" breadcrumbItem="کیف پول مجموعه‌ها" />
    <Card className="mb-4"><CardBody className="d-flex flex-wrap gap-3 align-items-end"><div style={{ minWidth: 300, flex: 1 }}><SchoolPicker value={schoolId} onChange={(value) => update({ schoolId: value, page: 1 })} /></div><div><label className="form-label">تعداد در صفحه</label><Input type="select" value={limit} onChange={(event) => update({ limit: event.target.value, page: 1 })}>{[20, 50, 100].map((value) => <option key={value}>{value}</option>)}</Input></div></CardBody></Card>
    {error && <Alert color="danger">{error} <Button size="sm" color="link" onClick={load}>تلاش مجدد</Button></Alert>}
    <Card><CardHeader className="d-flex justify-content-between"><strong>حساب مجموعه‌ها</strong><span>{Number(result.pagination.total).toLocaleString("fa-IR")} کیف پول</span></CardHeader><CardBody className="p-0">{loading ? <div className="p-4 placeholder-glow"><span className="placeholder col-12 py-3" /></div> : result.items.length ? <div className="table-responsive"><Table hover className="align-middle mb-0"><thead><tr><th>مجموعه</th><th>موجودی</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>{result.items.map((item) => { const balance = Number(item.balance ?? item.wallet?.balance ?? 0); const negative = item.isNegative ?? item.is_negative ?? balance < 0; const id = item.schoolId ?? item.school_id ?? item.school?.id; return <tr key={item.id || id}><td>{item.schoolName || item.school_name || item.school?.name || `مجموعه ${id}`}</td><td className={negative ? "text-danger fw-bold" : "fw-bold"} dir="ltr">{formatRial(balance)}</td><td><Badge color={negative ? "danger" : balance === 0 ? "secondary" : "success"}>{negative ? "بدهکار" : balance === 0 ? "بدون موجودی" : "بستانکار"}</Badge></td><td><Button tag={Link} size="sm" color="primary" to={`/billing/wallet?schoolId=${id}`}>مشاهده گردش</Button></td></tr>; })}</tbody></Table></div> : <div className="text-muted text-center py-5">کیف پولی یافت نشد.</div>}<div className="border-top p-3 d-flex justify-content-between"><Button size="sm" disabled={page <= 1 || loading} onClick={() => update({ page: page - 1 })}>قبلی</Button><span>صفحه {page.toLocaleString("fa-IR")} از {Number(result.pagination.lastPage || 1).toLocaleString("fa-IR")}</span><Button size="sm" disabled={page >= result.pagination.lastPage || loading} onClick={() => update({ page: page + 1 })}>بعدی</Button></div></CardBody></Card>
  </div></div>;
}
