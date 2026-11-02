import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getActiveAdviserCall } from "../services/adviserPortalService.jsx";
import { getCallTrace } from "../services/voipService.jsx";

export const activeCallQueryKey = (schoolId) => ["adviser-portal", "active-call", Number(schoolId)];

const ActiveCallContext = createContext(null);
const profilePath = (call) => `/adviser-calls/forms/${call.supportFormId}/students/${call.studentId}`;
const schoolFromPath = (pathname) => pathname.match(/^\/adviser-calls\/schools\/(\d+)/)?.[1] || null;
const isAdviserPath = (pathname) => pathname.startsWith("/adviser-calls") || pathname.startsWith("/adviser-portal/");

export function ActiveCallProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [schoolId, setSchoolIdState] = useState(() => schoolFromPath(location.pathname));
  const [activeCall, setActiveCall] = useState(null);
  const [recentCall, setRecentCall] = useState(null);
  const [recovering, setRecovering] = useState(false);
  const [blockedOpen, setBlockedOpen] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const requestRef = useRef(null);
  const timerRef = useRef(null);
  const lastTraceRef = useRef(null);
  const recentCallTimerRef = useRef(null);
  const activeCallRef = useRef(null);
  useEffect(() => { activeCallRef.current = activeCall; }, [activeCall]);

  const setSchoolId = useCallback((value) => {
    const normalized = Number(value);
    if (Number.isInteger(normalized) && normalized > 0) setSchoolIdState(String(normalized));
  }, []);

  useEffect(() => {
    const routed = schoolFromPath(location.pathname);
    if (routed) setSchoolId(routed);
  }, [location.pathname, setSchoolId]);

  const refetch = useCallback(async () => {
    if (!schoolId || !isAdviserPath(location.pathname)) return null;
    if (activeCallRef.current && document.visibilityState !== "visible") return activeCallRef.current;
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    try {
      const next = await getActiveAdviserCall(schoolId, controller.signal);
      if (controller.signal.aborted) return null;
      setRecovering(false);
      const previous = activeCallRef.current;
      if (!next && previous) {
        const dispatched = { ...previous, queueStatus: "dispatched", navigationLocked: false, progress: 100 };
        setRecentCall(dispatched);
        clearTimeout(recentCallTimerRef.current);
        recentCallTimerRef.current = setTimeout(() => setRecentCall(null), 15000);
        if (previous.traceId && lastTraceRef.current !== previous.traceId) {
          lastTraceRef.current = previous.traceId;
          getCallTrace(previous.traceId, {}).then((trace) => {
            const failed = trace?.status === "failed";
            setRecentCall((current) => current?.traceId === previous.traceId ? { ...current, queueStatus: failed ? "failed" : "dispatched", traceStatus: trace?.status } : current);
            toast[failed ? "error" : "info"](failed ? "ارسال درخواست تماس ناموفق بود" : "درخواست تماس ارسال شد؛ منتظر زنگ تلفن باشید");
          }).catch(() => {});
        }
      }
      setActiveCall(next);
      setCountdown(next?.estimatedWaitSeconds == null ? null : Math.max(0, Number(next.estimatedWaitSeconds) || 0));
      return next;
    } catch (error) {
      if (error?.code !== "ERR_CANCELED") setRecovering(true);
      return null;
    }
  }, [location.pathname, schoolId]);

  useEffect(() => () => clearTimeout(recentCallTimerRef.current), []);

  useEffect(() => { refetch(); return () => requestRef.current?.abort(); }, [refetch]);
  useEffect(() => {
    clearTimeout(timerRef.current);
    if (!activeCall || document.visibilityState !== "visible") return undefined;
    timerRef.current = setTimeout(refetch, recovering ? 5000 : 2000);
    return () => clearTimeout(timerRef.current);
  }, [activeCall, recovering, refetch]);
  useEffect(() => {
    const visible = () => { if (document.visibilityState === "visible") refetch(); };
    const online = () => refetch();
    document.addEventListener("visibilitychange", visible);
    window.addEventListener("online", online);
    return () => { document.removeEventListener("visibilitychange", visible); window.removeEventListener("online", online); };
  }, [refetch]);
  useEffect(() => {
    if (countdown == null || countdown <= 0 || document.visibilityState !== "visible") return undefined;
    const id = setTimeout(() => setCountdown((value) => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(id);
  }, [countdown]);
  useEffect(() => {
    if (!activeCall?.navigationLocked) return undefined;
    const beforeUnload = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [activeCall]);
  useEffect(() => {
    if (!activeCall?.navigationLocked) return undefined;
    const stopNavigation = (event) => {
      const anchor = event.target.closest?.("a[href]");
      if (!anchor || anchor.target === "_blank") return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === profilePath(activeCall)) return;
      event.preventDefault();
      event.stopPropagation();
      setBlockedOpen(true);
    };
    document.addEventListener("click", stopNavigation, true);
    return () => document.removeEventListener("click", stopNavigation, true);
  }, [activeCall]);
  useEffect(() => {
    if (!activeCall?.navigationLocked) return;
    const target = profilePath(activeCall);
    if (location.pathname !== target) {
      navigate(target, { replace: true, state: { schoolId: activeCall.schoolId } });
    }
  }, [activeCall, location.pathname, navigate]);

  const hydrate = useCallback((call, context = {}) => {
    const normalized = { ...call, schoolId: call?.schoolId ?? context.schoolId, supportFormId: call?.supportFormId ?? context.supportFormId, studentId: call?.studentId ?? context.studentId, queueStatus: call?.queueStatus ?? "pending", navigationLocked: call?.navigationLocked !== false };
    setSchoolId(normalized.schoolId);
    setRecentCall(null);
    setActiveCall(normalized);
    setCountdown(normalized.estimatedWaitSeconds == null ? null : Math.max(0, Number(normalized.estimatedWaitSeconds) || 0));
    window.setTimeout(refetch, 0);
  }, [refetch, setSchoolId]);

  const value = useMemo(() => ({ activeCall, recentCall, recovering, countdown, schoolId, setSchoolId, refetch, hydrate, blockedOpen, setBlockedOpen, returnToCall: () => navigate(activeCall ? profilePath(activeCall) : "/adviser-calls", { state: { schoolId: activeCall?.schoolId } }) }), [activeCall, recentCall, blockedOpen, countdown, hydrate, navigate, recovering, refetch, schoolId, setSchoolId]);
  return <ActiveCallContext.Provider value={value}>{children}</ActiveCallContext.Provider>;
}

ActiveCallProvider.propTypes = { children: PropTypes.node };
export const useActiveCall = () => useContext(ActiveCallContext);
