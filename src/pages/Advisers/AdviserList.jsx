// src/pages/Advisers/AdviserList.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  Progress,
  Row,
  Spinner,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";
import { getAdvisers } from "../../services/adviserService.jsx";
import { API_ROUTES, getApiUrl } from "../../helpers/apiRoutes.jsx";
import { getAccessToken } from "../../helpers/authStorage.jsx";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const iso = date.toISOString();
  return iso.replace("T", " ").slice(0, 16);
};

const AdviserList = () => {
  document.title = "مشاوران | داشبورد آیسوق";

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
    phone: "",
    parentId: "",
    isSuper: "",
  });
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [sort, setSort] = useState({ by: "id", order: "DESC" });
  const approxTotalRef = useRef(null);

  const buildSearchQuery = useCallback((currentFilters) => {
    return [currentFilters.code, currentFilters.name, currentFilters.username, currentFilters.phone]
      .filter(Boolean)
      .map((v) => v.toString().trim())
      .filter(Boolean)
      .join(" ");
  }, []);

  const parseParentId = useCallback((value) => {
    if (value === null || value === undefined || value === "") return undefined;
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  }, []);

  const parseIsSuper = useCallback((value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    return value === "1" || value === true || value === "true";
  }, []);

  const fetchData = useCallback(
    async (page = 1, currentFilters = {}, currentSort = sort) => {
      setLoading(true);
      try {
        const searchQuery = buildSearchQuery(currentFilters);
        const res = await getAdvisers({
          page,
          limit: meta.limit,
          search: searchQuery,
          sortBy: currentSort?.by,
          sortOrder: currentSort?.order,
          parentId: parseParentId(currentFilters.parentId),
          isSuper: parseIsSuper(currentFilters.isSuper),
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
        // eslint-disable-next-line no-console
        console.error("خطا در دریافت مشاوران", e);
        setData([]);
        setMeta((prev) => ({ ...prev, total: 0 }));
      } finally {
        setLoading(false);
      }
    },
    [meta.limit, buildSearchQuery, sort, parseParentId, parseIsSuper]
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
    const reset = {
      code: "",
      name: "",
      username: "",
      phone: "",
      parentId: "",
      isSuper: "",
    };
    setFilters(reset);
    fetchData(1, reset, sort);
  };

  const handlePageChange = (page) => {
    fetchData(page, filters, sort);
  };

  const handleExport = async () => {
    const searchQuery = buildSearchQuery(filters);
    const parentId = parseParentId(filters.parentId);
    const isSuper = parseIsSuper(filters.isSuper);
    const limit =
      meta?.total && meta.total > 0
        ? Math.min(meta.total, 300000)
        : meta.limit || 1000;

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
      if (parentId !== undefined) params.append("parentId", String(parentId));
      if (isSuper !== undefined) params.append("isSuper", isSuper ? "true" : "false");

      const url = `${getApiUrl(API_ROUTES.advisers.export)}?${params.toString()}`;
      const token = getAccessToken();
      const res = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok || !res.body) {
        const txt = await res.text();
        throw new Error(txt || "خطا در خروجی گرفتن مشاوران");
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
      const stamp = new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .slice(0, 15);
      link.setAttribute("download", `advisers-${stamp}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(urlObject);
      setExportProgress(100);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("خطا در خروجی گرفتن مشاوران", e);
    } finally {
      setTimeout(() => {
        setExportProgress(null);
        approxTotalRef.current = null;
      }, 1000);
      setExportLoading(false);
    }
  };

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
        header: "کد مشاور",
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
        enableSorting: true,
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
        id: "phone",
        header: "موبایل",
        accessorFn: (row) => row?.user?.phone || row?.phone,
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "is_super",
        header: "نوع مشاور",
        accessorKey: "is_super",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => {
          const value = info.getValue();
          const isSuper = value === true || value === 1 || value === "1" || value === "true";
          return (
            <Badge color={isSuper ? "primary" : "secondary"}>
              {isSuper ? "سر مشاور" : "مشاور"}
            </Badge>
          );
        },
      },
      {
        id: "parent_id",
        header: "سر مشاور مرتبط",
        accessorFn: (row) => row?.parent ?? row?.parent_id ?? row?.parentId,
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => {
          const value = info.getValue();
          if (!value) return "-";
          if (typeof value === "object") {
            const name = value.name || value?.user?.name;
            const code = value.code;
            const id = value.id;
            const parts = [name, code ? `(${code})` : null].filter(Boolean);
            if (parts.length) return parts.join(" ");
            return id ?? "-";
          }
          return value || "-";
        },
      },
      {
        id: "user_id",
        header: "شناسه کاربر",
        accessorFn: (row) => row?.user_id ?? row?.userId ?? row?.user?.id,
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "schools",
        header: "مدارس",
        accessorFn: (row) =>
          (row?.schools || [])
            .map((s) => s?.name || s?.code || "")
            .filter(Boolean)
            .join("، "),
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
    ],
    []
  );

  const handleSortingChange = useCallback(
    (nextSorting) => {
      const allowed = ["id", "code", "created_at", "updated_at", "user_id", "name", "is_super"];
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
        <Breadcrumbs title="مدیریت مشاوران" breadcrumbItem="مشاوران" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h4 className="card-title mb-1">مشاوران</h4>
                  <p className="text-muted mb-0">
                    جستجو، صفحه‌بندی و خروجی CSV لیست مشاوران
                  </p>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {loading && <Spinner size="sm" color="primary" />}
                  <Button
                    color="success"
                    outline
                    onClick={handleExport}
                    disabled={exportLoading}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {exportLoading ? "در حال دریافت..." : "خروجی CSV"}
                  </Button>
                </div>
              </CardHeader>

              <CardBody>
                <Form className="mb-4" onSubmit={handleSearchSubmit}>
                  <Row className="g-3 align-items-end">
                    <Col xl="3" lg="4" md="6">
                      <Label className="form-label" htmlFor="code">
                        کد مشاور
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
                          placeholder="مثلاً ADV-1001"
                        />
                      </InputGroup>
                    </Col>

                    <Col xl="3" lg="4" md="6">
                      <Label className="form-label" htmlFor="name">
                        نام
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
                          placeholder="مثلاً adviser1"
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
                      <Label className="form-label" htmlFor="parentId">
                        سر مشاور (ID)
                      </Label>
                      <InputGroup>
                        <InputGroupText>
                          <i className="bx bx-link" />
                        </InputGroupText>
                        <Input
                          id="parentId"
                          name="parentId"
                          value={filters.parentId}
                          onChange={handleFilterChange}
                          placeholder="مثلاً 12"
                        />
                      </InputGroup>
                    </Col>

                    <Col xl="3" lg="4" md="6">
                      <Label className="form-label" htmlFor="isSuper">
                        نوع مشاور
                      </Label>
                      <InputGroup>
                        <InputGroupText>
                          <i className="bx bx-select-multiple" />
                        </InputGroupText>
                        <Input
                          type="select"
                          id="isSuper"
                          name="isSuper"
                          value={filters.isSuper}
                          onChange={handleFilterChange}
                        >
                          <option value="">همه</option>
                          <option value="1">سر مشاور</option>
                          <option value="0">مشاور</option>
                        </Input>
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

export default AdviserList;
