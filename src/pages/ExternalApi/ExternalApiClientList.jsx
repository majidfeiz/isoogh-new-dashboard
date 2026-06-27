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

const EMPTY_FORM = { name: "", description: "", is_active: true, school_id: "" };

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

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.warning("نام کلاینت الزامی است");
    setSaving(true);
    try {
      const created = await createExternalApiClient({
        name: form.name.trim(),
        description: form.description.trim(),
        is_active: form.is_active,
        school_id: form.school_id ? Number(form.school_id) : null,
      });
      setNewApiKey(created.api_key || "");
      await fetchData();
      toast.success("کلاینت با موفقیت ایجاد شد");
    } catch {
      toast.error("خطا در ایجاد کلاینت");
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
        id: "school_id",
        header: "مجموعه",
        accessorKey: "school_id",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => {
          const sid = info.getValue();
          if (!sid) return <span className="text-muted small">همه مجموعه‌ها</span>;
          const school = schools.find((s) => s.id === sid);
          return school ? school.name : `#${sid}`;
        },
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
                <Label>مجموعه (اختیاری)</Label>
                <Input
                  type="select"
                  name="school_id"
                  value={form.school_id}
                  onChange={handleFormChange}
                >
                  <option value="">همه مجموعه‌ها (بدون محدودیت)</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Input>
                <small className="text-muted">
                  اگر انتخاب شود، کلاینت فقط داده‌های همان مجموعه را می‌بیند.
                </small>
              </FormGroup>
              <FormGroup check>
                <Input
                  type="checkbox"
                  name="is_active"
                  id="is_active_create"
                  checked={form.is_active}
                  onChange={handleFormChange}
                />
                <Label check for="is_active_create">فعال</Label>
              </FormGroup>
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
