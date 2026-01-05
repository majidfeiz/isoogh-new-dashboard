// src/pages/Managers/ManagerList.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
} from "reactstrap";
import { useNavigate } from "react-router-dom";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";
import { getManagers, deleteManager } from "../../services/managerService.jsx";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const iso = date.toISOString();
  return iso.replace("T", " ").slice(0, 16);
};

const ManagerList = () => {
  const navigate = useNavigate();
  document.title = "مدیران | داشبورد آیسوق";

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    lastPage: 1,
  });
  const [filters, setFilters] = useState({
    code: "",
    name: "",
    username: "",
    ssn: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [sort, setSort] = useState({ by: "id", order: "DESC" });

  const buildSearchQuery = useCallback((currentFilters) => {
    return Object.values(currentFilters || {})
      .filter(Boolean)
      .map((v) => v.toString().trim())
      .filter(Boolean)
      .join(" ");
  }, []);

  const fetchData = useCallback(
    async (page = 1, currentFilters = {}, currentSort = sort) => {
      setLoading(true);
      try {
        const searchQuery = buildSearchQuery(currentFilters);
        const res = await getManagers({
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
        console.error("خطا در دریافت مدیران", e);
        setData([]);
        setMeta((prev) => ({ ...prev, total: 0 }));
      } finally {
        setLoading(false);
      }
    },
    [meta.limit, buildSearchQuery, sort]
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
    const reset = { code: "", name: "", username: "", ssn: "", phone: "" };
    setFilters(reset);
    fetchData(1, reset, sort);
  };

  const handlePageChange = (page) => {
    fetchData(page, filters, sort);
  };

  const handleCreate = () => {
    navigate("/managers/create");
  };

  const handleEdit = useCallback(
    (id) => {
      navigate(`/managers/${id}/edit`);
    },
    [navigate]
  );

  const handleDelete = useCallback(
    async (id) => {
      const confirmed = window.confirm("آیا از حذف این مدیر مطمئن هستید؟");
      if (!confirmed) return;

      try {
        setLoading(true);
        await deleteManager(id);
        await fetchData(meta.page, filters, sort);
      } catch (e) {
        console.error("خطا در حذف مدیر", e);
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
        id: "code",
        header: "کد مدیر",
        accessorKey: "code",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "name",
        header: "نام",
        accessorFn: (row) => row?.user?.name || row?.name,
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "username",
        header: "نام کاربری",
        accessorFn: (row) => row?.user?.username || row?.username,
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "ssn",
        header: "کد ملی",
        accessorFn: (row) => row?.user?.ssn || row?.ssn,
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "user_id",
        header: "شناسه کاربر",
        accessorFn: (row) => row?.user_id ?? row?.userId ?? row?.user?.id,
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
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
    [handleEdit, handleDelete, loading]
  );

  const handleSortingChange = useCallback(
    (nextSorting) => {
      const allowed = ["id", "code", "created_at"];
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
        <Breadcrumbs title="مدیریت مدیران" breadcrumbItem="مدیران" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h4 className="card-title mb-1">مدیران</h4>
                  <p className="text-muted mb-0">
                    جستجو، صفحه‌بندی و مدیریت مدیران مجموعه
                  </p>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {loading && <Spinner size="sm" color="primary" />}
                  <Button color="primary" onClick={handleCreate}>
                    <i className="mdi mdi-plus me-1" />
                    افزودن مدیر جدید
                  </Button>
                </div>
              </CardHeader>

              <CardBody>
                <Form className="mb-4" onSubmit={handleSearchSubmit}>
                  <Row className="g-3 align-items-end">
                    <Col xl="3" lg="4" md="6">
                      <Label className="form-label" htmlFor="code">
                        کد مدیر
                      </Label>
                      <InputGroup>
                        <InputGroupText>
                          <i className="bx bx-id-card" />
                        </InputGroupText>
                        <Input
                          id="code"
                          name="code"
                          value={filters.code}
                          onChange={handleFilterChange}
                          placeholder="مثلاً MGR-1001"
                        />
                      </InputGroup>
                    </Col>

                    <Col xl="3" lg="4" md="6">
                      <Label className="form-label" htmlFor="name">
                        نام کاربر
                      </Label>
                      <InputGroup>
                        <InputGroupText>
                          <i className="bx bx-user" />
                        </InputGroupText>
                        <Input
                          id="name"
                          name="name"
                          value={filters.name}
                          onChange={handleFilterChange}
                          placeholder="مثلاً علی رضایی"
                        />
                      </InputGroup>
                    </Col>

                    <Col xl="3" lg="4" md="6">
                      <Label className="form-label" htmlFor="username">
                        نام کاربری
                      </Label>
                      <InputGroup>
                        <InputGroupText>
                          <i className="bx bx-user-circle" />
                        </InputGroupText>
                        <Input
                          id="username"
                          name="username"
                          value={filters.username}
                          onChange={handleFilterChange}
                          placeholder="مثلاً manager1"
                        />
                      </InputGroup>
                    </Col>

                    <Col xl="3" lg="4" md="6">
                      <Label className="form-label" htmlFor="phone">
                        موبایل
                      </Label>
                      <InputGroup>
                        <InputGroupText>
                          <i className="bx bx-phone" />
                        </InputGroupText>
                        <Input
                          id="phone"
                          name="phone"
                          value={filters.phone}
                          onChange={handleFilterChange}
                          placeholder="مثلاً 0912..."
                        />
                      </InputGroup>
                    </Col>

                    <Col xl="3" lg="4" md="6">
                      <Label className="form-label" htmlFor="ssn">
                        کد ملی
                      </Label>
                      <InputGroup>
                        <InputGroupText>
                          <i className="bx bx-id-card" />
                        </InputGroupText>
                        <Input
                          id="ssn"
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

export default ManagerList;
