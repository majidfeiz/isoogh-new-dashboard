// src/pages/Roles/RolePermissions.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Container,
  Input,
  Button,
  Alert,
} from "reactstrap";
import { useParams, useNavigate } from "react-router-dom";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";

import { getPermissions } from "../../services/permissionService.jsx";
import {
  getRole,
  syncRolePermissions,
} from "../../services/roleService.jsx";

const RolePermissions = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  document.title = "دسترسی‌های نقش | داشبورد آیسوق";

  const [role, setRole] = useState(null);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    lastPage: 1,
  });
  const [search, setSearch] = useState("");

  // Use array (stable comparison) for selected IDs
  const [selectedIds, setSelectedIds] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // ---------- نقش ----------
  const fetchRole = useCallback(async () => {
    try {
      const r = await getRole(id);
      setRole(r);

      // Normalize IDs to number for consistent comparison
      const currentPermIds = (r.permissions || []).map((p) =>
        typeof p.id === "number" ? p.id : Number(p.id)
      );
      setSelectedIds(currentPermIds);
    } catch (e) {
      console.error("خطا در دریافت نقش", e);
      setServerError("امکان دریافت اطلاعات نقش وجود ندارد.");
    }
  }, [id]);

  // ---------- پرمیشن‌ها ----------
  const fetchPermissions = useCallback(
    async (page = 1, currentSearch = "") => {
      setLoading(true);
      try {
        const res = await getPermissions({
          page,
          limit: meta.limit,
          search: currentSearch,
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
        console.error("خطا در دریافت سطوح دسترسی", e);
        setData([]);
        setMeta((prev) => ({ ...prev, total: 0 }));
      } finally {
        setLoading(false);
      }
    },
    [meta.limit]
  );

  useEffect(() => {
    fetchRole();
    fetchPermissions(1, "");
  }, [fetchRole, fetchPermissions]);

  // ---------- سرچ ----------
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    fetchPermissions(1, value);
  };

  // ---------- صفحه‌بندی ----------
  const handlePageChange = (page) => {
    fetchPermissions(page, search);
  };

  // ---------- تیک/برداشتن تیک ----------
  const handleTogglePermission = useCallback((permId, nextChecked) => {
    const idNum = typeof permId === "number" ? permId : Number(permId);
    setSelectedIds((prev) => {
      const exists = prev.includes(idNum);
      if (nextChecked && !exists) return [...prev, idNum];
      if (!nextChecked && exists) return prev.filter((id) => id !== idNum);
      return prev;
    });
  }, []);

  // ---------- ذخیره ----------
  const handleSave = useCallback(async () => {
    setServerError(null);
    setSuccessMsg(null);
    setSaving(true);

    try {
      await syncRolePermissions(id, selectedIds);
      setSuccessMsg("دسترسی‌های نقش با موفقیت ذخیره شد.");
    } catch (err) {
      console.error("خطا در ذخیره دسترسی‌های نقش", err);
      const msg =
        err?.response?.data?.message ||
        "خطایی در ذخیره‌سازی دسترسی‌های نقش رخ داد.";
      setServerError(Array.isArray(msg) ? msg.join("، ") : msg);
    } finally {
      setSaving(false);
    }
  }, [id, selectedIds]);

  // ---------- ستون‌ها ----------
  const columns = useMemo(
    () => [
      {
        id: "select",
        header: "",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const permIdRaw = row.original?.id;
          const permId =
            typeof permIdRaw === "number" ? permIdRaw : Number(permIdRaw);
          const isChecked = selectedIds.includes(permId);

          // Critical: stop any row-level click/selection handling
          const stop = (e) => {
            e.preventDefault();
            e.stopPropagation();
          };

          return (
            <div
              className="text-center"
              onClick={stop}
              onMouseDown={stop}
            >
              <input
                type="checkbox"
                className="form-check-input"
                checked={isChecked}
                readOnly
                onClick={(e) => {
                  // Use click + readOnly to avoid library interfering with change events
                  stop(e);
                  handleTogglePermission(permId, !isChecked);
                }}
                // Fallback in case click is ignored by table; will still not bubble
                onChange={(e) => {
                  stop(e);
                  handleTogglePermission(permId, e.target.checked);
                }}
                style={{ pointerEvents: "auto", cursor: "pointer" }}
              />
            </div>
          );
        },
      },
      {
        id: "name",
        header: "نام سطح دسترسی",
        accessorKey: "name",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        id: "label",
        header: "برچسب",
        accessorKey: "label",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        id: "module",
        header: "ماژول",
        accessorKey: "module",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue(),
      },
      {
        id: "description",
        header: "توضیحات",
        accessorKey: "description",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue(),
      },
    ],
    // Important: derive a stable dependency so memo updates when selection changes
    [handleTogglePermission, selectedIds.join(",")]
  );

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="مدیریت دسترسی"
          breadcrumbItem="دسترسی‌های نقش"
        />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader>
                <Row className="align-items-center g-2">
                  <Col md="6">
                    <h4 className="card-title mb-1">
                      دسترسی‌های نقش{" "}
                      {role ? `«${role.label || role.name}»` : ""}
                    </h4>
                    {role && (
                      <div className="text-muted small">
                        نام سیستم: <strong>{role.name}</strong>
                      </div>
                    )}
                  </Col>
                  <Col md="6">
                    <div className="d-flex gap-2 justify-content-start justify-content-md-end">
                      <Input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="جستجو بر اساس نام، برچسب یا ماژول..."
                        className="flex-grow-1"
                      />
                    </div>
                  </Col>
                </Row>
              </CardHeader>

              <CardBody>
                {serverError && (
                  <Alert color="danger" className="mb-3">
                    {serverError}
                  </Alert>
                )}
                {successMsg && (
                  <Alert color="success" className="mb-3">
                    {successMsg}
                  </Alert>
                )}

                <TableContainer
                  columns={columns}
                  data={data || []}
                  isGlobalFilter={false}
                  isPagination={false}
                  isLoading={loading}
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

                <div className="mt-4 d-flex gap-2">
                  <Button
                    color="primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "در حال ذخیره..." : "ذخیره دسترسی‌ها"}
                  </Button>
                  <Button
                    color="secondary"
                    type="button"
                    onClick={() => navigate("/roles")}
                  >
                    بازگشت به لیست نقش‌ها
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RolePermissions;
