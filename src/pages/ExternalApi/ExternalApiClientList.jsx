import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  Row,
  Spinner,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import {
  createExternalApiClient,
  deleteExternalApiClient,
  getExternalApiClients,
} from "../../services/externalApiService.jsx";
import { getSchools } from "../../services/schoolService.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("fa-IR");
};

const formatLimit = (value, unit) => {
  if (value === null || value === undefined) return "نامحدود";
  return unit ? `${value} ${unit}` : String(value);
};

const parsePositiveIntOrNull = (value, unlimited) => {
  if (unlimited) return null;
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue < 1) {
    throw new Error("مقدار محدودیت باید عدد صحیح بزرگ‌تر از صفر باشد");
  }
  return numberValue;
};

const buildRateLimitPayload = (form) => ({
  daily_request_limit: parsePositiveIntOrNull(
    form.dailyRequestLimit,
    form.dailyUnlimited
  ),
  max_concurrent_requests: parsePositiveIntOrNull(
    form.maxConcurrentRequests,
    form.concurrentUnlimited
  ),
  min_request_interval_seconds: parsePositiveIntOrNull(
    form.minRequestIntervalSeconds,
    form.intervalUnlimited
  ),
});

const EMPTY_FORM = {
  name: "",
  description: "",
  is_active: true,
  school_ids: [],
  dailyUnlimited: true,
  dailyRequestLimit: "",
  concurrentUnlimited: true,
  maxConcurrentRequests: "",
  intervalUnlimited: true,
  minRequestIntervalSeconds: "",
};

const ExternalApiClientList = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  document.title = "کلاینت‌های API خارجی | داشبورد آیسوق";

  const canCreate = hasPermission("external-api.create");
  const canShow = hasPermission("external-api.show");
  const canUpdate = hasPermission("external-api.update");
  const canDelete = hasPermission("external-api.delete");

  const [data, setData] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [newApiKey, setNewApiKey] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const items = await getExternalApiClients();
      setData(items);
    } catch {
      toast.error("خطا در دریافت لیست کلاینت‌ها");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    getSchools({ limit: 200 })
      .then((res) => setSchools(res.items || []))
      .catch(() => {});
  }, [fetchData]);

  const openModal = () => {
    setForm(EMPTY_FORM);
    setNewApiKey("");
    setModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSchoolChange = (e) => {
    const schoolIds = Array.from(e.target.selectedOptions, (option) => Number(option.value));
    setForm((prev) => ({ ...prev, school_ids: schoolIds }));
  };

  const toggleFormFlag = (name) => {
    setForm((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleFlagKeyDown = (e, name) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggleFormFlag(name);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.warning("نام کلاینت الزامی است");
    if (!form.school_ids.length) {
      return toast.warning("انتخاب حداقل یک مجموعه مجاز الزامی است");
    }
    setSaving(true);
    try {
      const rateLimitPayload = buildRateLimitPayload(form);
      const created = await createExternalApiClient({
        name: form.name.trim(),
        description: form.description.trim(),
        is_active: form.is_active,
        school_ids: form.school_ids,
        ...rateLimitPayload,
      });
      setNewApiKey(created.api_key || "");
      await fetchData();
      toast.success("کلاینت با موفقیت ایجاد شد");
    } catch (error) {
      toast.error(error?.message || "خطا در ایجاد کلاینت");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("آیا از حذف این کلاینت مطمئن هستید؟")) return;
      setLoading(true);
      try {
        await deleteExternalApiClient(id);
        await fetchData();
        toast.success("کلاینت حذف شد");
      } catch {
        toast.error("خطا در حذف کلاینت");
      } finally {
        setLoading(false);
      }
    },
    [fetchData]
  );

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        accessorKey: "id",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        id: "name",
        header: "نام",
        accessorKey: "name",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "description",
        header: "توضیحات",
        accessorKey: "description",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => info.getValue() || "-",
      },
      {
        id: "school_ids",
        header: "مدارس مجاز",
        accessorKey: "school_ids",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => {
          const schoolIds = info.getValue() || [];
          if (!schoolIds.length) return <span className="text-danger small">بدون مجموعه مجاز</span>;
          const visibleIds = schoolIds.slice(0, 3);
          return (
            <div className="d-flex flex-wrap gap-1">
              {visibleIds.map((schoolId) => {
                const school = schools.find((item) => Number(item.id) === Number(schoolId));
                return (
                  <Badge key={schoolId} color="light" className="text-dark border">
                    {school?.name || `#${schoolId}`}
                  </Badge>
                );
              })}
              {schoolIds.length > visibleIds.length && (
                <Badge color="primary">+{schoolIds.length - visibleIds.length}</Badge>
              )}
            </div>
          );
        },
      },
      {
        id: "daily_request_limit",
        header: "درخواست‌های ۲۴ ساعت",
        accessorKey: "daily_request_limit",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => formatLimit(info.getValue()),
      },
      {
        id: "max_concurrent_requests",
        header: "همزمان",
        accessorKey: "max_concurrent_requests",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => formatLimit(info.getValue()),
      },
      {
        id: "min_request_interval_seconds",
        header: "فاصله درخواست",
        accessorKey: "min_request_interval_seconds",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => formatLimit(info.getValue(), "ثانیه"),
      },
      {
        id: "active_requests",
        header: "در حال اجرا",
        accessorKey: "active_requests",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => {
          const value = Number(info.getValue() || 0);
          return value > 0 ? <Badge color="warning">{value}</Badge> : "0";
        },
      },
      {
        id: "last_request_at",
        header: "آخرین درخواست",
        accessorKey: "last_request_at",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => formatDateTime(info.getValue()),
      },
      {
        id: "is_active",
        header: "وضعیت",
        accessorKey: "is_active",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) =>
          info.getValue() ? (
            <Badge color="success" pill>فعال</Badge>
          ) : (
            <Badge color="secondary" pill>غیرفعال</Badge>
          ),
      },
      {
        id: "ips",
        header: "IP های مجاز",
        accessorKey: "ips",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => {
          const ips = info.getValue() || [];
          if (!ips.length) return <span className="text-muted">—</span>;
          return (
            <div className="d-flex flex-wrap gap-1">
              {ips.map((ip) => (
                <Badge key={ip.id} color="light" className="text-dark border">
                  {ip.ip}
                </Badge>
              ))}
            </div>
          );
        },
      },
      {
        id: "created_at",
        header: "تاریخ ایجاد",
        accessorKey: "created_at",
        enableColumnFilter: false,
        enableSorting: false,
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
              {(canShow || canUpdate) && (
                <Button
                  color="primary"
                  size="sm"
                  onClick={() => navigate(`/external-api-clients/${id}`)}
                >
                  مدیریت
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
    [canShow, canUpdate, canDelete, handleDelete, loading, navigate, schools]
  );

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="API خارجی" breadcrumbItem="کلاینت‌های API" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h4 className="card-title mb-1">کلاینت‌های API خارجی</h4>
                  <p className="text-muted mb-0">مدیریت دسترسی ارگان‌ها و مجموعه‌ها به API</p>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {loading && <Spinner size="sm" color="primary" />}
                  {canCreate && (
                    <Button color="primary" onClick={openModal}>
                      <i className="bx bx-plus me-1" />
                      کلاینت جدید
                    </Button>
                  )}
                  <Button color="light" onClick={() => navigate("/external-api-clients/logs")}>
                    <i className="bx bx-list-ul me-1" />
                    لاگ درخواست‌ها
                  </Button>
                </div>
              </CardHeader>

              <CardBody>
                <TableContainer
                  columns={columns}
                  data={data}
                  isGlobalFilter={false}
                  isPagination={false}
                  isLoading={loading}
                  tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Modal ایجاد کلاینت */}
      <Modal isOpen={modal} toggle={() => setModal(false)} size="md">
        <ModalHeader toggle={() => setModal(false)}>ایجاد کلاینت API جدید</ModalHeader>
        {newApiKey ? (
          <>
            <ModalBody>
              <div className="alert alert-success">
                <strong>کلاینت با موفقیت ایجاد شد!</strong>
                <p className="mb-1 mt-2 small">
                  API Key زیر را کپی کنید — این کلید فقط یک بار نمایش داده می‌شود:
                </p>
                <div className="d-flex align-items-center gap-2 mt-2">
                  <code
                    className="flex-grow-1 p-2 bg-white rounded border text-break"
                    style={{ fontSize: "0.75rem", wordBreak: "break-all" }}
                  >
                    {newApiKey}
                  </code>
                  <Button
                    color="outline-secondary"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(newApiKey);
                      toast.success("کپی شد");
                    }}
                  >
                    <i className="bx bx-copy" />
                  </Button>
                </div>
                <p className="text-danger mt-2 mb-0 small fw-bold">
                  این کلید دیگر نمایش داده نخواهد شد. همین الان کپی کنید.
                </p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={() => setModal(false)}>بستن</Button>
            </ModalFooter>
          </>
        ) : (
          <Form onSubmit={handleCreate}>
            <ModalBody>
              <FormGroup>
                <Label>نام <span className="text-danger">*</span></Label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="مثلاً: مجموعه شهید بهشتی"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>توضیحات</Label>
                <Input
                  type="textarea"
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  rows={2}
                  placeholder="توضیح اختیاری"
                />
              </FormGroup>
              <FormGroup>
                <Label>
                  مجموعه‌های مجاز این توکن <span className="text-danger">*</span>
                </Label>
                <Input
                  type="select"
                  name="school_ids"
                  value={form.school_ids.map(String)}
                  onChange={handleSchoolChange}
                  multiple
                  required
                  size={Math.min(Math.max(schools.length, 3), 7)}
                >
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Input>
                <small className="text-muted">
                  حداقل یک مجموعه انتخاب کنید. برای انتخاب چند مورد از Ctrl یا Command استفاده کنید.
                </small>
              </FormGroup>
              <FormGroup
                check
                role="checkbox"
                tabIndex={0}
                aria-checked={form.is_active}
                onClick={() => toggleFormFlag("is_active")}
                onKeyDown={(e) => handleFlagKeyDown(e, "is_active")}
                style={{ cursor: "pointer" }}
              >
                <Input
                  type="checkbox"
                  name="is_active"
                  id="is_active_create"
                  checked={form.is_active}
                  readOnly
                />
                <Label check for="is_active_create" style={{ pointerEvents: "none" }}>
                  فعال
                </Label>
              </FormGroup>

              <div className="border-top pt-3 mt-3">
                <h6 className="mb-3">محدودیت درخواست‌ها</h6>
                <Row className="g-3">
                  <Col md={12}>
                    <FormGroup className="mb-0">
                      <Label>حداکثر درخواست در ۲۴ ساعت</Label>
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          name="dailyRequestLimit"
                          value={form.dailyRequestLimit}
                          onChange={handleFormChange}
                          disabled={form.dailyUnlimited}
                          placeholder="مثلاً 10000"
                          style={{ maxWidth: 180 }}
                        />
                        <FormGroup
                          check
                          className="mb-0"
                          role="checkbox"
                          tabIndex={0}
                          aria-checked={form.dailyUnlimited}
                          onClick={() => toggleFormFlag("dailyUnlimited")}
                          onKeyDown={(e) => handleFlagKeyDown(e, "dailyUnlimited")}
                          style={{ cursor: "pointer" }}
                        >
                          <Input
                            type="checkbox"
                            name="dailyUnlimited"
                            id="daily_unlimited_create"
                            checked={form.dailyUnlimited}
                            readOnly
                          />
                          <Label check for="daily_unlimited_create" style={{ pointerEvents: "none" }}>
                            نامحدود
                          </Label>
                        </FormGroup>
                      </div>
                    </FormGroup>
                  </Col>

                  <Col md={12}>
                    <FormGroup className="mb-0">
                      <Label>حداکثر درخواست همزمان</Label>
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          name="maxConcurrentRequests"
                          value={form.maxConcurrentRequests}
                          onChange={handleFormChange}
                          disabled={form.concurrentUnlimited}
                          placeholder="مثلاً 5"
                          style={{ maxWidth: 180 }}
                        />
                        <FormGroup
                          check
                          className="mb-0"
                          role="checkbox"
                          tabIndex={0}
                          aria-checked={form.concurrentUnlimited}
                          onClick={() => toggleFormFlag("concurrentUnlimited")}
                          onKeyDown={(e) => handleFlagKeyDown(e, "concurrentUnlimited")}
                          style={{ cursor: "pointer" }}
                        >
                          <Input
                            type="checkbox"
                            name="concurrentUnlimited"
                            id="concurrent_unlimited_create"
                            checked={form.concurrentUnlimited}
                            readOnly
                          />
                          <Label check for="concurrent_unlimited_create" style={{ pointerEvents: "none" }}>
                            نامحدود
                          </Label>
                        </FormGroup>
                      </div>
                    </FormGroup>
                  </Col>

                  <Col md={12}>
                    <FormGroup className="mb-0">
                      <Label>حداقل فاصله بین درخواست‌ها</Label>
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          name="minRequestIntervalSeconds"
                          value={form.minRequestIntervalSeconds}
                          onChange={handleFormChange}
                          disabled={form.intervalUnlimited}
                          placeholder="ثانیه"
                          style={{ maxWidth: 180 }}
                        />
                        <span className="text-muted small">ثانیه</span>
                        <FormGroup
                          check
                          className="mb-0"
                          role="checkbox"
                          tabIndex={0}
                          aria-checked={form.intervalUnlimited}
                          onClick={() => toggleFormFlag("intervalUnlimited")}
                          onKeyDown={(e) => handleFlagKeyDown(e, "intervalUnlimited")}
                          style={{ cursor: "pointer" }}
                        >
                          <Input
                            type="checkbox"
                            name="intervalUnlimited"
                            id="interval_unlimited_create"
                            checked={form.intervalUnlimited}
                            readOnly
                          />
                          <Label check for="interval_unlimited_create" style={{ pointerEvents: "none" }}>
                            نامحدود
                          </Label>
                        </FormGroup>
                      </div>
                    </FormGroup>
                  </Col>
                </Row>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" type="button" onClick={() => setModal(false)}>
                انصراف
              </Button>
              <Button color="primary" type="submit" disabled={saving}>
                {saving ? <Spinner size="sm" /> : "ایجاد"}
              </Button>
            </ModalFooter>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default ExternalApiClientList;
