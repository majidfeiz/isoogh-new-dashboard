// src/pages/Voip/OutboundCallHistoriesLive.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  Input,
  Label,
  Row,
  Spinner,
} from "reactstrap";
import moment from "moment-jalaali";
import { io } from "socket.io-client";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import { API_BASE_URL } from "../../helpers/apiRoutes.jsx";
import { getAccessToken } from "../../helpers/authStorage.jsx";
import { getOutboundCallHistorySocketDocs } from "../../services/voipService.jsx";

const AUTO_REFRESH_MS = 8000;

const OutboundCallHistoriesLive = () => {
  document.title = "تماس خروجی آنلاین | داشبورد آیسوق";

  const [docsLoading, setDocsLoading] = useState(false);
  const [socketDocs, setSocketDocs] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | connecting | connected
  const [socketError, setSocketError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [rows, setRows] = useState([]);
  const [eventLog, setEventLog] = useState([]);
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 15,
    type: "",
    q: "",
    disposition: "",
    sort_order: "DESC",
    sort_by: "id",
  });

  const socketRef = useRef(null);
  const highlightTimersRef = useRef(new Map());
  const removeTimersRef = useRef(new Map());
  const refreshIntervalRef = useRef(null);

  const searchTypes = useMemo(
    () => [
      { value: "", label: "نوع جستجو..." },
      { value: "StudentName", label: "نام دانش‌آموز" },
      { value: "ssn", label: "کد ملی" },
      { value: "AdviserName", label: "نام مشاور" },
      { value: "AdviserPhone", label: "شماره مشاور" },
      { value: "tags", label: "تگ‌ها" },
    ],
    []
  );

  const dispositions = useMemo(
    () => [
      { value: "", label: "همه وضعیت‌ها" },
      { value: "ANSWERED", label: "پاسخ داده شد" },
      { value: "NO ANSWER", label: "بی‌پاسخ" },
      { value: "BUSY", label: "مشغول" },
      { value: "FAILED", label: "ناموفق" },
    ],
    []
  );

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        accessorKey: "id",
        enableSorting: false,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        id: "src",
        header: "شماره مبدا",
        accessorKey: "src",
        enableSorting: false,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        id: "to_phone",
        header: "شماره مقصد",
        accessorKey: "to_phone",
        enableSorting: false,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        id: "disposition",
        header: "وضعیت تماس",
        accessorKey: "disposition",
        enableSorting: false,
        cell: ({ row }) => dispositionFa(row.original?.disposition),
      },
      {
        id: "playtime_string",
        header: "مدت مکالمه",
        enableSorting: false,
        cell: ({ row }) => {
          const p = row.original?.playtime_string;
          if (p) return p;
          const dur = row.original?.duration;
          if (dur == null) return "-";
          const seconds = Number(dur);
          if (Number.isNaN(seconds)) return dur;
          return `${seconds} ثانیه`;
        },
      },
      {
        id: "starttime_unix",
        header: "شروع",
        enableSorting: false,
        cell: ({ row }) => formatUnixFa(row.original?.starttime_unix),
      },
      {
        id: "endtime_unix",
        header: "پایان",
        enableSorting: false,
        cell: ({ row }) => formatUnixFa(row.original?.endtime_unix),
      },
    ],
    []
  );

  const loadDocs = useCallback(async () => {
    setDocsLoading(true);
    setSocketError("");
    try {
      const res = await getOutboundCallHistorySocketDocs();
      setSocketDocs(res);
      if (res?.events?.[0]?.name) {
        setSelectedEvent(res.events[0].name);
      }
    } catch (e) {
      console.error("خطا در دریافت مستندات سوکت", e);
      setSocketError("دریافت اطلاعات سوکت ناموفق بود.");
    } finally {
      setDocsLoading(false);
    }
  }, []);

  const namespaceUrl = useMemo(() => {
    const ns = socketDocs?.namespace || "voip/outbound-call-histories";
    const cleaned = ns.startsWith("/") ? ns : `/${ns}`;
    return `${API_BASE_URL}${cleaned}`;
  }, [socketDocs]);

  const formatUnixFa = (unix) => {
    if (!unix || Number(unix) <= 0) return "-";
    const num = Number(unix);
    if (num >= 2147483647) return "-";
    const d = new Date(num * 1000);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("fa-IR");
  };

  const dispositionFa = (val) => {
    if (!val) return "-";
    const v = String(val).toUpperCase();
    if (v === "ANSWERED") return "پاسخ داده شد";
    if (v === "NO ANSWER") return "بی‌پاسخ";
    if (v === "BUSY") return "مشغول";
    if (v === "FAILED") return "ناموفق";
    return val;
  };

  const normalizeRows = useCallback((payload) => {
    if (!payload) return { items: [], meta: null };

    const tryArrays = [
      payload,
      payload?.data,
      payload?.data?.data,
      payload?.data?.items,
      payload?.response,
      payload?.response?.data,
      payload?.response?.data?.data,
      payload?.response?.data?.items,
      payload?.items,
      payload?.result,
    ];

    let items = [];
    for (const candidate of tryArrays) {
      if (Array.isArray(candidate)) {
        items = candidate;
        break;
      }
    }

    if (!items.length && payload && typeof payload === "object" && payload.id != null) {
      items = [payload];
    }

    const meta =
      payload?.meta ||
      payload?.pagination ||
      payload?.data?.meta ||
      payload?.data?.pagination ||
      payload?.response?.data?.meta ||
      payload?.response?.data?.pagination ||
      null;

    return { items, meta };
  }, []);

  const pushLog = useCallback((eventName, payload) => {
    setEventLog((prev) => {
      const next = [
        {
          at: new Date().toISOString(),
          event: eventName,
          payload,
        },
        ...prev,
      ];
      return next.slice(0, 30);
    });
  }, []);

  const scheduleClearHighlight = useCallback((id, type) => {
    const key = String(id);
    const timers = highlightTimersRef.current;
    if (timers.has(key)) clearTimeout(timers.get(key));
    const t = setTimeout(() => {
      setRows((prev) =>
        prev.map((row) => (String(row.id) === key && row.__highlight === type ? { ...row, __highlight: undefined } : row))
      );
      timers.delete(key);
    }, 3000);
    timers.set(key, t);
  }, []);

  const scheduleRemoveRow = useCallback((id) => {
    const key = String(id);
    const timers = removeTimersRef.current;
    if (timers.has(key)) clearTimeout(timers.get(key));
    const t = setTimeout(() => {
      setRows((prev) => prev.filter((row) => String(row.id) !== key));
      timers.delete(key);
    }, 3000);
    timers.set(key, t);
  }, []);

  const handleSocketEvent = useCallback(
    (eventName, payload) => {
      pushLog(eventName, payload);
      const { items: incoming, meta } = normalizeRows(payload);
      if (!incoming.length) return;

      setRows((prev) => {
        const prevMap = new Map();
        prev.forEach((row) => {
          if (row && row.id != null) prevMap.set(String(row.id), row);
        });

        const incomingMap = new Map();
        incoming.forEach((row) => {
          if (row && row.id != null) incomingMap.set(String(row.id), row);
        });

        incoming.forEach((row) => {
          const key = row && row.id != null ? String(row.id) : null;
          if (key && removeTimersRef.current.has(key)) {
            clearTimeout(removeTimersRef.current.get(key));
            removeTimersRef.current.delete(key);
          }
        });

        const nextMap = new Map(prevMap);
        incoming.forEach((row) => {
          if (!row || row.id == null) return;
          const key = String(row.id);
          const existed = nextMap.has(key);
          const existing = nextMap.get(key) || {};
          const merged = { ...existing, ...row };
          if (!existed) {
            merged.__highlight = "added";
            scheduleClearHighlight(key, "added");
          } else if (existing.__highlight) {
            merged.__highlight = existing.__highlight;
          }
          nextMap.set(key, merged);
        });

        if (meta) {
          prev.forEach((row) => {
            const key = row && row.id != null ? String(row.id) : null;
            if (key && !incomingMap.has(key)) {
              const removedRow = { ...row, __highlight: "removed" };
              nextMap.set(key, removedRow);
              scheduleRemoveRow(key);
            }
          });
        }

        const nextArr = Array.from(nextMap.values());

        // مرتب‌سازی بر اساس فیلتر فعلی (پیش‌فرض: id DESC)
        const sortBy = filters.sort_by || "id";
        const sortOrder = (filters.sort_order || "DESC").toUpperCase();
        const sorted = [...nextArr].sort((a, b) => {
          const av = a?.[sortBy];
          const bv = b?.[sortBy];
          if (av == null && bv == null) return 0;
          if (av == null) return 1;
          if (bv == null) return -1;
          // تلاش برای تبدیل به عدد، در غیر این صورت مقایسه رشته
          const na = Number(av);
          const nb = Number(bv);
          if (!Number.isNaN(na) && !Number.isNaN(nb)) {
            return sortOrder === "ASC" ? na - nb : nb - na;
          }
          const sa = String(av);
          const sb = String(bv);
          if (sa === sb) return 0;
          return sortOrder === "ASC" ? (sa > sb ? 1 : -1) : sa < sb ? 1 : -1;
        });

        return sorted;
      });
    },
    [normalizeRows, pushLog, scheduleClearHighlight, scheduleRemoveRow, filters.sort_by, filters.sort_order]
  );

  const buildPayload = useCallback(() => {
    const cleanedQ = filters.q?.trim?.() || "";
    return {
      page: Number(filters.page) || 1,
      per_page: Number(filters.per_page) || 15,
      type: filters.type || undefined,
      q: cleanedQ || undefined,
      disposition: filters.disposition || undefined,
      sort_by: filters.sort_by || undefined,
      sort_order: filters.sort_order || undefined,
    };
  }, [filters]);

  const emitRequest = useCallback(() => {
    if (!socketRef.current || !selectedEvent) return;
    const payload = buildPayload();
    socketRef.current.emit(selectedEvent, payload);
  }, [buildPayload, selectedEvent]);

  const stopAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  const startAutoRefresh = useCallback(() => {
    stopAutoRefresh();
    refreshIntervalRef.current = setInterval(() => {
      emitRequest();
    }, AUTO_REFRESH_MS);
  }, [emitRequest, stopAutoRefresh]);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
    }
    socketRef.current = null;
    setStatus("idle");
    stopAutoRefresh();
  }, [stopAutoRefresh]);

  const connectSocket = useCallback(() => {
    if (!selectedEvent) {
      setSocketError("هیچ رویدادی برای دریافت داده مشخص نشده است.");
      return;
    }
    disconnectSocket();
    setStatus("connecting");
    setSocketError("");

    const token = getAccessToken();
    const nextSocket = io(namespaceUrl, {
      transports: ["websocket"],
      auth: token ? { token, Authorization: `Bearer ${token}` } : undefined,
      query: token ? { token } : undefined,
    });

    nextSocket.on("connect", () => {
      setStatus("connected");
      setSocketError("");
      emitRequest();
      startAutoRefresh();
    });

    nextSocket.on("connect_error", (err) => {
      console.error("Socket connect_error", err);
      setSocketError("اتصال به سوکت برقرار نشد.");
      setStatus("idle");
      stopAutoRefresh();
    });

    nextSocket.on("disconnect", () => {
      setStatus("idle");
      stopAutoRefresh();
    });

    nextSocket.onAny((eventName, ...args) => {
      const payload = args.length === 1 ? args[0] : args;
      handleSocketEvent(eventName, payload);
    });

    socketRef.current = nextSocket;
  }, [disconnectSocket, emitRequest, handleSocketEvent, namespaceUrl, selectedEvent, startAutoRefresh, stopAutoRefresh]);

  useEffect(() => {
    loadDocs();
    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
      }
      stopAutoRefresh();
      // پاکسازی تایمرهای هایلایت
      highlightTimersRef.current.forEach((t) => clearTimeout(t));
      removeTimersRef.current.forEach((t) => clearTimeout(t));
      highlightTimersRef.current.clear();
      removeTimersRef.current.clear();
    };
  }, [loadDocs, stopAutoRefresh]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const statusBadge = useMemo(() => {
    if (status === "connected") return <Badge color="success">متصل</Badge>;
    if (status === "connecting") return <Badge color="warning">در حال اتصال...</Badge>;
    return <Badge color="secondary">قطع</Badge>;
  }, [status]);

  const rowStyle = useCallback((row) => {
    const marker = row?.original?.__highlight;
    if (marker === "added") return { backgroundColor: "rgba(25, 135, 84, 0.16)", transition: "background-color 0.4s ease" };
    if (marker === "removed") return { backgroundColor: "rgba(220, 53, 69, 0.16)", transition: "background-color 0.4s ease" };
    return undefined;
  }, []);

  const rowClassName = useCallback((row) => {
    const marker = row?.original?.__highlight;
    if (marker === "added") return "table-success";
    if (marker === "removed") return "table-danger";
    return "";
  }, []);

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="Voip" breadcrumbItem="تماس خروجی آنلاین" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h4 className="card-title mb-1">تماس خروجی آنلاین</h4>
                  <p className="text-muted mb-0">
                    اتصال به سوکت برای دریافت لحظه‌ای تماس‌های خروجی و مشاهده آنها در جدول.
                  </p>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {statusBadge}
                  <Button
                    color="primary"
                    onClick={connectSocket}
                    disabled={status === "connecting" || docsLoading}
                  >
                    {status === "connecting" ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        اتصال...
                      </>
                    ) : (
                      "اتصال به سوکت"
                    )}
                  </Button>
                  <Button color="danger" outline onClick={disconnectSocket} disabled={!socketRef.current}>
                    قطع اتصال
                  </Button>
                  <Button color="info" outline onClick={() => { emitRequest(); startAutoRefresh(); }} disabled={!socketRef.current}>
                    درخواست مجدد
                  </Button>
                  <Button color="info" outline onClick={loadDocs} disabled={docsLoading}>
                    {docsLoading ? "در حال بروزرسانی..." : "بروزرسانی مستندات"}
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                {/* <div className="text-muted small mb-3">
                  ردیف‌های جدید با سبز و ردیف‌های حذف‌شده با قرمز (۳ ثانیه) نمایش داده می‌شوند. لیست هر {AUTO_REFRESH_MS / 1000} ثانیه روی سوکت رفرش می‌شود.
                </div> */}
                <Row className="g-3 mb-4">
                  <Col lg={4} md={6}>
                    {/* <Label className="form-label text-muted mb-1">namespace</Label>
                    <div className="fw-semibold">{socketDocs?.namespace || "voip/outbound-call-histories"}</div> */}
                    {/* <div className="text-muted small">
                      هدر احراز هویت: {socketDocs?.auth_header || "Authorization: Bearer <jwt>"}
                    </div>
                    <div className="text-muted small">
                      مجوز مورد نیاز: {socketDocs?.required_permission || "voip.outbound.index"}
                    </div> */}
                  </Col>
                  <Col lg={4} md={6}>
                    <Label className="form-label text-muted mb-1">رویداد</Label>
                    <Input
                      type="select"
                      value={selectedEvent}
                      onChange={(e) => setSelectedEvent(e.target.value)}
                    >
                      {(socketDocs?.events || []).map((ev) => (
                        <option key={ev.name} value={ev.name}>
                          {ev.name}
                        </option>
                      ))}
                      {!socketDocs?.events?.length && <option value="">رویدادی ثبت نشده</option>}
                    </Input>
                    <div className="text-muted small mt-1">
                      با تغییر رویداد، پس از اتصال درخواست جدید ارسال می‌شود.
                    </div>
                  </Col>
                  <Col lg={4} md={12}>
                    <Label className="form-label text-muted mb-1">وضعیت</Label>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      {statusBadge}
                      {socketError && <span className="text-danger small">{socketError}</span>}
                    </div>
                  </Col>
                </Row>

                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    emitRequest();
                    startAutoRefresh();
                  }}
                  className="p-3 bg-light rounded-3 mb-4"
                >
                  <Row className="g-3 align-items-end">
                    <Col md="2" sm="6">
                      <Label className="form-label text-muted mb-1">صفحه</Label>
                      <Input
                        type="number"
                        min="1"
                        value={filters.page}
                        onChange={(e) => handleFilterChange("page", e.target.value)}
                      />
                    </Col>
                    <Col md="2" sm="6">
                      <Label className="form-label text-muted mb-1">تعداد در صفحه</Label>
                      <Input
                        type="number"
                        min="1"
                        value={filters.per_page}
                        onChange={(e) => handleFilterChange("per_page", e.target.value)}
                      />
                    </Col>
                    <Col md="3" sm="6">
                      <Label className="form-label text-muted mb-1">فیلد جستجو</Label>
                      <Input
                        type="select"
                        value={filters.type}
                        onChange={(e) => handleFilterChange("type", e.target.value)}
                      >
                        {searchTypes.map((opt) => (
                          <option key={opt.value || "empty"} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Input>
                    </Col>
                    <Col md="3" sm="6">
                      <Label className="form-label text-muted mb-1">عبارت</Label>
                      <Input
                        type="text"
                        value={filters.q}
                        onChange={(e) => handleFilterChange("q", e.target.value)}
                        placeholder="مثلاً نام مشاور یا دانش‌آموز..."
                      />
                    </Col>
                    <Col md="2" sm="6">
                      <Label className="form-label text-muted mb-1">وضعیت تماس</Label>
                      <Input
                        type="select"
                        value={filters.disposition}
                        onChange={(e) => handleFilterChange("disposition", e.target.value)}
                      >
                        {dispositions.map((opt) => (
                          <option key={opt.value || "any"} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Input>
                    </Col>
                    <Col md="2" sm="6">
                      <Label className="form-label text-muted mb-1">سورت</Label>
                      <Input
                        type="select"
                        value={filters.sort_by}
                        onChange={(e) => handleFilterChange("sort_by", e.target.value)}
                      >
                        <option value="starttime_unix">زمان شروع</option>
                        <option value="endtime_unix">زمان پایان</option>
                        <option value="duration">مدت تماس</option>
                        <option value="id">ID</option>
                      </Input>
                    </Col>
                    <Col md="2" sm="6">
                      <Label className="form-label text-muted mb-1">ترتیب</Label>
                      <Input
                        type="select"
                        value={filters.sort_order}
                        onChange={(e) => handleFilterChange("sort_order", e.target.value)}
                      >
                        <option value="DESC">نزولی</option>
                        <option value="ASC">صعودی</option>
                      </Input>
                    </Col>
                    <Col md="2" sm="6">
                      <Button color="success" type="submit" className="w-100">
                        ارسال به سوکت
                      </Button>
                    </Col>
                  </Row>
                  <div className="text-muted small mt-2">
                    با تغییر فیلترها و زدن دکمه، درخواست جدید روی سوکت ارسال می‌شود.
                  </div>
                </Form>

                <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                  <h5 className="mb-0">جدول لحظه‌ای</h5>
                  <div className="text-muted small">
                    آخرین آپدیت:{" "}
                    {eventLog?.[0]?.at
                      ? moment(eventLog[0].at).format("jYYYY/jMM/jDD HH:mm:ss")
                      : "داده‌ای دریافت نشده"}
                  </div>
                </div>

                <TableContainer
                  columns={columns}
                  data={rows || []}
                  isGlobalFilter={false}
                  isPagination={false}
                  isLoading={status === "connecting"}
                  rowStyle={rowStyle}
                  rowClassName={rowClassName}
                  tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
                />

                <div className="mt-4">
                  <h6 className="mb-2">لاگ آخرین پیام‌ها (حداکثر ۳۰ آیتم)</h6>
                  <div className="bg-light rounded-3 p-3" style={{ maxHeight: 260, overflowY: "auto" }}>
                    {eventLog.length === 0 && <div className="text-muted">پیامی دریافت نشده است.</div>}
                    {eventLog.map((item, idx) => (
                      <div key={`log-${idx}`} className="mb-3 pb-3 border-bottom">
                        <div className="text-muted small mb-1">
                          {moment(item.at).format("jYYYY/jMM/jDD HH:mm:ss")} {item.event ? `| ${item.event}` : ""}
                        </div>
                        <pre className="mb-0" style={{ whiteSpace: "pre-wrap", direction: "ltr" }}>
                          {JSON.stringify(item.payload, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default OutboundCallHistoriesLive;
