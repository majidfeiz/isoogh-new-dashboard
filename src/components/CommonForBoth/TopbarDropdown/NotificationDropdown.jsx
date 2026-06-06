import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown, DropdownToggle, DropdownMenu, Row, Col } from "reactstrap";
import SimpleBar from "simplebar-react";
import {
  getUnreadNotifications,
  getNotifications,
  markAsRead,
} from "../../../services/notificationService.jsx";

const POLL_INTERVAL_MS = 60_000;

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
    <div className="avatar-xs me-3 flex-shrink-0">
      <span
        className="avatar-title rounded-circle font-size-16"
        style={{ backgroundColor: bg, color: "#fff" }}
      >
        <i className={iconClass} />
      </span>
    </div>
  );
}

const NotificationDropdown = () => {
  const [menu, setMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const fetchUnread = useCallback(async () => {
    try {
      const data = await getUnreadNotifications();

      // اگر endpoint اختصاصی داده برگرداند از آن استفاده کن
      if (data.unreadCount > 0 || data.items.length > 0) {
        setUnreadCount(data.unreadCount);
        setItems(data.items.slice(0, 5));
        return;
      }

      // fallback: از endpoint اصلی لیست استفاده کن
      const listData = await getNotifications({ status: "unread", limit: 5, page: 1 });
      setUnreadCount(listData.meta.total ?? 0);
      setItems(listData.items.slice(0, 5));
    } catch {
      // silent — httpClient already shows toast for API errors
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    timerRef.current = setInterval(fetchUnread, POLL_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [fetchUnread]);

  const handleItemClick = async (item) => {
    setMenu(false);
    // optimistic update
    if (!item.isRead) {
      setUnreadCount((c) => Math.max(0, c - 1));
      setItems((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
      try {
        await markAsRead(item.id);
      } catch {
        // revert on failure
        fetchUnread();
      }
    }
    if (item.actionUrl) {
      navigate(item.actionUrl);
    }
  };

  return (
    <Dropdown
      isOpen={menu}
      toggle={() => setMenu(!menu)}
      className="dropdown d-inline-block"
      tag="li"
    >
      <DropdownToggle
        className="btn header-item noti-icon position-relative"
        tag="button"
        id="page-header-notifications-dropdown"
      >
        <i className="bx bx-bell bx-tada" />
        {unreadCount > 0 && (
          <span className="badge bg-danger rounded-pill">{unreadCount}</span>
        )}
      </DropdownToggle>

      <DropdownMenu className="dropdown-menu dropdown-menu-lg p-0 dropdown-menu-end">
        <div className="p-3">
          <Row className="align-items-center">
            <Col>
              <h6 className="m-0">اعلانات</h6>
            </Col>
            {unreadCount > 0 && (
              <div className="col-auto">
                <span className="badge bg-danger rounded-pill">{unreadCount} خوانده‌نشده</span>
              </div>
            )}
          </Row>
        </div>

        <SimpleBar style={{ height: "230px" }}>
          {items.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="bx bx-bell-off font-size-24 d-block mb-2" />
              اعلانی وجود ندارد
            </div>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                className="w-100 text-reset notification-item border-0 bg-transparent text-start"
                style={!item.isRead ? { backgroundColor: "rgba(85,110,230,0.05)" } : {}}
              >
                <div className="d-flex align-items-start p-2">
                  <NotificationIcon icon={item.icon} color={item.color} />
                  <div className="flex-grow-1 overflow-hidden">
                    <h6 className="mt-0 mb-1 text-truncate">{item.title}</h6>
                    <div className="font-size-12 text-muted">
                      <p className="mb-1 text-truncate">{item.body}</p>
                      <p className="mb-0">
                        <i className="mdi mdi-clock-outline" />{" "}
                        {timeAgo(item.createdAt)}
                      </p>
                    </div>
                  </div>
                  {!item.isRead && (
                    <span
                      className="flex-shrink-0 ms-2 mt-1"
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "#556ee6",
                        display: "inline-block",
                      }}
                    />
                  )}
                </div>
              </button>
            ))
          )}
        </SimpleBar>

        <div className="p-2 border-top d-grid">
          <Link
            className="btn btn-sm btn-link font-size-14 btn-block text-center"
            to="/notifications"
            onClick={() => setMenu(false)}
          >
            <i className="mdi mdi-arrow-left-circle me-1" />
            مشاهده همه
          </Link>
        </div>
      </DropdownMenu>
    </Dropdown>
  );
};

export default NotificationDropdown;
