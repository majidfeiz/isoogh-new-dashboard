import React, { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Spinner,
  Table,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Paginations from "../../components/Common/Paginations.jsx";
import { getVoipWebhookLogs, getVoipWebhooks } from "../../services/voipWebhookService.jsx";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("fa-IR");
};

const getLogStatus = (log) => {
  if (log.success) return { color: "success", label: "موفق" };
  if (log.final_failure) return { color: "danger", label: "شکست نهایی" };
  return { color: "warning", label: "در انتظار تلاش بعدی" };
};

const VoipWebhookLogs = () => {
  const navigate = useNavigate();
  document.title = "لاگ وب‌هوک‌های VoIP | داشبورد آیسوق";

  const [webhooks, setWebhooks] = useState([]);
  const [selectedWebhook, setSelectedWebhook] = useState("");
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, per_page: 30, total: 0, lastPage: 1 });
  const [loading, setLoading] = useState(false);
  const [payloadModal, setPayloadModal] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    getVoipWebhooks()
      .then(setWebhooks)
      .catch(() => {});
  }, []);

  const fetchLogs = useCallback(
    async (page = 1) => {
      setLoading(true);
      setLoadError("");
      try {
        const res = await getVoipWebhookLogs({
          page,
          per_page: 30,
          webhook_id: selectedWebhook || undefined,
        });
        setLogs(res.items);
        setMeta(res.pagination);
      } catch {
        setLogs([]);
        setLoadError("دریافت لاگ ارسال‌ها انجام نشد.");
      } finally {
        setLoading(false);
      }
    },
    [selectedWebhook]
  );

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="وب‌هوک‌های VoIP" breadcrumbItem="لاگ ارسال‌ها" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h4 className="card-title mb-1">لاگ ارسال وب‌هوک‌ها</h4>
                  <p className="text-muted mb-0">مجموع: {meta.total} رکورد</p>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {loading && <Spinner size="sm" color="primary" />}
                  <Button color="light" size="sm" onClick={() => navigate("/voip-webhooks")}>
                    <i className="bx bx-arrow-back me-1" />
                    بازگشت
                  </Button>
                </div>
              </CardHeader>

              <CardBody>
                <Row className="g-3 align-items-end mb-4">
                  <Col md={4}>
                    <Label>فیلتر بر اساس وب‌هوک</Label>
                    <Input
                      type="select"
                      value={selectedWebhook}
                      onChange={(e) => setSelectedWebhook(e.target.value)}
                    >
                      <option value="">همه وب‌هوک‌ها</option>
                      {webhooks.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </Input>
                  </Col>
                  <Col md={2}>
                    <Button color="light" onClick={() => fetchLogs(1)} disabled={loading}>
                      بروزرسانی
                    </Button>
                  </Col>
                </Row>

                {loadError && <div className="alert alert-danger">{loadError}<Button size="sm" outline color="danger" className="ms-2" onClick={() => fetchLogs(meta.page)}>تلاش مجدد</Button></div>}
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                ) : logs.length > 0 ? (
                  <>
                    <div className="table-responsive">
                      <Table bordered size="sm">
                        <thead>
                          <tr>
                            <th>زمان ارسال</th>
                            <th>وب‌هوک</th>
                            <th>نوع / شناسه رویداد</th>
                            <th>شماره تلاش</th>
                            <th>تلاش بعدی</th>
                            <th>Payload</th>
                            <th>وضعیت پاسخ</th>
                            <th>خطا</th>
                            <th>شکست نهایی</th>
                            <th>نتیجه</th>
                            <th>پاسخ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {logs.map((log) => {
                            const webhookName = webhooks.find((w) => w.id === log.webhook_id)?.name;
                            const webhook = webhooks.find((w) => w.id === log.webhook_id);
                            const status = getLogStatus(log);
                            return (
                              <tr key={log.id}>
                                <td className="text-nowrap">{formatDateTime(log.sent_at)}</td>
                                <td>{webhookName || `#${log.webhook_id}`}</td>
                                <td>
                                  {log.audit_log_id ? <><Badge color="primary" className="me-1">تغییرات</Badge>#{log.audit_log_id}</> : log.voip_call_history_id ? <><Badge color="info" className="me-1">تماس</Badge>#{log.voip_call_history_id}</> : <><Badge color={webhook?.event_type === "audit_log" ? "primary" : "secondary"}>{webhook?.event_type === "audit_log" ? "تغییرات" : "نامشخص"}</Badge> —</>}
                                </td>
                                <td>{log.attempt_number ?? "-"}</td>
                                <td className="text-nowrap">{formatDateTime(log.next_attempt_at)}</td>
                                <td>
                                  <Button
                                    color="light"
                                    size="sm"
                                    onClick={() => setPayloadModal(log.payload)}
                                  >
                                    نمایش
                                  </Button>
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
                                <td>
                                  <span
                                    className="text-truncate d-block text-muted small"
                                    style={{ maxWidth: 150 }}
                                    title={log.error_message}
                                  >
                                    {log.error_message || "-"}
                                  </span>
                                </td>
                                <td>
                                  {log.final_failure ? (
                                    <Badge color="danger" pill>بله</Badge>
                                  ) : (
                                    <Badge color="secondary" pill>خیر</Badge>
                                  )}
                                </td>
                                <td>
                                  <Badge color={status.color} pill>{status.label}</Badge>
                                </td>
                                <td>
                                  <span
                                    className="text-truncate d-block text-muted small"
                                    style={{ maxWidth: 150 }}
                                    title={log.response_body}
                                  >
                                    {log.response_body || "-"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </div>
                    <Paginations
                      perPageData={meta.per_page}
                      data={logs}
                      totalRecords={meta.total}
                      currentPage={meta.page}
                      setCurrentPage={(p) => fetchLogs(p)}
                      isShowingPageLength={true}
                      paginationDiv="col-sm-auto"
                      paginationClass="pagination pagination-sm mb-0"
                    />
                  </>
                ) : (
                  <p className="text-muted text-center py-4">هیچ لاگی ثبت نشده است.</p>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Modal نمایش Payload */}
      <Modal isOpen={!!payloadModal} toggle={() => setPayloadModal(null)} size="lg">
        <ModalHeader toggle={() => setPayloadModal(null)}>Payload ارسال شده</ModalHeader>
        <ModalBody>
          <pre
            className="bg-light p-3 rounded"
            style={{ fontSize: "0.8rem", maxHeight: 400, overflow: "auto" }}
          >
            {payloadModal ? JSON.stringify(payloadModal, null, 2) : ""}
          </pre>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default VoipWebhookLogs;
