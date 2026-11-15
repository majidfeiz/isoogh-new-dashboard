// src/pages/Schools/SchoolList.jsx
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
  Badge,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { useListState } from "../../hooks/useListState";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";
import {
  getSchools,
  deleteSchool,
  invalidateSchoolQueries,
  updateSchoolStatus,
} from "../../services/schoolService.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { toast } from "react-toastify";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().replace("T", " ").slice(0, 16);
};

const managerLabel = (manager) =>
  manager?.user?.name ||
  manager?.user?.username ||
  manager?.code ||
  (manager?.id ? `مدیر #${manager.id}` : "");

const normalizeSavedFilters = (filters) => {
  if (!filters) return { search: "", managerId: "", status: "all" };
  const search =
    filters.search ??
    [filters.name, filters.code, filters.managerName]
      .filter(Boolean)
      .map((value) => value.toString().trim())
      .filter(Boolean)
      .join(" ");

  return {
    search,
    managerId: filters.managerId || "",
    status: ["active", "inactive", "all"].includes(filters.status)
      ? filters.status
      : "all",
  };
};

const schoolIsActive = (school) =>
  typeof school?.isActive === "boolean"
    ? school.isActive
    : school?.status === 1 || school?.status === "1" || school?.status === true;

const backendMessage = (error, fallback) => {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message.filter(Boolean).join("، ");
  return message || error?.response?.data?.error || fallback;
};

const SchoolList = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  document.title = "مجموعه‌ها | داشبورد آیسوق";

  const { saved, saveState } = useListState("schools");

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    lastPage: 1,
  });
  const [filters, setFilters] = useState(normalizeSavedFilters(saved?.filters));
  const [loading, setLoading] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [statusError, setStatusError] = useState("");
  const [sorting, setSorting] = useState(saved?.sorting ?? [{ id: "id", desc: true }]);
  const [sort, setSort] = useState(saved?.sort ?? { by: "id", order: "DESC" });
  const initialPageRef = useRef(saved?.page ?? 1);

  const buildSearchQuery = useCallback((currentFilters) => {
    return (currentFilters?.search || "").toString().trim();
  }, []);

  const fetchData = useCallback(
    async (page = 1, currentFilters = {}, currentSort = sort) => {
      setLoading(true);
      try {
        const searchQuery = buildSearchQuery(currentFilters);
        const res = await getSchools({
          page,
          limit: meta.limit,
          search: searchQuery,
          sortBy: currentSort?.by,
          sortOrder: currentSort?.order,
          managerId: currentFilters?.managerId || undefined,
          status: currentFilters?.status || "all",
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
        console.error("خطا در دریافت مجموعه‌ها", e);
        setData([]);
        setMeta((prev) => ({ ...prev, total: 0 }));
      } finally {
        setLoading(false);
      }
    },
    [meta.limit, buildSearchQuery, sort]
  );

  useEffect(() => {
    const page = initialPageRef.current;
    initialPageRef.current = 1;
    fetchData(page, filters, sort);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, sort]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const nextFilters = { ...filters, [name]: value };
    setFilters(nextFilters);

    if (name === "status") {
      saveState({ page: 1, filters: nextFilters, sort, sorting });
      fetchData(1, nextFilters, sort);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    saveState({ page: 1, filters, sort, sorting });
    fetchData(1, filters, sort);
  };

  const handleResetFilters = () => {
    const reset = { search: "", managerId: "", status: "all" };
    setFilters(reset);
    saveState({ page: 1, filters: reset, sort, sorting });
    fetchData(1, reset, sort);
  };

  const handlePageChange = (page) => {
    saveState({ page, filters, sort, sorting });
    fetchData(page, filters, sort);
  };

  const handleCreate = () => {
    navigate("/schools/create");
  };

  const handleEdit = useCallback(
    (id) => {
      navigate(`/schools/${id}/edit`);
    },
    [navigate]
  );

  const handleDelete = useCallback(
    async (id) => {
      const confirmed = window.confirm("آیا از حذف این مجموعه مطمئن هستید؟");
      if (!confirmed) return;

      try {
        setLoading(true);
        await deleteSchool(id);
        await fetchData(meta.page, filters, sort);
      } catch (e) {
        console.error("خطا در حذف مجموعه", e);
      } finally {
        setLoading(false);
      }
    },
    [meta.page, filters, sort, fetchData]
  );

  const openStatusConfirmation = useCallback((school) => {
    setStatusError("");
    setStatusTarget(school);
  }, []);

  const closeStatusConfirmation = useCallback(() => {
    if (statusUpdatingId !== null) return;
    setStatusTarget(null);
    setStatusError("");
  }, [statusUpdatingId]);

  const confirmStatusChange = useCallback(async () => {
    if (!statusTarget || statusUpdatingId !== null) return;
    const nextIsActive = !schoolIsActive(statusTarget);
    setStatusUpdatingId(statusTarget.id);
    setStatusError("");

    try {
      await updateSchoolStatus(statusTarget.id, nextIsActive);
      invalidateSchoolQueries({ schoolId: statusTarget.id, isActive: nextIsActive });
      toast.success(
        nextIsActive
          ? "مجموعه با موفقیت فعال شد."
          : "مجموعه با موفقیت غیرفعال شد."
      );
      setStatusTarget(null);
      await fetchData(meta.page, filters, sort);
    } catch (error) {
      const message = backendMessage(error, "تغییر وضعیت مجموعه انجام نشد.");
      setStatusError(message);
      toast.error(message);
    } finally {
      setStatusUpdatingId(null);
    }
  }, [fetchData, filters, meta.page, sort, statusTarget, statusUpdatingId]);

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
        header: "کد مجموعه",
        accessorKey: "code",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "name",
        header: "نام مجموعه",
        accessorKey: "name",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "phone",
        header: "تلفن",
        accessorKey: "phone",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "manager",
        header: "مدیر مجموعه",
        accessorKey: "manager",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => {
          const manager = info.row.original?.manager || info.getValue();
          const fallback = info.row.original?.manager_name || info.row.original?.managerName;
          return managerLabel(manager) || fallback || "-";
        },
      },
      {
        id: "status",
        header: "وضعیت",
        accessorKey: "isActive",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => {
          const active = schoolIsActive(info.row.original);
          return (
            <Badge color={active ? "success" : "secondary"} pill>
              {active ? "فعال" : "غیرفعال"}
            </Badge>
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
          const canUpdate = hasPermission("schools.update");
          const canDelete = hasPermission("schools.delete");
          const active = schoolIsActive(row.original);
          const rowStatusLoading = statusUpdatingId === id;

          if (!canUpdate && !canDelete) return "-";

          return (
            <div className="d-flex gap-2">
              {canUpdate && (
                <Button color="warning" size="sm" onClick={() => handleEdit(id)}>
                  ویرایش
                </Button>
              )}

              {canUpdate && (
                <Button
                  color={active ? "danger" : "success"}
                  outline={active}
                  size="sm"
                  onClick={() => openStatusConfirmation(row.original)}
                  disabled={rowStatusLoading}
                >
                  {rowStatusLoading && <Spinner size="sm" className="ms-1" />}
                  {active ? "غیرفعال‌کردن" : "فعال‌کردن"}
                </Button>
              )}

              {canDelete && (
                <Button
                  color="danger"
                  size="sm"
                  onClick={() => handleDelete(id)}
                  disabled={loading}
                >
                  حذف
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [handleEdit, handleDelete, hasPermission, loading, openStatusConfirmation, statusUpdatingId]
  );

  const handleSortingChange = useCallback(
    (nextSorting) => {
      const allowed = ["id", "name", "code", "created_at"];
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
        <Breadcrumbs title="مدیریت مجموعه‌ها" breadcrumbItem="مجموعه‌ها" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h4 className="card-title mb-1">مجموعه‌ها</h4>
                  <p className="text-muted mb-0">
                    جستجو، صفحه‌بندی و مدیریت مجموعه‌ها
                  </p>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {loading && <Spinner size="sm" color="primary" />}
                  {hasPermission("schools.create") && (
                    <Button color="primary" onClick={handleCreate}>
                      <i className="mdi mdi-plus me-1" />
                      ایجاد مجموعه جدید
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardBody>
                <Form className="mb-4" onSubmit={handleSearchSubmit}>
                  <Row className="g-3 align-items-end">
                    <Col xl="4" lg="5" md="6">
                      <Label className="form-label" htmlFor="search">
                        جستجو
                      </Label>
                      <InputGroup>
                        <InputGroupText>
                          <i className="bx bx-search" />
                        </InputGroupText>
                        <Input
                          id="search"
                          name="search"
                          value={filters.search}
                          onChange={handleFilterChange}
                          placeholder="نام، کد، تلفن یا مدیر مجموعه"
                        />
                      </InputGroup>
                    </Col>

                    <Col xl="3" lg="4" md="6">
                      <Label className="form-label" htmlFor="managerId">
                        شناسه مدیر (فقط ادمین)
                      </Label>
                      <InputGroup>
                        <InputGroupText>
                          <i className="bx bx-id-card" />
                        </InputGroupText>
                        <Input
                          id="managerId"
                          name="managerId"
                          type="number"
                          value={filters.managerId}
                          onChange={handleFilterChange}
                          placeholder="مثلاً 157"
                        />
                      </InputGroup>
                    </Col>

                    <Col xl="2" lg="3" md="6">
                      <Label className="form-label" htmlFor="status">
                        وضعیت
                      </Label>
                      <Input
                        id="status"
                        name="status"
                        type="select"
                        value={filters.status}
                        onChange={handleFilterChange}
                      >
                        <option value="all">همه</option>
                        <option value="active">فعال</option>
                        <option value="inactive">غیرفعال</option>
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

        <Modal isOpen={Boolean(statusTarget)} toggle={closeStatusConfirmation} centered>
          <ModalHeader toggle={closeStatusConfirmation}>
            تأیید تغییر وضعیت مجموعه
          </ModalHeader>
          <ModalBody>
            {statusError && (
              <Alert color="danger" role="alert">
                {statusError}
              </Alert>
            )}
            {schoolIsActive(statusTarget) ? (
              <>
                <p>
                  مجموعه «{statusTarget?.name || statusTarget?.code || statusTarget?.id}» غیرفعال شود؟
                </p>
                <Alert color="warning" className="mb-0">
                  این مجموعه از selectorها و بخش‌های عملیاتی حذف می‌شود، اما هیچ‌یک از داده‌های آن حذف نخواهد شد.
                </Alert>
              </>
            ) : (
              <p className="mb-0">
                مجموعه «{statusTarget?.name || statusTarget?.code || statusTarget?.id}» دوباره فعال شود؟
              </p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="light" onClick={closeStatusConfirmation} disabled={statusUpdatingId !== null}>
              انصراف
            </Button>
            <Button
              color={schoolIsActive(statusTarget) ? "danger" : "success"}
              onClick={confirmStatusChange}
              disabled={statusUpdatingId !== null}
            >
              {statusUpdatingId !== null && <Spinner size="sm" className="ms-1" />}
              {schoolIsActive(statusTarget) ? "غیرفعال‌کردن" : "فعال‌کردن"}
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
};

export default SchoolList;
