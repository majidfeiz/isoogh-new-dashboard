import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, CardBody, CardHeader, Col, Input, Label, Row, Spinner, Table } from "reactstrap";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useAuth } from "../../context/AuthContext.jsx";
import { getSchools } from "../../services/schoolService.jsx";
import { executeBillingReminders, executeBillingRestrictions, getBillingInvoices } from "../../services/billingService.jsx";
import InvoiceCreateModal from "./InvoiceCreateModal.jsx";
import { BILLING_ADMIN_ROLES, billingErrorMessage, getUserSchoolId, hasBillingRole, invalidateBillingCache, isBillingManager, moneyDisplay, STATUS_LABELS, subscribeBillingCache } from "./billingUtils.js";

export default function BillingInvoices() {
  document.title = "مالی و اشتراک | داشبورد آیسوق";
  const { user, hasPermission } = useAuth();
  const manager = isBillingManager(user);
  const fixedSchoolId = manager ? getUserSchoolId(user) : "";
  const admin = hasBillingRole(user, BILLING_ADMIN_ROLES);
  const [filters, setFilters] = useState({ schoolId: fixedSchoolId, status: "", search: "", page: 1, limit: 10 });
  const [result, setResult] = useState({ items: [], kpis: {}, pagination: { page: 1, lastPage: 1, total: 0 } });
  const [schools, setSchools] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [executing, setExecuting] = useState("");

  useEffect(() => {
    let active = true;
    setSchoolsLoading(true);
    getSchools({ limit: 100 }).then((response) => {
      if (!active) return;
      const allowedSchools = response.items || [];
      setSchools(allowedSchools);
      setFilters((current) => ({
        ...current,
        schoolId: current.schoolId || fixedSchoolId || (manager && allowedSchools.length === 1 ? String(allowedSchools[0].id) : ""),
      }));
    }).catch(() => { if (active) setSchools([]); }).finally(() => { if (active) setSchoolsLoading(false); });
    return () => { active = false; };
  }, [manager, fixedSchoolId]);
  const load = useCallback(async () => {
    if (schoolsLoading) return;
    const selectedSchoolId = manager ? (filters.schoolId || fixedSchoolId) : filters.schoolId;
    if (manager && !selectedSchoolId) {
      setError(schools.length ? "برای مشاهده فاکتورها یک مجموعه را انتخاب کنید." : "هیچ مجموعه مجازی برای این حساب مدیر یافت نشد.");
      setLoading(false);
      return;
    }
    setLoading(true); setError("");
    try { setResult(await getBillingInvoices({ ...filters, schoolId: selectedSchoolId })); }
    catch (e) { setError(billingErrorMessage(e)); }
    finally { setLoading(false); }
  }, [filters, manager, fixedSchoolId, schools, schoolsLoading]);
  useEffect(() => { load(); return subscribeBillingCache(load); }, [load]);

  const kpis = useMemo(() => ["unpaid", "paid", "expired"].map((status) => ({ status, ...(result.kpis?.[status] || {}) })), [result.kpis]);
  const execute = async (kind) => {
    if (executing || !window.confirm(`آیا از اجرای فرآیند ${kind === "reminders" ? "یادآوری" : "محدودسازی"} مطمئن هستید؟`)) return;
    setExecuting(kind);
    try { kind === "reminders" ? await executeBillingReminders() : await executeBillingRestrictions(); invalidateBillingCache(); }
    finally { setExecuting(""); }
  };

  return <div className="page-content" dir="rtl"><div className="container-fluid">
    <Breadcrumbs title="مالی و اشتراک" breadcrumbItem="فاکتورها" />
    <Row>{kpis.map((kpi) => <Col md={4} key={kpi.status}><Card><CardBody><div className="text-muted">{STATUS_LABELS[kpi.status]}</div><h4>{Number(kpi.count || 0).toLocaleString("fa-IR")} فاکتور</h4><small>{moneyDisplay(kpi.amount ?? kpi.totalAmount ?? 0)}</small></CardBody></Card></Col>)}</Row>
    <Card><CardHeader className="d-flex flex-wrap gap-2 justify-content-between"><strong>فهرست فاکتورها</strong><div className="d-flex gap-2">
      {admin && hasPermission("billing.execute") && <><Button size="sm" outline onClick={() => execute("reminders")} disabled={!!executing}>اجرای یادآوری‌ها</Button><Button size="sm" outline color="warning" onClick={() => execute("restrictions")} disabled={!!executing}>اجرای محدودیت‌ها</Button></>}
      {admin && hasPermission("billing.invoices.create") && <Button size="sm" color="primary" onClick={() => setCreateOpen(true)}>صدور فاکتور</Button>}
      {admin && hasPermission("billing.pricing.show") && <Button size="sm" tag={Link} to="/billing/pricing">تنظیم قیمت</Button>}
    </div></CardHeader><CardBody>
      <Row className="g-2 mb-3">
        <Col md={4}><Label for="schoolFilter">مجموعه</Label><Input id="schoolFilter" type="select" value={filters.schoolId} disabled={schoolsLoading || (manager && schools.length === 1)} onChange={(e) => setFilters({ ...filters, schoolId: e.target.value, page: 1 })}><option value="">{manager ? "انتخاب مجموعه" : "همه مجموعه‌ها"}</option>{schools.map((s) => <option key={s.id} value={s.id}>{s.name || s.title}</option>)}</Input></Col>
        <Col md={3}><Label for="statusFilter">وضعیت</Label><Input id="statusFilter" type="select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}><option value="">همه</option>{Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Input></Col>
        <Col md={5}><Label for="invoiceSearch">شماره فاکتور</Label><Input id="invoiceSearch" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} placeholder="جستجو…" /></Col>
      </Row>
      {error && <Alert color="danger">{error}<Button color="link" onClick={load}>تلاش دوباره</Button></Alert>}
      <div className="table-responsive"><Table hover className="align-middle"><thead><tr><th>شماره</th><th>مجموعه</th><th>وضعیت</th><th>تاریخ صدور</th><th>مبلغ</th><th><span className="visually-hidden">عملیات</span></th></tr></thead><tbody>
        {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan="6"><span className="placeholder col-12" /></td></tr>) : result.items.length ? result.items.map((invoice) => <tr key={invoice.id}><td>{invoice.number || invoice.invoiceNumber || invoice.id}</td><td>{invoice.school?.name || invoice.schoolName || "—"}</td><td><Badge color={invoice.status === "paid" ? "success" : invoice.status === "expired" ? "danger" : "warning"}>{STATUS_LABELS[invoice.status] || invoice.status}</Badge></td><td>{invoice.issuedAt ? new Intl.DateTimeFormat("fa-IR-u-ca-persian").format(new Date(invoice.issuedAt)) : "—"}</td><td>{moneyDisplay(invoice.totalAmount ?? invoice.finalAmount)}</td><td>{hasPermission("billing.invoices.show") && <Button tag={Link} size="sm" to={`/billing/invoices/${invoice.id}?schoolId=${invoice.schoolId}`}>جزئیات</Button>}</td></tr>) : <tr><td colSpan="6" className="text-center py-5 text-muted">فاکتوری یافت نشد.</td></tr>}
      </tbody></Table></div>
      <div className="d-flex justify-content-between align-items-center"><small>{Number(result.pagination.total || 0).toLocaleString("fa-IR")} مورد</small><div><Button size="sm" className="ms-2" disabled={filters.page <= 1 || loading} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>قبلی</Button><span>{filters.page.toLocaleString("fa-IR")} از {Number(result.pagination.lastPage || 1).toLocaleString("fa-IR")}</span><Button size="sm" className="me-2" disabled={filters.page >= result.pagination.lastPage || loading} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>بعدی</Button></div></div>
    </CardBody></Card>
    <InvoiceCreateModal open={createOpen} toggle={() => setCreateOpen(false)} schools={schools} fixedSchoolId={fixedSchoolId} allowOverrides={admin} onCreated={load} />
  </div></div>;
}
