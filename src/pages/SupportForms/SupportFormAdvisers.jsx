// src/pages/SupportForms/SupportFormAdvisers.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Button,
  Form,
  Input,
  Label,
  InputGroup,
  InputGroupText,
  Spinner,
  Alert,
} from "reactstrap";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";
import DeleteModal from "../../components/Common/DeleteModal.jsx";
import {
  getSupportForm,
  getSupportFormAdvisers,
  getSupportFormAdviserCandidates,
  upsertSupportFormAdviser,
  detachSupportFormAdviser,
} from "../../services/supportFormService.jsx";

const SupportFormAdvisers = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  document.title = "مشاوران فرم تماس | داشبورد آیسوق";

  const [formTitle, setFormTitle] = useState("");
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    lastPage: 1,
  });
  const [filters, setFilters] = useState({
    search: "",
    isActive: "",
  });
  const [attachSearch, setAttachSearch] = useState("");
  const [attachResults, setAttachResults] = useState([]);
  const [attachLoading, setAttachLoading] = useState(false);
  const [attachedIds, setAttachedIds] = useState(() => new Set());
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [sort, setSort] = useState({ by: "id", order: "DESC" });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const fetchTitle = useCallback(async () => {
    try {
      const res = await getSupportForm(id);
      setFormTitle(res?.title || "");
    } catch (e) {
      console.error("خطا در دریافت عنوان فرم تماس", e);
    }
  }, [id]);

  const fetchData = useCallback(
    async (page = 1, currentFilters = {}, currentSort = sort) => {
      setLoading(true);
      setAlert(null);
      try {
        const res = await getSupportFormAdvisers(id, {
          page,
          limit: meta.limit,
          search: currentFilters.search || undefined,
          isActive:
            currentFilters.isActive === ""
              ? undefined
              : currentFilters.isActive,
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
        console.error("خطا در دریافت مشاوران فرم تماس", e);
        setData([]);
        setMeta((prev) => ({ ...prev, total: 0 }));
        setAlert({ type: "danger", message: "خطا در دریافت اطلاعات." });
      } finally {
        setLoading(false);
      }
    },
    [id, meta.limit, sort]
  );

  useEffect(() => {
    fetchTitle();
  }, [fetchTitle]);

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
    const reset = { search: "", isActive: "" };
    setFilters(reset);
    fetchData(1, reset, sort);
  };

  const handlePageChange = (page) => {
    fetchData(page, filters, sort);
  };

  const handleToggleActive = async (row) => {
    const adviserId = row?.adviser_id || row?.adviser?.id;
    if (!adviserId) return;
    setActionLoading(adviserId);
    try {
      await upsertSupportFormAdviser(id, {
        adviser_id: adviserId,
        is_active: !row?.is_active,
      });
      await fetchData(meta.page, filters, sort);
    } catch (e) {
      console.error("خطا در بروزرسانی وضعیت مشاور", e);
      setAlert({ type: "danger", message: "خطا در بروزرسانی وضعیت." });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDetachAdviser = async () => {
    const adviserId =
      pendingDelete?.adviser_id || pendingDelete?.adviser?.id || pendingDelete?.id;
    if (!adviserId) return;
    setActionLoading(adviserId);
    try {
      await detachSupportFormAdviser(id, adviserId);
      await fetchData(meta.page, filters, sort);
      setAlert({ type: "success", message: "مشاور حذف شد." });
    } catch (e) {
      console.error("خطا در حذف مشاور", e);
      setAlert({ type: "danger", message: "خطا در حذف مشاور." });
    } finally {
      setActionLoading(null);
      setDeleteModal(false);
      setPendingDelete(null);
    }
  };

  const openDeleteModal = (row) => {
    setPendingDelete(row);
    setDeleteModal(true);
  };

  const handleAttachSearch = async (e) => {
    e.preventDefault();
    const query = attachSearch.trim();
    if (!query) return;
    setAttachLoading(true);
    setAlert(null);
    try {
      const res = await getSupportFormAdviserCandidates(id, {
        page: 1,
        limit: 20,
        search: query,
      });
      setAttachResults(res.items || []);
      if (!res.items?.length) {
        setAlert({ type: "warning", message: "نتیجه‌ای برای جستجو یافت نشد." });
      }
    } catch (e2) {
      console.error("خطا در جستجوی مشاور", e2);
      setAlert({ type: "danger", message: "خطا در جستجوی مشاور." });
    } finally {
      setAttachLoading(false);
    }
  };

  const handleAttachAdviser = async (row) => {
    const adviserId = row?.adviser_id || row?.adviser?.id || row?.id;
    if (!adviserId) return;
    setActionLoading(adviserId);
    try {
      await upsertSupportFormAdviser(id, {
        adviser_id: adviserId,
        is_active: true,
      });
      await fetchData(meta.page, filters, sort);
      setAttachedIds((prev) => {
        const next = new Set(prev);
        next.add(String(adviserId));
        return next;
      });
      setAttachResults((prev) =>
        prev.map((item) =>
          (item?.id || item?.adviser_id) === adviserId
            ? { ...item, is_active: true }
            : item
        )
      );
      setAlert({ type: "success", message: "مشاور به فرم تماس اضافه شد." });
    } catch (e) {
      console.error("خطا در افزودن مشاور", e);
      setAlert({ type: "danger", message: "خطا در افزودن مشاور." });
    } finally {
      setActionLoading(null);
    }
  };

  const attachColumns = useMemo(
    () => [
      {
        id: "code",
        header: "کد مشاور",
        accessorKey: "code",
        enableSorting: false,
        cell: ({ row }) => row.original?.code || row.original?.adviser?.code || "-",
      },
      {
        id: "name",
        header: "نام",
        accessorKey: "user.name",
        enableSorting: false,
        cell: ({ row }) => row.original?.user?.name || row.original?.adviser?.user?.name || "-",
      },
      {
        id: "username",
        header: "نام کاربری",
        accessorKey: "user.username",
        enableSorting: false,
        cell: ({ row }) =>
          row.original?.user?.username || row.original?.adviser?.user?.username || "-",
      },
      {
        id: "ssn",
        header: "کد ملی",
        accessorKey: "user.ssn",
        enableSorting: false,
        cell: ({ row }) =>
          row.original?.user?.ssn || row.original?.adviser?.user?.ssn || "-",
      },
      {
        id: "phone",
        header: "تلفن",
        accessorKey: "user.phone",
        enableSorting: false,
        cell: ({ row }) =>
          row.original?.user?.phone || row.original?.adviser?.user?.phone || "-",
      },
      {
        id: "actions",
        header: "افزودن",
        enableSorting: false,
        cell: ({ row }) => {
          const adviserId =
            row.original?.adviser_id || row.original?.adviser?.id || row.original?.id;
          const isActive = row.original?.is_active;
          const isAttached = attachedIds.has(String(adviserId));
          return (
            <Button
              color={isActive || isAttached ? "secondary" : "success"}
              size="sm"
              disabled={actionLoading === adviserId || isActive || isAttached}
              onClick={() =>
                isActive ? handleToggleActive(row.original) : handleAttachAdviser(row.original)
              }
            >
              {actionLoading === adviserId
                ? "در حال ثبت..."
                : isActive || isAttached
                ? "افزوده شد"
                : "افزودن"}
            </Button>
          );
        },
      },
    ],
    [actionLoading, attachedIds]
  );

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        accessorKey: "id",
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        id: "code",
        header: "کد مشاور",
        accessorKey: "adviser.code",
        enableSorting: false,
        cell: ({ row }) => row.original?.adviser?.code || "-",
      },
      {
        id: "name",
        header: "نام",
        accessorKey: "adviser.user.name",
        enableSorting: false,
        cell: ({ row }) => row.original?.adviser?.user?.name || "-",
      },
      {
        id: "username",
        header: "نام کاربری",
        accessorKey: "adviser.user.username",
        enableSorting: false,
        cell: ({ row }) => row.original?.adviser?.user?.username || "-",
      },
      {
        id: "ssn",
        header: "کد ملی",
        accessorKey: "adviser.user.ssn",
        enableSorting: false,
        cell: ({ row }) => row.original?.adviser?.user?.ssn || "-",
      },
      {
        id: "phone",
        header: "تلفن",
        accessorKey: "adviser.user.phone",
        enableSorting: false,
        cell: ({ row }) => row.original?.adviser?.user?.phone || "-",
      },
      {
        id: "is_active",
        header: "وضعیت",
        accessorKey: "is_active",
        enableSorting: true,
        cell: ({ row }) => (row.original?.is_active ? "فعال" : "غیرفعال"),
      },
      {
        id: "actions",
        header: "عملیات",
        enableSorting: false,
        cell: ({ row }) => {
          const adviserId =
            row.original?.adviser_id || row.original?.adviser?.id || row.original?.id;
          return (
            <div className="d-flex gap-2">
              <Button
                color="primary"
                size="sm"
                onClick={() =>
                  navigate(`/support-forms/${id}/advisers/${adviserId}/students`, {
                    state: { adviser: row.original?.adviser || row.original },
                  })
                }
              >
                دانش‌آموزان
              </Button>
              <Button
                color={row.original?.is_active ? "danger" : "success"}
                size="sm"
                disabled={actionLoading === adviserId}
                onClick={() => handleToggleActive(row.original)}
              >
                {actionLoading === adviserId
                  ? "در حال ثبت..."
                  : row.original?.is_active
                  ? "غیرفعال‌سازی"
                  : "فعال‌سازی"}
              </Button>
              <Button
                color="secondary"
                size="sm"
                disabled={actionLoading === adviserId}
                onClick={() => openDeleteModal(row.original)}
              >
                حذف
              </Button>
            </div>
          );
        },
      },
    ],
    [actionLoading, id, navigate]
  );

  const handleSortingChange = useCallback(
    (nextSorting) => {
      const allowed = [
        "id",
        "created_at",
        "updated_at",
        "adviser_id",
        "is_active",
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
        <Breadcrumbs
          title="فرم تماس"
          breadcrumbItem={formTitle ? `مشاوران ${formTitle}` : "مشاوران فرم تماس"}
        />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h4 className="card-title mb-1">مشاوران فرم تماس</h4>
                  <p className="text-muted mb-0">
                    مدیریت مشاوران متصل به فرم تماس انتخاب‌شده.
                  </p>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {loading && <Spinner size="sm" color="primary" />}
                  <Button color="light" onClick={() => navigate("/support-forms")}>
                    بازگشت
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <DeleteModal
                  show={deleteModal}
                  onDeleteClick={handleDetachAdviser}
                  onCloseClick={() => {
                    setDeleteModal(false);
                    setPendingDelete(null);
                  }}
                />
                {alert && (
                  <Alert color={alert.type} className="mb-3">
                    {alert.message}
                  </Alert>
                )}

                <Card className="border mb-4">
                  <CardHeader className="bg-light">
                    <h5 className="mb-0">افزودن مشاور</h5>
                  </CardHeader>
                  <CardBody>
                    <Form onSubmit={handleAttachSearch}>
                      <Row className="g-3 align-items-end">
                        <Col xl="6" lg="6" md="6">
                          <Label className="form-label" htmlFor="attachSearch">
                            جستجو با کد ملی، نام کاربری یا تلفن
                          </Label>
                          <InputGroup>
                            <InputGroupText>
                              <i className="bx bx-search" />
                            </InputGroupText>
                            <Input
                              id="attachSearch"
                              value={attachSearch}
                              onChange={(e) => setAttachSearch(e.target.value)}
                              placeholder="مثلاً ۰۰۱۰۰..."
                            />
                          </InputGroup>
                        </Col>
                        <Col xl="3" lg="4" md="6" className="d-flex gap-2">
                          <Button
                            color="primary"
                            type="submit"
                            className="w-100"
                            disabled={attachLoading}
                          >
                            {attachLoading ? "در حال جستجو..." : "جستجو"}
                          </Button>
                        </Col>
                      </Row>
                    </Form>

                    {attachResults.length > 0 && (
                      <div className="mt-4">
                        <TableContainer
                          columns={attachColumns}
                          data={attachResults}
                          isGlobalFilter={false}
                          isPagination={false}
                          isLoading={attachLoading}
                          tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
                        />
                      </div>
                    )}
                  </CardBody>
                </Card>

                <Form className="mb-4" onSubmit={handleSearchSubmit}>
                  <Row className="g-3 align-items-end">
                    <Col xl="6" lg="6" md="6">
                      <Label className="form-label" htmlFor="search">
                        جستجو (کد ملی، نام کاربری، تلفن یا کد مشاور)
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
                          placeholder="مثلاً ۰۰۱۰۰..."
                        />
                      </InputGroup>
                    </Col>
                    <Col xl="3" lg="4" md="6">
                      <Label className="form-label" htmlFor="isActive">
                        وضعیت
                      </Label>
                      <Input
                        id="isActive"
                        name="isActive"
                        type="select"
                        value={filters.isActive}
                        onChange={handleFilterChange}
                      >
                        <option value="">همه</option>
                        <option value="true">فعال</option>
                        <option value="false">غیرفعال</option>
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
      </div>
    </div>
  );
};

export default SupportFormAdvisers;
