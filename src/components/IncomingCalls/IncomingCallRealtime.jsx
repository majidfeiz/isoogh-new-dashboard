import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Alert, Badge, Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner, Table } from "reactstrap";
import { API_BASE_URL } from "../../helpers/apiRoutes.jsx";
import { getAccessToken } from "../../helpers/authStorage.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getIncomingCallerProfile, incomingCallErrorMessage } from "../../services/incomingCallService.jsx";
import { formatDateTime, formatDuration } from "../../pages/IncomingCalls/IncomingCallsCommon.jsx";
import { incomingCallKey, isSameIncomingCall, mergeIncomingCall, normalizeRealtimeIncomingCall } from "./incomingCallRealtimeUtils.js";

const statusLabels = { routing: "در حال مسیریابی", answered: "پاسخ داده شد", missed: "از دست رفته", ended: "پایان یافته", voice: "پیام صوتی" };
const statusColors = { routing: "info", answered: "success", missed: "danger", ended: "secondary", voice: "warning" };
const value = (input) => input == null || input === "" ? null : input;
const fullName = (record) => value(record?.name) || [record?.firstName ?? record?.first_name, record?.lastName ?? record?.last_name].filter(Boolean).join(" ") || null;

const Field = ({ label, children }) => value(children) ? <Col sm="6" className="mb-3"><small className="text-muted d-block">{label}</small><span>{children}</span></Col> : null;

const IncomingCallRealtime = () => {
  const { user, hasPermission, selectedSchoolId } = useAuth();
  const schoolId = selectedSchoolId ? Number(selectedSchoolId) : null;
  const canSubscribe = hasPermission("incoming-calls.realtime.subscribe");
  const canShowProfile = hasPermission("incoming-calls.caller-profile.show");
  const socketRef = useRef(null);
  const seenRef = useRef(new Set());
  const [call, setCall] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [connection, setConnection] = useState("idle");

  const schoolName = useMemo(() => {
    if (String(user?.school?.id) === String(schoolId)) return user.school.name || user.school.title;
    return user?.schools?.find((school) => String(school.id) === String(schoolId))?.name || user?.schoolName || user?.school_name || `مجموعه ${schoolId}`;
  }, [schoolId, user]);

  const close = useCallback(() => { setCall(null); setProfile(null); setProfileError(""); }, []);
  const loadProfile = useCallback(async (activeCall) => {
    if (!activeCall?.caller?.matched || !canShowProfile) return;
    setProfileLoading(true); setProfileError("");
    try { setProfile(await getIncomingCallerProfile(activeCall.callId, activeCall.schoolId ?? schoolId)); }
    catch (error) {
      const status = error?.response?.status;
      if (status === 403) { close(); return; }
      setProfileError(status === 404 ? "تماس یا دانش‌آموز در این مجموعه یافت نشد." : incomingCallErrorMessage(error));
    } finally { setProfileLoading(false); }
  }, [canShowProfile, close, schoolId]);

  useEffect(() => {
    if (!canSubscribe || !schoolId || !getAccessToken()) return undefined;
    const socket = io(`${API_BASE_URL}/incoming-calls`, {
      auth: { token: getAccessToken() }, transports: ["websocket"], reconnection: true,
      reconnectionDelay: 1000, reconnectionDelayMax: 10000, randomizationFactor: 0.5,
    });
    socketRef.current = socket;
    const subscribe = () => { setConnection("connected"); socket.emit("incoming-calls.subscribe", { schoolId }); };
    const started = (payload) => {
      const next = normalizeRealtimeIncomingCall(payload);
      const key = incomingCallKey(next);
      if (!key || (next.schoolId != null && String(next.schoolId) !== String(schoolId))) return;
      if (seenRef.current.has(key)) { setCall((current) => isSameIncomingCall(current, next) ? { ...current, ...next } : current); return; }
      seenRef.current.add(key); setCall(next); setProfile(null); setProfileError("");
    };
    const updated = (payload) => setCall((current) => mergeIncomingCall(current, payload));
    socket.on("connect", subscribe);
    socket.on("incoming-calls.subscribed", () => setConnection("subscribed"));
    socket.on("incoming-call.started", started);
    socket.on("incoming-call.updated", updated);
    socket.on("disconnect", () => setConnection("disconnected"));
    socket.on("connect_error", () => setConnection("reconnecting"));
    return () => { socket.removeAllListeners(); socket.disconnect(); socketRef.current = null; seenRef.current.clear(); close(); setConnection("idle"); };
  }, [canSubscribe, close, schoolId, user]);

  useEffect(() => { if (call?.caller?.matched && canShowProfile) loadProfile(call); }, [call?.callId, canShowProfile]);

  const student = profile?.student;
  const contactValues = [student?.user?.phone, student?.phone, student?.mobile, ...(Array.isArray(student?.contacts) ? student.contacts.map((contact) => contact?.value ?? contact?.phone ?? contact?.mobile) : [])].filter(Boolean);
  const history = profile?.recentCalls ?? profile?.incomingCalls ?? profile?.calls ?? [];

  return <Modal isOpen={!!call} toggle={close} size="xl" scrollable centered contentClassName="incoming-call-modal shadow-lg">
    <ModalHeader toggle={close}><span className="d-inline-flex align-items-center gap-2"><span className="rounded-circle bg-success d-inline-block" style={{ width: 12, height: 12 }} /> تماس ورودی <Badge color={statusColors[call?.status] || "secondary"}>{statusLabels[call?.status] || call?.status}</Badge></span></ModalHeader>
    <ModalBody>
      {connection !== "subscribed" && <Alert color="warning" className="py-2">اتصال زنده در حال بازیابی است…</Alert>}
      <div className="rounded border bg-light p-3 mb-4"><Row className="align-items-center"><Col md="3" className="text-center mb-3 mb-md-0"><i className="bx bxs-phone-call text-success" style={{ fontSize: 52 }} /><div className="fw-bold fs-5" dir="ltr">{call?.caller?.phone || "شماره نامشخص"}</div></Col><Col md="9"><Row><Field label="نام تماس‌گیرنده">{call?.caller?.matched ? call.caller.name || "دانش‌آموز شناسایی‌شده" : "تماس‌گیرنده ناشناس"}</Field><Field label="مجموعه">{schoolName}</Field><Field label="زمان شروع">{formatDateTime(call?.startedAt)}</Field><Field label="نوع مقصد">{call?.destinationType === "supporter" ? "پشتیبان" : call?.destinationType === "consultant" ? "مشاور" : call?.destinationType}</Field></Row></Col></Row></div>
      {call?.caller?.matched === false && <Alert color="warning" className="d-flex align-items-center gap-2"><i className="bx bx-user-x fs-3" /><div><strong>کاربر با این شماره پیدا نشد.</strong><div>شماره تماس‌گیرنده: <span dir="ltr">{call?.caller?.phone || "—"}</span></div></div></Alert>}
      {call?.caller?.matched && !canShowProfile && <Alert color="info">شما دسترسی مشاهده پرونده تماس‌گیرنده را ندارید.</Alert>}
      {profileLoading && <div className="text-center py-5"><Spinner color="primary" /><div className="mt-2">در حال دریافت پرونده…</div></div>}
      {profileError && <Alert color="danger">{profileError} <Button color="link" className="p-0 ms-2" onClick={() => loadProfile(call)}>تلاش مجدد</Button></Alert>}
      {profile && !profileLoading && <>
        <h5 className="mt-2">مشخصات</h5><Row><Field label="نام و نام خانوادگی">{fullName(student) || call?.caller?.name}</Field><Field label="نام کاربری">{student?.user?.username ?? call?.caller?.username}</Field><Field label="کد دانش‌آموز">{student?.id ?? call?.caller?.studentId}</Field><Field label="پایه">{student?.grade?.name ?? student?.gradeName ?? student?.grade_name}</Field></Row>
        {!!contactValues.length && <><h5 className="mt-3">شماره‌ها و راه‌های تماس</h5><div className="d-flex flex-wrap gap-2">{[...new Set(contactValues)].map((contact) => <Badge key={contact} color="light" className="text-dark fs-6" dir="ltr">{contact}</Badge>)}</div></>}
        {!!history.length && <><h5 className="mt-4">سوابق تماس</h5><div className="table-responsive"><Table size="sm" hover><thead><tr><th>وضعیت</th><th>شماره</th><th>شروع</th><th>مدت</th></tr></thead><tbody>{history.slice(0, 50).map((item, index) => <tr key={item.id ?? item.callId ?? index}><td>{statusLabels[item.status] || item.status || "—"}</td><td dir="ltr">{item.src ?? item.callerNumber ?? item.caller?.phone ?? "—"}</td><td>{formatDateTime(item.startedAt ?? item.started_at ?? item.created_at)}</td><td>{formatDuration(item.durationSeconds ?? item.duration_seconds)}</td></tr>)}</tbody></Table></div></>}
      </>}
    </ModalBody><ModalFooter><Button color="secondary" onClick={close}>بستن</Button></ModalFooter>
  </Modal>;
};

export default IncomingCallRealtime;
