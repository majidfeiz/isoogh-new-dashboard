// src/pages/Dashboard/widgets/RecentTableWidget.jsx
import React from "react";
import { Card, CardBody, CardHeader, Table, Spinner, Badge } from "reactstrap";
import { Link } from "react-router-dom";

const fDate = (v) => {
  if (!v) return "—";
  try { return new Date(v).toLocaleDateString("fa-IR"); } catch { return String(v); }
};

const fUnix = (ts) => {
  if (!ts) return "—";
  try { return new Date(ts * 1000).toLocaleDateString("fa-IR"); } catch { return "—"; }
};

const DISPOSITION_BADGE = {
  ANSWERED: "success",
  "NO ANSWER": "danger",
  BUSY: "warning",
  FAILED: "secondary",
};

const LOG_STATUS_BADGE = {
  success: "success",
  failed: "danger",
  pending: "secondary",
  processing: "info",
};

const LOG_STATUS_LABEL = {
  success: "موفق",
  failed: "ناموفق",
  pending: "در انتظار",
  processing: "در حال پردازش",
};

const TABLES_CONFIG = {
  recent_students: {
    title: "آخرین دانش‌آموزان",
    icon: "bx-user-circle",
    linkTo: "/students",
    columns: [
      { label: "#", render: (_, i) => i + 1, width: 36 },
      { label: "نام", render: (r) => r.name || "—" },
      { label: "کد", render: (r) => <code className="font-size-11">{r.code || "—"}</code> },
      { label: "استان", render: (r) => r.province || "—" },
      { label: "تاریخ", render: (r) => fDate(r.createdAt) },
    ],
    getItems: (d) => d?.items ?? [],
  },
  recent_voip_calls: {
    title: "آخرین تماس‌های VoIP",
    icon: "bx-phone-call",
    linkTo: "/voip/outbound-call-histories",
    columns: [
      { label: "#", render: (_, i) => i + 1, width: 36 },
      {
        label: "وضعیت",
        render: (r) => (
          <Badge color={DISPOSITION_BADGE[r.disposition] || "secondary"} className="font-size-10">
            {r.disposition || "—"}
          </Badge>
        ),
      },
      { label: "شماره", render: (r) => r.src || "—" },
      { label: "مدت", render: (r) => r.duration || "—" },
      { label: "تاریخ", render: (r) => fUnix(r.starttimeUnix) },
    ],
    getItems: (d) => d?.items ?? [],
  },
  recent_support_forms: {
    title: "آخرین فرم‌های پشتیبانی",
    icon: "bx-clipboard",
    linkTo: "/support-forms",
    columns: [
      { label: "#", render: (_, i) => i + 1, width: 36 },
      { label: "عنوان", render: (r) => r.title || "—" },
      { label: "شروع", render: (r) => fUnix(r.startAt) },
      { label: "پایان", render: (r) => fUnix(r.endAt) },
      { label: "ثبت", render: (r) => fDate(r.createdAt) },
    ],
    getItems: (d) => d?.items ?? [],
  },
  import_logs_recent: {
    title: "لاگ‌های ایمپورت اخیر",
    icon: "bx-import",
    linkTo: "/students",
    columns: [
      { label: "#", render: (_, i) => i + 1, width: 36 },
      { label: "فایل", render: (r) => <span className="font-size-12">{r.fileName || "—"}</span> },
      {
        label: "وضعیت",
        render: (r) => (
          <Badge color={LOG_STATUS_BADGE[r.status] || "secondary"} className="font-size-10">
            {LOG_STATUS_LABEL[r.status] || r.status || "—"}
          </Badge>
        ),
      },
      {
        label: "ردیف",
        render: (r) => (
          <span className="font-size-12">
            {r.processedRows ?? 0}/{r.totalRows ?? 0}
          </span>
        ),
      },
      { label: "تاریخ", render: (r) => fDate(r.createdAt) },
    ],
    getItems: (d) => d?.items ?? [],
  },
  advisers_top_by_students: {
    title: "مشاوران برتر",
    icon: "bx-medal",
    linkTo: "/advisers",
    columns: [
      {
        label: "رتبه",
        render: (_, i) => (
          <span
            className={`badge rounded-pill font-size-11 ${i === 0 ? "bg-warning" : i === 1 ? "bg-secondary" : i === 2 ? "bg-danger" : "bg-light text-dark"}`}
          >
            {i + 1}
          </span>
        ),
        width: 50,
      },
      { label: "نام مشاور", render: (r) => r.name || "—" },
      { label: "کد", render: (r) => <code className="font-size-11">{r.code || "—"}</code> },
      {
        label: "دانش‌آموزان",
        render: (r) => (
          <span className="fw-semibold text-primary">
            {Number(r.studentCount || 0).toLocaleString("fa-IR")}
          </span>
        ),
      },
    ],
    getItems: (d) => d?.items ?? [],
  },

  // ── Super Adviser ────────────────────────────
  sa_top_advisers: {
    title: "برترین مشاوران",
    icon: "bx-crown",
    linkTo: "/super-adviser-portal/advisers",
    rowStyle: (row) =>
      row.callsToday > 0 ? { backgroundColor: "rgba(16, 185, 129, 0.08)" } : {},
    columns: [
      { label: "ردیف", render: (_, i) => i + 1, width: 36 },
      { label: "نام مشاور", render: (r) => r.name || "—" },
      { label: "کد", render: (r) => <code className="font-size-11">{r.code || "—"}</code> },
      {
        label: "تماس امروز",
        render: (r) => (
          <Badge color={r.callsToday > 0 ? "success" : "secondary"} pill className="font-size-10">
            {r.callsToday > 0 ? r.callsToday : "—"}
          </Badge>
        ),
      },
      {
        label: "تماس موفق",
        render: (r) => (
          <span className="fw-semibold text-success">
            {Number(r.successfulCalls || 0).toLocaleString("fa-IR")}
          </span>
        ),
      },
      {
        label: "کل تماس",
        render: (r) => Number(r.totalCalls || 0).toLocaleString("fa-IR"),
      },
      {
        label: "مدت تماس ماه",
        render: (r) => {
          const total = r.totalDurationSeconds || 0;
          const h = Math.floor(total / 3600);
          const m = Math.floor((total % 3600) / 60);
          const s = total % 60;
          return (
            <code className="font-size-11">
              {`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`}
            </code>
          );
        },
      },
    ],
    getItems: (d) => d?.items ?? [],
  },
};

const RecentTableWidget = ({ widgetKey, widgetName, data }) => {
  const cfg = TABLES_CONFIG[widgetKey];
  if (!cfg) return null;

  const rows = data ? cfg.getItems(data) : null;
  const loading = data === undefined;
  const error = data === null;

  return (
    <Card className="h-100 mb-0">
      <CardHeader className="bg-transparent border-bottom-0 pb-0 d-flex align-items-center justify-content-between">
        <h6 className="mb-0 fw-semibold d-flex align-items-center gap-2">
          <i className={`bx ${cfg.icon} text-primary font-size-18`} />
          {widgetName || cfg.title}
        </h6>
        <Link to={cfg.linkTo} className="text-muted font-size-12 text-decoration-none">
          مشاهده همه <i className="mdi mdi-arrow-left" />
        </Link>
      </CardHeader>
      <CardBody className="pt-2">
        {loading ? (
          <div className="text-center py-4">
            <Spinner size="sm" color="primary" />
          </div>
        ) : error ? (
          <div className="text-center py-4 text-muted">
            <i className="bx bx-error-circle font-size-28 d-block mb-2 text-warning" />
            <span className="font-size-13">خطا در دریافت داده</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <i className="bx bx-data font-size-28 d-block mb-2" />
            <span className="font-size-13">داده‌ای موجود نیست</span>
          </div>
        ) : (
          <div className="table-responsive">
            <Table className="table-sm align-middle mb-0" hover>
              <thead>
                <tr>
                  {cfg.columns.map((col, i) => (
                    <th
                      key={i}
                      className="text-muted fw-medium font-size-12 border-0"
                      style={col.width ? { width: col.width } : {}}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr key={rowIdx} style={cfg.rowStyle ? cfg.rowStyle(row) : {}}>
                    {cfg.columns.map((col, colIdx) => (
                      <td key={colIdx} className="font-size-13 border-0 py-2">
                        {col.render(row, rowIdx)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default RecentTableWidget;
