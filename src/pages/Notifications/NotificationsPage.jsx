import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import classnames from "classnames";
import Breadcrumb from "../../components/Common/Breadcrumb";
import DeleteModal from "../../components/Common/DeleteModal";
import Paginations from "../../components/Common/Paginations";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../../services/notificationService.jsx";

function timeAgo(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "همین الان";
  if (diff < 3600) return `${Math.floor(diff / 60)} دقیقه پیش`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ساعت پیش`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} روز پیش`;
  return date.toLocaleDateString("fa-IR");
}

function NotificationIcon({ icon, color }) {
  const bg = color || "#556ee6";
  const iconClass = icon ? `mdi mdi-${icon}` : "bx bx-bell";
  return (
    <div className="avatar-sm flex-shrink-0 me-3">
      <span
        className="avatar-title rounded-circle font-size-20"
        style={{ backgroundColor: bg, color: "#fff" }}
      >
        <i className={iconClass} />
      </span>
    </div>
  );
}

const TABS = [
  { key: "all", label: "همه" },
  { key: "unread", label: "خوانده‌نشده" },
  { key: "read", label: "خوانده‌شده" },
];

const LIMIT = 15;

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, lastPage: 1, unreadCount: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  // delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async (tab, page) => {
    setLoading(true);
    try {
      const result = await getNotifications({ page, limit: LIMIT, status: tab });
      setItems(result.items);
      setMeta(result.meta);
    } catch {
      // httpClient shows toast
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeTab, currentPage);
  }, [activeTab, currentPage, fetchData]);

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleItemClick = async (item) => {
    if (!item.isRead) {
      // optimistic update
      setItems((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
      setMeta((m) => ({ ...m, unreadCount: Math.max(0, m.unreadCount - 1) }));
      try {
        await markAsRead(item.id);
      } catch {
        fetchData(activeTab, currentPage);
      }
    }
    if (item.actionUrl) {
      navigate(item.actionUrl);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setMeta((m) => ({ ...m, unreadCount: 0 }));
    } catch {
      // httpClient shows toast
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDeleteClick = (e, item) => {
    e.stopPropagation();
    setDeleteTarget(item);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteNotification(deleteTarget.id);
      setDeleteTarget(null);
      // refresh current page; if it was unread decrement count
      await fetchData(activeTab, currentPage);
    } catch {
      // httpClient shows toast
    } finally {
      setDeleting(false);
    }
  };

  const displayedUnread =
    activeTab === "all" ? meta.unreadCount : activeTab === "unread" ? meta.total : 0;

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumb title="اعلانات" breadcrumbItem="همه اعلانات" />

        <Row>
          <Col xs={12}>
            <Card>
              <CardBody>
                {/* header row */}
                <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                  <Nav tabs className="nav-tabs-custom">
                    {TABS.map((tab) => (
                      <NavItem key={tab.key}>
                        <NavLink
                          className={classnames({ active: activeTab === tab.key })}
                          onClick={() => handleTabChange(tab.key)}
                          style={{ cursor: "pointer" }}
                        >
                          {tab.label}
                          {tab.key === "unread" && meta.unreadCount > 0 && (
                            <span className="badge bg-danger rounded-pill ms-1">
                              {meta.unreadCount}
                            </span>
                          )}
                        </NavLink>
                      </NavItem>
                    ))}
                  </Nav>

                  {displayedUnread > 0 && (
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={handleMarkAllRead}
                      disabled={markingAll}
                    >
                      {markingAll ? (
                        <span className="spinner-border spinner-border-sm me-1" />
                      ) : (
                        <i className="bx bx-check-double me-1" />
                      )}
                      علامت‌گذاری همه به عنوان خوانده‌شده
                    </button>
                  )}
                </div>

                {/* list */}
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" />
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bx bx-bell-off font-size-48 d-block mb-3" />
                    <p className="mb-0">اعلانی برای نمایش وجود ندارد</p>
                  </div>
                ) : (
                  <div className="notification-list">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className="d-flex align-items-start p-3 border-bottom cursor-pointer"
                        style={{
                          backgroundColor: !item.isRead
                            ? "rgba(85,110,230,0.05)"
                            : "transparent",
                          cursor: "pointer",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "rgba(85,110,230,0.08)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = !item.isRead
                            ? "rgba(85,110,230,0.05)"
                            : "transparent")
                        }
                      >
                        <NotificationIcon icon={item.icon} color={item.color} />

                        <div className="flex-grow-1 overflow-hidden">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            {!item.isRead && (
                              <span
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  backgroundColor: "#556ee6",
                                  display: "inline-block",
                                  flexShrink: 0,
                                }}
                              />
                            )}
                            <h6 className="mb-0 text-truncate">{item.title}</h6>
                          </div>
                          <p className="text-muted font-size-13 mb-1">{item.body}</p>
                          <p className="text-muted font-size-12 mb-0">
                            <i className="mdi mdi-clock-outline me-1" />
                            {timeAgo(item.createdAt)}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger ms-2 flex-shrink-0"
                          onClick={(e) => handleDeleteClick(e, item)}
                          title="حذف"
                        >
                          <i className="mdi mdi-trash-can-outline" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* pagination */}
                {!loading && meta.total > LIMIT && (
                  <div className="mt-3">
                    <Paginations
                      perPageData={LIMIT}
                      data={items}
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                      isShowingPageLength
                      paginationDiv="col-auto"
                      paginationClass="pagination pagination-rounded justify-content-end mb-0"
                      totalRecords={meta.total}
                    />
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <DeleteModal
        show={!!deleteTarget}
        onDeleteClick={handleDeleteConfirm}
        onCloseClick={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};

export default NotificationsPage;
