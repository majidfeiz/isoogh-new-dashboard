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
  InputGroup,
  InputGroupText,
  Label,
  Row,
  Spinner,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { useListState } from "../../hooks/useListState";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";
import { deleteFile, getFiles } from "../../services/fileService.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("fa-IR");
};

const formatSize = (raw) => {
  const bytes = Number(raw);
  if (!raw || !Number.isFinite(bytes) || bytes <= 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const resolveFileUrl = (file) => {
  if (file?.arvan_status === 1 && file?.arvan_url) return file.arvan_url;
  return file?.url || "";
};

const FILEABLE_TYPE_OPTIONS = [
  { value: "", label: "همه انواع" },
  { value: "App\\Models\\VoipCallHistory", label: "تاریخچه تماس VoIP" },
];

const STATUS_OPTIONS = [
  { value: "", label: "همه وضعیت‌ها" },
  { value: "1", label: "فعال" },
  { value: "0", label: "غیرفعال" },
];

const SORTABLE_COLUMNS = [
  "id", "code", "name", "fileable_type", "fileable_id",
  "status", "arvan_status", "s3_status", "used_count",
  "file_checked", "created_at", "updated_at",
];

const FileList = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  document.title = "فایل‌ها | داشبورد آیسوق";

  const canShow = hasPermission("files.show");

  const { saved, saveState } = useListState("files");

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, lastPage: 1 });
  const [filters, setFilters] = useState(
    saved?.filters ?? { search: "", fileable_type: "", fileable_id: "", status: "" }
  );
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState(saved?.sorting ?? [{ id: "id", desc: true }]);
  const [sort, setSort] = useState(saved?.sort ?? { by: "id", order: "DESC" });
  const initialPageRef = useRef(saved?.page ?? 1);

  const fetchData = useCallback(
    async (page = 1, currentFilters = {}, currentSort = sort) => {
      setLoading(true);
      try {
        const res = await getFiles({
          page,
          limit: meta.limit,
          search: currentFilters.search,
          fileable_type: currentFilters.fileable_type,
          fileable_id: currentFilters.fileable_id,
          status: currentFilters.status,
          sortBy: currentSort?.by,
          sortOrder: currentSort?.order,
        });
        setData(res.items || []);
        setMeta(res.pagination || { page, limit: meta.limit, total: 0, lastPage: 1 });
      } catch (e) {
        console.error("خطا در دریافت فایل‌ها", e);
        setData([]);
        setMeta((prev) => ({ ...prev, total: 0, lastPage: 1 }));
      } finally {
        setLoading(false);
      }
    },
    [meta.limit, sort]
  );

  useEffect(() => {
    const page = initialPageRef.current;
    initialPageRef.current = 1;
    fetchData(page, filters, sort);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, sort]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    saveState({ page: 1, filters, sort, sorting });
    fetchData(1, filters, sort);
  };

  const handleResetFilters = () => {
    const reset = { search: "", fileable_type: "", fileable_id: "", status: "" };
    setFilters(reset);
    saveState({ page: 1, filters: reset, sort, sorting });
    fetchData(1, reset, sort);
  };

  const handlePageChange = (page) => {
    saveState({ page, filters, sort, sorting });
    fetchData(page, filters, sort);
  };

  const handleEdit = useCallback(
    (id) => navigate(`/files/${id}/edit`),
    [navigate]
  );

  const handleDelete = useCallback(
    async (id) => {
      const confirmed = window.confirm("آیا از حذف این فایل مطمئن هستید؟");
      if (!confirmed) return;
      try {
        setLoading(true);
        await deleteFile(id);
        await fetchData(meta.page, filters, sort);
      } catch (e) {
        console.error("خطا در حذف فایل", e);
      } finally {
        setLoading(false);
      }
    },
    [fetchData, filters, meta.page, sort]
  );

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        accessorKey: "id",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        id: "title",
        header: "عنوان",
        accessorKey: "title",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "name",
        header: "نام فایل",
        accessorKey: "name",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "type",
        header: "نوع",
        accessorKey: "type",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "size",
        header: "حجم",
        accessorKey: "size",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => formatSize(info.getValue()),
      },
      {
        id: "time",
        header: "مدت",
        accessorKey: "time",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "status",
        header: "وضعیت",
        accessorKey: "status",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => {
          const val = info.getValue();
          return val === 1
            ? <Badge color="success" pill>فعال</Badge>
            : <Badge color="secondary" pill>غیرفعال</Badge>;
        },
      },
      {
        id: "arvan_status",
        header: "Arvan",
        accessorKey: "arvan_status",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => {
          const val = info.getValue();
          return val === 1
            ? <Badge color="info" pill>آپلود شده</Badge>
            : <Badge color="light" className="text-muted" pill>ندارد</Badge>;
        },
      },
      {
        id: "fileable_type",
        header: "نوع owner",
        accessorKey: "fileable_type",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => {
          const val = info.getValue();
          if (!val) return "-";
          // نمایش مختصر: آخرین بخش namespace
          const short = val.split("\\").pop();
          return <span title={val} className="text-muted small">{short}</span>;
        },
      },
      {
        id: "fileable_id",
        header: "ID owner",
        accessorKey: "fileable_id",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        id: "used_count",
        header: "تعداد استفاده",
        accessorKey: "used_count",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        id: "file_checked",
        header: "تأیید فایل",
        accessorKey: "file_checked",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => {
          const val = info.getValue();
          return val === 1
            ? <Badge color="success" pill>تأیید شده</Badge>
            : <Badge color="warning" pill>تأیید نشده</Badge>;
        },
      },
      {
        id: "url",
        header: "لینک",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const url = resolveFileUrl(row.original);
          if (!url) return "-";
          const isArvan = row.original?.arvan_status === 1 && row.original?.arvan_url;
          return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-break">
              {isArvan ? "Arvan" : "باز کردن فایل"}
            </a>
          );
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
            <div className="d-flex gap-2">
              {canShow && (
                <Button color="info" size="sm" onClick={() => handleEdit(id)}>
                  جزئیات
                </Button>
              )}
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
    [canShow, handleDelete, handleEdit, loading]
  );

  const handleSortingChange = useCallback(
    (nextSorting) => {
      const first = nextSorting?.[0];
      if (first && !SORTABLE_COLUMNS.includes(first.id)) return;

      setSorting(nextSorting);

      if (!first) {
        const resetSort = { by: undefined, order: undefined };
        setSort(resetSort);
        saveState({ page: 1, filters, sort: resetSort, sorting: nextSorting });
        fetchData(1, filters, resetSort);
        return;
      }

      const nextSort = { by: first.id, order: first.desc ? "DESC" : "ASC" };
      setSort(nextSort);
      saveState({ page: 1, filters, sort: nextSort, sorting: nextSorting });
      fetchData(1, filters, nextSort);
    },
    [fetchData, filters, saveState]
  );

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="مدیریت فایل‌ها" breadcrumbItem="فایل‌ها" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h4 className="card-title mb-1">فایل‌ها</h4>
                  <p className="text-muted mb-0">لیست و مدیریت فایل‌های ثبت شده</p>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {loading && <Spinner size="sm" color="primary" />}
                </div>
              </CardHeader>

              <CardBody>
                <Form className="mb-4" onSubmit={handleSearchSubmit}>
                  <Row className="g-3 align-items-end">
                    <Col xl="3" lg="5" md="6">
                      <Label className="form-label">جستجو</Label>
                      <InputGroup>
                        <InputGroupText>
                          <i className="bx bx-search" />
                        </InputGroupText>
                        <Input
                          name="search"
                          value={filters.search}
                          onChange={handleFilterChange}
                          placeholder="نام، کد یا عنوان فایل"
                        />
                      </InputGroup>
                    </Col>

                    <Col xl="3" lg="4" md="6">
                      <Label className="form-label">نوع owner</Label>
                      <Input
                        type="select"
                        name="fileable_type"
                        value={filters.fileable_type}
                        onChange={handleFilterChange}
                      >
                        {FILEABLE_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </Input>
                    </Col>

                    <Col xl="2" lg="3" md="4">
                      <Label className="form-label">ID owner</Label>
                      <Input
                        type="number"
                        name="fileable_id"
                        value={filters.fileable_id}
                        onChange={handleFilterChange}
                        placeholder="مثلاً 42"
                      />
                    </Col>

                    <Col xl="2" lg="3" md="4">
                      <Label className="form-label">وضعیت</Label>
                      <Input
                        type="select"
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </Input>
                    </Col>

                    <Col xl="2" lg="2" md="4" className="d-flex gap-2">
                      <Button color="primary" type="submit" className="w-100" disabled={loading}>
                        جستجو
                      </Button>
                      <Button color="light" type="button" className="w-100" onClick={handleResetFilters} disabled={loading}>
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

export default FileList;
