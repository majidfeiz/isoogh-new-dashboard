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
} from "reactstrap";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import moment from "moment-jalaali";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";

import {
  getOutboundCallHistories,
} from "../../services/voipService.jsx";
import { API_ROUTES, getApiUrl } from "../../helpers/apiRoutes.jsx";
import { getAccessToken } from "../../helpers/authStorage.jsx";

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
  const [exportLoading, setExportLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);
  const [exportPhase, setExportPhase] = useState("idle"); // idle | pending | downloading | finalizing
  const approxTotalRef = useRef(null);
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

    const start = startDate
      ? moment(startDate.toDate()).format("YYYY-MM-DD")
      : "";
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
      const start = startDate
        ? moment(startDate.toDate()).format("YYYY-MM-DD")
        : "";
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

  const handleExport = useCallback(async () => {
    if (startDate && endDate && startDate > endDate) {
      setSearchError("تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.");
      return;
    }

    const start = startDate
      ? moment(startDate.toDate()).format("YYYY-MM-DD")
      : "";
    const end = endDate ? moment(endDate.toDate()).format("YYYY-MM-DD") : "";
    const cleanedQ = q?.trim?.() || "";

    const perPage = meta?.total && meta.total > 0 ? meta.total : meta.limit;

    setExportLoading(true);
    setSearchError("");
    setExportProgress(0);
    setExportPhase("pending");
    approxTotalRef.current = null;
    try {
      const params = new URLSearchParams();
      params.append("page", "1");
      params.append("per_page", String(perPage));
      if (type) params.append("type", type);
      if (cleanedQ) params.append("q", cleanedQ);
      if (start) params.append("start_date", start);
      if (end) params.append("end_date", end);

      const url = `${getApiUrl(API_ROUTES.voip.exportOutboundCallHistories)}?${params.toString()}`;
      const token = getAccessToken();
      const res = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok || !res.body) {
        const text = await res.text();
        throw new Error(text || "خطا در خروجی گرفتن");
      }

      const approxHeader =
        res.headers.get("X-Approx-Content-Length") ||
        res.headers.get("x-approx-content-length") ||
        res.headers.get("Content-Length");
      const approxTotal = approxHeader ? Number(approxHeader) : 0;
      if (approxTotal > 0) {
        approxTotalRef.current = approxTotal;
        setExportPhase("downloading");
        setExportProgress(1); // شروع با 1% تا نوار خالی نباشد
      }

      const reader = res.body.getReader();
      const chunks = [];
      let loaded = 0;
      const total = approxTotalRef.current || 0;
      const decoder = new TextDecoder("utf-8");
      let carry = "";
      let headerBytes = 0;
      let rowsSeen = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunkSize = value?.byteLength ?? value?.length ?? 0;
        if (chunkSize > 0) {
          chunks.push(value);
          loaded += chunkSize;

          const chunkText = carry + decoder.decode(value, { stream: true });
          const parts = chunkText.split("\n");
          carry = parts.pop() || "";

          parts.forEach((line, idx) => {
            const trimmed = line.trim();
            if (!trimmed) return;
            if (headerBytes === 0) {
              // اولین خط را به عنوان هدر در نظر بگیر
              headerBytes = line.length + 1; // شامل \n
            } else {
              rowsSeen += 1;
            }
          });

          const approx =
            approxTotalRef.current ||
            (rowsSeen > 0
              ? Math.round(
                  headerBytes +
                    ((loaded - headerBytes) / Math.max(rowsSeen, 1)) * perPage
                )
              : 0);

          if (total > 0) {
            const percent = Math.min(
              99,
              Math.round((loaded / total) * 100)
            );
            setExportPhase("downloading");
            setExportProgress(percent);
          } else if (approx > 0) {
            const percent = Math.min(
              99,
              Math.round((loaded / approx) * 100)
            );
            setExportPhase("downloading");
            setExportProgress(percent);
          } else {
            setExportPhase("pending");
            setExportProgress(null);
          }
        }
      }

      // افزودن BOM برای نمایش صحیح حروف فارسی در Excel
      const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
      const csvBlob = new Blob([bom, ...chunks], {
        type: "text/csv;charset=utf-8;",
      });

      const urlObject = window.URL.createObjectURL(csvBlob);
      const link = document.createElement("a");
      link.href = urlObject;
      const stamp = moment().format("YYYYMMDD-HHmmss");
      link.setAttribute("download", `outbound-calls-${stamp}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(urlObject);
      setExportPhase("finalizing");
      setExportProgress(100);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("خطا در خروجی اکسل", e);
      setSearchError("خروجی گرفتن ناموفق بود. دوباره تلاش کنید.");
    } finally {
      setExportLoading(false);
      setTimeout(() => {
        setExportProgress(null);
        setExportPhase("idle");
        approxTotalRef.current = null;
      }, 1000);
    }
  }, [endDate, meta.limit, meta.total, q, startDate, type]);

  const formatUnixFa = (unix) => {
    if (!unix || Number(unix) <= 0) return "-";
    const num = Number(unix);

    // placeholder غیرواقعی
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

          // نمایش ساده: ثانیه
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
        id: "adviser_id",
        header: "Adviser ID",
        accessorKey: "adviser_id",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (info) => info.getValue() ?? "-",
        meta: { sortKey: null },
      },
      {
        id: "student_id",
        header: "Student ID",
        accessorKey: "student_id",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (info) => info.getValue() ?? "-",
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
      {
        id: "call_group_id",
        header: "Call Group",
        accessorKey: "call_group_id",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const v = row.original?.call_group_id;
          if (!v) return "-";
          // کوتاه‌نمایی برای اینکه جدول به هم نریزه
          return v.length > 22 ? `${v.slice(0, 22)}...` : v;
        },
        meta: { sortKey: null },
      },
    ],
    []
  );

  const columnSortKeyMap = useMemo(() => {
    const map = {};
    columns.forEach((col) => {
      const key = col.meta?.sortKey;
      if (!key) {
        map[col.id] = null;
      } else {
        map[col.id] = key;
      }
    });
    return map;
  }, [columns]);

  const handleSortingChange = useCallback(
    (nextSorting) => {
      const first = nextSorting?.[0];
      const sortKey = first ? columnSortKeyMap[first.id] : null;
      const sortDirection = first ? (first.desc ? "DESC" : "ASC") : null;

      // اگر ستون قابل سورت نبود، هیچ پارامتر اضافه نفرست
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

      const start = startDate
        ? moment(startDate.toDate()).format("YYYY-MM-DD")
        : "";
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
                  <Form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
                    <div className="p-3 bg-light rounded-3 shadow-sm">
                      <Row className="g-3 align-items-end">
                        <Col md="3" sm="6">
                          <Label className="form-label text-muted mb-1">فیلد جستجو</Label>
                          <Input
                            type="select"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                          >
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
                                onChange={(date) => {
                                  setStartDate(date || null);
                                }}
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
                                  onChange={(date) => {
                                    setEndDate(date || null);
                                  }}
                                  format="YYYY/MM/DD"
                                  placeholder="تاریخ پایان"
                                  className="form-control"
                                  inputClass="form-control"
                                  calendarPosition="bottom-right"
                                />
                                <Button
                                  color="success"
                                  type="button"
                                  onClick={handleExport}
                                  disabled={exportLoading || loading}
                                >
                                  {exportLoading ? "در حال آماده‌سازی..." : "خروجی CSV"}
                                </Button>
                              </div>
                            </Col>
                          </Row>
                        </Col>
                        <Col md="12" className="d-flex justify-content-between flex-wrap gap-2">
                          {searchError ? <div className="text-danger small">{searchError}</div> : <div className="text-muted small">سورت روی عناوین جدول فعال است.</div>}
                          <div className="text-muted small">
                            <span className="me-2">برای پاکسازی سریع، روی "پاک کردن" بزن.</span>
                            <Button color="secondary" size="sm" outline onClick={handleResetFilters} disabled={loading}>
                              ریست فیلترها
                            </Button>
                          </div>
                        </Col>
                      </Row>
                      {exportLoading && (
                        <div className="mt-3">
                          <div className="d-flex align-items-center gap-3 flex-wrap">
                            <div className="d-flex align-items-center gap-2">
                              <div
                                style={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  background: "#28a745",
                                  boxShadow: "0 0 0 4px rgba(40,167,69,0.15)",
                                }}
                              ></div>
                              <span className="text-success fw-semibold">
                                {exportPhase === "finalizing"
                                  ? "در حال نهایی‌سازی فایل"
                                  : exportPhase === "downloading"
                                    ? "در حال دانلود فایل"
                                    : "در حال آماده‌سازی فایل"}
                              </span>
                            </div>
                            <div className="flex-grow-1" style={{ minWidth: 240 }}>
                              <Progress
                                value={exportProgress ?? 0}
                                animated={exportProgress == null}
                                striped
                                color="success"
                                style={{ height: 10 }}
                              >
                                {exportProgress != null ? `${exportProgress}%` : ""}
                              </Progress>
                            </div>
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
    </div>
  );
};

export default OutboundCallHistories;
