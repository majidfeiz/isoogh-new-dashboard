// src/pages/Users/UserList.jsx
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
} from "reactstrap";
import { useNavigate } from "react-router-dom";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";
import { API_ROUTES, getApiUrl } from "../../helpers/apiRoutes.jsx";
import { getAccessToken } from "../../helpers/authStorage.jsx";

import {
  getUsers,
  deleteUser,
} from "../../services/userService.jsx";

const UserList = () => {
  const navigate = useNavigate();
  document.title = "کاربران | داشبورد آیسوق";

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
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [sort, setSort] = useState({ by: "id", order: "DESC" });
  const approxTotalRef = useRef(null);

  const buildSearchQuery = useCallback((currentFilters) => {
    const values = Object.values(currentFilters || {}).filter(Boolean);
    return values.join(" ").trim();
  }, []);

  const fetchData = useCallback(
    async (page = 1, currentFilters = {}, currentSort = sort) => {
      setLoading(true);
      try {
        const searchQuery = buildSearchQuery(currentFilters);
        const res = await getUsers({
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
        console.error("خطا در دریافت کاربران", e);
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
    const reset = { name: "", username: "", ssn: "", phone: "" };
    setFilters(reset);
    fetchData(1, reset, sort);
  };

  const handlePageChange = (page) => {
    fetchData(page, filters, sort);
  };

  const handleExport = async () => {
    const searchQuery = buildSearchQuery(filters);
    const limit = meta?.total && meta.total > 0 ? meta.total : meta.limit || 1000;

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

      const url = `${getApiUrl(API_ROUTES.users.export)}?${params.toString()}`;
      const token = getAccessToken();
      const res = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok || !res.body) {
        const txt = await res.text();
        throw new Error(txt || "خطا در خروجی گرفتن کاربران");
      }

      const approxHeader =
        res.headers.get("X-Approx-Content-Length") ||
        res.headers.get("x-approx-content-length") ||
        res.headers.get("Content-Length");
      const approxTotal = approxHeader ? Number(approxHeader) : 0;
      if (approxTotal > 0) {
        approxTotalRef.current = approxTotal;
        setExportProgress(1); // شروع با 1%
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
              headerBytes = line.length + 1; // به همراه \n
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
      const stamp = new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .slice(0, 15);
      link.setAttribute("download", `users-${stamp}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(urlObject);
      setExportProgress(100);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("خطا در خروجی گرفتن کاربران", e);
    } finally {
      setTimeout(() => {
        setExportProgress(null);
        approxTotalRef.current = null;
      }, 1000);
      setExportLoading(false);
    }
  };

  const handleCreateClick = () => {
    navigate("/users/create");
  };

  const handleEdit = useCallback(
    (id) => {
      navigate(`/users/${id}/edit`);
    },
    [navigate]
  );

const handleManagePermissions = useCallback(
    (id) => {
      navigate(`/users/${id}/permissions`);
    },
    [navigate]
  );


  const handleDelete = useCallback(
    async (id) => {
      const confirmed = window.confirm("آیا از حذف این کاربر مطمئن هستید؟");
      if (!confirmed) return;

      try {
        setLoading(true);
        await deleteUser(id);
        await fetchData(meta.page, filters, sort);
      } catch (e) {
        console.error("خطا در حذف کاربر", e);
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
        header: "نام",
        accessorKey: "name",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        id: "username",
        header: "نام کاربری",
        accessorKey: "username",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "email",
        header: "ایمیل",
        accessorKey: "email",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue(),
      },
      {
        id: "phone",
        header: "موبایل",
        accessorKey: "phone",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue(),
      },
      {
        id: "ssn",
        header: "کد ملی",
        accessorKey: "ssn",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "status",
        header: "وضعیت",
        accessorKey: "status",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => {
          const value = info.getValue();
          if (value === "active") return "فعال";
          if (value === "inactive") return "غیرفعال";
          return value ?? "-";
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
                color="info"
                size="sm"
                onClick={() => handleManagePermissions(id)}
              >
                نقش‌ها / دسترسی‌ها
              </Button>

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
    [handleManagePermissions, handleEdit, handleDelete]
  );

  const handleSortingChange = useCallback(
    (nextSorting) => {
      const allowed = ["id", "name"];
      const first = nextSorting?.[0];

      // اگر ستون قابل سورت نبود، نادیده بگیر
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
        <Breadcrumbs title="مدیریت کاربران" breadcrumbItem="کاربران" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <h4 className="card-title mb-0">لیست کاربران</h4>
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
                    + کاربر جدید
                  </Button>
                </div>
              </CardHeader>

              <CardBody>
                <Form onSubmit={handleSearchSubmit} className="mb-3">
                  <Row className="g-2 align-items-end">
                    <Col xl="3" lg="4" md="6">
                      <Label className="form-label">نام</Label>
                      <InputGroup>
                        <InputGroupText>
                          <i className="mdi mdi-account-outline" />
                        </InputGroupText>
                        <Input
                          type="text"
                          name="name"
                          value={filters.name}
                          onChange={handleFilterChange}
                          placeholder="مثلاً زهرا"
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
                          placeholder="مثلاً user123"
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

                    <Col xl="3" lg="4" md="6">
                      <Label className="form-label">شماره موبایل</Label>
                      <InputGroup>
                        <InputGroupText>
                          <i className="mdi mdi-cellphone" />
                        </InputGroupText>
                        <Input
                          type="text"
                          name="phone"
                          value={filters.phone}
                          onChange={handleFilterChange}
                          placeholder="مثلاً 0912..."
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

export default UserList;
