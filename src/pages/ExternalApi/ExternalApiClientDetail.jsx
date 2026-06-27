import React, { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
  Spinner,
  TabContent,
  TabPane,
  Table,
} from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import classnames from "classnames";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import Paginations from "../../components/Common/Paginations.jsx";
import {
  addClientIp,
  deleteClientIp,
  getExternalApiClient,
  getExternalApiLogs,
  regenerateApiKey,
  updateExternalApiClient,
} from "../../services/externalApiService.jsx";
import { getSchools } from "../../services/schoolService.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("fa-IR");
};

const ExternalApiClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  document.title = "جزئیات کلاینت API | داشبورد آیسوق";

  const canUpdate = hasPermission("external-api.update");
  const canLogs = hasPermission("external-api.logs");

  const [client, setClient] = useState(null);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");

  // edit form
  const [editForm, setEditForm] = useState({ name: "", description: "", is_active: true, school_id: "" });
  const [saving, setSaving] = useState(false);

  // api key
  const [shownApiKey, setShownApiKey] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [confirmRegenModal, setConfirmRegenModal] = useState(false);

  // IP management
  const [newIp, setNewIp] = useState("");
  const [addingIp, setAddingIp] = useState(false);
  const [deletingIpId, setDeletingIpId] = useState(null);

  // logs
  const [logs, setLogs] = useState([]);
  const [logsMeta, setLogsMeta] = useState({ page: 1, per_page: 30, total: 0, lastPage: 1 });
  const [logsLoading, setLogsLoading] = useState(false);

  const fetchClient = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getExternalApiClient(id);
      setClient(data);
      setEditForm({
        name: data.name,
        description: data.description,
        is_active: data.is_active,
        school_id: data.school_id ?? "",
      });
    } catch {
      toast.error("خطا در دریافت اطلاعات کلاینت");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchLogs = useCallback(
    async (page = 1) => {
      if (!canLogs) return;
      setLogsLoading(true);
      try {
        const res = await getExternalApiLogs({ page, per_page: 30, client_id: id });
        setLogs(res.items);
        setLogsMeta(res.pagination);
      } catch {
        toast.error("خطا در دریافت لاگ‌ها");
      } finally {
        setLogsLoading(false);
      }
    },
    [id, canLogs]
  );

  useEffect(() => {
    fetchClient();
    getSchools({ limit: 200 })
      .then((res) => setSchools(res.items || []))
      .catch(() => {});
  }, [fetchClient]);

  useEffect(() => {
    if (activeTab === "logs") fetchLogs(1);
  }, [activeTab, fetchLogs]);

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return toast.warning("نام الزامی است");
    setSaving(true);
    try {
      await updateExternalApiClient(id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        is_active: editForm.is_active,
        school_id: editForm.school_id ? Number(editForm.school_id) : null,
      });
      await fetchClient();
      toast.success("تغییرات ذخیره شد");
    } catch {
      toast.error("خطا در ذخیره تغییرات");
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    setConfirmRegenModal(false);
    setRegenerating(true);
    try {
      // پاسخ: { "api_key": "newkey..." } — فقط api_key برمی‌گردد
      const apiKey = await regenerateApiKey(id);
      setShownApiKey(apiKey || "");
      toast.success("API Key جدید تولید شد");
    } catch {
      toast.error("خطا در تولید مجدد API Key");
    } finally {
      setRegenerating(false);
    }
  };

  const handleAddIp = async (e) => {
    e.preventDefault();
    if (!newIp.trim()) return toast.warning("آدرس IP الزامی است");
    setAddingIp(true);
    try {
      await addClientIp(id, newIp.trim());
      setNewIp("");
      await fetchClient();
      toast.success("IP اضافه شد");
    } catch {
      toast.error("خطا در افزودن IP");
    } finally {
      setAddingIp(false);
    }
  };

  const handleDeleteIp = async (ipId) => {
    if (!window.confirm("آیا از حذف این IP مطمئن هستید؟")) return;
    setDeletingIpId(ipId);
    try {
      await deleteClientIp(id, ipId);
      await fetchClient();
      toast.success("IP حذف شد");
    } catch {
      toast.error("خطا در حذف IP");
    } finally {
      setDeletingIpId(null);
    }
  };

  const schoolName = (sid) => {
    if (!sid) return <span className="text-muted">همه مجموعه‌ها (بدون محدودیت)</span>;
    const s = schools.find((x) => x.id === sid);
    return s ? s.name : `#${sid}`;
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
          <Spinner color="primary" />
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="page-content">
        <div className="container-fluid">
          <p className="text-danger">کلاینت یافت نشد.</p>
          <Button color="secondary" onClick={() => navigate(-1)}>بازگشت</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="API خارجی" breadcrumbItem={client.name || "جزئیات کلاینت"} />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                  <h4 className="card-title mb-1">{client.name}</h4>
                  <p className="text-muted mb-0 small">{client.description || "—"}</p>
                </div>
                <div className="d-flex gap-2 align-items-center">
                  {client.is_active ? (
                    <Badge color="success" pill className="fs-6">فعال</Badge>
                  ) : (
                    <Badge color="secondary" pill className="fs-6">غیرفعال</Badge>
                  )}
                  <Button color="light" size="sm" onClick={() => navigate(-1)}>
                    <i className="bx bx-arrow-back me-1" />
                    بازگشت
                  </Button>
                </div>
              </CardHeader>

              <CardBody>
                <Nav tabs className="mb-3">
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "info" })}
                      onClick={() => setActiveTab("info")}
                      style={{ cursor: "pointer" }}
                    >
                      اطلاعات پایه
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "apikey" })}
                      onClick={() => setActiveTab("apikey")}
                      style={{ cursor: "pointer" }}
                    >
                      API Key
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "ips" })}
                      onClick={() => setActiveTab("ips")}
                      style={{ cursor: "pointer" }}
                    >
                      IP های مجاز ({client.ips?.length || 0})
                    </NavLink>
                  </NavItem>
                  {canLogs && (
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "logs" })}
                        onClick={() => setActiveTab("logs")}
                        style={{ cursor: "pointer" }}
                      >
                        لاگ درخواست‌ها
                      </NavLink>
                    </NavItem>
                  )}
                </Nav>

                <TabContent activeTab={activeTab}>
                  {/* تب اطلاعات پایه */}
                  <TabPane tabId="info">
                    {canUpdate ? (
                      <Form onSubmit={handleSave} style={{ maxWidth: 520 }}>
                        <FormGroup>
                          <Label>نام <span className="text-danger">*</span></Label>
                          <Input
                            name="name"
                            value={editForm.name}
                            onChange={handleEditChange}
                            required
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label>توضیحات</Label>
                          <Input
                            type="textarea"
                            name="description"
                            value={editForm.description}
                            onChange={handleEditChange}
                            rows={3}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label>مجموعه (اختیاری)</Label>
                          <Input
                            type="select"
                            name="school_id"
                            value={editForm.school_id}
                            onChange={handleEditChange}
                          >
                            <option value="">همه مجموعه‌ها (بدون محدودیت)</option>
                            {schools.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </Input>
                          <small className="text-muted">
                            اگر مجموعه انتخاب شود، کلاینت فقط داده‌های همان مجموعه را می‌بیند.
                          </small>
                        </FormGroup>
                        <FormGroup check className="mb-3">
                          <Input
                            type="checkbox"
                            name="is_active"
                            id="is_active_edit"
                            checked={editForm.is_active}
                            onChange={handleEditChange}
                          />
                          <Label check for="is_active_edit">فعال</Label>
                        </FormGroup>
                        <Button color="primary" type="submit" disabled={saving}>
                          {saving ? <Spinner size="sm" /> : "ذخیره تغییرات"}
                        </Button>
                      </Form>
                    ) : (
                      <Table bordered size="sm" style={{ maxWidth: 520 }}>
                        <tbody>
                          <tr>
                            <th>نام</th>
                            <td>{client.name}</td>
                          </tr>
                          <tr>
                            <th>توضیحات</th>
                            <td>{client.description || "—"}</td>
                          </tr>
                          <tr>
                            <th>مجموعه</th>
                            <td>{schoolName(client.school_id)}</td>
                          </tr>
                          <tr>
                            <th>وضعیت</th>
                            <td>
                              {client.is_active ? (
                                <Badge color="success">فعال</Badge>
                              ) : (
                                <Badge color="secondary">غیرفعال</Badge>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <th>تاریخ ایجاد</th>
                            <td>{formatDateTime(client.created_at)}</td>
                          </tr>
                          <tr>
                            <th>آخرین ویرایش</th>
                            <td>{formatDateTime(client.updated_at)}</td>
                          </tr>
                        </tbody>
                      </Table>
                    )}
                  </TabPane>

                  {/* تب API Key */}
                  <TabPane tabId="apikey">
                    <div style={{ maxWidth: 600 }}>
                      <div className="alert alert-warning">
                        <i className="bx bx-info-circle me-1" />
                        API Key به صورت hash ذخیره می‌شود و قابل بازیابی نیست. برای دیدن کلید جدید باید آن را regenerate کنید.
                      </div>

                      {shownApiKey && (
                        <div className="alert alert-success mb-3">
                          <p className="mb-1 fw-bold">API Key جدید:</p>
                          <div className="d-flex align-items-center gap-2">
                            <code
                              className="flex-grow-1 p-2 bg-white rounded border text-break"
                              style={{ fontSize: "0.75rem", wordBreak: "break-all" }}
                            >
                              {shownApiKey}
                            </code>
                            <Button
                              color="outline-secondary"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(shownApiKey);
                                toast.success("کپی شد");
                              }}
                            >
                              <i className="bx bx-copy" />
                            </Button>
                          </div>
                          <p className="text-danger mt-2 mb-0 small fw-bold">
                            این کلید دیگر نمایش داده نخواهد شد. همین الان به ارگان ابلاغ کنید.
                          </p>
                        </div>
                      )}

                      {canUpdate && (
                        <Button
                          color="warning"
                          onClick={() => setConfirmRegenModal(true)}
                          disabled={regenerating}
                        >
                          {regenerating ? <Spinner size="sm" /> : (
                            <>
                              <i className="bx bx-refresh me-1" />
                              تولید مجدد API Key
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </TabPane>

                  {/* تب IP ها */}
                  <TabPane tabId="ips">
                    {canUpdate && (
                      <Form onSubmit={handleAddIp} className="mb-4" style={{ maxWidth: 420 }}>
                        <FormGroup className="d-flex gap-2 align-items-end mb-0">
                          <div className="flex-grow-1">
                            <Label>افزودن IP مجاز</Label>
                            <Input
                              value={newIp}
                              onChange={(e) => setNewIp(e.target.value)}
                              placeholder="مثلاً: 185.105.100.50"
                              dir="ltr"
                            />
                          </div>
                          <Button color="primary" type="submit" disabled={addingIp}>
                            {addingIp ? <Spinner size="sm" /> : "افزودن"}
                          </Button>
                        </FormGroup>
                      </Form>
                    )}

                    {client.ips && client.ips.length > 0 ? (
                      <Table bordered size="sm" style={{ maxWidth: 500 }}>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>آدرس IP</th>
                            <th>تاریخ افزودن</th>
                            {canUpdate && <th>عملیات</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {client.ips.map((ip, idx) => (
                            <tr key={ip.id}>
                              <td>{idx + 1}</td>
                              <td><code>{ip.ip}</code></td>
                              <td>{formatDateTime(ip.created_at)}</td>
                              {canUpdate && (
                                <td>
                                  <Button
                                    color="danger"
                                    size="sm"
                                    onClick={() => handleDeleteIp(ip.id)}
                                    disabled={deletingIpId === ip.id}
                                  >
                                    {deletingIpId === ip.id ? <Spinner size="sm" /> : "حذف"}
                                  </Button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <p className="text-muted">هیچ IP مجازی تعریف نشده است.</p>
                    )}
                  </TabPane>

                  {/* تب لاگ‌ها */}
                  {canLogs && (
                    <TabPane tabId="logs">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="text-muted small">مجموع: {logsMeta.total} درخواست</span>
                        <Button color="light" size="sm" onClick={() => fetchLogs(logsMeta.page)} disabled={logsLoading}>
                          <i className="bx bx-refresh me-1" />
                          بروزرسانی
                        </Button>
                      </div>

                      {logsLoading ? (
                        <div className="text-center py-4">
                          <Spinner color="primary" />
                        </div>
                      ) : logs.length > 0 ? (
                        <>
                          <div className="table-responsive">
                            <Table bordered size="sm">
                              <thead>
                                <tr>
                                  <th>زمان</th>
                                  <th>IP</th>
                                  <th>Method</th>
                                  <th>مسیر</th>
                                  <th>وضعیت پاسخ</th>
                                  <th>زمان پاسخ</th>
                                </tr>
                              </thead>
                              <tbody>
                                {logs.map((log) => (
                                  <tr key={log.id}>
                                    <td className="text-nowrap">{formatDateTime(log.created_at)}</td>
                                    <td><code>{log.ip}</code></td>
                                    <td>
                                      <Badge color={log.method === "GET" ? "info" : "warning"}>
                                        {log.method}
                                      </Badge>
                                    </td>
                                    <td>
                                      <code className="text-break" style={{ fontSize: "0.75rem" }}>
                                        {log.path}
                                      </code>
                                    </td>
                                    <td>
                                      <Badge
                                        color={
                                          log.response_status >= 200 && log.response_status < 300
                                            ? "success"
                                            : log.response_status >= 400
                                            ? "danger"
                                            : "secondary"
                                        }
                                      >
                                        {log.response_status ?? "-"}
                                      </Badge>
                                    </td>
                                    <td className="text-nowrap">
                                      {log.response_time_ms != null ? `${log.response_time_ms} ms` : "-"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                          <Paginations
                            perPageData={logsMeta.per_page}
                            data={logs}
                            totalRecords={logsMeta.total}
                            currentPage={logsMeta.page}
                            setCurrentPage={(p) => fetchLogs(p)}
                            isShowingPageLength={true}
                            paginationDiv="col-sm-auto"
                            paginationClass="pagination pagination-sm mb-0"
                          />
                        </>
                      ) : (
                        <p className="text-muted">هیچ لاگی ثبت نشده است.</p>
                      )}
                    </TabPane>
                  )}
                </TabContent>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Modal تأیید Regenerate */}
      <Modal isOpen={confirmRegenModal} toggle={() => setConfirmRegenModal(false)}>
        <ModalHeader toggle={() => setConfirmRegenModal(false)}>تأیید تولید مجدد API Key</ModalHeader>
        <ModalBody>
          <p>آیا از تولید مجدد API Key مطمئن هستید؟</p>
          <p className="text-danger small mb-0">
            کلید قدیمی بلافاصله باطل می‌شود و تمام سرویس‌هایی که از آن استفاده می‌کنند باید به‌روزرسانی شوند.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setConfirmRegenModal(false)}>انصراف</Button>
          <Button color="warning" onClick={handleRegenerate}>بله، تولید کن</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ExternalApiClientDetail;
