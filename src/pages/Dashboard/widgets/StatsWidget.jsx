// src/pages/Dashboard/widgets/StatsWidget.jsx
import React from "react";
import { Card, CardBody } from "reactstrap";

const formatDuration = (seconds) => {
  if (seconds === null || seconds === undefined) return "---";
  const s = Math.round(seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
};

const formatHMS = (seconds) => {
  if (seconds === null || seconds === undefined) return "---";
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};

const STATS_CONFIG = {
  students_total: {
    icon: "bx-user-circle",
    bgClass: "bg-primary",
    label: "تعداد کل دانش‌آموزان",
    getValue: (s) => s?.students?.total,
  },
  students_unassigned: {
    icon: "bx-user-x",
    bgClass: "bg-warning",
    label: "دانش‌آموزان بدون مشاور",
    getValue: (s) => s?.students?.unassigned,
    dynamicColor: (val) => (val > 0 ? "bg-warning" : "bg-success"),
    suffix: (val) => (val > 0 ? <i className="bx bx-error-circle text-warning ms-1 font-size-14" /> : null),
  },
  students_new_month: {
    icon: "bx-user-plus",
    bgClass: "bg-info",
    label: "ثبت‌نام این ماه",
    getValue: (s) => s?.students?.newThisMonth,
    suffix: () => <span className="text-muted font-size-11 ms-1">این ماه</span>,
  },
  advisers_total: {
    icon: "bx-briefcase",
    bgClass: "bg-success",
    label: "تعداد کل مشاوران",
    getValue: (s) => s?.advisers?.total,
  },
  schools_total: {
    icon: "bx-buildings",
    bgClass: "bg-warning",
    label: "تعداد کل مدارس",
    getValue: (s) => s?.schools?.total,
  },
  managers_total: {
    icon: "bx-user-check",
    bgClass: "bg-warning",
    label: "تعداد مدیران",
    getValue: (s) => s?.managers?.total,
  },
  files_total: {
    icon: "bx-file",
    bgClass: "bg-success",
    label: "فایل‌های آپلود‌شده",
    getValue: (s) => s?.files?.total,
  },
  support_forms_total: {
    icon: "bx-clipboard",
    bgClass: "bg-info",
    label: "فرم‌های پشتیبانی",
    getValue: (s) => s?.supportForms?.total,
  },
  support_forms_active: {
    icon: "bx-run",
    bgClass: "bg-success",
    label: "فرم‌های در حال اجرا",
    getValue: (s) => s?.supportForms?.active,
    badge: <span className="badge bg-success-subtle text-success rounded-pill font-size-10 ms-1">در حال اجرا</span>,
  },
  support_forms_pending: {
    icon: "bx-time-five",
    bgClass: "bg-danger",
    label: "تخصیص‌های بی‌پاسخ",
    getValue: (s) => s?.supportForms?.pendingAssignments,
  },
  voip_calls_today: {
    icon: "bx-phone-call",
    bgClass: "bg-primary",
    label: "تماس‌های امروز",
    getValue: (s) => s?.voipCalls?.today,
  },
  voip_calls_total: {
    icon: "bx-phone",
    bgClass: "bg-primary",
    label: "کل تماس‌ها",
    getValue: (s) => s?.voipCalls?.total,
  },
  voip_avg_duration: {
    icon: "bx-timer",
    bgClass: "bg-info",
    label: "میانگین مدت تماس",
    getValue: (s) => s?.voipCalls?.avgDurationSeconds,
    format: formatDuration,
    unit: "دقیقه:ثانیه",
  },

  // ── Super Adviser stats ──────────────────────
  sa_connected_advisers: {
    icon: "bx-user-cog",
    bgClass: "bg-primary",
    label: "مشاوران متصل",
    getValue: (s) => s?.advisers?.total,
  },
  sa_online_today: {
    icon: "bx-circle",
    bgClass: "bg-success",
    label: "آنلاین امروز",
    getValue: (s) => s?.superAdviser?.onlineToday,
    suffix: (val) =>
      val > 0 ? (
        <span
          className="d-inline-block rounded-circle bg-success ms-1"
          style={{ width: 8, height: 8, flexShrink: 0 }}
        />
      ) : null,
  },
  sa_total_calls_today: {
    icon: "bx-phone",
    bgClass: "bg-primary",
    label: "تماس امروز",
    getValue: (s) => s?.superAdviser?.totalCallsToday,
  },
  sa_successful_calls_today: {
    icon: "bx-phone-call",
    bgClass: "bg-success",
    label: "تماس موفق امروز",
    getValue: (s) => s?.superAdviser?.successfulCallsToday,
  },
  sa_students_total: {
    icon: "bx-user-circle",
    bgClass: "bg-info",
    label: "دانش‌آموزان زیرمجموعه",
    getValue: (s) => s?.students?.total,
  },
  sa_support_forms_count: {
    icon: "bx-file",
    bgClass: "bg-warning",
    label: "فرم‌های تماس",
    getValue: (s) => s?.supportForms?.total,
  },
  sa_monthly_duration: {
    icon: "bx-time-five",
    bgClass: "bg-info",
    label: "مدت تماس این ماه",
    getValue: (s) => s?.superAdviser?.monthlyDurationSeconds,
    format: formatHMS,
    unit: "ساعت:دقیقه:ثانیه",
  },
};

const StatsWidget = ({ widgetKey, widgetName, stats }) => {
  const cfg = STATS_CONFIG[widgetKey];
  if (!cfg) return null;

  const rawVal = cfg.getValue(stats);
  const displayVal = cfg.format ? cfg.format(rawVal) : (rawVal !== null && rawVal !== undefined ? Number(rawVal).toLocaleString("fa-IR") : null);
  const bgClass = cfg.dynamicColor ? cfg.dynamicColor(rawVal) : cfg.bgClass;
  const loading = stats === null || stats === undefined;

  return (
    <Card className="mini-stats-wid h-100 mb-0">
      <CardBody>
        <div className="d-flex align-items-center">
          <div className="flex-grow-1">
            <p className="text-muted fw-medium mb-1 font-size-13">{widgetName || cfg.label}</p>
            {loading ? (
              <div className="placeholder-glow">
                <span className="placeholder col-5 bg-secondary rounded" style={{ height: 28 }} />
              </div>
            ) : (
              <div className="d-flex align-items-baseline gap-1 flex-wrap">
                <h4 className="mb-0 font-size-22 fw-bold lh-1">
                  {displayVal ?? "---"}
                </h4>
                {cfg.suffix?.(rawVal)}
                {cfg.badge}
                {cfg.unit && displayVal !== "---" && (
                  <span className="text-muted font-size-11">{cfg.unit}</span>
                )}
              </div>
            )}
          </div>
          <div
            className={`avatar-sm rounded-circle ${bgClass} align-self-center mini-stat-icon`}
            style={{ flexShrink: 0 }}
          >
            <span className={`avatar-title rounded-circle ${bgClass}`}>
              <i className={`bx ${cfg.icon} font-size-24`} />
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default StatsWidget;
