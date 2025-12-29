// src/pages/Users/UserPermissions.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Container,
  Button,
  Input,
  Alert,
} from "reactstrap";
import { useParams, useNavigate } from "react-router-dom";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";

import { getUser, syncUserRoles, syncUserPermissions } from "../../services/userService.jsx";
import { getRoles } from "../../services/roleService.jsx";
import { getPermissions } from "../../services/permissionService.jsx";

const UserPermissions = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  document.title = "نقش‌ها و دسترسی‌های کاربر | داشبورد آیسوق";

  const [user, setUser] = useState(null);

  // لیست نقش‌ها و پرمیشن‌ها
  const [roles, setRoles] = useState([]);
  const [permData, setPermData] = useState([]);

  // pagination برای permissions
  const [permMeta, setPermMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    lastPage: 1,
  });

  const [permSearch, setPermSearch] = useState("");

  // انتخاب‌ها
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [selectedPermIds, setSelectedPermIds] = useState([]);

  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [saving, setSaving] = useState(false);

  const [serverError, setServerError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // ---------- گرفتن اطلاعات کاربر ----------
  const fetchUser = useCallback(async () => {
    try {
      const res = await getUser(id);
      const u = res?.data || res;
      setUser(u);

      // نقش‌های فعلی کاربر
      const roleIds = (u.roles || []).map((r) =>
        typeof r.id === "number" ? r.id : Number(r.id)
      );
      setSelectedRoleIds(roleIds);

      // پرمیشن‌های مستقیم فعلی کاربر
      const permIds = (u.permissions || u.directPermissions || []).map((p) =>
        typeof p.id === "number" ? p.id : Number(p.id)
      );
      setSelectedPermIds(permIds);
    } catch (e) {
      console.error("خطا در دریافت کاربر", e);
      setServerError("امکان دریافت اطلاعات کاربر وجود ندارد.");
    }
  }, [id]);

  // ---------- گرفتن نقش‌ها ----------
  const fetchRoles = useCallback(async () => {
    setLoadingRoles(true);
    try {
      const res = await getRoles({ page: 1, limit: 100, search: "" });
      setRoles(res.items || []);
    } catch (e) {
      console.error("خطا در دریافت نقش‌ها", e);
      setRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  }, []);

  // ---------- گرفتن پرمیشن‌ها ----------
  const fetchPermissions = useCallback(
    async (page = 1, currentSearch = "") => {
      setLoadingPerms(true);
      try {
        const res = await getPermissions({
          page,
          limit: permMeta.limit,
          search: currentSearch,
        });

        setPermData(res.items || []);
        setPermMeta(
          res.pagination || {
            page,
            limit: permMeta.limit,
            total: 0,
            lastPage: 1,
          }
        );
      } catch (e) {
        console.error("خطا در دریافت سطوح دسترسی", e);
        setPermData([]);
        setPermMeta((prev) => ({ ...prev, total: 0 }));
      } finally {
        setLoadingPerms(false);
      }
    },
    [permMeta.limit]
  );

  useEffect(() => {
    fetchUser();
    fetchRoles();
    fetchPermissions(1, "");
  }, [fetchUser, fetchRoles, fetchPermissions]);

  // ---------- سرچ پرمیشن ----------
  const handlePermSearchChange = (e) => {
    const value = e.target.value;
    setPermSearch(value);
    fetchPermissions(1, value);
  };

  // ---------- صفحه‌بندی پرمیشن ----------
  const handlePermPageChange = (page) => {
    fetchPermissions(page, permSearch);
  };

  // ---------- تیک/برداشتن تیک نقش ----------
  const handleToggleRole = useCallback((roleId, nextChecked) => {
    const idNum = typeof roleId === "number" ? roleId : Number(roleId);
    setSelectedRoleIds((prev) => {
      const exists = prev.includes(idNum);
      if (nextChecked && !exists) return [...prev, idNum];
      if (!nextChecked && exists) return prev.filter((id) => id !== idNum);
      return prev;
    });
  }, []);

  // ---------- تیک/برداشتن تیک پرمیشن ----------
  const handleTogglePermission = useCallback((permId, nextChecked) => {
    const idNum = typeof permId === "number" ? permId : Number(permId);
    setSelectedPermIds((prev) => {
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
      await syncUserRoles(id, selectedRoleIds);
      await syncUserPermissions(id, selectedPermIds);

      setSuccessMsg("نقش‌ها و دسترسی‌های کاربر با موفقیت ذخیره شد.");
    } catch (err) {
      console.error("خطا در ذخیره نقش‌ها/دسترسی‌ها", err);
      const msg =
        err?.response?.data?.message ||
        "خطایی در ذخیره‌سازی نقش‌ها و دسترسی‌ها رخ داد.";
      setServerError(Array.isArray(msg) ? msg.join("، ") : msg);
    } finally {
      setSaving(false);
    }
  }, [id, selectedRoleIds, selectedPermIds]);

  // ---------- ستون‌های نقش‌ها (با fix چک‌باکس) ----------
  const roleColumns = useMemo(
    () => [
      {
        id: "selectRole",
        header: "",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const roleIdRaw = row.original?.id;
          const roleId =
            typeof roleIdRaw === "number" ? roleIdRaw : Number(roleIdRaw);
          const isChecked = selectedRoleIds.includes(roleId);

          const stop = (e) => {
            e.preventDefault();
            e.stopPropagation();
          };

          return (
            <div className="text-center" onClick={stop} onMouseDown={stop}>
              <input
                type="checkbox"
                className="form-check-input"
                checked={isChecked}
                readOnly
                onClick={(e) => {
                  stop(e);
                  handleToggleRole(roleId, !isChecked);
                }}
                onChange={(e) => {
                  stop(e);
                  handleToggleRole(roleId, e.target.checked);
                }}
                style={{ pointerEvents: "auto", cursor: "pointer" }}
              />
            </div>
          );
        },
      },
      {
        id: "name",
        header: "نام نقش",
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
    ],
    [handleToggleRole, selectedRoleIds.join(",")]
  );

  // ---------- ستون‌های پرمیشن‌ها (کپی fix از RolePermissions) ----------
  const permColumns = useMemo(
    () => [
      {
        id: "selectPerm",
        header: "",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const permIdRaw = row.original?.id;
          const permId =
            typeof permIdRaw === "number" ? permIdRaw : Number(permIdRaw);
          const isChecked = selectedPermIds.includes(permId);

          const stop = (e) => {
            e.preventDefault();
            e.stopPropagation();
          };

          return (
            <div className="text-center" onClick={stop} onMouseDown={stop}>
              <input
                type="checkbox"
                className="form-check-input"
                checked={isChecked}
                readOnly
                onClick={(e) => {
                  stop(e);
                  handleTogglePermission(permId, !isChecked);
                }}
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
    [handleTogglePermission, selectedPermIds.join(",")]
  );

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="مدیریت کاربران"
          breadcrumbItem="نقش‌ها و دسترسی‌های کاربر"
        />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader>
                <Row className="align-items-center g-2">
                  <Col md="6">
                    <h4 className="card-title mb-1">
                      نقش‌ها و دسترسی‌های{" "}
                      {user ? `«${user.name || user.email}»` : "کاربر"}
                    </h4>
                    {user && (
                      <div className="text-muted small">
                        ایمیل: <strong>{user.email}</strong>
                      </div>
                    )}
                  </Col>
                  <Col md="6" className="text-md-end mt-2 mt-md-0">
                    <Button
                      color="secondary"
                      className="me-2"
                      onClick={() => navigate("/users")}
                      disabled={saving}
                    >
                      بازگشت به لیست کاربران
                    </Button>
                    <Button color="primary" onClick={handleSave} disabled={saving}>
                      {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                    </Button>
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

                <Row>
                  {/* نقش‌ها */}
                  <Col md="6" className="mb-4">
                    <h5 className="mb-3">نقش‌ها</h5>

                    <TableContainer
                      columns={roleColumns}
                      data={roles || []}
                      isGlobalFilter={false}
                      isPagination={false}
                      isLoading={loadingRoles}
                      tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
                    />
                  </Col>

                  {/* پرمیشن‌ها */}
                  <Col md="6" className="mb-4">
                    <h5 className="mb-3">دسترسی‌های مستقیم</h5>

                    <div className="mb-3">
                      <Input
                        type="text"
                        value={permSearch}
                        onChange={handlePermSearchChange}
                        placeholder="جستجو بر اساس نام، برچسب یا ماژول..."
                      />
                    </div>

                    <TableContainer
                      columns={permColumns}
                      data={permData || []}
                      isGlobalFilter={false}
                      isPagination={false}
                      isLoading={loadingPerms}
                      tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
                    />

                    <Paginations
                      perPageData={permMeta.limit}
                      data={permData}
                      totalRecords={permMeta.total}
                      currentPage={permMeta.page}
                      setCurrentPage={handlePermPageChange}
                      isShowingPageLength={true}
                      paginationDiv="col-sm-auto"
                      paginationClass="pagination pagination-sm mb-0"
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UserPermissions;
