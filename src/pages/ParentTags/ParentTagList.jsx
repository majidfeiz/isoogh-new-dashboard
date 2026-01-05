// src/pages/ParentTags/ParentTagList.jsx
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
  InputGroupText,
  Spinner,
  Progress,
  Alert,
} from "reactstrap";
import { useNavigate } from "react-router-dom";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";
import {
  getParentTags,
  deleteParentTag,
  importParentTagUsers,
} from "../../services/parentTagService.jsx";
import { API_ROUTES, getApiUrl } from "../../helpers/apiRoutes.jsx";
import { getAccessToken } from "../../helpers/authStorage.jsx";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const iso = date.toISOString();
  return iso.replace("T", " ").slice(0, 16);
};

const getParentName = (row) =>
  row?.parent?.name ||
  row?.parent?.title ||
  row?.parent_tag?.name ||
  row?.parent_tag?.title ||
  row?.parentTag?.name ||
  row?.parentTag?.title ||
  row?.parent_name ||
  row?.parentName ||
  "";

const ParentTagList = () => {
  const navigate = useNavigate();
  document.title = "مدیریت تگ‌ها | داشبورد آیسوق";

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    lastPage: 1,
  });
  const [filters, setFilters] = useState({
    search: "",
    schoolId: "",
    parentId: "",
    rootOnly: "",
  });
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [sort, setSort] = useState({ by: "id", order: "DESC" });
  const [exportLoading, setExportLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);
  const [exportPhase, setExportPhase] = useState("idle"); // idle | pending | downloading | finalizing
  const approxTotalRef = useRef(null);
  const [importRows, setImportRows] = useState([]);
  const [maxTagColumns, setMaxTagColumns] = useState(3);
  const [importFileName, setImportFileName] = useState("");
  const [importSchoolId, setImportSchoolId] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importUploadProgress, setImportUploadProgress] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState(null);
  const [importPreviewPage, setImportPreviewPage] = useState(1);
  const [importPreviewPageSize, setImportPreviewPageSize] = useState(200);
  const [virtualRange, setVirtualRange] = useState({ start: 0, end: 40 });
  const ROW_HEIGHT = 44;
  const VIRTUAL_BUFFER = 10;

  const baseImportColumns = useMemo(
    () => {
      const tags = Array.from({ length: Math.max(1, maxTagColumns) }, (_, idx) => `tag${idx + 1}`);
      return ["username", "action", ...tags];
    },
    [maxTagColumns]
  );

  const previewColumns = baseImportColumns;

  const pagedImportRows = useMemo(() => {
    const start = (importPreviewPage - 1) * importPreviewPageSize;
    return importRows.slice(start, start + importPreviewPageSize);
  }, [importRows, importPreviewPage, importPreviewPageSize]);

  const totalPageRows = pagedImportRows.length;
  const visibleStart = Math.min(virtualRange.start, Math.max(0, totalPageRows));
  const visibleEnd = Math.min(totalPageRows, virtualRange.end);

  const fetchData = useCallback(
    async (page = 1, currentFilters = {}, currentSort = sort) => {
      setLoading(true);
      try {
        const res = await getParentTags({
          page,
          limit: meta.limit,
          search: currentFilters.search,
          schoolId: currentFilters.schoolId,
          parentId: currentFilters.parentId,
          rootOnly: currentFilters.rootOnly,
          sortBy: currentSort?.by,
          sortOrder: currentSort?.order,
        });

        setData(res.items || []);
        setMeta(
          res.pagination || {
            page,
            limit: meta.limit,
            total: 0,
            lastPage: 1,
          }
        );
      } catch (e) {
        console.error("خطا در دریافت تگ‌ها", e);
        setData([]);
        setMeta((prev) => ({ ...prev, total: 0 }));
      } finally {
        setLoading(false);
      }
    },
    [meta.limit, sort]
  );

  useEffect(() => {
    fetchData(1, filters, sort);
  }, [fetchData, sort]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData(1, filters, sort);
  };

  const handleResetFilters = () => {
    const reset = { search: "", schoolId: "", parentId: "", rootOnly: "" };
    setFilters(reset);
    fetchData(1, reset, sort);
  };

  const handlePageChange = (page) => {
    fetchData(page, filters, sort);
  };

  const handleCreate = () => {
    navigate("/parent-tags/create");
  };

  const handleEdit = useCallback(
    (id) => {
      navigate(`/parent-tags/${id}/edit`);
    },
    [navigate]
  );

  const handleManageUsers = useCallback(
    (id) => {
      navigate(`/parent-tags/${id}/users`);
    },
    [navigate]
  );

  const handleDelete = useCallback(
    async (id) => {
      const confirmed = window.confirm("آیا از حذف این تگ مطمئن هستید؟");
      if (!confirmed) return;

      try {
        setLoading(true);
        await deleteParentTag(id);
        await fetchData(meta.page, filters, sort);
      } catch (e) {
        console.error("خطا در حذف تگ", e);
      } finally {
        setLoading(false);
      }
    },
    [meta.page, filters, sort, fetchData]
  );

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        accessorKey: "id",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        id: "name",
        header: "نام تگ",
        accessorKey: "name",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "parent",
        header: "والد",
        accessorKey: "parent_id",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const parentName = getParentName(row.original);
          const parentId =
            row.original?.parent_id ??
            row.original?.parentId ??
            row.original?.parent?.id ??
            row.original?.parent_tag?.id ??
            row.original?.parentTag?.id;

          if (parentName) return parentName;
          if (parentId) return `#${parentId}`;
          return "بدون والد";
        },
      },
      {
        id: "created_at",
        header: "تاریخ ایجاد",
        accessorKey: "created_at",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => formatDateTime(info.getValue()),
      },
      {
        id: "actions",
        header: "عملیات",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const id = row.original.id;

          return (
            <div className="d-flex flex-wrap gap-2">
              <Button color="info" size="sm" onClick={() => handleManageUsers(id)}>
                کاربران/مقادیر
              </Button>

              <Button color="warning" size="sm" onClick={() => handleEdit(id)}>
                ویرایش
              </Button>

              <Button
                color="danger"
                size="sm"
                onClick={() => handleDelete(id)}
                disabled={loading}
              >
                حذف
              </Button>
            </div>
          );
        },
      },
    ],
    [handleEdit, handleDelete, handleManageUsers, loading]
  );

  const handleSortingChange = useCallback(
    (nextSorting) => {
      const allowed = ["id", "name", "created_at"];
      const first = nextSorting?.[0];

      if (first && !allowed.includes(first.id)) {
        return;
      }

      setSorting(nextSorting);

      if (!first) {
        const resetSort = { by: undefined, order: undefined };
        setSort(resetSort);
        fetchData(1, filters, resetSort);
        return;
      }

      const nextSort = {
        by: first.id,
        order: first.desc ? "DESC" : "ASC",
      };
      setSort(nextSort);
      fetchData(1, filters, nextSort);
    },
    [fetchData, filters]
  );

  const handleImportRowChange = (index, field, value) => {
    setImportRows((prev) => {
      const next = [...prev];
      next[index] = { ...(next[index] || {}), [field]: value };
      return next;
    });
  };

  const handleRemoveImportRow = (index) => {
    setImportRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddImportRow = () => {
    const empty = {};
    baseImportColumns.forEach((c) => {
      empty[c] = "";
    });
    setImportRows((prev) => [...prev, empty]);
  };

  const parseExcelFile = useCallback(async (file) => {
    if (!file) return;
    setImportLoading(true);
    setImportError(null);
    setImportResult(null);
    try {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames?.[0];
      if (!sheetName) throw new Error("Sheet not found");
      const sheet = workbook.Sheets[sheetName];
      const rowsRaw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

      let detectedMaxTags = 1;
      const normalized = (rowsRaw || [])
        .map((rowArr) => {
          if (!Array.isArray(rowArr)) return null;
          const username = rowArr[0] ?? "";
          const action = rowArr[1] ?? "";
          const tagValues = rowArr.slice(2);
          detectedMaxTags = Math.max(detectedMaxTags, tagValues.length || 1);
          const obj = {
            username,
            action,
          };
          tagValues.forEach((val, idx) => {
            obj[`tag${idx + 1}`] = val ?? "";
          });
          return obj;
        })
        .filter((row) =>
          row ? Object.values(row).some((v) => String(v).trim() !== "") : false
        );

      setMaxTagColumns(Math.max(1, detectedMaxTags));
      setImportRows(normalized);
      setImportFileName(file.name);
      setImportPreviewPage(1);
      setVirtualRange({ start: 0, end: 40 });
    } catch (err) {
      console.error("خطا در خواندن فایل اکسل", err);
      setImportError("خواندن فایل اکسل ناموفق بود. فرمت را بررسی کنید.");
      setImportRows([]);
      setImportFileName("");
      setMaxTagColumns(3);
    } finally {
      setImportLoading(false);
    }
  }, []);

  const handleImportFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseExcelFile(file);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    setImportError(null);
    setImportResult(null);

    if (!importRows.length) {
      setImportError("ابتدا فایل را لود یا ردیف‌ها را وارد کنید.");
      return;
    }
    if (!importSchoolId) {
      setImportError("شناسه مدرسه الزامی است.");
      return;
    }

    setImportLoading(true);
    setImportUploadProgress(0);
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();
      const sheetData = importRows.map((row) => {
        const obj = {};
        previewColumns.forEach((col) => {
          obj[col] = row?.[col] ?? "";
        });
        return obj;
      });
      const sheet = XLSX.utils.json_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(workbook, sheet, "tags");
      const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const formData = new FormData();
      formData.append("file", blob, importFileName || "parent-tags-import.xlsx");
      formData.append("schoolId", importSchoolId);

      const res = await importParentTagUsers(formData, {
        onUploadProgress: (evt) => {
          const total = evt?.total;
          const loaded = evt?.loaded;
          if (total && total > 0) {
            const percent = Math.min(99, Math.round((loaded / total) * 100));
            setImportUploadProgress(percent);
          } else {
            setImportUploadProgress(null);
          }
        },
      });

      setImportResult(res?.data || res || {});
      setImportRows([]);
      setImportFileName("");
      setImportSchoolId("");
      setImportPreviewPage(1);
      setVirtualRange({ start: 0, end: 40 });
      setImportUploadProgress(100);
      fetchData(meta.page, filters, sort);
    } catch (err) {
      console.error("خطا در ایمپورت تگ‌ها", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "ایمپورت با خطا مواجه شد.";
      setImportError(msg);
    } finally {
      setImportLoading(false);
      setTimeout(() => setImportUploadProgress(null), 1000);
    }
  };

  const handleExport = useCallback(async () => {
    const params = new URLSearchParams();
    params.append("page", "1");
    params.append("limit", String(meta.total && meta.total > 0 ? meta.total : meta.limit));
    if (filters.search) params.append("search", filters.search);
    if (filters.schoolId) params.append("schoolId", filters.schoolId);
    if (filters.parentId) params.append("parentId", filters.parentId);
    if (filters.rootOnly !== "" && filters.rootOnly !== null && typeof filters.rootOnly !== "undefined") {
      params.append("rootOnly", filters.rootOnly);
    }

    const url = `${getApiUrl(API_ROUTES.parentTags.export)}?${params.toString()}`;
    const token = getAccessToken();
    setExportLoading(true);
    setExportProgress(0);
    setExportPhase("pending");
    approxTotalRef.current = null;

    try {
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
        setExportProgress(1);
      }

      const reader = res.body.getReader();
      const chunks = [];
      let loaded = 0;
      const total = approxTotalRef.current || 0;
      const decoder = new TextDecoder("utf-8");
      let carry = "";
      let headerBytes = 0;
      let rowsSeen = 0;
      const perPage = meta.total && meta.total > 0 ? meta.total : meta.limit;

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

          parts.forEach((line) => {
            const trimmed = line.trim();
            if (!trimmed) return;
            if (headerBytes === 0) {
              headerBytes = line.length + 1;
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
            setExportPhase("downloading");
            setExportProgress(Math.min(99, Math.round((loaded / total) * 100)));
          } else if (approx > 0) {
            setExportPhase("downloading");
            setExportProgress(Math.min(99, Math.round((loaded / approx) * 100)));
          } else {
            setExportPhase("pending");
            setExportProgress(null);
          }
        }
      }

      const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
      const csvBlob = new Blob([bom, ...chunks], {
        type: "text/csv;charset=utf-8;",
      });

      const urlObject = window.URL.createObjectURL(csvBlob);
      const link = document.createElement("a");
      link.href = urlObject;
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.setAttribute("download", `parent-tags-${stamp}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(urlObject);
      setExportPhase("finalizing");
      setExportProgress(100);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("خطا در خروجی اکسل", e);
    } finally {
      setExportLoading(false);
      setTimeout(() => {
        setExportProgress(null);
        setExportPhase("idle");
        approxTotalRef.current = null;
      }, 900);
    }
  }, [filters, meta.limit, meta.total]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(importRows.length / importPreviewPageSize));
    if (importPreviewPage > maxPage) {
      setImportPreviewPage(maxPage);
      setVirtualRange({ start: 0, end: 40 });
    }
  }, [importRows.length, importPreviewPage, importPreviewPageSize]);

  useEffect(() => {
    setVirtualRange({ start: 0, end: 40 });
  }, [importPreviewPage, importPreviewPageSize]);

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="تگ‌ها" breadcrumbItem="لیست تگ‌ها" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h4 className="card-title mb-0">ایمپورت اکسل تگ‌ها برای کاربران</h4>
                  <div className="text-muted small mt-1">
                    فایل Excel با ستون‌های: A=نام‌کاربری، B=Action (Append|Replace|Remove)، C به بعد: شناسه/نام تگ.
                    schoolId الزامی است (برای مدیران فقط در صورت داشتن چند مدرسه).
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {importError && (
                  <Alert color="danger" className="mb-3">
                    {importError}
                  </Alert>
                )}
                {importResult && (
                  <Alert color="success" className="mb-3">
                    <div>کل ردیف‌ها: {importResult.totalRows ?? "-"}</div>
                    <div>پردازش شده: {importResult.processedRows ?? "-"}</div>
                    <div>ناموفق: {importResult.failedRows ?? "-"}</div>
                    {Array.isArray(importResult.errors) && importResult.errors.length > 0 && (
                      <div className="mt-2">
                        خطاها:
                        <ul className="mb-0">
                          {importResult.errors.slice(0, 5).map((er, idx) => (
                            <li key={`imp-err-${idx}`}>{typeof er === "string" ? er : JSON.stringify(er)}</li>
                          ))}
                          {importResult.errors.length > 5 ? (
                            <li>... {importResult.errors.length - 5} مورد دیگر</li>
                          ) : null}
                        </ul>
                      </div>
                    )}
                  </Alert>
                )}

                {(importLoading || importUploadProgress !== null) && (
                  <div className="mb-3">
                    <Label className="form-label d-flex justify-content-between">
                      <span>در حال ارسال فایل</span>
                      {importUploadProgress != null ? <span>%{importUploadProgress}</span> : null}
                    </Label>
                    <Progress
                      animated={importUploadProgress === null}
                      striped
                      color="info"
                      value={importUploadProgress ?? 25}
                    />
                  </div>
                )}

                <Form onSubmit={handleImportSubmit}>
                  <Row className="g-3 align-items-end">
                    <Col md="4">
                      <Label className="form-label">فایل اکسل (.xlsx)</Label>
                      <Input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleImportFileChange}
                        disabled={importLoading}
                      />
                      {importFileName ? (
                        <div className="mt-1 text-muted" style={{ fontSize: "0.9rem" }}>
                          {importFileName}
                        </div>
                      ) : null}
                    </Col>
                    <Col md="3">
                      <Label className="form-label">شناسه مدرسه</Label>
                      <Input
                        type="number"
                        value={importSchoolId}
                        onChange={(e) => setImportSchoolId(e.target.value)}
                        placeholder="مثلاً 94"
                        disabled={importLoading}
                      />
                    </Col>
                    <Col md="5">
                      <div className="text-muted small">
                        <strong>راهنما:</strong> Action=Append تگ‌های جدید را اضافه می‌کند (تگ والد در نبود ایجاد می‌شود)،
                        Replace همه تگ‌های قبلی کاربر در همان مدرسه را حذف و جایگزین می‌کند، Remove تمام تگ‌ها را حذف می‌کند.
                      </div>
                    </Col>
                    <Col md="3" className="d-flex gap-2">
                      <Button
                        type="button"
                        color="secondary"
                        outline
                        className="w-100"
                        onClick={handleAddImportRow}
                        disabled={importLoading}
                      >
                        افزودن ردیف دستی
                      </Button>
                      <Button
                        type="button"
                        color="danger"
                        outline
                        className="w-100"
                        onClick={() => setImportRows([])}
                        disabled={importLoading || importRows.length === 0}
                      >
                        پاک‌کردن
                      </Button>
                    </Col>
                  </Row>

                  {importRows.length > 0 && (
                    <div className="table-responsive mt-3">
                      <div className="d-flex flex-wrap justify-content-between align-items-center mb-2 gap-2">
                        <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                          مجموع ردیف‌ها: {importRows.length.toLocaleString("fa-IR")}
                        </div>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                            اندازه صفحه
                          </span>
                          <Input
                            type="number"
                            min="50"
                            max="2000"
                            value={importPreviewPageSize}
                            onChange={(e) =>
                              setImportPreviewPageSize(
                                Math.max(50, Math.min(2000, Number(e.target.value) || 200))
                              )
                            }
                            bsSize="sm"
                            style={{ width: 90 }}
                          />
                          <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                            صفحه
                          </span>
                          <Input
                            type="number"
                            min="1"
                            max={Math.max(1, Math.ceil(importRows.length / importPreviewPageSize))}
                            value={importPreviewPage}
                            onChange={(e) =>
                              setImportPreviewPage(Math.max(1, Number(e.target.value) || 1))
                            }
                            bsSize="sm"
                            style={{ width: 90 }}
                          />
                          <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                            / {Math.max(1, Math.ceil(importRows.length / importPreviewPageSize))}
                          </span>
                        </div>
                      </div>
                      <table className="table table-sm table-bordered align-middle">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: 40 }}>#</th>
                            {previewColumns.map((col) => (
                              <th key={col}>{col}</th>
                            ))}
                            <th style={{ width: 80 }}>حذف</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan={previewColumns.length + 2} style={{ padding: 0 }}>
                              <div
                                style={{ maxHeight: 480, overflowY: "auto" }}
                                onScroll={(e) => {
                                  const scrollTop = e.currentTarget.scrollTop;
                                  const start = Math.max(
                                    0,
                                    Math.floor(scrollTop / ROW_HEIGHT) - VIRTUAL_BUFFER
                                  );
                                  const end = Math.min(
                                    totalPageRows,
                                    start + Math.ceil(480 / ROW_HEIGHT) + VIRTUAL_BUFFER * 2
                                  );
                                  setVirtualRange({ start, end });
                                }}
                              >
                                <table className="table table-sm mb-0">
                                  <tbody>
                                    {visibleStart > 0 && (
                                      <tr style={{ height: visibleStart * ROW_HEIGHT }}>
                                        <td colSpan={previewColumns.length + 2} />
                                      </tr>
                                    )}
                                    {pagedImportRows.slice(visibleStart, visibleEnd).map((row, idx) => {
                                      const absoluteIndex =
                                        (importPreviewPage - 1) * importPreviewPageSize +
                                        visibleStart +
                                        idx;
                                      return (
                                        <tr key={`import-row-${absoluteIndex}`}>
                                          <td style={{ width: 40 }}>{absoluteIndex + 1}</td>
                                          {previewColumns.map((col) => (
                                            <td key={`${absoluteIndex}-${col}`}>
                                              <Input
                                                bsSize="sm"
                                                value={row?.[col] ?? ""}
                                                onChange={(e) =>
                                                  handleImportRowChange(
                                                    absoluteIndex,
                                                    col,
                                                    e.target.value
                                                  )
                                                }
                                                placeholder={col === "action" ? "Append/Replace/Remove" : ""}
                                              />
                                            </td>
                                          ))}
                                          <td style={{ width: 80 }} className="text-center">
                                            <Button
                                              color="danger"
                                              size="sm"
                                              outline
                                              onClick={() => handleRemoveImportRow(absoluteIndex)}
                                              disabled={importLoading}
                                            >
                                              حذف
                                            </Button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                    {visibleEnd < totalPageRows && (
                                      <tr
                                        style={{
                                          height: Math.max(0, totalPageRows - visibleEnd) * ROW_HEIGHT,
                                        }}
                                      >
                                        <td colSpan={previewColumns.length + 2} />
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="d-flex gap-2 mt-3">
                    <Button type="submit" color="primary" disabled={importLoading || importRows.length === 0}>
                      {importLoading ? "در حال ارسال..." : "آپلود و ایمپورت"}
                    </Button>
                    <Button
                      type="button"
                      color="light"
                      onClick={() => {
                        setImportRows([]);
                        setImportFileName("");
                        setImportSchoolId("");
                        setImportResult(null);
                        setImportError(null);
                        setImportPreviewPage(1);
                        setImportUploadProgress(null);
                        setMaxTagColumns(3);
                      }}
                      disabled={importLoading}
                    >
                      پاک‌کردن فرم
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>

          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h4 className="card-title mb-1">تگ‌ها</h4>
                  <p className="text-muted mb-0">
                    مدیریت تگ‌ها و ساختار والد/فرزند
                  </p>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <Button color="success" outline onClick={handleExport} disabled={exportLoading}>
                    {exportLoading ? "در حال دریافت..." : "خروجی CSV"}
                  </Button>
                  {loading && <Spinner size="sm" color="primary" />}
                  <Button color="primary" onClick={handleCreate}>
                    <i className="mdi mdi-plus me-1" />
                    افزودن تگ جدید
                  </Button>
                </div>
              </CardHeader>

              <CardBody>
                <Form className="mb-4" onSubmit={handleSearchSubmit}>
                  <Row className="g-3 align-items-end">
                    <Col xl="3" lg="4" md="6">
                      <Label className="form-label" htmlFor="name">
                        جستجو
                      </Label>
                      <InputGroup>
                        <InputGroupText>
                          <i className="bx bx-purchase-tag-alt" />
                        </InputGroupText>
                        <Input
                          id="search"
                          name="search"
                          value={filters.search}
                          onChange={handleFilterChange}
                          placeholder="نام یا توضیح تگ..."
                        />
                      </InputGroup>
                    </Col>

                    <Col xl="2" lg="4" md="6">
                      <Label className="form-label" htmlFor="schoolId">
                        شناسه مدرسه
                      </Label>
                      <Input
                        id="schoolId"
                        name="schoolId"
                        type="number"
                        value={filters.schoolId}
                        onChange={handleFilterChange}
                        placeholder="مثلاً 94"
                      />
                    </Col>

                    <Col xl="2" lg="4" md="6">
                      <Label className="form-label" htmlFor="parentId">
                        شناسه والد
                      </Label>
                      <Input
                        id="parentId"
                        name="parentId"
                        type="number"
                        value={filters.parentId}
                        onChange={handleFilterChange}
                        placeholder="مثلاً 12"
                      />
                    </Col>

                    <Col xl="2" lg="4" md="6">
                      <Label className="form-label" htmlFor="rootOnly">
                        نوع تگ
                      </Label>
                      <Input
                        id="rootOnly"
                        name="rootOnly"
                        type="select"
                        value={filters.rootOnly}
                        onChange={handleFilterChange}
                      >
                        <option value="">همه</option>
                        <option value="1">فقط بدون والد</option>
                      </Input>
                    </Col>

                    <Col xl="3" lg="4" md="6" className="d-flex gap-2">
                      <Button
                        color="primary"
                        type="submit"
                        className="w-100"
                        disabled={loading}
                      >
                        جستجو
                      </Button>
                      <Button
                        color="light"
                        type="button"
                        className="w-100"
                        onClick={handleResetFilters}
                        disabled={loading}
                      >
                        ریست
                      </Button>
                    </Col>
                  </Row>
                </Form>

                {(exportLoading || exportProgress !== null) && (
                  <div className="mb-3">
                    <Label className="form-label d-flex justify-content-between">
                      <span>در حال دانلود خروجی</span>
                      {exportProgress != null ? <span>%{exportProgress}</span> : null}
                    </Label>
                    <Progress
                      animated={exportProgress === null}
                      striped
                      color="success"
                      value={exportProgress ?? 30}
                    />
                  </div>
                )}

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

export default ParentTagList;
