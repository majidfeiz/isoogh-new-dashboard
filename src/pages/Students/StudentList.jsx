// src/pages/Students/StudentList.jsx
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
  Progress,
  Alert,
} from "reactstrap";
import { useNavigate } from "react-router-dom";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";

import { getStudents, deleteStudent, importStudents } from "../../services/studentService.jsx";
import { API_ROUTES, getApiUrl } from "../../helpers/apiRoutes.jsx";
import { getAccessToken } from "../../helpers/authStorage.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const StudentList = () => {
  const navigate = useNavigate();
  const auth = useAuth?.();
  document.title = "دانش‌آموزان | داشبورد آیسوق";

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    lastPage: 1,
  });
  const [filters, setFilters] = useState({
    name: "",
    username: "",
    ssn: "",
  });
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [sort, setSort] = useState({ by: "id", order: "DESC" });
  const approxTotalRef = useRef(null);
  const [importRows, setImportRows] = useState([]);
  const [importFileName, setImportFileName] = useState("");
  const [importSchoolId, setImportSchoolId] = useState("");
  const [importDefaultPassword, setImportDefaultPassword] = useState("");
  const [importError, setImportError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importPreviewPage, setImportPreviewPage] = useState(1);
  const [importPreviewPageSize, setImportPreviewPageSize] = useState(200);
  const [virtualRange, setVirtualRange] = useState({ start: 0, end: 40 });
  const [importUploadProgress, setImportUploadProgress] = useState(null);
  const ROW_HEIGHT = 44;
  const VIRTUAL_BUFFER = 10;

  const pagedImportRows = useMemo(() => {
    const start = (importPreviewPage - 1) * importPreviewPageSize;
    return importRows.slice(start, start + importPreviewPageSize);
  }, [importRows, importPreviewPage, importPreviewPageSize]);

  const totalPageRows = pagedImportRows.length;
  const visibleStart = Math.min(virtualRange.start, Math.max(0, totalPageRows));
  const visibleEnd = Math.min(totalPageRows, virtualRange.end);

  const baseImportColumns = useMemo(
    () => [
      "code",
      "name",
      "username",
      "ssn",
      "phone",
      "email",
      "password",
      "user_id",
      "birthday",
      "phone_2",
      "phone_3",
      "voip_phone",
      "work_shift_id",
    ],
    []
  );

  const isAdminLike = useMemo(() => {
    const roles = auth?.user?.roles || [];
    return roles.some((r) => {
      const name = (r?.name || r?.label || "").toLowerCase();
      return ["admin", "super_admin", "super-admin", "super admin"].includes(name);
    });
  }, [auth]);

  const previewColumns = useMemo(() => {
    const keys = new Set(baseImportColumns);
    importRows.forEach((row) => {
      Object.keys(row || {}).forEach((k) => keys.add(k));
    });
    return Array.from(keys);
  }, [baseImportColumns, importRows]);

  const buildSearchQuery = useCallback((currentFilters) => {
    const values = [
      currentFilters?.name,
      currentFilters?.username,
      currentFilters?.ssn,
    ]
      .filter(Boolean)
      .map((v) => v.trim())
      .filter(Boolean);
    return values.join(" ").trim();
  }, []);

  const fetchData = useCallback(
    async (page = 1, currentFilters = {}, currentSort = sort) => {
      setLoading(true);
      try {
        const searchQuery = buildSearchQuery(currentFilters);
        const res = await getStudents({
          page,
          limit: meta.limit,
          search: searchQuery,
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
        console.error("خطا در دریافت دانش‌آموزان", e);
        setData([]);
        setMeta((prev) => ({ ...prev, total: 0 }));
      } finally {
        setLoading(false);
      }
    },
    [meta.limit, sort, buildSearchQuery]
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
    const reset = { name: "", username: "", ssn: "" };
    setFilters(reset);
    fetchData(1, reset, sort);
  };

  const handlePageChange = (page) => {
    fetchData(page, filters, sort);
  };

  const handleExport = async () => {
    const searchQuery = buildSearchQuery(filters);
    const limit = meta?.total && meta.total > 0 ? meta.total : meta.limit || 200;

    setExportLoading(true);
    setExportProgress(0);
    approxTotalRef.current = null;
    try {
      const params = new URLSearchParams();
      params.append("page", "1");
      params.append("limit", String(limit));
      if (sort?.by) params.append("sortBy", sort.by);
      if (sort?.order) params.append("sortOrder", sort.order);
      if (searchQuery) params.append("search", searchQuery);

      const url = `${getApiUrl(API_ROUTES.students.export)}?${params.toString()}`;
      const token = getAccessToken();
      const res = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok || !res.body) {
        const txt = await res.text();
        throw new Error(txt || "خطا در خروجی گرفتن دانش‌آموزان");
      }

      const approxHeader =
        res.headers.get("X-Approx-Content-Length") ||
        res.headers.get("x-approx-content-length") ||
        res.headers.get("Content-Length");
      const approxTotal = approxHeader ? Number(approxHeader) : 0;
      if (approxTotal > 0) {
        approxTotalRef.current = approxTotal;
        setExportProgress(1);
      }

      const reader = res.body.getReader();
      const chunks = [];
      let loaded = 0;
      let headerBytes = 0;
      let rowsSeen = 0;
      const decoder = new TextDecoder("utf-8");
      let carry = "";

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
                    ((loaded - headerBytes) / Math.max(rowsSeen, 1)) * limit
                )
              : 0);

          if (approx > 0) {
            const percent = Math.min(99, Math.round((loaded / approx) * 100));
            setExportProgress(percent);
          } else {
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
      const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15);
      link.setAttribute("download", `students-${stamp}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(urlObject);
      setExportProgress(100);
    } catch (e) {
      console.error("خطا در خروجی گرفتن دانش‌آموزان", e);
    } finally {
      setTimeout(() => {
        setExportProgress(null);
        approxTotalRef.current = null;
      }, 1000);
      setExportLoading(false);
    }
  };

  const handleCreateClick = () => {
    navigate("/students/create");
  };

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
    const emptyRow = {};
    baseImportColumns.forEach((col) => {
      emptyRow[col] = "";
    });
    setImportRows((prev) => [...prev, emptyRow]);
  };

  const parseExcelFile = useCallback(
    async (file) => {
      if (!file) return;
      setImportLoading(true);
      setImportError(null);
      setImportSuccess(null);
      try {
        const XLSX = await import("xlsx");
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames?.[0];
        if (!sheetName) throw new Error("Sheet not found");
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        setImportRows(rows);
        setImportFileName(file.name);
        setImportPreviewPage(1);
        setVirtualRange({ start: 0, end: 40 });
      } catch (err) {
        console.error("خطا در خواندن فایل اکسل", err);
        setImportError("خواندن فایل اکسل ناموفق بود. فرمت را بررسی کنید.");
        setImportRows([]);
        setImportFileName("");
      } finally {
        setImportLoading(false);
      }
    },
    []
  );

  const handleImportFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseExcelFile(file);
  };

  const handleUploadImport = async () => {
    if (!importRows.length) {
      setImportError("هیچ داده‌ای برای ارسال وجود ندارد.");
      return;
    }

    if (isAdminLike && !importSchoolId) {
      setImportError("برای ادمین وارد کردن schoolId الزامی است.");
      return;
    }

    setImportLoading(true);
    setImportError(null);
    setImportSuccess(null);
    setImportUploadProgress(0);
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();
      const sheet = XLSX.utils.json_to_sheet(importRows);
      XLSX.utils.book_append_sheet(workbook, sheet, "students");
      const wbout = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const formData = new FormData();
      formData.append("file", blob, importFileName || "students-import.xlsx");
      if (isAdminLike && importSchoolId) {
        formData.append("schoolId", importSchoolId);
      }
      if (importDefaultPassword) {
        formData.append("defaultPassword", importDefaultPassword);
      }

      await importStudents(formData, {
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
      setImportSuccess("ایمپورت با موفقیت ارسال شد. پردازش در بک‌اند انجام می‌شود.");
      setImportRows([]);
      setImportFileName("");
      setImportSchoolId("");
      setImportDefaultPassword("");
      setImportPreviewPage(1);
      setVirtualRange({ start: 0, end: 40 });
      setImportUploadProgress(100);
    } catch (err) {
      console.error("خطا در ارسال ایمپورت", err);
      setImportError("ارسال ایمپورت ناموفق بود. دوباره تلاش کنید.");
    } finally {
      setImportLoading(false);
      setTimeout(() => setImportUploadProgress(null), 1000);
    }
  };

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

  const handleEdit = useCallback(
    (id) => {
      navigate(`/students/${id}/edit`);
    },
    [navigate]
  );

  const handleDelete = useCallback(
    async (id) => {
      const confirmed = window.confirm("آیا از حذف این دانش‌آموز مطمئن هستید؟");
      if (!confirmed) return;

      try {
        setLoading(true);
        await deleteStudent(id);
        await fetchData(meta.page, filters, sort);
      } catch (e) {
        console.error("خطا در حذف دانش‌آموز", e);
      } finally {
        setLoading(false);
      }
    },
    [meta.page, filters, sort, fetchData]
  );

  const renderSchools = useCallback((schools) => {
    if (!Array.isArray(schools) || schools.length === 0) return "-";
    const names = schools
      .map((s) => s?.name || s?.code || s?.id)
      .filter(Boolean);
    return names.length > 0 ? names.join("، ") : "-";
  }, []);

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
        id: "code",
        header: "کد",
        accessorKey: "code",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "name",
        header: "نام",
        accessorKey: "name",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => info.getValue() || info.row.original?.user?.name || "-",
      },
      {
        id: "username",
        header: "نام کاربری",
        accessorKey: "username",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) =>
          info.getValue() || info.row.original?.user?.username || "-",
      },
      {
        id: "ssn",
        header: "کد ملی",
        accessorKey: "ssn",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || info.row.original?.user?.ssn || "-",
      },
      {
        id: "user_id",
        header: "شناسه کاربر",
        accessorKey: "user_id",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "work_shift_id",
        header: "شیفت",
        accessorKey: "work_shift_id",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        id: "schools",
        header: "مدارس",
        accessorKey: "schools",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => renderSchools(info.getValue()),
      },
      {
        id: "actions",
        header: "عملیات",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const id = row.original.id;

          return (
            <div className="d-flex gap-2">
              <Button
                color="warning"
                size="sm"
                onClick={() => handleEdit(id)}
              >
                ویرایش
              </Button>

              <Button
                color="danger"
                size="sm"
                onClick={() => handleDelete(id)}
              >
                حذف
              </Button>
            </div>
          );
        },
      },
    ],
    [handleEdit, handleDelete, renderSchools]
  );

  const handleSortingChange = useCallback(
    (nextSorting) => {
      const allowed = [
        "id",
        "name",
      ];
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

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="مدیریت دانش‌آموزان" breadcrumbItem="دانش‌آموزان" />

        <Row className="mb-4">
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <h4 className="card-title mb-0">ایمپورت اکسل دانش‌آموزان</h4>
                <div className="text-muted small">
                  هدرهای قابل قبول: code, name, username, password, phone, ssn, email, user_id, birthday و سایر فیلدهای سند.
                </div>
              </CardHeader>
              <CardBody>
                {importError && (
                  <Alert color="danger" className="mb-3">
                    {importError}
                  </Alert>
                )}
                {importSuccess && (
                  <Alert color="success" className="mb-3">
                    {importSuccess}
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
                      value={importUploadProgress ?? 35}
                    />
                  </div>
                )}

                <Row className="g-3 align-items-end mb-3">
                  <Col md="4">
                    <Label className="form-label">فایل اکسل (.xlsx)</Label>
                    <Input
                      type="file"
                      accept=".xlsx"
                      onChange={handleImportFileChange}
                      disabled={importLoading}
                    />
                    {importFileName ? (
                      <div className="mt-1 text-muted" style={{ fontSize: "0.85rem" }}>
                        {importFileName}
                      </div>
                    ) : null}
                  </Col>

                  <Col md="3">
                    <Label className="form-label">رمز عبور پیش‌فرض (اختیاری)</Label>
                    <Input
                      type="text"
                      value={importDefaultPassword}
                      onChange={(e) => setImportDefaultPassword(e.target.value)}
                      placeholder="در صورت خالی، از فایل خوانده می‌شود"
                      disabled={importLoading}
                    />
                  </Col>

                  {isAdminLike && (
                    <Col md="3">
                      <Label className="form-label">شناسه مدرسه (Admins لازم است)</Label>
                      <Input
                        type="number"
                        value={importSchoolId}
                        onChange={(e) => setImportSchoolId(e.target.value)}
                        placeholder="مثلاً 146"
                        disabled={importLoading}
                      />
                    </Col>
                  )}

                  <Col md="2" className="d-flex gap-2">
                    <Button
                      color="secondary"
                      outline
                      className="w-100"
                      onClick={handleAddImportRow}
                      disabled={importLoading}
                    >
                      افزودن ردیف دستی
                    </Button>
                    <Button
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

                {importLoading && (
                  <div className="mb-3">
                    <Progress animated color="info" value={80} />
                  </div>
                )}

                {importRows.length > 0 && (
                  <div className="table-responsive mb-3">
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
                          max={Math.max(
                            1,
                            Math.ceil(importRows.length / importPreviewPageSize)
                          )}
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
                                  {pagedImportRows
                                    .slice(visibleStart, visibleEnd)
                                    .map((row, idx) => {
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

                <div className="d-flex justify-content-end gap-2">
                  <Button
                    color="primary"
                    onClick={handleUploadImport}
                    disabled={importLoading || importRows.length === 0}
                  >
                    {importLoading ? "در حال ارسال..." : "آپلود و ایمپورت"}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <h4 className="card-title mb-0">لیست دانش‌آموزان</h4>
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    color="success"
                    outline
                    onClick={handleExport}
                    disabled={exportLoading}
                  >
                    {exportLoading ? "در حال دریافت..." : "خروجی CSV"}
                  </Button>
                  <Button
                    color="primary"
                    onClick={handleCreateClick}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    + دانش‌آموز جدید
                  </Button>
                </div>
              </CardHeader>

              <CardBody>
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

                <Form onSubmit={handleSearchSubmit} className="mb-3">
                  <Row className="g-2 align-items-end">
                    <Col xl="3" lg="4" md="6">
                      <Label className="form-label">نام</Label>
                      <InputGroup>
                        <InputGroupText>
                          <i className="mdi mdi-account" />
                        </InputGroupText>
                        <Input
                          type="text"
                          name="name"
                          value={filters.name}
                          onChange={handleFilterChange}
                          placeholder="مثلاً زهرا داداشی"
                        />
                      </InputGroup>
                    </Col>

                    <Col xl="3" lg="4" md="6">
                      <Label className="form-label">نام کاربری</Label>
                      <InputGroup>
                        <InputGroupText>
                          <i className="mdi mdi-account-circle-outline" />
                        </InputGroupText>
                        <Input
                          type="text"
                          name="username"
                          value={filters.username}
                          onChange={handleFilterChange}
                          placeholder="مثلاً 24880680176"
                        />
                      </InputGroup>
                    </Col>

                    <Col xl="3" lg="4" md="6">
                      <Label className="form-label">کد ملی</Label>
                      <InputGroup>
                        <InputGroupText>
                          <i className="mdi mdi-card-account-details-outline" />
                        </InputGroupText>
                        <Input
                          type="text"
                          name="ssn"
                          value={filters.ssn}
                          onChange={handleFilterChange}
                          placeholder="مثلاً 1234567890"
                        />
                      </InputGroup>
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

export default StudentList;
