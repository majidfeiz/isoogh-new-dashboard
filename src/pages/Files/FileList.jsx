import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, CardBody, CardHeader, Col, Form, Input, InputGroup, Row, Spinner } from "reactstrap";
import { useNavigate } from "react-router-dom";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";
import { deleteFile, getFiles } from "../../services/fileService.jsx";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("fa-IR");
};

const textFallback = (value) => value || "-";

const FileList = () => {
  const navigate = useNavigate();
  document.title = "فایل‌ها | داشبورد آیسوق";

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    lastPage: 1,
  });
  const [filters, setFilters] = useState({ search: "" });
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [sort, setSort] = useState({ by: "id", order: "DESC" });

  const fetchData = useCallback(
    async (page = 1, currentFilters = {}, currentSort = sort) => {
      setLoading(true);
      try {
        const res = await getFiles({
          page,
          limit: meta.limit,
          search: currentFilters.search,
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
    fetchData(1, filters, sort);
  }, [fetchData, sort]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData(1, filters, sort);
  };

  const handleResetFilters = () => {
    const reset = { search: "" };
    setFilters(reset);
    fetchData(1, reset, sort);
  };

  const handlePageChange = (page) => {
    fetchData(page, filters, sort);
  };

  const handleCreate = () => {
    navigate("/files/create");
  };

  const handleEdit = useCallback(
    (id) => {
      navigate(`/files/${id}/edit`);
    },
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
        enableSorting: true,
        cell: (info) => textFallback(info.getValue()),
      },
      {
        id: "name",
        header: "نام فایل",
        accessorKey: "name",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => textFallback(info.getValue()),
      },
      {
        id: "type",
        header: "نوع",
        accessorKey: "type",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => textFallback(info.getValue()),
      },
      {
        id: "size",
        header: "حجم",
        accessorKey: "size",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => textFallback(info.getValue()),
      },
      {
        id: "time",
        header: "مدت",
        accessorKey: "time",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => textFallback(info.getValue()),
      },
      {
        id: "url",
        header: "لینک",
        accessorKey: "url",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const url = row.original?.url;
          if (!url) return "-";
          return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-break">
              باز کردن فایل
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
              <Button color="warning" size="sm" onClick={() => handleEdit(id)}>
                ویرایش
              </Button>
              <Button color="danger" size="sm" onClick={() => handleDelete(id)} disabled={loading}>
                حذف
              </Button>
            </div>
          );
        },
      },
    ],
    [handleDelete, handleEdit, loading]
  );

  const handleSortingChange = useCallback(
    (nextSorting) => {
      const allowed = ["id", "title", "name", "created_at"];
      const first = nextSorting?.[0];

      if (first && !allowed.includes(first.id)) return;

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
                  <Button color="primary" onClick={handleCreate}>
                    <i className="mdi mdi-plus me-1" />
                    افزودن فایل جدید
                  </Button>
                </div>
              </CardHeader>

              <CardBody>
                <Form className="mb-4" onSubmit={handleSearchSubmit}>
                  <Row className="g-3 align-items-end">
                    <Col xl="5" lg="6" md="8">
                      <InputGroup>
                        <Input
                          name="search"
                          value={filters.search}
                          onChange={handleFilterChange}
                          placeholder="جستجو بر اساس عنوان/نام/کد"
                        />
                        <Button color="primary" type="submit" disabled={loading}>
                          جستجو
                        </Button>
                      </InputGroup>
                    </Col>

                    <Col xl="3" lg="4" md="4">
                      <Button color="light" onClick={handleResetFilters} disabled={loading}>
                        ریست فیلترها
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
