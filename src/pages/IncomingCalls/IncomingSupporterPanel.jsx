import React, { useEffect, useRef, useState } from "react";
import { Alert, Badge, Button, Card, CardBody, Col, FormGroup, Input, Label, Row } from "reactstrap";
import { toast } from "react-toastify";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import { getApiUrl, API_ROUTES } from "../../helpers/apiRoutes.jsx";
import { getAccessToken } from "../../helpers/authStorage.jsx";
import { incomingCallErrorMessage, setIncomingAvailability } from "../../services/incomingCallService.jsx";
import { SchoolPicker } from "./IncomingCallsCommon.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const IncomingSupporterPanel = () => {
  document.title = "پنل پشتیبان تماس ورودی | آیسوق";
  const { setSelectedSchoolId } = useAuth();
  const [schoolId, setSchoolId] = useState(() => sessionStorage.getItem("incoming_calls_school_id") || ""); const [available, setAvailable] = useState(false); const [saving, setSaving] = useState(false);
  const state = useRef({ schoolId: "", available: false });
  useEffect(() => { state.current = { schoolId, available }; }, [schoolId, available]);
  useEffect(() => { if (schoolId) setSelectedSchoolId(schoolId); }, [schoolId, setSelectedSchoolId]);
  useEffect(() => { const leave = () => { const current = state.current; if (!current.schoolId || !current.available) return; sessionStorage.removeItem("incoming_calls_available"); const token = getAccessToken(); fetch(getApiUrl(API_ROUTES.incomingCalls.availability), { method: "PATCH", keepalive: true, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ schoolId: Number(current.schoolId), isAvailable: false }) }).catch(() => {}); }; window.addEventListener("pagehide", leave); return () => { window.removeEventListener("pagehide", leave); leave(); }; }, []);
  const change = async (checked) => { if (!schoolId) return; const previous = available; setAvailable(checked); setSaving(true); try { await setIncomingAvailability(schoolId, checked); sessionStorage.setItem("incoming_calls_school_id", schoolId); if (checked) sessionStorage.setItem("incoming_calls_available", "true"); else sessionStorage.removeItem("incoming_calls_available"); toast.success(checked ? "آنلاین شدید؛ این صفحه را برای دریافت تماس باز نگه دارید." : "وضعیت شما غیرفعال شد."); } catch (e) { setAvailable(previous); toast.error(incomingCallErrorMessage(e)); } finally { setSaving(false); } };
  const selectSchool = async (id) => { if (available && schoolId) { try { await setIncomingAvailability(schoolId, false); } catch (error) { toast.error(incomingCallErrorMessage(error)); return; } } setAvailable(false); sessionStorage.removeItem("incoming_calls_available"); setSchoolId(id); setSelectedSchoolId(id); if (id) sessionStorage.setItem("incoming_calls_school_id", id); };
  return <div className="page-content"><div className="container-fluid"><Breadcrumbs title="تماس‌های ورودی" breadcrumbItem="پنل پشتیبان" />
    <Row className="justify-content-center"><Col xl="9"><Card className={`border ${available ? "border-success" : "border-light"}`}><CardBody className="p-4">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4"><div><h4 className="mb-1">مرکز دریافت تماس پشتیبان</h4><p className="text-muted mb-0">برای دریافت تماس باید آنلاین شوید و در همین صفحه بمانید.</p></div><Badge color={available ? "success" : "secondary"} pill className="fs-6 px-3 py-2"><i className={`bx ${available ? "bx-wifi" : "bx-wifi-off"} me-1`} />{available ? "آنلاین و آماده" : "آفلاین"}</Badge></div>
      <Row className="g-4 align-items-stretch"><Col lg="5"><div className="border rounded p-3 h-100"><SchoolPicker value={schoolId} onChange={selectSchool} disabled={saving || available} /><small className="text-muted">هنگام آنلاین بودن امکان تغییر مجموعه وجود ندارد.</small></div></Col><Col lg="7"><div className={`rounded p-4 h-100 ${available ? "bg-success bg-opacity-10" : "bg-light"}`}><div className="d-flex align-items-center gap-3"><div className={`rounded-circle d-flex align-items-center justify-content-center ${available ? "bg-success" : "bg-secondary"}`} style={{ width: 56, height: 56 }}><i className="bx bxs-headphone text-white fs-2" /></div><div><div className="fw-bold fs-5">{available ? "آماده دریافت تماس هستید" : "دریافت تماس غیرفعال است"}</div><div className="text-muted">{available ? "اتصال زنده برقرار است؛ منتظر تماس بمانید." : "برای ورود به صف تماس، وضعیت را فعال کنید."}</div></div></div><FormGroup switch className="mt-4 mb-0"><Input type="switch" role="switch" disabled={!schoolId || saving} checked={available} onChange={(e) => change(e.target.checked)} /><Label check className="fw-bold ms-2">{saving ? "در حال تغییر وضعیت…" : available ? "آنلاین" : "آفلاین"}</Label></FormGroup></div></Col></Row>
      {available && <Alert color="warning" className="mt-4 mb-0"><i className="bx bx-info-circle me-2" /><strong>این صفحه را نبندید و از آن خارج نشوید.</strong> با خروج از پنل، وضعیت شما خودکار غیرفعال می‌شود و تماس جدیدی دریافت نخواهید کرد.</Alert>}
      {!schoolId && <Alert color="info" className="mt-4 mb-0">ابتدا مجموعه را انتخاب کنید، سپس وضعیت خود را آنلاین کنید.</Alert>}
    </CardBody></Card></Col></Row></div></div>;
};
export default IncomingSupporterPanel;
