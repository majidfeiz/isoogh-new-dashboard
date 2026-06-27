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
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { useListState } from "../../hooks/useListState";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";

import { getStudents, deleteStudent, importStudents } from "../../services/studentService.jsx";
import { getSchools } from "../../services/schoolService.jsx";
import { API_ROUTES, getApiUrl } from "../../helpers/apiRoutes.jsx";
import { getAccessToken } from "../../helpers/authStorage.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const StudentList = () => {
  const navigate = useNavigate();
  const auth = useAuth?.();
  document.title = "دانش‌آموزان | داشبورد آیسوق";

  const { saved, saveState } = useListState("students");

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    lastPage: 1,
  });
  const [filters, setFilters] = useState(
    saved?.filters ?? { name: "", username: "", ssn: "", tag: "", tagId: "" }
  );
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);
  const [sorting, setSorting] = useState(saved?.sorting ?? [{ id: "id", desc: true }]);
  const [sort, setSort] = useState(saved?.sort ?? { by: "id", order: "DESC" });
  const initialPageRef = useRef(saved?.page ?? 1);
  const approxTotalRef = useRef(null);
  const [importRows, setImportRows] = useState([]);
  const [importFileName, setImportFileName] = useState("");
  const [importSchoolId, setImportSchoolId] = useState("");
  const [importDefaultPassword, setImportDefaultPassword] = useState("");
  const [importError, setImportError] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importPreviewPage, setImportPreviewPage] = useState(1);
  const [importPreviewPageSize, setImportPreviewPageSize] = useState(200);
  const [virtualRange, setVirtualRange] = useState({ start: 0, end: 40 });
  const [importUploadProgress, setImportUploadProgress] = useState(null);
  const [schools, setSchools] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const ROW_HEIGHT = 44;
  const VIRTUAL_BUFFER = 10;
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [tagModalTitle, setTagModalTitle] = useState("");
  const [tagModalItems, setTagModalItems] = useState([]);

  const pagedImportRows = useMemo(() => {
    const start = (importPreviewPage - 1) * importPreviewPageSize;
    return importRows.slice(start, start + importPreviewPageSize);
  }, [importRows, importPreviewPage, importPreviewPageSize]);

  const totalPageRows = pagedImportRows.length;
  const visibleStart = Math.min(virtualRange.start, Math.max(0, totalPageRows));
  const visibleEnd = Math.min(totalPageRows, virtualRange.end);

  const baseImportColumns = useMemo(
    () => [
      "username",
      "name",
      "password",
      "phone",
      "ssn",
      "email",
      "birthday",
      "point",
      "phone_2",
      "phone_3",
      "shift",
      "city",
      "province",
      "region",
      "institute_type",
      "institute_name",
      "gpa",
      "emergency_phone",
      "village",
      "religion",
      "relationship",
      "group_id",
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

  const managedSchools = isAdminLike ? [] : schools;
  const managerAutoSchool = !isAdminLike && managedSchools.length === 1 ? managedSchools[0] : null;
  const needsSchoolSelect = isAdminLike || managedSchools.length > 1;

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
          tag: currentFilters.tag,
          tagId: currentFilters.tagId,
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
    const page = initialPageRef.current;
    initialPageRef.current = 1;
    fetchData(page, filters, sort);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, sort]);

  useEffect(() => {
    if (!auth?.user) return;
    const loadSchools = async () => {
      setSchoolsLoading(true);
      try {
        if (isAdminLike) {
          const res = await getSchools({ limit: 500, sortBy: "name", sortOrder: "ASC" });
          setSchools(res.items || []);
        } else {
          const userId = auth.user.id;
          if (userId) {
            const res = await getSchools({ managerId: userId, limit: 200 });
            setSchools(res.items || []);
          }
        }
      } catch (e) {
        console.error("خطا در دریافت مجموعه‌ها", e);
      } finally {
        setSchoolsLoading(false);
      }
    };
    loadSchools();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminLike, auth?.user?.id]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    saveState({ page: 1, filters, sort, sorting });
    fetchData(1, filters, sort);
  };

  const handleResetFilters = () => {
    const reset = { name: "", username: "", ssn: "", tag: "", tagId: "" };
    setFilters(reset);
    saveState({ page: 1, filters: reset, sort, sorting });
    fetchData(1, reset, sort);
  };

  const handlePageChange = (page) => {
    saveState({ page, filters, sort, sorting });
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
      if (filters.tag) params.append("tag", filters.tag);
      if (filters.tagId) params.append("tagId", filters.tagId);

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
      setImportResult(null);
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

  const handleDownloadSample = async () => {
    const XLSX = await import("xlsx")
    const sampleRows = [
      {
        username: "09123456789", name: "علی احمدی", password: "Pass1234",
        phone: "09123456789", ssn: "1234567890", email: "ali@example.com",
        birthday: "1385/01/01", point: "", phone_2: "", phone_3: "",
        shift: "", city: "تهران", province: "تهران", region: "",
        institute_type: "", institute_name: "", gpa: "", emergency_phone: "",
        village: "", religion: "", relationship: "", group_id: "",
        voip_phone: "", work_shift_id: "",
      },
      {
        username: "09198765432", name: "زهرا حسینی", password: "Pass5678",
        phone: "09198765432", ssn: "0987654321", email: "zahra@example.com",
        birthday: "1386/06/15", point: "", phone_2: "", phone_3: "",
        shift: "", city: "اصفهان", province: "اصفهان", region: "",
        institute_type: "", institute_name: "", gpa: "", emergency_phone: "",
        village: "", religion: "", relationship: "", group_id: "",
        voip_phone: "", work_shift_id: "",
      },
    ]
    const ws = XLSX.utils.json_to_sheet(sampleRows)
    ws["!cols"] = Object.keys(sampleRows[0]).map((k) => ({ wch: Math.max(k.length + 2, 14) }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "students")
    XLSX.writeFile(wb, "students-import-sample.xlsx")
  }

  const handleImportFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setImportError("حجم فایل نباید بیشتر از ۱۵ مگابایت باشد.");
      e.target.value = "";
      return;
    }
    setImportError(null);
    setImportResult(null);
    parseExcelFile(file);
  };

  const handleUploadImport = async () => {
    if (!importRows.length) {
      setImportError("هیچ داده‌ای برای ارسال وجود ندارد.");
      return;
    }

    if (needsSchoolSelect && !importSchoolId) {
      setImportError("انتخاب مجموعه الزامی است.");
      return;
    }

    setImportLoading(true);
    setImportError(null);
    setImportResult(null);
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
      const effectiveSchoolId = importSchoolId || (managerAutoSchool ? String(managerAutoSchool.id) : null);
      if (effectiveSchoolId) {
        formData.append("schoolId", effectiveSchoolId);
      }
      if (importDefaultPassword) {
        formData.append("defaultPassword", importDefaultPassword);
      }

      const raw = await importStudents(formData, {
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
      const result = raw?.logId != null ? raw : (raw?.data ?? raw ?? {});
      setImportResult(result);
      setImportRows([]);
      setImportFileName("");
      setImportSchoolId("");
      setImportDefaultPassword("");
      setImportPreviewPage(1);
      setVirtualRange({ start: 0, end: 40 });
      setImportUploadProgress(100);
    } catch (err) {
      console.error("خطا در ارسال ایمپورت", err);
      const serverMsg = err?.response?.data?.message || err?.response?.data?.errorMessage;
      setImportError(serverMsg || "ارسال ایمپورت ناموفق بود. دوباره تلاش کنید.");
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

  const handleShowTags = useCallback((student) => {
    const tags = Array.isArray(student?.tags) ? student.tags : [];
    setTagModalItems(tags);
    const title =
      student?.name ||
      student?.user?.name ||
      student?.username ||
      student?.user?.username ||
      `دانش‌آموز #${student?.id ?? ""}`;
    setTagModalTitle(title);
    setTagModalOpen(true);
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
        header: "مجموعه‌ها",
        accessorKey: "schools",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => renderSchools(info.getValue()),
      },
      {
        id: "tags",
        header: "تگ‌ها",
        accessorKey: "tags",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const tags = row.original?.tags || [];
          if (!Array.isArray(tags) || tags.length === 0) return "-";

          const maxInline = 3;
          const inline = tags.slice(0, maxInline);
          const remaining = tags.length - inline.length;

          return (
            <div className="d-flex flex-wrap gap-1">
              {inline.map((t) => (
                <Badge key={t.id || t.name} color="info" pill className="px-2">
                  <span className="text-truncate" style={{ maxWidth: 140, display: "inline-block" }}>
                    {t.name || t.title || t.id}
                  </span>
                </Badge>
              ))}
              {remaining > 0 && (
                <Button
                  size="sm"
                  color="light"
                  className="px-2 py-0"
                  onClick={() => handleShowTags(row.original)}
                >
                  +{remaining} بیشتر
                </Button>
              )}
              {remaining <= 0 && tags.length > maxInline && (
                <Button
                  size="sm"
                  color="light"
                  className="px-2 py-0"
                  onClick={() => handleShowTags(row.original)}
                >
                  همه
                </Button>
              )}
            </div>
          );
        },
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
    [handleEdit, handleDelete, renderSchools, handleShowTags]
  );

  const handleSortingChange = useCallback(
    (nextSorting) => {
      const allowed = ["id", "name"];
      const first = nextSorting?.[0];

      if (first && !allowed.includes(first.id)) {
        return;
      }

      setSorting(nextSorting);

      if (!first) {
        const resetSort = { by: undefined, order: undefined };
        setSort(resetSort);
        saveState({ page: 1, filters, sort: resetSort, sorting: nextSorting });
        fetchData(1, filters, resetSort);
        return;
      }

      const nextSort = {
        by: first.id,
        order: first.desc ? "DESC" : "ASC",
      };
      setSort(nextSort);
      saveState({ page: 1, filters, sort: nextSort, sorting: nextSorting });
      fetchData(1, filters, nextSort);
    },
    [fetchData, filters, saveState]
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
                <Button color="secondary" outline size="sm" onClick={handleDownloadSample}>
                  <i className="bx bx-download me-1" />
                  دانلود فایل نمونه
                </Button>
              </CardHeader>
              <CardBody>
                <Alert color="info" className="mb-4 py-2 small border-0" style={{ background: "rgba(var(--bs-info-rgb), 0.08)" }}>
                  <div className="mb-1">
                    <strong>ستون‌های پشتیبانی‌شده:</strong>{" "}
                    <span className="text-muted">
                      username (الزامی)، name، password، phone، ssn، email، birthday، point، phone_2، phone_3، shift، city، province، region، institute_type، institute_name، gpa، emergency_phone، village، religion، relationship، group_id، voip_phone، work_shift_id
                    </span>
                  </div>
                  <div className="text-muted">
                    ستون <code>code</code> خودکار از username ساخته می‌شود — نیازی به وارد کردن ندارد. حجم فایل: حداکثر ۱۵ مگابایت.
                  </div>
                </Alert>

                {importError && (
                  <Alert color="danger" className="mb-3">
                    {importError}
                  </Alert>
                )}

                {importResult && (
                  <Alert
                    color={
                      importResult.status === "failed"
                        ? "danger"
                        : importResult.failedRows > 0
                        ? "warning"
                        : "success"
                    }
                    className="mb-3"
                  >
                    <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                      <i
                        className={`bx ${importResult.status === "failed" ? "bx-x-circle" : importResult.failedRows > 0 ? "bx-error" : "bx-check-circle"} fs-5`}
                      />
                      <strong>
                        {importResult.status === "failed"
                          ? "ایمپورت ناموفق بود"
                          : importResult.failedRows > 0
                          ? "ایمپورت با خطاهای جزئی انجام شد"
                          : "ایمپورت با موفقیت انجام شد"}
                      </strong>
                      {importResult.logId != null && (
                        <span className="text-muted small">شناسه لاگ: {importResult.logId}</span>
                      )}
                    </div>
                    <div className="d-flex gap-4 flex-wrap">
                      {importResult.totalRows != null && (
                        <span>
                          <span className="text-muted small d-block">کل ردیف‌ها</span>
                          <strong>{importResult.totalRows.toLocaleString("fa-IR")}</strong>
                        </span>
                      )}
                      {importResult.processedRows != null && (
                        <span>
                          <span className="text-muted small d-block">پردازش موفق</span>
                          <strong className="text-success">{importResult.processedRows.toLocaleString("fa-IR")}</strong>
                        </span>
                      )}
                      {importResult.failedRows > 0 && (
                        <span>
                          <span className="text-muted small d-block">ناموفق</span>
                          <strong className="text-danger">{importResult.failedRows.toLocaleString("fa-IR")}</strong>
                        </span>
                      )}
                    </div>
                    {importResult.errorMessage && (
                      <div className="mt-2 small text-muted">{importResult.errorMessage}</div>
                    )}
                  </Alert>
                )}

                {(importLoading || importUploadProgress !== null) && (
                  <div className="mb-3">
                    <Label className="form-label d-flex justify-content-between">
                      <span>
                        {importUploadProgress !== null
                          ? "در حال آپلود فایل..."
                          : "در حال خواندن فایل..."}
                      </span>
                      {importUploadProgress != null ? <span>%{importUploadProgress}</span> : null}
                    </Label>
                    <Progress
                      animated={importUploadProgress === null}
                      striped
                      color="primary"
                      value={importUploadProgress ?? 50}
                    />
                  </div>
                )}

                <Row className="g-3 align-items-end mb-4">
                  <Col md="4">
                    <Label className="form-label">فایل اکسل (.xlsx)</Label>
                    <Input
                      type="file"
                      accept=".xlsx"
                      onChange={handleImportFileChange}
                      disabled={importLoading}
                    />
                    {importFileName && (
                      <div className="mt-1 text-muted" style={{ fontSize: "0.85rem" }}>
                        <i className="bx bx-file me-1" />
                        {importFileName}
                        {importRows.length > 0 && (
                          <span className="ms-2 badge bg-secondary rounded-pill">
                            {importRows.length.toLocaleString("fa-IR")} ردیف
                          </span>
                        )}
                      </div>
                    )}
                  </Col>

                  <Col md="3">
                    <Label className="form-label">رمز عبور پیش‌فرض</Label>
                    <Input
                      type="text"
                      value={importDefaultPassword}
                      onChange={(e) => setImportDefaultPassword(e.target.value)}
                      placeholder="اختیاری — حداقل ۶ کاراکتر"
                      disabled={importLoading}
                    />
                  </Col>

                  {needsSchoolSelect && (
                    <Col md="3">
                      <Label className="form-label">
                        مجموعه{" "}
                        <span className="text-danger fw-bold">*</span>
                      </Label>
                      <Input
                        type="select"
                        value={importSchoolId}
                        onChange={(e) => setImportSchoolId(e.target.value)}
                        disabled={importLoading || schoolsLoading}
                      >
                        <option value="">
                          {schoolsLoading ? "در حال بارگذاری..." : "انتخاب مجموعه..."}
                        </option>
                        {schools.map((s) => (
                          <option key={s.id} value={String(s.id)}>
                            {s.name || s.title || `مجموعه ${s.id}`}
                          </option>
                        ))}
                      </Input>
                    </Col>
                  )}

                  {managerAutoSchool && (
                    <Col md="3">
                      <Label className="form-label">مجموعه</Label>
                      <div
                        className="border rounded px-3 py-2"
                        style={{ background: "rgba(var(--bs-success-rgb), 0.06)", fontSize: "0.9rem", minHeight: 38, display: "flex", flexDirection: "column", justifyContent: "center" }}
                      >
                        <div>
                          <i className="bx bxs-school me-1 text-success" />
                          <strong>{managerAutoSchool.name || managerAutoSchool.title || `مجموعه ${managerAutoSchool.id}`}</strong>
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.78rem" }}>خودکار انتخاب می‌شود</div>
                      </div>
                    </Col>
                  )}

                  <Col md={needsSchoolSelect || managerAutoSchool ? 2 : 5} className="d-flex gap-2 align-items-end">
                    <Button
                      color="secondary"
                      outline
                      onClick={handleAddImportRow}
                      disabled={importLoading}
                      title="افزودن ردیف دستی"
                    >
                      <i className="bx bx-plus me-1" />
                      ردیف دستی
                    </Button>
                    <Button
                      color="danger"
                      outline
                      onClick={() => {
                        setImportRows([])
                        setImportFileName("")
                        setImportResult(null)
                      }}
                      disabled={importLoading || importRows.length === 0}
                      title="پاک‌کردن داده‌ها"
                    >
                      <i className="bx bx-trash me-1" />
                      پاک‌کردن
                    </Button>
                  </Col>
                </Row>

                {importRows.length > 0 && (
                  <div className="table-responsive mb-3">
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-2 gap-2">
                      <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                        مجموع ردیف‌ها:{" "}
                        <strong className="text-dark">{importRows.length.toLocaleString("fa-IR")}</strong>
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

                <div className="d-flex justify-content-between align-items-center mt-2">
                  <div className="text-muted small">
                    {importRows.length > 0 && !importLoading && (
                      <span>
                        <i className="bx bx-info-circle me-1" />
                        {importRows.length.toLocaleString("fa-IR")} ردیف آماده آپلود
                      </span>
                    )}
                  </div>
                  <Button
                    color="primary"
                    onClick={handleUploadImport}
                    disabled={importLoading || importRows.length === 0}
                  >
                    {importLoading ? (
                      <>
                        <i className="bx bx-loader-alt bx-spin me-1" />
                        در حال ارسال...
                      </>
                    ) : (
                      <>
                        <i className="bx bx-upload me-1" />
                        آپلود و ایمپورت
                      </>
                    )}
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
                      <Label className="form-label">نام تگ (جستجوی جزئی)</Label>
                      <InputGroup>
                        <InputGroupText>
                          <i className="bx bx-purchase-tag-alt" />
                        </InputGroupText>
                        <Input
                          type="text"
                          name="tag"
                          value={filters.tag}
                          onChange={handleFilterChange}
                          placeholder="مثلاً پایه نهم ..."
                        />
                      </InputGroup>
                    </Col>

                    <Col xl="3" lg="4" md="6">
                      <Label className="form-label">شناسه تگ (parent_tags.id)</Label>
                      <Input
                        type="number"
                        name="tagId"
                        value={filters.tagId}
                        onChange={handleFilterChange}
                        placeholder="مثلاً 565"
                      />
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

      <Modal isOpen={tagModalOpen} toggle={() => setTagModalOpen(false)} size="lg" centered>
        <ModalHeader toggle={() => setTagModalOpen(false)}>
          تگ‌های {tagModalTitle}
        </ModalHeader>
        <ModalBody>
          {tagModalItems.length === 0 ? (
            <div className="text-muted">تگی ثبت نشده است.</div>
          ) : (
            <div className="d-flex flex-wrap gap-2">
              {tagModalItems.map((t) => (
                <Badge key={t.id || t.name} color="info" pill className="px-3 py-2">
                  <div className="fw-semibold">{t.name || t.title || t.id}</div>
                  <div className="text-muted small">
                    {t.school_id ? `مجموعه: ${t.school_id}` : ""}
                    {t.parent_id ? ` | والد: ${t.parent_id}` : ""}
                  </div>
                </Badge>
              ))}
            </div>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default StudentList;
