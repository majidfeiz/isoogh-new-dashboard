// src/pages/Voip/OutboundCallHistories.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Input,
  Button,
  Form,
  Label,
  Progress,
  Modal,
  ModalHeader,
  ModalBody,
  Badge,
} from "reactstrap";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import moment from "moment-jalaali";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";

import { getOutboundCallHistories } from "../../services/voipService.jsx";
import { API_ROUTES, getApiUrl } from "../../helpers/apiRoutes.jsx";
import { getAccessToken } from "../../helpers/authStorage.jsx";

const INITIAL_EXPORT_STATE = {
  status: "idle",
  receivedBytes: 0,
  totalBytes: null,
  percent: null,
  errorMessage: null,
};

const OutboundCallHistories = () => {
  document.title = "تماس‌های خروجی | داشبورد آیسوق";

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0, lastPage: 1 });

  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [sort, setSort] = useState({ by: null, order: null });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchError, setSearchError] = useState("");

  const [exportState, setExportState] = useState(INITIAL_EXPORT_STATE);
  const exportAbortRef = useRef(null);

  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [selectedCallFiles, setSelectedCallFiles] = useState([]);
  const [selectedCallId, setSelectedCallId] = useState(null);

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

  const fetchData = useCallback(
    async ({
      page = 1,
      currentType = "",
      currentQ = "",
      currentSortBy = "",
      currentSortOrder = "",
      currentStart = "",
      currentEnd = "",
    } = {}) => {
      setLoading(true);
      try {
        const cleanedQ = currentQ?.trim?.() || "";
        const res = await getOutboundCallHistories({
          page,
          per_page: meta.limit,
          type: currentType,
          q: cleanedQ,
          sortBy: currentSortBy,
          sortOrder: currentSortOrder,
          start_date: currentStart,
          end_date: currentEnd,
        });

        setData(res.items || []);
        setMeta((prev) => ({
          page: res.pagination?.page ?? page,
          limit: res.pagination?.limit ?? prev.limit,
          total: res.pagination?.total ?? 0,
          lastPage: res.pagination?.lastPage ?? 1,
        }));
      } catch (e) {
        console.error("خطا در دریافت تماس‌های خروجی", e);
        setData([]);
        setMeta((prev) => ({ ...prev, total: 0, lastPage: 1 }));
      } finally {
        setLoading(false);
      }
    },
    [meta.limit]
  );

  useEffect(() => {
    fetchData({ page: 1, currentType: "", currentQ: "" });
  }, [fetchData]);

  const handleSearch = useCallback(() => {
    setSearchError("");
    if (startDate && endDate && startDate > endDate) {
      setSearchError("تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.");
      return;
    }

    const start = startDate ? moment(startDate.toDate()).format("YYYY-MM-DD") : "";
    const end = endDate ? moment(endDate.toDate()).format("YYYY-MM-DD") : "";

    fetchData({
      page: 1,
      currentType: type,
      currentQ: q,
      currentSortBy: sort.by,
      currentSortOrder: sort.order,
      currentStart: start,
      currentEnd: end,
    });
  }, [fetchData, sort.by, sort.order, type, q, startDate, endDate]);

  const handlePageChange = useCallback(
    (page) => {
      const start = startDate ? moment(startDate.toDate()).format("YYYY-MM-DD") : "";
      const end = endDate ? moment(endDate.toDate()).format("YYYY-MM-DD") : "";

      fetchData({
        page,
        currentType: type,
        currentQ: q,
        currentSortBy: sort.by,
        currentSortOrder: sort.order,
        currentStart: start,
        currentEnd: end,
      });
    },
    [fetchData, sort.by, sort.order, type, q, startDate, endDate]
  );

  const onKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleResetFilters = useCallback(
    (e) => {
      if (e) e.preventDefault();
      setType("");
      setQ("");
      setStartDate(null);
      setEndDate(null);
      setSearchError("");
      fetchData({
        page: 1,
        currentType: "",
        currentQ: "",
        currentSortBy: sort.by,
        currentSortOrder: sort.order,
        currentStart: "",
        currentEnd: "",
      });
    },
    [fetchData, sort.by, sort.order]
  );

  const parseTotalBytes = (headers) => {
    const raw =
      headers.get("X-Approx-Content-Length") ||
      headers.get("x-approx-content-length") ||
      headers.get("Content-Length") ||
      headers.get("content-length");

    if (!raw) return null;
    const n = Number(String(raw).replace(/[^\d]/g, ""));
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const formatBytes = (bytes) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const parseFilename = (contentDisposition) => {
    if (!contentDisposition) return "outbound-call-histories.csv";

    const utf8 = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8?.[1]) {
      try {
        return decodeURIComponent(utf8[1].trim().replace(/^"|"$/g, ""));
      } catch {
        return utf8[1].trim().replace(/^"|"$/g, "");
      }
    }

    const normal = contentDisposition.match(/filename="?([^";]+)"?/i);
    if (normal?.[1]) return normal[1].trim();

    return "outbound-call-histories.csv";
  };

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename || "outbound-call-histories.csv");
    document.body.appendChild(link);
    link.click();
    if (link.parentNode) link.parentNode.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(url), 1200);
  };

  const handleExport = useCallback(async () => {
    if (exportAbortRef.current) return;

    if (startDate && endDate && startDate > endDate) {
      setSearchError("تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.");
      return;
    }

    const start = startDate ? moment(startDate.toDate()).format("YYYY-MM-DD") : "";
    const end = endDate ? moment(endDate.toDate()).format("YYYY-MM-DD") : "";
    const cleanedQ = q?.trim?.() || "";
    const perPage = meta?.total && meta.total > 0 ? meta.total : meta.limit;

    setSearchError("");
    setExportState({ status: "preparing", receivedBytes: 0, totalBytes: null, percent: null, errorMessage: null });

    try {
      const params = new URLSearchParams();
      params.append("page", "1");
      params.append("per_page", String(perPage));
      if (sort?.by) params.append("sort_by", sort.by);
      if (sort?.order) params.append("sort_order", sort.order);
      if (type) params.append("type", type);
      if (cleanedQ) params.append("q", cleanedQ);
      if (start) params.append("start_date", start);
      if (end) params.append("end_date", end);

      const url = `${getApiUrl(API_ROUTES.voip.exportOutboundCallHistories)}?${params.toString()}`;
      const token = getAccessToken();
      const controller = new AbortController();
      exportAbortRef.current = controller;

      const res = await fetch(url, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const text = await res.text();
        throw new Error(text || "خطا در خروجی گرفتن");
      }

      const totalBytes = parseTotalBytes(res.headers);
      setExportState((prev) => ({ ...prev, status: "downloading", totalBytes, percent: totalBytes ? 0 : null }));

      const reader = res.body.getReader();
      const chunks = [];
      let receivedBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunkSize = value?.byteLength ?? value?.length ?? 0;
        if (chunkSize > 0) {
          chunks.push(value);
          receivedBytes += chunkSize;
          const percent = totalBytes ? Math.min(99, Math.floor((receivedBytes / totalBytes) * 100)) : null;
          setExportState((prev) => ({ ...prev, status: "downloading", receivedBytes, totalBytes, percent, errorMessage: null }));
        }
      }

      const csvBlob = new Blob(chunks, { type: "text/csv;charset=utf-8" });
      const filename = parseFilename(res.headers.get("Content-Disposition"));
      downloadBlob(csvBlob, filename || "outbound-call-histories.csv");

      setExportState((prev) => ({ ...prev, status: "success", receivedBytes, totalBytes, percent: 100, errorMessage: null }));
    } catch (e) {
      if (e?.name === "AbortError") {
        setExportState(INITIAL_EXPORT_STATE);
        return;
      }
      console.error("خطا در خروجی CSV تماس خروجی", e);
      setExportState((prev) => ({ ...prev, status: "error", errorMessage: e?.message || "خروجی گرفتن ناموفق بود. دوباره تلاش کنید." }));
    } finally {
      exportAbortRef.current = null;
    }
  }, [endDate, meta.limit, meta.total, q, sort.by, sort.order, startDate, type]);

  const handleCancelExport = useCallback(() => {
    if (exportAbortRef.current) {
      exportAbortRef.current.abort();
      exportAbortRef.current = null;
    }
    setExportState(INITIAL_EXPORT_STATE);
  }, []);

  const getFileLabel = (file) =>
    file?.title?.trim?.() || file?.name?.trim?.() || file?.code?.trim?.() || "فایل";

  const isAudioFile = (file = {}) => {
    const t = String(file?.type || "").toLowerCase();
    const url = String(file?.url || "").toLowerCase();
    return t.startsWith("audio/") || /\.(mp3|wav|ogg|m4a|aac|webm|flac)(\?|#|$)/.test(url);
  };

  const openFilesModal = (row = {}) => {
    const files = Array.isArray(row?.files) ? row.files : [];
    if (files.length === 0) return;
    setSelectedCallFiles(files);
    setSelectedCallId(row?.id ?? null);
    setFileModalOpen(true);
  };

  const closeFilesModal = () => {
    setFileModalOpen(false);
    setSelectedCallFiles([]);
    setSelectedCallId(null);
  };

  const formatUnixFa = (unix) => {
    if (!unix || Number(unix) <= 0) return "-";
    const num = Number(unix);
    if (num >= 2147483647) return "-";
    const d = new Date(num * 1000);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("fa-IR");
  };

  const dispositionFa = (val) => {
    if (!val) return { label: "-", color: "secondary" };
    const v = String(val).toUpperCase();
    if (v === "ANSWERED") return { label: "پاسخ داده شد", color: "success" };
    if (v === "NO ANSWER") return { label: "بی‌پاسخ", color: "warning" };
    if (v === "BUSY") return { label: "مشغول", color: "info" };
    if (v === "FAILED") return { label: "ناموفق", color: "danger" };
    return { label: val, color: "secondary" };
  };

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        accessorKey: "id",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (info) => (
          <span className="text-muted fw-semibold" style={{ fontSize: "0.8rem" }}>
            {info.getValue() ?? "-"}
          </span>
        ),
        meta: { sortKey: "id" },
      },
      {
        id: "src",
        header: "شماره مبدا",
        accessorKey: "src",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (info) => (
          <span className="font-monospace" dir="ltr">
            {info.getValue() ?? "-"}
          </span>
        ),
        meta: { sortKey: "src" },
      },
      {
        id: "to_phone",
        header: "شماره مقصد",
        accessorKey: "to_phone",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (info) => (
          <span className="font-monospace" dir="ltr">
            {info.getValue() ?? "-"}
          </span>
        ),
        meta: { sortKey: "to_phone" },
      },
      {
        id: "disposition",
        header: "وضعیت تماس",
        accessorKey: "disposition",
        enableSorting: true,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const { label, color } = dispositionFa(row.original?.disposition);
          if (label === "-") return <span className="text-muted">-</span>;
          return (
            <Badge color={color} pill className="px-2 py-1" style={{ fontSize: "0.78rem" }}>
              {label}
            </Badge>
          );
        },
        meta: { sortKey: "disposition" },
      },
      {
        id: "files",
        header: "فایل‌ها",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const disposition = String(row.original?.disposition || "").toUpperCase();
          const files = Array.isArray(row.original?.files) ? row.original.files : [];

          if (disposition !== "ANSWERED" || files.length === 0)
            return <span className="text-muted">-</span>;

          return (
            <Button
              color="primary"
              size="sm"
              outline
              className="d-flex align-items-center gap-1 py-0 px-2"
              style={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}
              onClick={() => openFilesModal(row.original)}
            >
              <i className="mdi mdi-paperclip" />
              {`فایل‌ها (${files.length})`}
            </Button>
          );
        },
        meta: { sortKey: null },
      },
      {
        id: "wait",
        header: "انتظار (ث)",
        accessorKey: "wait",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (info) => {
          const val = info.getValue();
          return val != null ? (
            <span className="badge bg-light text-dark border">{val}</span>
          ) : (
            <span className="text-muted">-</span>
          );
        },
        meta: { sortKey: null },
      },
      {
        id: "talk_time",
        header: "مدت مکالمه",
        enableSorting: true,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const p = row.original?.playtime_string;
          if (p) return <span className="fw-semibold text-success">{p}</span>;

          const dur = row.original?.duration;
          if (dur == null) return <span className="text-muted">-</span>;

          const seconds = Number(dur);
          if (Number.isNaN(seconds)) return String(dur);

          return seconds > 0 ? (
            <span className="fw-semibold text-success">{`${seconds} ثانیه`}</span>
          ) : (
            <span className="text-muted">{`${seconds} ثانیه`}</span>
          );
        },
        meta: { sortKey: "duration" },
      },
      {
        id: "support_form_title",
        header: "فرم پشتیبانی",
        accessorKey: "support_form_title",
        enableSorting: true,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const val = row.original?.support_form_title;
          return val ? (
            <span className="text-truncate d-block" style={{ maxWidth: 180 }} title={val}>
              {val}
            </span>
          ) : (
            <span className="text-muted">-</span>
          );
        },
        meta: { sortKey: "support_form_title" },
      },
      {
        id: "adviser_name",
        header: "نام مشاور",
        accessorKey: "adviser_name",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const val = row.original?.adviser_name;
          return val ? (
            <span className="fw-medium">{val}</span>
          ) : (
            <span className="text-muted">-</span>
          );
        },
        meta: { sortKey: null },
      },
      {
        id: "student_full_name",
        header: "نام و نام خانوادگی دانش‌آموز",
        accessorKey: "student_full_name",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const val = row.original?.student_full_name ?? row.original?.student_name;
          return val ? val : <span className="text-muted">-</span>;
        },
        meta: { sortKey: null },
      },
      {
        id: "student_username",
        header: "نام کاربری دانش‌آموز",
        accessorKey: "student_username",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const val = row.original?.student_username;
          return val ? (
            <span className="font-monospace text-muted" style={{ fontSize: "0.85rem" }}>
              {val}
            </span>
          ) : (
            <span className="text-muted">-</span>
          );
        },
        meta: { sortKey: null },
      },
      {
        id: "start",
        header: "شروع",
        enableSorting: true,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const val = formatUnixFa(row.original?.starttime_unix);
          return <span style={{ fontSize: "0.82rem", whiteSpace: "nowrap" }}>{val}</span>;
        },
        meta: { sortKey: "starttime_unix" },
      },
      {
        id: "end",
        header: "پایان",
        enableSorting: true,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const val = formatUnixFa(row.original?.endtime_unix);
          return <span style={{ fontSize: "0.82rem", whiteSpace: "nowrap" }}>{val}</span>;
        },
        meta: { sortKey: "endtime_unix" },
      },
    ],
    []
  );

  const columnSortKeyMap = useMemo(() => {
    const map = {};
    columns.forEach((col) => { map[col.id] = col.meta?.sortKey || null; });
    return map;
  }, [columns]);

  const handleSortingChange = useCallback(
    (nextSorting) => {
      const first = nextSorting?.[0];
      const sortKey = first ? columnSortKeyMap[first.id] : null;
      const sortDirection = first ? (first.desc ? "DESC" : "ASC") : null;

      if (!sortKey) {
        setSorting([]);
        setSort({ by: null, order: null });
        fetchData({ page: 1, currentType: type, currentQ: q, currentSortBy: "", currentSortOrder: "" });
        return;
      }

      setSorting(nextSorting);
      setSort({ by: sortKey, order: sortDirection });

      const start = startDate ? moment(startDate.toDate()).format("YYYY-MM-DD") : "";
      const end = endDate ? moment(endDate.toDate()).format("YYYY-MM-DD") : "";

      fetchData({ page: 1, currentType: type, currentQ: q, currentSortBy: sortKey, currentSortOrder: sortDirection, currentStart: start, currentEnd: end });
    },
    [columnSortKeyMap, fetchData, q, type, startDate, endDate]
  );

  const isExportBusy = exportState.status === "preparing" || exportState.status === "downloading";
  const showExportPanel = exportState.status !== "idle";

  const exportStatusLabel = {
    preparing: "در حال آماده‌سازی...",
    downloading: "در حال دانلود...",
    success: "دانلود موفق",
    error: "خطا",
    cancelled: "لغو شد",
  };

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="Voip" breadcrumbItem="تماس‌های خروجی" />

        <Row>
          <Col lg={12}>
            <Card className="shadow-sm">
              <CardHeader className="bg-white border-bottom pb-0">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div
                    className="rounded-2 d-flex align-items-center justify-content-center text-white"
                    style={{ width: 36, height: 36, backgroundColor: "#556ee6", flexShrink: 0 }}
                  >
                    <i className="mdi mdi-phone-outgoing fs-5" />
                  </div>
                  <h5 className="card-title mb-0 fw-semibold">لیست تماس‌های خروجی</h5>
                  {meta.total > 0 && (
                    <Badge color="primary" pill className="ms-1">
                      {meta.total.toLocaleString("fa-IR")}
                    </Badge>
                  )}
                </div>

                <Form
                  onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
                  className="mb-3"
                >
                  <div className="p-3 rounded-3" style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}>
                    {/* Row 1: Search type + query */}
                    <Row className="g-3 mb-3">
                      <Col md="3" sm="6">
                        <Label className="form-label fw-medium mb-1" style={{ fontSize: "0.85rem" }}>
                          <i className="mdi mdi-filter-variant me-1 text-muted" />
                          فیلد جستجو
                        </Label>
                        <Input
                          type="select"
                          bsSize="sm"
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          className="border-0 shadow-sm"
                        >
                          {searchTypes.map((opt) => (
                            <option key={opt.value || "empty"} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </Input>
                      </Col>

                      <Col md="5" sm="6">
                        <Label className="form-label fw-medium mb-1" style={{ fontSize: "0.85rem" }}>
                          <i className="mdi mdi-magnify me-1 text-muted" />
                          عبارت جستجو
                        </Label>
                        <div className="d-flex gap-2">
                          <Input
                            type="text"
                            bsSize="sm"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="مثلاً نام مشاور یا دانش‌آموز..."
                            className="border-0 shadow-sm"
                          />
                          <Button
                            color="primary"
                            size="sm"
                            type="submit"
                            disabled={loading}
                            className="px-3 d-flex align-items-center gap-1"
                            style={{ whiteSpace: "nowrap" }}
                          >
                            <i className="mdi mdi-magnify" />
                            جستجو
                          </Button>
                        </div>
                      </Col>

                      <Col md="4" className="d-flex align-items-end">
                        <div className="d-flex gap-2 w-100 justify-content-end">
                          <Button
                            color="success"
                            size="sm"
                            type="button"
                            onClick={handleExport}
                            disabled={isExportBusy || loading}
                            className="d-flex align-items-center gap-1 px-3"
                            style={{ whiteSpace: "nowrap" }}
                          >
                            <i className={`mdi ${isExportBusy ? "mdi-loading mdi-spin" : "mdi-file-download-outline"}`} />
                            {isExportBusy ? "در حال دریافت..." : "خروجی CSV"}
                          </Button>
                          {isExportBusy && (
                            <Button
                              color="danger"
                              size="sm"
                              outline
                              type="button"
                              onClick={handleCancelExport}
                              className="d-flex align-items-center gap-1"
                              style={{ whiteSpace: "nowrap" }}
                            >
                              <i className="mdi mdi-close" />
                              لغو
                            </Button>
                          )}
                        </div>
                      </Col>
                    </Row>

                    {/* Row 2: Date range */}
                    <Row className="g-3 align-items-end">
                      <Col md="12">
                        <Label className="form-label fw-medium mb-2" style={{ fontSize: "0.85rem" }}>
                          <i className="mdi mdi-calendar-range me-1 text-muted" />
                          بازه زمانی (شمسی)
                        </Label>
                        <div className="d-flex gap-2 align-items-center flex-wrap">
                          <div style={{ flex: "1 1 180px", maxWidth: 240 }}>
                            <DatePicker
                              calendar={persian}
                              locale={persian_fa}
                              value={startDate}
                              onChange={(date) => setStartDate(date || null)}
                              format="YYYY/MM/DD"
                              placeholder="تاریخ شروع"
                              className="form-control"
                              inputClass="form-control form-control-sm border-0 shadow-sm"
                              calendarPosition="bottom-right"
                            />
                          </div>
                          <span className="text-muted" style={{ fontSize: "0.85rem" }}>تا</span>
                          <div style={{ flex: "1 1 180px", maxWidth: 240 }}>
                            <DatePicker
                              calendar={persian}
                              locale={persian_fa}
                              value={endDate}
                              onChange={(date) => setEndDate(date || null)}
                              format="YYYY/MM/DD"
                              placeholder="تاریخ پایان"
                              className="form-control"
                              inputClass="form-control form-control-sm border-0 shadow-sm"
                              calendarPosition="bottom-right"
                            />
                          </div>
                          <Button
                            color="secondary"
                            size="sm"
                            outline
                            type="button"
                            onClick={handleResetFilters}
                            disabled={loading}
                            className="d-flex align-items-center gap-1"
                            style={{ whiteSpace: "nowrap" }}
                          >
                            <i className="mdi mdi-refresh" />
                            ریست فیلترها
                          </Button>
                        </div>
                      </Col>
                    </Row>

                    {/* Status / error row */}
                    {(searchError || !searchError) && (
                      <div className="mt-2">
                        {searchError ? (
                          <div className="d-flex align-items-center gap-1 text-danger" style={{ fontSize: "0.82rem" }}>
                            <i className="mdi mdi-alert-circle-outline" />
                            {searchError}
                          </div>
                        ) : (
                          <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                            <i className="mdi mdi-information-outline me-1" />
                            برای سورت روی عناوین جدول کلیک کنید.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Export progress panel */}
                    {showExportPanel && (
                      <div
                        className="mt-3 p-2 rounded-2 d-flex align-items-center gap-3 flex-wrap"
                        style={{ background: "#fff", border: "1px solid #dee2e6" }}
                      >
                        <div className="d-flex align-items-center gap-2" style={{ fontSize: "0.82rem" }}>
                          <i
                            className={`mdi ${
                              exportState.status === "success"
                                ? "mdi-check-circle text-success"
                                : exportState.status === "error"
                                ? "mdi-alert-circle text-danger"
                                : "mdi-loading mdi-spin text-primary"
                            } fs-5`}
                          />
                          <span className="text-muted">
                            {exportStatusLabel[exportState.status] || ""}
                          </span>
                          {exportState.receivedBytes > 0 && (
                            <span className="text-muted">
                              {exportState.totalBytes
                                ? `${formatBytes(exportState.receivedBytes)} / ${formatBytes(exportState.totalBytes)}`
                                : formatBytes(exportState.receivedBytes)}
                              {exportState.percent != null && ` (${exportState.percent}%)`}
                            </span>
                          )}
                        </div>
                        <div className="flex-grow-1" style={{ minWidth: 180 }}>
                          <Progress
                            animated={exportState.percent === null && isExportBusy}
                            striped={isExportBusy}
                            color={exportState.status === "error" ? "danger" : exportState.status === "success" ? "success" : "primary"}
                            style={{ height: 8, borderRadius: 4 }}
                            value={exportState.percent ?? 30}
                          />
                        </div>
                        {exportState.errorMessage && (
                          <div className="text-danger" style={{ fontSize: "0.8rem" }}>
                            {exportState.errorMessage}
                          </div>
                        )}
                        {exportState.status === "success" && (
                          <Button
                            color="link"
                            size="sm"
                            className="p-0 text-muted"
                            onClick={() => setExportState(INITIAL_EXPORT_STATE)}
                          >
                            <i className="mdi mdi-close" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </Form>
              </CardHeader>

              <CardBody className="p-0">
                <TableContainer
                  columns={columns}
                  data={data || []}
                  isGlobalFilter={false}
                  isPagination={false}
                  isLoading={loading}
                  manualSorting
                  sortingState={sorting}
                  onSortingChange={handleSortingChange}
                  theadClass="table-light"
                  tableClass="table-bordered table-hover align-middle mb-0"
                  divClassName="table-responsive"
                />

                <div className="px-3 py-2 border-top bg-light">
                  <Paginations
                    perPageData={meta.limit}
                    data={data}
                    totalRecords={meta.total}
                    currentPage={meta.page}
                    setCurrentPage={handlePageChange}
                    isShowingPageLength={true}
                    paginationDiv="col-sm-auto"
                    paginationClass="pagination pagination-sm mb-0"
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>

      <Modal isOpen={fileModalOpen} toggle={closeFilesModal} centered size="lg">
        <ModalHeader toggle={closeFilesModal} className="bg-light">
          <div className="d-flex align-items-center gap-2">
            <i className="mdi mdi-paperclip text-primary fs-5" />
            {selectedCallId != null ? `فایل‌های تماس #${selectedCallId}` : "فایل‌های تماس"}
          </div>
        </ModalHeader>
        <ModalBody>
          {!selectedCallFiles.length ? (
            <div className="text-center py-4 text-muted">
              <i className="mdi mdi-folder-open-outline fs-1 d-block mb-2 opacity-50" />
              فایلی برای این تماس ثبت نشده است.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>عنوان</th>
                    <th style={{ minWidth: 220 }}>پخش</th>
                    <th>حجم</th>
                    <th>مدت</th>
                    <th>دانلود</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCallFiles.map((file) => (
                    <tr key={file?.id ?? `${file?.url}-${file?.code}`}>
                      <td className="text-break fw-medium">{getFileLabel(file)}</td>
                      <td>
                        {isAudioFile(file) ? (
                          <audio controls preload="none" src={file?.url} style={{ width: "100%", height: 36 }}>
                            مرورگر شما پخش صوت را پشتیبانی نمی‌کند.
                          </audio>
                        ) : (
                          <span className="badge bg-light text-muted border">فایل غیرصوتی</span>
                        )}
                      </td>
                      <td>
                        <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                          {file?.size || "-"}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                          {file?.time || "-"}
                        </span>
                      </td>
                      <td>
                        {file?.url ? (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1 py-0"
                            style={{ fontSize: "0.78rem" }}
                          >
                            <i className="mdi mdi-download" />
                            دانلود
                          </a>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default OutboundCallHistories;
