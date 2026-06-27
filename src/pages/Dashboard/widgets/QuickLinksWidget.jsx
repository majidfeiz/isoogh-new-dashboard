import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import { Link } from "react-router-dom";

const QUICK_LINKS = [
  { label: "دانش‌آموزان", icon: "bx-user-circle",  color: "text-primary", to: "/students" },
  { label: "مشاوران",     icon: "bx-briefcase",     color: "text-success", to: "/advisers" },
  { label: "مجموعه‌ها",   icon: "bx-buildings",     color: "text-warning", to: "/schools" },
  { label: "فرم‌های پشتیبانی", icon: "bx-clipboard", color: "text-info",  to: "/support-forms" },
  { label: "تماس‌های VoIP",    icon: "bx-phone-call", color: "text-primary", to: "/voip/outbound-call-histories" },
  { label: "فایل‌ها",     icon: "bx-file",          color: "text-success", to: "/files" },
  { label: "مدیران",      icon: "bx-user-check",    color: "text-warning", to: "/managers" },
  { label: "کاربران",     icon: "bx-group",         color: "text-danger",  to: "/users" },
];

const QuickLinksWidget = ({ widgetName }) => {
  return (
    <Card className="h-100 mb-0" style={{ display: "flex", flexDirection: "column" }}>
      <CardHeader className="bg-transparent border-bottom-0 pb-0 d-flex align-items-center gap-2" style={{ flexShrink: 0 }}>
        <i className="bx bx-link text-primary font-size-18" />
        <h6 className="mb-0 fw-semibold">{widgetName || "دسترسی سریع"}</h6>
      </CardHeader>
      <CardBody className="pt-2 d-flex flex-column" style={{ flex: 1, minHeight: 0 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "repeat(2, 1fr)",
            gap: 8,
            flex: 1,
            minHeight: 0,
          }}
        >
          {QUICK_LINKS.map((link, idx) => (
            <Link
              key={idx}
              to={link.to}
              className="d-flex flex-column align-items-center justify-content-center rounded text-decoration-none"
              style={{
                background: "rgba(85,110,230,0.05)",
                border: "1px solid rgba(85,110,230,0.1)",
                transition: "background 0.2s, transform 0.2s",
                padding: "6px 4px",
                minHeight: 0,
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(85,110,230,0.12)"
                e.currentTarget.style.transform = "translateY(-2px)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(85,110,230,0.05)"
                e.currentTarget.style.transform = "none"
              }}
            >
              <i className={`bx ${link.icon} ${link.color} font-size-22`} style={{ lineHeight: 1.2 }} />
              <span className="font-size-11 text-muted fw-medium text-center mt-1" style={{ lineHeight: 1.2 }}>
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}

export default QuickLinksWidget
