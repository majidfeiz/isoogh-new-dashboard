// src/pages/Admin/DashboardWidgets/index.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner,
  Table,
} from "reactstrap";
import { toast } from "react-toastify";

import Breadcrumbs from "../../../components/Common/Breadcrumb";
import {
  getAdminWidgets,
  toggleWidgetStatus,
  getWidgetRoles,
  updateWidgetRoles,
  removeWidgetRole,
} from "../../../services/dashboardService.jsx";
import { getRoles } from "../../../services/roleService.jsx";

const CATEGORY_LABELS = { stats: "آمار", charts: "نمودار", tables: "جدول", misc: "سایر" };
const CATEGORY_COLORS = { stats: "primary", charts: "success", tables: "info", misc: "warning" };

const DashboardWidgetsAdmin = () => {
  document.title = "مدیریت ویجت‌های داشبورد | آیسوق";

  const [widgets, setWidgets] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Roles modal
  const [rolesModal, setRolesModal] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);

  // Status toggle confirm modal
  const [statusModal, setStatusModal] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null); // { id, isActive }
  const [statusLoading, setStatusLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all"); // all | active | inactive

  // ── Load data ──────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [widgetList, roleList] = await Promise.all([
        getAdminWidgets(),          // GET /dashboard/admin/widgets — includes inactive
        getRoles({ limit: 100 }),
      ]);
      setWidgets(widgetList);
      setRoles(roleList.items || []);
    } catch {
      toast.error("خطا در بارگذاری اطلاعات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Roles modal ────────────────────────────
  const openRolesModal = useCallback(async (widget) => {
    setSelectedWidget(widget);
    setRolesModal(true);
    setRolesLoading(true);
    try {
      const data = await getWidgetRoles(widget.id);
      setSelectedRoleIds(data?.roleIds || []);
    } catch {
      setSelectedRoleIds([]);
    } finally {
      setRolesLoading(false);
    }
  }, []);

  const closeRolesModal = () => {
    setRolesModal(false);
    setSelectedWidget(null);
    setSelectedRoleIds([]);
  };

  const handleToggleRole = (roleId) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSaveRoles = async () => {
    if (!selectedWidget) return;
    setSaving(true);
    try {
      await updateWidgetRoles(selectedWidget.id, selectedRoleIds);
      setWidgets((prev) =>
        prev.map((w) => w.id === selectedWidget.id ? { ...w, allowedRoleIds: selectedRoleIds } : w)
      );
      toast.success("نقش‌های ویجت ذخیره شد");
      closeRolesModal();
    } catch {
      toast.error("خطا در ذخیره نقش‌ها");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveRole = async (roleId) => {
    if (!selectedWidget) return;
    try {
      await removeWidgetRole(selectedWidget.id, roleId);
      const newIds = selectedRoleIds.filter((id) => id !== roleId);
      setSelectedRoleIds(newIds);
      toast.success("نقش حذف شد");
    } catch {
      toast.error("خطا در حذف نقش");
    }
  };

  // ── Status toggle ──────────────────────────
  const askToggleStatus = useCallback((widget) => {
    setStatusTarget({ id: widget.id, name: widget.name, isActive: widget.isActive });
    setStatusModal(true);
  }, []);

  const confirmToggleStatus = async () => {
    if (!statusTarget) return;
    setStatusLoading(true);
    try {
      const updated = await toggleWidgetStatus(statusTarget.id, !statusTarget.isActive);
      setWidgets((prev) =>
        prev.map((w) => w.id === statusTarget.id ? { ...w, isActive: updated?.isActive ?? !statusTarget.isActive } : w)
      );
      toast.success(
        !statusTarget.isActive
          ? `ویجت "${statusTarget.name}" فعال شد`
          : `ویجت "${statusTarget.name}" غیرفعال شد`
      );
      setStatusModal(false);
      setStatusTarget(null);
    } catch (e) {
      if (e?.response?.status === 403) toast.error("دسترسی کافی ندارید");
      else toast.error("خطا در تغییر وضعیت ویجت");
    } finally {
      setStatusLoading(false);
    }
  };

  // ── Filters ────────────────────────────────
  const filtered = useMemo(() => {
    let list = widgets;
    if (categoryFilter !== "all") list = list.filter((w) => w.category === categoryFilter);
    if (activeFilter === "active") list = list.filter((w) => w.isActive);
    if (activeFilter === "inactive") list = list.filter((w) => !w.isActive);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((w) => w.name?.toLowerCase().includes(q) || w.key?.toLowerCase().includes(q));
    }
    return list;
  }, [widgets, categoryFilter, activeFilter, search]);

  const categories = [...new Set(widgets.map((w) => w.category))];
  const activeCount = widgets.filter((w) => w.isActive).length;
  const inactiveCount = widgets.filter((w) => !w.isActive).length;

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="ادمین" breadcrumbItem="مدیریت ویجت‌های داشبورد" />

          {/* Summary cards */}
          <Row className="mb-3 g-3">
            <Col xs={6} md={3}>
              <Card className="mb-0 border-0 shadow-sm">
                <CardBody className="py-3 d-flex align-items-center gap-3">
                  <div className="avatar-sm bg-primary-subtle rounded d-flex align-items-center justify-content-center">
                    <i className="bx bxs-widget text-primary font-size-20" />
                  </div>
                  <div>
                    <p className="mb-0 text-muted font-size-12">کل ویجت‌ها</p>
                    <h5 className="mb-0 fw-bold">{widgets.length}</h5>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xs={6} md={3}>
              <Card className="mb-0 border-0 shadow-sm">
                <CardBody className="py-3 d-flex align-items-center gap-3">
                  <div className="avatar-sm bg-success-subtle rounded d-flex align-items-center justify-content-center">
                    <i className="bx bx-check-circle text-success font-size-20" />
                  </div>
                  <div>
                    <p className="mb-0 text-muted font-size-12">فعال</p>
                    <h5 className="mb-0 fw-bold text-success">{activeCount}</h5>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xs={6} md={3}>
              <Card className="mb-0 border-0 shadow-sm">
                <CardBody className="py-3 d-flex align-items-center gap-3">
                  <div className="avatar-sm bg-danger-subtle rounded d-flex align-items-center justify-content-center">
                    <i className="bx bx-x-circle text-danger font-size-20" />
                  </div>
                  <div>
                    <p className="mb-0 text-muted font-size-12">غیرفعال</p>
                    <h5 className="mb-0 fw-bold text-danger">{inactiveCount}</h5>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Card>
            <CardHeader className="bg-transparent">
              <Row className="align-items-center g-2">
                <Col>
                  <h5 className="mb-0 d-flex align-items-center gap-2">
                    <i className="bx bxs-widget text-primary font-size-20" />
                    ویجت‌های داشبورد
                  </h5>
                  <p className="text-muted mb-0 font-size-13 mt-1">
                    مدیریت وضعیت و دسترسی‌های نقش هر ویجت
                  </p>
                </Col>
                <Col xs="auto">
                  <div className="d-flex gap-2 flex-wrap">
                    <Input
                      type="text"
                      placeholder="جستجو..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      bsSize="sm"
                      style={{ width: 160 }}
                    />
                    <Input
                      type="select"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      bsSize="sm"
                      style={{ width: 110 }}
                    >
                      <option value="all">همه دسته‌ها</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>
                      ))}
                    </Input>
                    <Input
                      type="select"
                      value={activeFilter}
                      onChange={(e) => setActiveFilter(e.target.value)}
                      bsSize="sm"
                      style={{ width: 110 }}
                    >
                      <option value="all">همه وضعیت‌ها</option>
                      <option value="active">فقط فعال</option>
                      <option value="inactive">فقط غیرفعال</option>
                    </Input>
                  </div>
                </Col>
              </Row>
            </CardHeader>

            <CardBody className="p-0">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner color="primary" />
                  <p className="text-muted mt-2 mb-0">در حال بارگذاری...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bx bx-search-alt font-size-36 d-block mb-2" />
                  <p className="mb-0">ویجتی یافت نشد</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table className="table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="fw-medium font-size-13 text-muted border-0 ps-3" style={{ width: 40 }}>#</th>
                        <th className="fw-medium font-size-13 text-muted border-0">نام ویجت</th>
                        <th className="fw-medium font-size-13 text-muted border-0">دسته</th>
                        <th className="fw-medium font-size-13 text-muted border-0">وضعیت دسترسی نقش</th>
                        <th className="fw-medium font-size-13 text-muted border-0">وضعیت سیستمی</th>
                        <th className="fw-medium font-size-13 text-muted border-0 text-center">عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((widget, idx) => {
                        const restricted = widget.allowedRoleIds?.length > 0;
                        return (
                          <tr
                            key={widget.id}
                            style={{ opacity: widget.isActive ? 1 : 0.6, transition: "opacity 0.2s" }}
                          >
                            <td className="ps-3 text-muted font-size-13">{idx + 1}</td>

                            {/* Name + icon */}
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className={`avatar-xs bg-${CATEGORY_COLORS[widget.category] || "primary"}-subtle rounded d-flex align-items-center justify-content-center`}
                                  style={{ flexShrink: 0 }}
                                >
                                  <i className={`bx bx-widget text-${CATEGORY_COLORS[widget.category] || "primary"} font-size-14`} />
                                </div>
                                <div>
                                  <p className="mb-0 fw-medium font-size-13">{widget.name}</p>
                                  <code className="bg-light px-1 rounded font-size-10 text-muted">{widget.key}</code>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td>
                              <Badge color={CATEGORY_COLORS[widget.category] || "secondary"} pill className="font-size-11">
                                {CATEGORY_LABELS[widget.category] || widget.category}
                              </Badge>
                            </td>

                            {/* Role access */}
                            <td>
                              {restricted ? (
                                <span className="d-flex align-items-center gap-1 text-warning font-size-12">
                                  <i className="bx bx-lock font-size-14" />
                                  {widget.allowedRoleIds.length} نقش
                                </span>
                              ) : (
                                <span className="d-flex align-items-center gap-1 text-success font-size-12">
                                  <i className="bx bx-globe font-size-14" />
                                  برای همه
                                </span>
                              )}
                            </td>

                            {/* Active status */}
                            <td>
                              <Badge
                                color={widget.isActive ? "success" : "danger"}
                                className="font-size-11 d-inline-flex align-items-center gap-1"
                                pill
                              >
                                <i className={`bx ${widget.isActive ? "bx-check-circle" : "bx-x-circle"} font-size-12`} />
                                {widget.isActive ? "فعال" : "غیرفعال"}
                              </Badge>
                            </td>

                            {/* Actions */}
                            <td>
                              <div className="d-flex align-items-center justify-content-center gap-2">
                                <Button
                                  size="sm"
                                  color="primary"
                                  outline
                                  onClick={() => openRolesModal(widget)}
                                  className="d-inline-flex align-items-center gap-1 px-2"
                                  title="مدیریت نقش‌های دسترسی"
                                >
                                  <i className="bx bx-shield-alt-2 font-size-14" />
                                  نقش‌ها
                                </Button>

                                <Button
                                  size="sm"
                                  color={widget.isActive ? "danger" : "success"}
                                  outline
                                  onClick={() => askToggleStatus(widget)}
                                  className="d-inline-flex align-items-center gap-1 px-2"
                                  title={widget.isActive ? "غیرفعال کردن ویجت" : "فعال کردن ویجت"}
                                >
                                  <i className={`bx ${widget.isActive ? "bx-pause-circle" : "bx-play-circle"} font-size-14`} />
                                  {widget.isActive ? "غیرفعال" : "فعال"}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
            </CardBody>
          </Card>
        </Container>
      </div>

      {/* ── Roles Modal ──────────────────────── */}
      <Modal isOpen={rolesModal} toggle={closeRolesModal} centered size="md">
        <ModalHeader toggle={closeRolesModal} className="border-bottom-0 pb-0">
          <div className="d-flex align-items-center gap-2">
            <div className="avatar-xs bg-primary-subtle rounded d-flex align-items-center justify-content-center">
              <i className="bx bx-shield-alt-2 text-primary font-size-16" />
            </div>
            <div>
              <h6 className="mb-0">مدیریت نقش‌های دسترسی</h6>
              {selectedWidget && <p className="text-muted mb-0 font-size-11">{selectedWidget.name}</p>}
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="pt-2">
          {rolesLoading ? (
            <div className="text-center py-4"><Spinner color="primary" /></div>
          ) : (
            <>
              <div className={`alert alert-${selectedRoleIds.length === 0 ? "success" : "warning"} d-flex align-items-center gap-2 py-2 mb-3`}>
                <i className={`bx ${selectedRoleIds.length === 0 ? "bx-globe" : "bx-lock"} font-size-18`} />
                <span className="font-size-13">
                  {selectedRoleIds.length === 0
                    ? "این ویجت برای تمام کاربران قابل مشاهده است"
                    : `فقط ${selectedRoleIds.length} نقش انتخاب‌شده می‌توانند ببینند`}
                </span>
              </div>

              {selectedRoleIds.length > 0 && (
                <div className="d-flex flex-wrap gap-1 mb-3">
                  {selectedRoleIds.map((id) => {
                    const role = roles.find((r) => r.id === id);
                    if (!role) return null;
                    return (
                      <span key={id} className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1 d-flex align-items-center gap-1">
                        {role.display_name || role.name}
                        <button
                          className="btn btn-sm p-0 border-0 text-primary"
                          style={{ lineHeight: 1, width: 16, height: 16 }}
                          onClick={() => handleRemoveRole(id)}
                        >
                          <i className="bx bx-x font-size-12" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="border rounded" style={{ maxHeight: 280, overflowY: "auto" }}>
                {roles.length === 0 ? (
                  <p className="text-muted text-center py-3 mb-0 font-size-13">نقشی یافت نشد</p>
                ) : roles.map((role) => (
                  <div
                    key={role.id}
                    className={`d-flex align-items-center p-2 border-bottom ${selectedRoleIds.includes(role.id) ? "bg-primary-subtle" : ""}`}
                    style={{ cursor: "pointer", transition: "background 0.15s" }}
                    onClick={() => handleToggleRole(role.id)}
                  >
                    <Input
                      type="checkbox"
                      className="form-check-input me-2 mt-0"
                      checked={selectedRoleIds.includes(role.id)}
                      onChange={() => handleToggleRole(role.id)}
                      style={{ cursor: "pointer" }}
                    />
                    <div className="flex-grow-1">
                      <span className="fw-medium font-size-13">{role.display_name || role.name}</span>
                      {role.name && role.display_name && (
                        <span className="text-muted font-size-11 ms-1">({role.name})</span>
                      )}
                    </div>
                    {selectedRoleIds.includes(role.id) && <i className="bx bx-check text-primary font-size-16" />}
                  </div>
                ))}
              </div>
              <p className="text-muted font-size-11 mt-2 mb-0">
                <i className="bx bx-info-circle me-1" />
                انتخاب نکردن هیچ نقشی = ویجت برای همه قابل مشاهده است.
              </p>
            </>
          )}
        </ModalBody>

        <ModalFooter className="border-top-0 pt-0">
          <Button color="light" size="sm" onClick={closeRolesModal} disabled={saving}>انصراف</Button>
          <Button color="primary" size="sm" onClick={handleSaveRoles} disabled={saving || rolesLoading}>
            {saving ? <Spinner size="sm" className="me-1" /> : null}
            ذخیره تغییرات
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── Status Toggle Confirm Modal ───────── */}
      <Modal isOpen={statusModal} toggle={() => !statusLoading && setStatusModal(false)} centered size="sm">
        <ModalBody className="text-center px-4 py-4">
          <div
            className={`avatar-sm mx-auto mb-3 bg-${statusTarget?.isActive ? "danger" : "success"}-subtle rounded-circle d-flex align-items-center justify-content-center`}
            style={{ width: 56, height: 56 }}
          >
            <i
              className={`bx ${statusTarget?.isActive ? "bx-pause-circle text-danger" : "bx-play-circle text-success"} font-size-28`}
            />
          </div>

          <h6 className="fw-semibold mb-2">
            {statusTarget?.isActive ? "غیرفعال کردن ویجت" : "فعال کردن ویجت"}
          </h6>

          {statusTarget?.isActive ? (
            <p className="text-muted font-size-13 mb-4">
              غیرفعال کردن <strong>«{statusTarget?.name}»</strong> این ویجت را از داشبورد تمام کاربران پنهان می‌کند.
              رکوردهای شخصی‌سازی حذف نمی‌شوند و با فعال‌سازی مجدد بازمی‌گردند. ادامه می‌دهید؟
            </p>
          ) : (
            <p className="text-muted font-size-13 mb-4">
              ویجت <strong>«{statusTarget?.name}»</strong> در Widget Picker کاربران نمایش داده خواهد شد. ادامه می‌دهید؟
            </p>
          )}

          <div className="d-flex gap-2 justify-content-center">
            <Button
              color={statusTarget?.isActive ? "danger" : "success"}
              size="sm"
              onClick={confirmToggleStatus}
              disabled={statusLoading}
              className="d-flex align-items-center gap-1"
            >
              {statusLoading ? <Spinner size="sm" className="me-1" /> : null}
              {statusTarget?.isActive ? "بله، غیرفعال کن" : "بله، فعال کن"}
            </Button>
            <Button
              color="light"
              size="sm"
              onClick={() => { setStatusModal(false); setStatusTarget(null); }}
              disabled={statusLoading}
            >
              انصراف
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default DashboardWidgetsAdmin;
