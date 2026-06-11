import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Spinner,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import {
  deleteVoipWebhook,
  getVoipWebhooks,
  testVoipWebhook,
} from "../../services/voipWebhookService.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("fa-IR");
};

const VoipWebhookList = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  document.title = "وب‌هوک‌های VoIP | داشبورد آیسوق";

  const canCreate = hasPermission("voip-webhooks.create");
  const canUpdate = hasPermission("voip-webhooks.update");
  const canDelete = hasPermission("voip-webhooks.delete");
  const canLogs = hasPermission("voip-webhooks.logs");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testingId, setTestingId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const items = await getVoipWebhooks();
      setData(items);
    } catch {
      toast.error("خطا در دریافت لیست وب‌هوک‌ها");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTest = useCallback(async (id) => {
    setTestingId(id);
    try {
      await testVoipWebhook(id);
      toast.success("درخواست تست ارسال شد");
    } catch {
      toast.error("خطا در ارسال تست وب‌هوک");
    } finally {
      setTestingId(null);
    }
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("آیا از حذف این وب‌هوک مطمئن هستید؟")) return;
      setLoading(true);
      try {
        await deleteVoipWebhook(id);
        await fetchData();
        toast.success("وب‌هوک حذف شد");
      } catch {
        toast.error("خطا در حذف وب‌هوک");
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
        id: "src",
        header: "شماره (src)",
        accessorKey: "src",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => <code>{info.getValue() || "-"}</code>,
      },
      {
        id: "webhook_url",
        header: "URL",
        accessorKey: "webhook_url",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => (
          <span
            className="text-truncate d-block"
            style={{ maxWidth: 250 }}
            title={info.getValue()}
          >
            {info.getValue() || "-"}
          </span>
        ),
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
            <div className="d-flex gap-1 flex-wrap">
              {canUpdate && (
                <>
                  <Button
                    color="warning"
                    size="sm"
                    onClick={() => navigate(`/voip-webhooks/${id}/edit`)}
                  >
                    ویرایش
                  </Button>
                  <Button
                    color="info"
                    size="sm"
                    onClick={() => handleTest(id)}
                    disabled={testingId === id}
                  >
                    {testingId === id ? <Spinner size="sm" /> : "تست"}
                  </Button>
                </>
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
    [canUpdate, canDelete, handleDelete, handleTest, loading, navigate, testingId]
  );

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="VoIP" breadcrumbItem="وب‌هوک‌ها" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h4 className="card-title mb-1">وب‌هوک‌های VoIP</h4>
                  <p className="text-muted mb-0">ارسال رویداد تماس به سرویس‌های خارجی</p>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {loading && <Spinner size="sm" color="primary" />}
                  {canCreate && (
                    <Button color="primary" onClick={() => navigate("/voip-webhooks/create")}>
                      <i className="bx bx-plus me-1" />
                      وب‌هوک جدید
                    </Button>
                  )}
                  {canLogs && (
                    <Button color="light" onClick={() => navigate("/voip-webhooks/logs")}>
                      <i className="bx bx-list-ul me-1" />
                      لاگ ارسال‌ها
                    </Button>
                  )}
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
    </div>
  );
};

export default VoipWebhookList;
