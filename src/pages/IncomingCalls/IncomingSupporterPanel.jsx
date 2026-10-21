import React, { useEffect, useRef, useState } from "react";
import { Alert, Badge, Card, CardBody, Col, FormGroup, Input, Label, Row, Spinner } from "reactstrap";
import { toast } from "react-toastify";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import { getApiUrl, API_ROUTES } from "../../helpers/apiRoutes.jsx";
import { getAccessToken } from "../../helpers/authStorage.jsx";
import { getIncomingAvailability, incomingCallErrorMessage, setIncomingAvailability } from "../../services/incomingCallService.jsx";
import { SchoolPicker } from "./IncomingCallsCommon.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const actorLabels = { consultant: "مشاور", supporter: "پشتیبان" };
const connectionConfig = {
  subscribed: { label: "متصل", color: "success" }, connected: { label: "در حال عضویت", color: "warning" },
  connecting: { label: "در حال اتصال", color: "warning" }, reconnecting: { label: "اتصال مجدد", color: "warning" },
  disconnected: { label: "قطع", color: "danger" }, idle: { label: "قطع", color: "secondary" },
};

const IncomingSupporterPanel = () => {
  document.title = "دریافت تماس ورودی | آیسوق";
  const { hasPermission, refreshMe, setSelectedSchoolId } = useAuth();
  const [schoolId, setSchoolId] = useState(() => sessionStorage.getItem("incoming_calls_school_id") || "");
  const [availability, setAvailability] = useState({ actorType: "", isAvailable: false });
  const [connection, setConnection] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const state = useRef({ schoolId: "", available: false });
  const mutationPending = useRef(false);
  const canSubscribe = hasPermission("incoming-calls.realtime.subscribe");
  const subscribed = connection === "subscribed";
  const effectiveAvailable = availability.isAvailable && subscribed;
  const connectionBadge = connectionConfig[connection] || connectionConfig.idle;

  useEffect(() => { state.current = { schoolId, available: availability.isAvailable }; }, [schoolId, availability.isAvailable]);
  useEffect(() => {
    const onConnection = (event) => {
      if (String(event.detail?.schoolId ?? "") === String(schoolId)) setConnection(event.detail?.status || "idle");
    };
    window.addEventListener("incoming-calls:connection", onConnection);
    return () => window.removeEventListener("incoming-calls:connection", onConnection);
  }, [schoolId]);

  useEffect(() => {
    if (!schoolId) { setAvailability({ actorType: "", isAvailable: false }); setConnection("idle"); return undefined; }
    setSelectedSchoolId(schoolId);
    sessionStorage.setItem("incoming_calls_school_id", schoolId);
    const controller = new AbortController();
    setLoading(true);
    getIncomingAvailability(schoolId, controller.signal)
      .then((result) => { if (!controller.signal.aborted) setAvailability(result); })
      .catch((error) => {
        if (error?.code === "ERR_CANCELED" || controller.signal.aborted) return;
        setAvailability({ actorType: "", isAvailable: false });
        toast.error(incomingCallErrorMessage(error));
        if (error?.response?.status === 403) refreshMe("incoming-availability-403");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [refreshMe, schoolId, setSelectedSchoolId]);

  useEffect(() => {
    const leave = () => {
      const current = state.current;
      if (!current.schoolId || !current.available) return;
      const token = getAccessToken();
      fetch(getApiUrl(API_ROUTES.incomingCalls.availability), {
        method: "PATCH", keepalive: true,
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ schoolId: Number(current.schoolId), isAvailable: false }),
      }).catch(() => {});
    };
    window.addEventListener("pagehide", leave);
    return () => { window.removeEventListener("pagehide", leave); leave(); sessionStorage.removeItem("incoming_calls_available"); };
  }, []);

  const change = async (checked) => {
    if (!schoolId || mutationPending.current || (checked && !subscribed)) return;
    const previous = availability;
    mutationPending.current = true; setSaving(true);
    setAvailability((current) => ({ ...current, isAvailable: checked }));
    try {
      const result = await setIncomingAvailability(schoolId, checked);
      setAvailability(result);
      toast.success(result.isAvailable ? "آماده دریافت تماس شدید." : "دریافت تماس غیرفعال شد.");
    } catch (error) {
      setAvailability(error?.response?.status === 403 ? { ...previous, isAvailable: false } : previous);
      toast.error(incomingCallErrorMessage(error));
      if (error?.response?.status === 403) refreshMe("incoming-availability-403");
    } finally { mutationPending.current = false; setSaving(false); }
  };

  const selectSchool = async (nextSchoolId) => {
    if (mutationPending.current) return;
    if (availability.isAvailable && schoolId) {
      try { await setIncomingAvailability(schoolId, false); }
      catch (error) { toast.error(incomingCallErrorMessage(error)); return; }
    }
    setAvailability({ actorType: "", isAvailable: false }); setConnection("idle"); setSchoolId(nextSchoolId); setSelectedSchoolId(nextSchoolId);
    if (!nextSchoolId) sessionStorage.removeItem("incoming_calls_school_id");
  };

  return <div className="page-content"><div className="container-fluid"><Breadcrumbs title="تماس‌های ورودی" breadcrumbItem="آماده دریافت تماس" />
    <Row className="justify-content-center"><Col xl="9"><Card className={`border ${effectiveAvailable ? "border-success" : "border-light"}`}><CardBody className="p-4">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4"><div><h4 className="mb-1">آماده دریافت تماس</h4><p className="text-muted mb-0">برای دریافت تماس باید این صفحه باز و اتصال زنده برقرار باشد.</p></div><div className="d-flex gap-2 flex-wrap">
        {availability.actorType && <Badge color="primary" pill className="fs-6 px-3 py-2">{actorLabels[availability.actorType] || availability.actorType}</Badge>}
        <Badge color={connectionBadge.color} pill className="fs-6 px-3 py-2">اتصال زنده: {connectionBadge.label}</Badge>
        <Badge color={effectiveAvailable ? "success" : "secondary"} pill className="fs-6 px-3 py-2">{effectiveAvailable ? "آماده" : "غیرفعال"}</Badge>
      </div></div>
      <Row className="g-4 align-items-stretch"><Col lg="5"><div className="border rounded p-3 h-100"><SchoolPicker value={schoolId} onChange={selectSchool} disabled={saving} /></div></Col><Col lg="7"><div className={`rounded p-4 h-100 ${effectiveAvailable ? "bg-success bg-opacity-10" : "bg-light"}`}>
        <div className="d-flex align-items-center gap-3"><div className={`rounded-circle d-flex align-items-center justify-content-center ${effectiveAvailable ? "bg-success" : "bg-secondary"}`} style={{ width: 56, height: 56 }}><i className="bx bxs-headphone text-white fs-2" /></div><div><div className="fw-bold fs-5">{effectiveAvailable ? "آماده دریافت تماس هستید" : "دریافت مؤثر تماس غیرفعال است"}</div><div className="text-muted">{availability.isAvailable && !subscribed ? "وضعیت ذخیره‌شده فعال است، اما اتصال زنده برقرار نیست." : "availability و اتصال زنده باید هم‌زمان فعال باشند."}</div></div></div>
        <FormGroup switch className="mt-4 mb-0"><Input aria-label="آماده دریافت تماس" type="switch" role="switch" disabled={!schoolId || loading || saving || !canSubscribe || !subscribed} checked={availability.isAvailable} onChange={(event) => change(event.target.checked)} /><Label check className="fw-bold ms-2">{loading ? "در حال دریافت وضعیت…" : saving ? "در حال ذخیره…" : availability.isAvailable ? "فعال" : "غیرفعال"}</Label>{(loading || saving) && <Spinner size="sm" className="ms-2" />}</FormGroup>
      </div></Col></Row>
      {!schoolId && <Alert color="info" className="mt-4 mb-0">ابتدا مجموعه را انتخاب کنید.</Alert>}
      {schoolId && !subscribed && <Alert color="warning" className="mt-4 mb-0">اتصال زنده برقرار نیست؛ تا برقراری اتصال تماس جدیدی به شما مسیریابی نمی‌شود.</Alert>}
      {!canSubscribe && <Alert color="danger" className="mt-4 mb-0">دسترسی اتصال زنده تماس ورودی برای حساب شما فعال نیست.</Alert>}
    </CardBody></Card></Col></Row>
  </div></div>;
};

export default IncomingSupporterPanel;
