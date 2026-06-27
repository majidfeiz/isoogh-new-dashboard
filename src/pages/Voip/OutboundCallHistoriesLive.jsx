// src/pages/Voip/OutboundCallHistoriesLive.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Input,
  Label,
  Row,
  Spinner,
} from "reactstrap";
import moment from "moment-jalaali";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { io } from "socket.io-client";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import { API_BASE_URL } from "../../helpers/apiRoutes.jsx";
import { getAccessToken } from "../../helpers/authStorage.jsx";

const NAMESPACE = "voip/outbound-call-histories";
const HIGHLIGHT_DURATION_MS = 5000;
const AUTO_REFRESH_MS = 15000;

// Safely extract list + meta from any common server response shape
const extractListPayload = (payload) => {
  if (!payload) return { data: null, meta: null };
  if (Array.isArray(payload)) return { data: payload, meta: null };

  const dataCandidates = [
    payload.data,
    payload.data?.data,
    payload.data?.items,
    payload.response?.data,
    payload.response?.data?.data,
    payload.items,
    payload.result,
  ];
  const data = dataCandidates.find(Array.isArray) ?? null;
  const meta =
    payload.meta ??
    payload.pagination ??
    payload.data?.meta ??
    payload.data?.pagination ??
    payload.response?.data?.meta ??
    null;
  return { data, meta };
};

const OutboundCallHistoriesLive = () => {
  document.title = "تماس خروجی آنلاین | داشبورد آیسوق";

  const [status, setStatus] = useState("connecting");
  const [socketError, setSocketError] = useState("");
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 15,
    disposition: "ALL",
    type: "",
    q: "",
    sort_order: "DESC",
    sort_by: "id",
    start_date: "",
    end_date: "",
  });

  const [startDatePicker, setStartDatePicker] = useState(null);
  const [endDatePicker, setEndDatePicker] = useState(null);

  const socketRef = useRef(null);
  const highlightTimersRef = useRef(new Map());
  const refreshIntervalRef = useRef(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const dispositions = useMemo(
    () => [
      { value: "ALL", label: "همه وضعیت‌ها" },
      { value: "ANSWERED", label: "پاسخ داده شد" },
      { value: "NO ANSWER", label: "بی‌پاسخ" },
      { value: "BUSY", label: "اشغال" },
      { value: "FAILED", label: "ناموفق" },
    ],
    []
  );

  const searchTypes = useMemo(
    () => [
      { value: "", label: "جستجو در..." },
      { value: "StudentName", label: "نام دانش‌آموز" },
      { value: "ssn", label: "کد ملی" },
      { value: "AdviserName", label: "نام مشاور" },
      { value: "AdviserPhone", label: "شماره مشاور" },
      { value: "tags", label: "تگ‌ها" },
    ],
    []
  );

  const formatUnixFa = useCallback((unix) => {
    if (!unix || Number(unix) <= 0) return "-";
    const num = Number(unix);
    if (num >= 2147483647) return "-";
    const d = new Date(num * 1000);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("fa-IR");
  }, []);

  const dispositionBadge = useCallback((val) => {
    if (!val) return <span className="text-muted">-</span>;
    const v = String(val).toUpperCase();
    if (v === "ANSWERED") return <Badge color="success" pill>پاسخ داده شد</Badge>;
    if (v === "NO ANSWER") return <Badge color="secondary" pill>بی‌پاسخ</Badge>;
    if (v === "BUSY") return <Badge color="warning" pill>مشغول</Badge>;
    if (v === "FAILED") return <Badge color="danger" pill>ناموفق</Badge>;
    return <Badge color="light" pill className="text-dark">{val}</Badge>;
  }, []);

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        accessorKey: "id",
        enableSorting: false,
        cell: (info) => <span className="text-muted small">{info.getValue() ?? "-"}</span>,
      },
      {
        id: "adviser",
        header: "مشاور",
        enableSorting: false,
        cell: ({ row }) => {
          const name = row.original?.adviser_name;
          const src = row.original?.src;
          return (
            <div>
              {name ? <div className="fw-medium">{name}</div> : null}
              {src ? <div className="text-muted small">{src}</div> : (!name ? <span className="text-muted">-</span> : null)}
            </div>
          );
        },
      },
      {
        id: "student",
        header: "دانش‌آموز",
        enableSorting: false,
        cell: ({ row }) => {
          const name = row.original?.student_full_name || row.original?.student_name;
          const phone = row.original?.to_phone;
          return (
            <div>
              {name ? <div className="fw-medium">{name}</div> : null}
              {phone ? <div className="text-muted small">{phone}</div> : (!name ? <span className="text-muted">-</span> : null)}
            </div>
          );
        },
      },
      {
        id: "support_form_title",
        header: "فرم پشتیبانی",
        accessorKey: "support_form_title",
        enableSorting: false,
        cell: (info) => info.getValue()
          ? <span className="text-truncate d-block" style={{ maxWidth: 160 }}>{info.getValue()}</span>
          : <span className="text-muted">-</span>,
      },
      {
        id: "disposition",
        header: "وضعیت",
        accessorKey: "disposition",
        enableSorting: false,
        cell: ({ row }) => dispositionBadge(row.original?.disposition),
      },
      {
        id: "playtime_string",
        header: "مدت",
        enableSorting: false,
        cell: ({ row }) => {
          const p = row.original?.playtime_string;
          if (p) return p;
          const dur = row.original?.duration;
          if (dur == null) return "-";
          const seconds = Number(dur);
          return Number.isNaN(seconds) ? dur : `${seconds} ثانیه`;
        },
      },
      {
        id: "starttime_unix",
        header: "زمان شروع",
        enableSorting: false,
        cell: ({ row }) => formatUnixFa(row.original?.starttime_unix),
      },
      {
        id: "endtime_unix",
        header: "زمان پایان",
        enableSorting: false,
        cell: ({ row }) => formatUnixFa(row.original?.endtime_unix),
      },
    ],
    [dispositionBadge, formatUnixFa]
  );

  const buildPayload = useCallback((overrides = {}) => {
    const f = { ...filtersRef.current, ...overrides };
    const q = f.q?.trim() || "";
    const payload = {
      page: Number(f.page) || 1,
      per_page: Number(f.per_page) || 15,
      sort_by: f.sort_by || "id",
      sort_order: f.sort_order || "DESC",
    };
    // type only sent alongside a non-empty q
    if (q) {
      payload.q = q;
      if (f.type) payload.type = f.type;
    }
    // ALL or empty → omit disposition (backend treats absence as ALL)
    if (f.disposition && f.disposition !== "ALL") {
      payload.disposition = f.disposition;
    }
    if (f.start_date) payload.start_date = f.start_date;
    if (f.end_date) payload.end_date = f.end_date;
    return payload;
  }, []);

  const scheduleClearHighlight = useCallback((id) => {
    const key = String(id);
    const timers = highlightTimersRef.current;
    if (timers.has(key)) clearTimeout(timers.get(key));
    const t = setTimeout(() => {
      setRows((prev) =>
        prev.map((row) => String(row.id) === key ? { ...row, __highlight: undefined } : row)
      );
      timers.delete(key);
    }, HIGHLIGHT_DURATION_MS);
    timers.set(key, t);
  }, []);

  const stopAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  const startAutoRefresh = useCallback(() => {
    stopAutoRefresh();
    refreshIntervalRef.current = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("refresh", buildPayload());
      }
    }, AUTO_REFRESH_MS);
  }, [buildPayload, stopAutoRefresh]);

  // Handles outbound-call-histories.list and outbound-call-histories.updated
  const handleListEvent = useCallback((payload) => {
    const { data, meta: newMeta } = extractListPayload(payload);
    if (!Array.isArray(data)) return;

    // Collect new row IDs outside the updater to avoid side-effects inside pure function
    let newRowIds = [];

    setRows((prevRows) => {
      newRowIds = []; // reset on each call (React StrictMode may call twice)
      const prevIds = new Set(prevRows.map((r) => r.id != null ? String(r.id) : null).filter(Boolean));
      return data.map((row) => {
        if (row.id != null && !prevIds.has(String(row.id))) {
          newRowIds.push(row.id);
          return { ...row, __highlight: "added" };
        }
        const existing = prevRows.find((p) => p.id != null && String(p.id) === String(row.id));
        if (existing?.__highlight) return { ...row, __highlight: existing.__highlight };
        return row;
      });
    });

    // Schedule highlight clearing after state commits
    newRowIds.forEach((id) => scheduleClearHighlight(id));

    if (newMeta) setMeta(newMeta);
    setLastUpdate(new Date());
  }, [scheduleClearHighlight]);

  // Handles outbound-call-histories.created — prepend if matches filters
  const handleCreatedEvent = useCallback((payload) => {
    // Record may come as the object directly or wrapped in a response envelope
    const record = payload?.id != null ? payload : (payload?.data ?? payload?.record ?? payload?.item);
    if (!record || record.id == null) return;

    const f = filtersRef.current;
    // Client-side disposition check — skip only when a specific value is active (not ALL/empty)
    const activeDisposition = f.disposition && f.disposition !== "ALL" ? f.disposition : null;
    if (activeDisposition && record.disposition !== activeDisposition) return;

    setRows((prev) => {
      const perPage = Number(f.per_page) || 30;
      const withHighlight = { ...record, __highlight: "added" };
      const next = [withHighlight, ...prev].slice(0, perPage);
      return next;
    });

    setMeta((prev) => prev ? { ...prev, total: (prev.total || 0) + 1 } : prev);
    setLastUpdate(new Date());
    scheduleClearHighlight(record.id);
  }, [scheduleClearHighlight]);

  const namespaceUrl = useMemo(() => {
    const cleaned = NAMESPACE.startsWith("/") ? NAMESPACE : `/${NAMESPACE}`;
    return `${API_BASE_URL}${cleaned}`;
  }, []);

  const disconnectSocket = useCallback(() => {
    stopAutoRefresh();
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
    }
    socketRef.current = null;
    setStatus("idle");
  }, [stopAutoRefresh]);

  const connectSocket = useCallback(() => {
    disconnectSocket();
    setStatus("connecting");
    setSocketError("");

    const token = getAccessToken();
    const sock = io(namespaceUrl, {
      transports: ["websocket"],
      auth: token ? { token } : undefined,
    });

    sock.on("connect", () => {
      setStatus("connected");
      setSocketError("");
      sock.emit("subscribe", buildPayload());
      startAutoRefresh();
    });

    sock.on("connect_error", () => {
      setSocketError("اتصال به سوکت برقرار نشد.");
      setStatus("idle");
      stopAutoRefresh();
    });

    sock.on("disconnect", () => {
      setStatus("idle");
      stopAutoRefresh();
    });

    sock.on("outbound-call-histories.created", (payload) => {
      handleCreatedEvent(payload);
    });

    // Pass raw payload — handleListEvent extracts data/meta flexibly
    sock.on("outbound-call-histories.updated", (payload) => {
      handleListEvent(payload);
    });

    sock.on("outbound-call-histories.list", (payload) => {
      handleListEvent(payload);
    });

    socketRef.current = sock;
  }, [buildPayload, disconnectSocket, handleCreatedEvent, handleListEvent, namespaceUrl, startAutoRefresh, stopAutoRefresh]);

  useEffect(() => {
    connectSocket();
    return () => {
      stopAutoRefresh();
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
      }
      highlightTimersRef.current.forEach((t) => clearTimeout(t));
      highlightTimersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = useCallback((field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleApplyFilters = useCallback((e) => {
    e?.preventDefault?.();
    if (!socketRef.current?.connected) return;
    const start = startDatePicker ? moment(startDatePicker.toDate()).format("YYYY-MM-DD") : "";
    const end = endDatePicker ? moment(endDatePicker.toDate()).format("YYYY-MM-DD") : "";
    setFilters((prev) => ({ ...prev, page: 1, start_date: start, end_date: end }));
    const payload = buildPayload({ page: 1, start_date: start, end_date: end });
    socketRef.current.emit("subscribe", payload);
    socketRef.current.emit("list", payload);
  }, [buildPayload, startDatePicker, endDatePicker]);

  const defaultFilters = {
    page: 1,
    per_page: 15,
    disposition: "ALL",
    type: "",
    q: "",
    sort_order: "DESC",
    sort_by: "id",
    start_date: "",
    end_date: "",
  };

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setStartDatePicker(null);
    setEndDatePicker(null);
    if (!socketRef.current?.connected) return;
    const payload = {
      page: 1,
      per_page: 15,
      sort_by: "id",
      sort_order: "DESC",
    };
    socketRef.current.emit("subscribe", payload);
    socketRef.current.emit("list", payload);
  }, []);

  const handleRefresh = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit("refresh", buildPayload());
  }, [buildPayload]);

  const rowStyle = useCallback(() => undefined, []);

  const rowClassName = useCallback((row) => {
    if (row?.original?.__highlight === "added") return "live-row-added";
    return "";
  }, []);

  const newRowsCount = rows.filter((r) => r.__highlight === "added").length;

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="VoIP" breadcrumbItem="تماس خروجی آنلاین" />

        {/* Status Bar */}
        <Card className="mb-3">
          <CardBody className="py-3">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: 18, height: 18 }}>
                  {status === "connected" ? (
                    <>
                      <span
                        className="rounded-circle bg-success position-absolute"
                        style={{ width: 18, height: 18, animation: "livePulse 1.4s ease-in-out infinite", opacity: 0.3 }}
                      />
                      <span className="rounded-circle bg-success d-block position-relative" style={{ width: 10, height: 10 }} />
                    </>
                  ) : status === "connecting" ? (
                    <Spinner size="sm" color="warning" style={{ width: 14, height: 14 }} />
                  ) : (
                    <span className="rounded-circle bg-secondary d-block" style={{ width: 10, height: 10 }} />
                  )}
                </div>

                <div>
                  <h5 className="mb-0 fw-semibold">تماس خروجی آنلاین</h5>
                  <div className="text-muted small mt-1">
                    {status === "connected" && (
                      <>
                        <span className="text-success fw-medium">آنلاین</span>
                        {lastUpdate && (
                          <span className="ms-2 text-muted">
                            · آخرین آپدیت: {moment(lastUpdate).format("HH:mm:ss")}
                          </span>
                        )}
                        {newRowsCount > 0 && (
                          <span className="ms-2">
                            · <span className="text-success fw-medium">{newRowsCount} تماس جدید</span>
                          </span>
                        )}
                      </>
                    )}
                    {status === "connecting" && <span className="text-warning">در حال اتصال...</span>}
                    {status === "idle" && (
                      <span className="text-danger">
                        اتصال قطع شد{socketError ? ` — ${socketError}` : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                {meta?.total != null && (
                  <span className="text-muted small">
                    {rows.length} از {meta.total.toLocaleString("fa-IR")} ردیف
                  </span>
                )}
                {status === "connected" && (
                  <Button color="light" size="sm" onClick={handleRefresh}>
                    <i className="bx bx-refresh me-1" />
                    رفرش
                  </Button>
                )}
                {status === "connected" ? (
                  <Button color="danger" size="sm" outline onClick={disconnectSocket}>
                    <i className="bx bx-wifi-off me-1" />
                    قطع اتصال
                  </Button>
                ) : (
                  <Button
                    color="success"
                    size="sm"
                    onClick={connectSocket}
                    disabled={status === "connecting"}
                  >
                    {status === "connecting" ? (
                      <><Spinner size="sm" className="me-1" />اتصال...</>
                    ) : (
                      <><i className="bx bx-wifi me-1" />اتصال مجدد</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Filters */}
        <Card className="mb-3">
          <CardBody className="py-2">
            <form onSubmit={handleApplyFilters}>
              <Row className="g-2 align-items-end">
                <Col md={2} sm={6}>
                  <Label className="form-label text-muted small mb-1">وضعیت تماس</Label>
                  <Input
                    type="select"
                    bsSize="sm"
                    value={filters.disposition}
                    onChange={(e) => handleFilterChange("disposition", e.target.value)}
                  >
                    {dispositions.map((opt) => (
                      <option key={opt.value || "any"} value={opt.value}>{opt.label}</option>
                    ))}
                  </Input>
                </Col>
                <Col md={2} sm={6}>
                  <Label className="form-label text-muted small mb-1">جستجو در</Label>
                  <Input
                    type="select"
                    bsSize="sm"
                    value={filters.type}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                  >
                    {searchTypes.map((opt) => (
                      <option key={opt.value || "all"} value={opt.value}>{opt.label}</option>
                    ))}
                  </Input>
                </Col>
                <Col md={2} sm={6}>
                  <Label className="form-label text-muted small mb-1">عبارت جستجو</Label>
                  <Input
                    type="text"
                    bsSize="sm"
                    value={filters.q}
                    onChange={(e) => handleFilterChange("q", e.target.value)}
                    placeholder="نام، شماره..."
                  />
                </Col>
                <Col md={2} sm={6}>
                  <Label className="form-label text-muted small mb-1">از تاریخ</Label>
                  <DatePicker
                    calendar={persian}
                    locale={persian_fa}
                    value={startDatePicker}
                    onChange={(date) => setStartDatePicker(date || null)}
                    format="YYYY/MM/DD"
                    placeholder="از تاریخ"
                    inputClass="form-control form-control-sm"
                    calendarPosition="bottom-right"
                  />
                </Col>
                <Col md={2} sm={6}>
                  <Label className="form-label text-muted small mb-1">تا تاریخ</Label>
                  <DatePicker
                    calendar={persian}
                    locale={persian_fa}
                    value={endDatePicker}
                    onChange={(date) => setEndDatePicker(date || null)}
                    format="YYYY/MM/DD"
                    placeholder="تا تاریخ"
                    inputClass="form-control form-control-sm"
                    calendarPosition="bottom-right"
                  />
                </Col>
                <Col md={1} sm={4}>
                  <Label className="form-label text-muted small mb-1">مرتب‌سازی</Label>
                  <Input
                    type="select"
                    bsSize="sm"
                    value={filters.sort_by}
                    onChange={(e) => handleFilterChange("sort_by", e.target.value)}
                  >
                    <option value="id">ID</option>
                    <option value="starttime_unix">زمان شروع</option>
                    <option value="endtime_unix">زمان پایان</option>
                    <option value="duration">مدت تماس</option>
                    <option value="disposition">وضعیت</option>
                    <option value="to_phone">شماره مقصد</option>
                    <option value="src">شماره مبدا</option>
                    <option value="support_form_title">عنوان فرم</option>
                  </Input>
                </Col>
                <Col md={1} sm={4}>
                  <Label className="form-label text-muted small mb-1">ترتیب</Label>
                  <Input
                    type="select"
                    bsSize="sm"
                    value={filters.sort_order}
                    onChange={(e) => handleFilterChange("sort_order", e.target.value)}
                  >
                    <option value="DESC">نزولی</option>
                    <option value="ASC">صعودی</option>
                  </Input>
                </Col>
                <Col md={1} sm={4}>
                  <Label className="form-label text-muted small mb-1">تعداد</Label>
                  <Input
                    type="select"
                    bsSize="sm"
                    value={filters.per_page}
                    onChange={(e) => handleFilterChange("per_page", e.target.value)}
                  >
                    <option value={15}>۱۵</option>
                    <option value={30}>۳۰</option>
                    <option value={50}>۵۰</option>
                    <option value={100}>۱۰۰</option>
                  </Input>
                </Col>
                <Col md={2} sm={4}>
                  <div className="d-flex gap-1">
                    <Button color="primary" size="sm" type="submit" className="flex-grow-1" disabled={status !== "connected"}>
                      اعمال
                    </Button>
                    <Button color="secondary" size="sm" type="button" outline onClick={handleResetFilters}>
                      <i className="bx bx-reset" />
                    </Button>
                  </div>
                </Col>
              </Row>
            </form>
          </CardBody>
        </Card>

        {/* Table */}
        <Card>
          <CardBody>
            {status === "idle" && rows.length === 0 ? (
              <div className="text-center py-5">
                <i className="bx bx-wifi-off display-4 text-muted mb-3 d-block" />
                <p className="text-muted mb-3">اتصال برقرار نیست.</p>
                <Button color="success" onClick={connectSocket}>
                  <i className="bx bx-wifi me-1" />
                  اتصال به سوکت
                </Button>
              </div>
            ) : (
              <TableContainer
                columns={columns}
                data={rows}
                isGlobalFilter={false}
                isPagination={false}
                isLoading={status === "connecting" && rows.length === 0}
                rowStyle={rowStyle}
                rowClassName={rowClassName}
                tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
              />
            )}

            {status === "connected" && rows.length === 0 && (
              <div className="text-center py-4 text-muted">
                <Spinner size="sm" className="me-2" />
                در انتظار داده از سوکت...
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <style>{`
        @keyframes livePulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(2.4); opacity: 0; }
        }

        @property --live-row-color {
          syntax: '<color>';
          inherits: true;
          initial-value: transparent;
        }
        @keyframes liveRowFade {
          0%   { --live-row-color: rgba(25, 135, 84, 0.30); }
          100% { --live-row-color: transparent; }
        }
        .live-row-added {
          animation: liveRowFade ${HIGHLIGHT_DURATION_MS}ms ease-out forwards;
          --bs-table-accent-bg: var(--live-row-color);
        }
      `}</style>
    </div>
  );
};

export default OutboundCallHistoriesLive;
