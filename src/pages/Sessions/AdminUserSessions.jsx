import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Spinner,
  Badge,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { toast } from "react-toastify";

import Breadcrumb from "../../components/Common/Breadcrumb";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getUserSessions,
  revokeAdminSession,
  revokeAllUserSessions,
} from "../../services/sessionService.jsx";
import { apiGet } from "../../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../../helpers/apiRoutes.jsx";

function toJalali(dateInput) {
  if (!dateInput) return "—";
  try {
    const d = typeof dateInput === "number" ? new Date(dateInput * 1000) : new Date(dateInput);
    return d.toLocaleString("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(dateInput);
  }
}

function parseDevice(ua) {
  if (!ua) return "نامشخص";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Android/i.test(ua)) return "Android";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Macintosh|Mac OS/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "نامشخص";
}

function parseBrowser(ua) {
  if (!ua) return "";
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) return "Chrome";
  if (/Firefox/i.test(ua)) return "Firefox";
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return "Safari";
  if (/Edg/i.test(ua)) return "Edge";
  if (/OPR|Opera/i.test(ua)) return "Opera";
  return "";
}

const AdminUserSessions = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [targetUser, setTargetUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revokeId, setRevokeId] = useState(null);
  const [revokeAllModal, setRevokeAllModal] = useState(false);
  const [revokeAllLoading, setRevokeAllLoading] = useState(false);

  const canRevoke = hasPermission("auth.sessions.revoke");
  const canRevokeAll = hasPermission("auth.sessions.revoke-all");

  document.title = "نشست‌های کاربر | ایسوق";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, sessionsData] = await Promise.all([
        apiGet(getApiUrl(API_ROUTES.users.detail(userId))),
        getUserSessions(userId),
      ]);
      setTargetUser(userRes?.data?.data ?? userRes?.data ?? null);
      setSessions(sessionsData);
    } catch {
      // خطاها توسط httpClient نمایش داده می‌شوند
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!hasPermission("auth.sessions.index")) {
      navigate("/dashboard");
      return;
    }
    fetchData();
  }, [fetchData, hasPermission, navigate]);

  const handleRevoke = async (sessionId) => {
    setRevokeId(sessionId);
    try {
      await revokeAdminSession(sessionId);
      toast.success("نشست با موفقیت ابطال شد");
      fetchData();
    } catch {
      // خطا توسط httpClient
    } finally {
      setRevokeId(null);
    }
  };

  const handleRevokeAll = async () => {
    setRevokeAllLoading(true);
    try {
      const result = await revokeAllUserSessions(userId);
      toast.success(
        result?.message ??
          `${result?.revokedCount ?? ""} نشست ابطال شد`.trim()
      );
      setRevokeAllModal(false);
      fetchData();
    } catch {
      // خطا توسط httpClient
    } finally {
      setRevokeAllLoading(false);
    }
  };

  const userName = targetUser?.name || targetUser?.username || `کاربر #${userId}`;

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="مدیریت"
            breadcrumbItem={`نشست‌های ${userName}`}
          />

          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
            </div>
          ) : (
            <Row>
              <Col>
                <Card>
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                      <div>
                        <h5 className="card-title mb-0">
                          <i className="bx bx-desktop me-2 text-primary" />
                          نشست‌های فعال:{" "}
                          <span className="text-primary">{userName}</span>
                        </h5>
                        {targetUser?.phone && (
                          <small className="text-muted" dir="ltr">
                            {targetUser.phone}
                          </small>
                        )}
                      </div>
                      <div className="d-flex gap-2">
                        <Button
                          color="secondary"
                          outline
                          size="sm"
                          onClick={fetchData}
                          disabled={loading}
                        >
                          <i className="bx bx-refresh" />
                        </Button>
                        {canRevokeAll && sessions.length > 0 && (
                          <Button
                            color="danger"
                            size="sm"
                            onClick={() => setRevokeAllModal(true)}
                          >
                            <i className="bx bx-log-out me-1" />
                            اخراج از همه دستگاه‌ها
                          </Button>
                        )}
                      </div>
                    </div>

                    {sessions.length === 0 ? (
                      <Alert color="info" className="mb-0">
                        هیچ نشست فعالی برای این کاربر وجود ندارد.
                      </Alert>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover table-nowrap mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>#</th>
                              <th>آدرس IP</th>
                              <th>دستگاه / مرورگر</th>
                              <th>زمان ورود</th>
                              <th>مرا به خاطر بسپار</th>
                              {canRevoke && <th />}
                            </tr>
                          </thead>
                          <tbody>
                            {sessions.map((s, idx) => {
                              const device = parseDevice(s.user_agent);
                              const browser = parseBrowser(s.user_agent);
                              return (
                                <tr key={s.id}>
                                  <td className="text-muted">{idx + 1}</td>
                                  <td>
                                    <code className="text-dark">
                                      {s.ip_address || "—"}
                                    </code>
                                  </td>
                                  <td>
                                    <span
                                      title={s.user_agent}
                                      style={{ cursor: "default" }}
                                    >
                                      {device}
                                      {browser ? ` / ${browser}` : ""}
                                    </span>
                                  </td>
                                  <td>{toJalali(s.created_at)}</td>
                                  <td>
                                    {s.remember_me ? (
                                      <Badge color="success" pill>
                                        بله
                                      </Badge>
                                    ) : (
                                      <Badge color="secondary" pill>
                                        خیر
                                      </Badge>
                                    )}
                                  </td>
                                  {canRevoke && (
                                    <td className="text-end">
                                      <Button
                                        color="danger"
                                        size="sm"
                                        outline
                                        onClick={() => handleRevoke(s.id)}
                                        disabled={revokeId === s.id}
                                      >
                                        {revokeId === s.id ? (
                                          <Spinner size="sm" />
                                        ) : (
                                          <>
                                            <i className="bx bx-x me-1" />
                                            ابطال نشست
                                          </>
                                        )}
                                      </Button>
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </div>

      {/* مودال تأیید اخراج از همه دستگاه‌ها */}
      <Modal isOpen={revokeAllModal} toggle={() => setRevokeAllModal(false)} centered>
        <ModalHeader toggle={() => setRevokeAllModal(false)}>
          اخراج از همه دستگاه‌ها
        </ModalHeader>
        <ModalBody>
          آیا مطمئن هستید که می‌خواهید{" "}
          <strong>{userName}</strong> را از تمام دستگاه‌ها خارج کنید؟
          <br />
          <small className="text-muted">
            ({sessions.length} نشست فعال ابطال خواهد شد)
          </small>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setRevokeAllModal(false)}>
            انصراف
          </Button>
          <Button color="danger" onClick={handleRevokeAll} disabled={revokeAllLoading}>
            {revokeAllLoading ? <Spinner size="sm" className="me-1" /> : null}
            بله، خارج کن
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default AdminUserSessions;
