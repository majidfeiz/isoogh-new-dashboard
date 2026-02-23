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
  InputGroup,
  Progress,
  Modal,
  ModalHeader,
  ModalBody,
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
  status: "idle", // idle | preparing | downloading | success | error | cancelled
  receivedBytes: 0,
  totalBytes: null,
  percent: null,
  errorMessage: null,
};

const OutboundCallHistories = () => {
  document.title = "تماس‌های خروجی | داشبورد آیسوق";

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 15,
    total: 0,
    lastPage: 1,
  });

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
    setExportState({
      status: "preparing",
      receivedBytes: 0,
      totalBytes: null,
      percent: null,
      errorMessage: null,
    });

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
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const text = await res.text();
        throw new Error(text || "خطا در خروجی گرفتن");
      }

      const totalBytes = parseTotalBytes(res.headers);
      setExportState((prev) => ({
        ...prev,
        status: "downloading",
        totalBytes,
        percent: totalBytes ? 0 : null,
      }));

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

          const percent = totalBytes
            ? Math.min(99, Math.floor((receivedBytes / totalBytes) * 100))
            : null;

          setExportState((prev) => ({
            ...prev,
            status: "downloading",
            receivedBytes,
            totalBytes,
            percent,
            errorMessage: null,
          }));
        }
      }

      const csvBlob = new Blob(chunks, {
        type: "text/csv;charset=utf-8",
      });

      const filename = parseFilename(res.headers.get("Content-Disposition"));
      downloadBlob(csvBlob, filename || "outbound-call-histories.csv");

      setExportState((prev) => ({
        ...prev,
        status: "success",
        receivedBytes,
        totalBytes,
        percent: 100,
        errorMessage: null,
      }));
    } catch (e) {
      if (e?.name === "AbortError") {
        setExportState(INITIAL_EXPORT_STATE);
        return;
      }

      console.error("خطا در خروجی CSV تماس خروجی", e);
      setExportState((prev) => ({
        ...prev,
        status: "error",
        errorMessage: e?.message || "خروجی گرفتن ناموفق بود. دوباره تلاش کنید.",
      }));
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
    if (!val) return "-";
    const v = String(val).toUpperCase();
    if (v === "ANSWERED") return "پاسخ داده شد";
    if (v === "NO ANSWER") return "بی‌پاسخ";
    if (v === "BUSY") return "مشغول";
    if (v === "FAILED") return "ناموفق";
    return val;
  };

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        accessorKey: "id",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (info) => info.getValue() ?? "-",
        meta: { sortKey: "id" },
      },
      {
        id: "src",
        header: "شماره مبدا",
        accessorKey: "src",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (info) => info.getValue() ?? "-",
        meta: { sortKey: "src" },
      },
      {
        id: "to_phone",
        header: "شماره مقصد",
        accessorKey: "to_phone",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (info) => info.getValue() ?? "-",
        meta: { sortKey: "to_phone" },
      },
      {
        id: "disposition",
        header: "وضعیت تماس",
        accessorKey: "disposition",
        enableSorting: true,
        enableColumnFilter: false,
        cell: ({ row }) => dispositionFa(row.original?.disposition),
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

          if (disposition !== "ANSWERED" || files.length === 0) return "-";

          return (
            <Button
              color="link"
              className="p-0 text-decoration-underline text-break"
              onClick={() => openFilesModal(row.original)}
            >
              {`مشاهده فایل‌ها (${files.length})`}
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
        cell: (info) => info.getValue() ?? "-",
        meta: { sortKey: null },
      },
      {
        id: "talk_time",
        header: "مدت مکالمه",
        enableSorting: true,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const p = row.original?.playtime_string;
          if (p) return p;

          const dur = row.original?.duration;
          if (dur == null) return "-";

          const seconds = Number(dur);
          if (Number.isNaN(seconds)) return String(dur);

          return `${seconds} ثانیه`;
        },
        meta: { sortKey: "duration" },
      },
      {
        id: "support_form_title",
        header: "فرم پشتیبانی",
        accessorKey: "support_form_title",
        enableSorting: true,
        enableColumnFilter: false,
        cell: ({ row }) => row.original?.support_form_title ?? "-",
        meta: { sortKey: "support_form_title" },
      },
      {
        id: "adviser_name",
        header: "نام مشاور",
        accessorKey: "adviser_name",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => row.original?.adviser_name ?? "-",
        meta: { sortKey: null },
      },
      {
        id: "student_full_name",
        header: "نام و نام خانوادگی دانش‌آموز",
        accessorKey: "student_full_name",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => row.original?.student_full_name ?? row.original?.student_name ?? "-",
        meta: { sortKey: null },
      },
      {
        id: "student_username",
        header: "نام کاربری دانش‌آموز",
        accessorKey: "student_username",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => row.original?.student_username ?? "-",
        meta: { sortKey: null },
      },
      {
        id: "start",
        header: "شروع",
        enableSorting: true,
        enableColumnFilter: false,
        cell: ({ row }) => formatUnixFa(row.original?.starttime_unix),
        meta: { sortKey: "starttime_unix" },
      },
      {
        id: "end",
        header: "پایان",
        enableSorting: true,
        enableColumnFilter: false,
        cell: ({ row }) => formatUnixFa(row.original?.endtime_unix),
        meta: { sortKey: "endtime_unix" },
      },
    ],
    []
  );

  const columnSortKeyMap = useMemo(() => {
    const map = {};
    columns.forEach((col) => {
      const key = col.meta?.sortKey;
      map[col.id] = key || null;
    });
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
        fetchData({
          page: 1,
          currentType: type,
          currentQ: q,
          currentSortBy: "",
          currentSortOrder: "",
        });
        return;
      }

      setSorting(nextSorting);
      setSort({ by: sortKey, order: sortDirection });

      const start = startDate ? moment(startDate.toDate()).format("YYYY-MM-DD") : "";
      const end = endDate ? moment(endDate.toDate()).format("YYYY-MM-DD") : "";

      fetchData({
        page: 1,
        currentType: type,
        currentQ: q,
        currentSortBy: sortKey,
        currentSortOrder: sortDirection,
        currentStart: start,
        currentEnd: end,
      });
    },
    [columnSortKeyMap, fetchData, q, type, startDate, endDate]
  );

  const isExportBusy = exportState.status === "preparing" || exportState.status === "downloading";
  const showExportPanel = exportState.status !== "idle";

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="Voip" breadcrumbItem="تماس‌های خروجی" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader>
                <div className="d-flex flex-column gap-2">
                  <h4 className="card-title mb-0">لیست تماس‌های خروجی</h4>
                  <Form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSearch();
                    }}
                  >
                    <div className="p-3 bg-light rounded-3 shadow-sm">
                      <Row className="g-3 align-items-end">
                        <Col md="3" sm="6">
                          <Label className="form-label text-muted mb-1">فیلد جستجو</Label>
                          <Input type="select" value={type} onChange={(e) => setType(e.target.value)}>
                            {searchTypes.map((opt) => (
                              <option key={opt.value || "empty"} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </Input>
                        </Col>

                        <Col md="4" sm="6">
                          <Label className="form-label text-muted mb-1">عبارت</Label>
                          <InputGroup>
                            <Input
                              type="text"
                              value={q}
                              onChange={(e) => setQ(e.target.value)}
                              onKeyDown={onKeyDown}
                              placeholder="مثلاً نام مشاور یا دانش‌آموز..."
                            />
                            {q && (
                              <Button color="light" onClick={handleResetFilters} type="button">
                                پاک کردن
                              </Button>
                            )}
                            <Button color="primary" type="submit" disabled={loading}>
                              جستجو
                            </Button>
                          </InputGroup>
                        </Col>

                        <Col md="5">
                          <Label className="form-label text-muted mb-1">بازه زمانی (شمسی)</Label>
                          <Row className="g-2">
                            <Col sm="6">
                              <DatePicker
                                calendar={persian}
                                locale={persian_fa}
                                value={startDate}
                                onChange={(date) => setStartDate(date || null)}
                                format="YYYY/MM/DD"
                                placeholder="تاریخ شروع"
                                className="form-control"
                                inputClass="form-control"
                                calendarPosition="bottom-right"
                              />
                            </Col>
                            <Col sm="6">
                              <div className="d-flex gap-2">
                                <DatePicker
                                  calendar={persian}
                                  locale={persian_fa}
                                  value={endDate}
                                  onChange={(date) => setEndDate(date || null)}
                                  format="YYYY/MM/DD"
                                  placeholder="تاریخ پایان"
                                  className="form-control"
                                  inputClass="form-control"
                                  calendarPosition="bottom-right"
                                />
                                <Button color="success" type="button" onClick={handleExport} disabled={isExportBusy || loading}>
                                  {isExportBusy ? "در حال دریافت..." : "خروجی CSV"}
                                </Button>
                                <Button
                                  color="danger"
                                  outline
                                  type="button"
                                  onClick={handleCancelExport}
                                  disabled={!isExportBusy}
                                >
                                  لغو
                                </Button>
                              </div>
                            </Col>
                          </Row>
                        </Col>

                        <Col md="12" className="d-flex justify-content-between flex-wrap gap-2">
                          {searchError ? (
                            <div className="text-danger small">{searchError}</div>
                          ) : (
                            <div className="text-muted small">سورت روی عناوین جدول فعال است.</div>
                          )}
                          <div className="text-muted small">
                            <span className="me-2">برای پاکسازی سریع، روی "پاک کردن" بزن.</span>
                            <Button color="secondary" size="sm" outline onClick={handleResetFilters} disabled={loading}>
                              ریست فیلترها
                            </Button>
                          </div>
                        </Col>
                      </Row>

                      {showExportPanel && (
                        <div className="mt-3">
                          <div className="d-flex align-items-center gap-3 flex-wrap">
                            <div className="text-muted small">
                              وضعیت:
                              <span className="ms-1">
                                {exportState.status === "preparing" && "در حال آماده‌سازی"}
                                {exportState.status === "downloading" && "در حال دانلود"}
                                {exportState.status === "success" && "موفق"}
                                {exportState.status === "error" && "خطا"}
                                {exportState.status === "cancelled" && "لغو شد"}
                              </span>
                              <span className="ms-2">
                                {exportState.totalBytes
                                  ? `${formatBytes(exportState.receivedBytes)} / ${formatBytes(exportState.totalBytes)}${
                                      exportState.percent != null ? ` (${exportState.percent}%)` : ""
                                    }`
                                  : `${formatBytes(exportState.receivedBytes)} downloaded`}
                              </span>
                            </div>

                            <div className="flex-grow-1" style={{ minWidth: 240 }}>
                              <Progress
                                animated={exportState.percent === null && isExportBusy}
                                striped
                                color="success"
                                style={{ height: 10 }}
                                value={exportState.percent ?? 30}
                              >
                                {exportState.percent != null ? `%${exportState.percent}` : ""}
                              </Progress>
                            </div>

                            {exportState.errorMessage ? (
                              <div className="text-danger small">{exportState.errorMessage}</div>
                            ) : null}
                          </div>
                        </div>
                      )}
                    </div>
                  </Form>
                </div>
              </CardHeader>

              <CardBody>
                <TableContainer
                  columns={columns}
                  data={data || []}
                  isGlobalFilter={false}
                  isPagination={false}
                  isLoading={loading}
                  manualSorting
                  sortingState={sorting}
                  onSortingChange={handleSortingChange}
                  tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
                />

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
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>

      <Modal isOpen={fileModalOpen} toggle={closeFilesModal} centered size="lg">
        <ModalHeader toggle={closeFilesModal}>
          {selectedCallId != null ? `فایل‌های تماس #${selectedCallId}` : "فایل‌های تماس"}
        </ModalHeader>
        <ModalBody>
          {!selectedCallFiles.length ? (
            <div className="text-muted">فایلی برای این تماس ثبت نشده است.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th>عنوان</th>
                    <th>پخش</th>
                    <th>حجم</th>
                    <th>مدت</th>
                    <th>لینک</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCallFiles.map((file) => (
                    <tr key={file?.id ?? `${file?.url}-${file?.code}`}>
                      <td className="text-break">{getFileLabel(file)}</td>
                      <td style={{ minWidth: 220 }}>
                        {isAudioFile(file) ? (
                          <audio controls preload="none" src={file?.url} style={{ width: "100%" }}>
                            مرورگر شما پخش صوت را پشتیبانی نمی‌کند.
                          </audio>
                        ) : (
                          <span className="text-muted small">فایل غیرصوتی</span>
                        )}
                      </td>
                      <td>{file?.size || "-"}</td>
                      <td>{file?.time || "-"}</td>
                      <td>
                        {file?.url ? (
                          <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-break">
                            {getFileLabel(file)}
                          </a>
                        ) : (
                          "-"
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
