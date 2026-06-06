// src/pages/Dashboard/widgets/QuickLinksWidget.jsx
import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import { Link } from "react-router-dom";

const QUICK_LINKS = [
  { label: "دانش‌آموزان", icon: "bx-user-circle", color: "text-primary", to: "/students" },
  { label: "مشاوران", icon: "bx-briefcase", color: "text-success", to: "/advisers" },
  { label: "مدارس", icon: "bx-buildings", color: "text-warning", to: "/schools" },
  { label: "فرم‌های پشتیبانی", icon: "bx-clipboard", color: "text-info", to: "/support-forms" },
  { label: "تماس‌های VoIP", icon: "bx-phone-call", color: "text-primary", to: "/voip" },
  { label: "فایل‌ها", icon: "bx-file", color: "text-success", to: "/files" },
  { label: "مدیران", icon: "bx-user-check", color: "text-warning", to: "/managers" },
  { label: "کاربران", icon: "bx-group", color: "text-danger", to: "/users" },
];

const QuickLinksWidget = ({ widgetName }) => {
  return (
    <Card className="h-100 mb-0">
      <CardHeader className="bg-transparent border-bottom-0 pb-0 d-flex align-items-center gap-2">
        <i className="bx bx-link text-primary font-size-18" />
        <h6 className="mb-0 fw-semibold">{widgetName || "دسترسی سریع"}</h6>
      </CardHeader>
      <CardBody className="pt-2">
        <div className="row g-2">
          {QUICK_LINKS.map((link, idx) => (
            <div key={idx} className="col-6 col-sm-3">
              <Link
                to={link.to}
                className="d-flex flex-column align-items-center justify-content-center p-3 rounded text-decoration-none hover-bg"
                style={{
                  background: "rgba(85,110,230,0.05)",
                  transition: "all 0.2s",
                  minHeight: 72,
                  border: "1px solid rgba(85,110,230,0.1)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(85,110,230,0.12)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(85,110,230,0.05)"; e.currentTarget.style.transform = "none"; }}
              >
                <i className={`bx ${link.icon} ${link.color} font-size-24 mb-1`} />
                <span className="font-size-12 text-muted fw-medium text-center">{link.label}</span>
              </Link>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default QuickLinksWidget;
