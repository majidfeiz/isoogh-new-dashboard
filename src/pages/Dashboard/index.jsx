// src/pages/Dashboard/index.jsx
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ResponsiveGridLayout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Alert,
  Spinner,
} from "reactstrap";
import { toast } from "react-toastify";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import DeleteModal from "../../components/Common/DeleteModal.jsx";
import StatsWidget from "./widgets/StatsWidget.jsx";
import RecentTableWidget from "./widgets/RecentTableWidget.jsx";
import ChartWidget from "./widgets/ChartWidget.jsx";
import QuickLinksWidget from "./widgets/QuickLinksWidget.jsx";
import WidgetPicker from "./WidgetPicker.jsx";
import WidgetConfigModal from "./WidgetConfigModal.jsx";

import {
  getMyDashboard,
  getDefaultDashboard,
  addWidgetToDashboard,
  updateDashboardWidget,
  removeDashboardWidget,
  resetDashboard,
  getDashboardStats,
  getDashboardChart,
  getDashboardRecent,
} from "../../services/dashboardService.jsx";

import { useAuth } from "../../context/AuthContext.jsx";

// ─────────────────────────────────────────────
// Custom width hook: measures actual offsetWidth
// avoids RTL issues with clientWidth/useContainerWidth
// ─────────────────────────────────────────────
function useGridWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(1200);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 50) setWidth(w);
    };

    const raf = requestAnimationFrame(measure);
    const obs = new ResizeObserver(measure);
    obs.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
    };
  }, []);

  return { ref, width };
}

// ─────────────────────────────────────────────
// Widget key sets
// ─────────────────────────────────────────────
const STATS_KEYS = new Set([
  "students_total", "students_unassigned", "students_new_month",
  "advisers_total", "schools_total", "managers_total", "files_total",
  "support_forms_total", "support_forms_active", "support_forms_pending",
  "voip_calls_today", "voip_calls_total", "voip_avg_duration",
  // Super Adviser stats
  "sa_connected_advisers", "sa_online_today", "sa_total_calls_today",
  "sa_successful_calls_today", "sa_students_total", "sa_support_forms_count",
  "sa_monthly_duration",
]);

const CHART_KEY_TO_TYPE = {
  students_by_province:      "students-by-province",
  students_by_shift:         "students-by-shift",
  students_by_grade:         "support-forms-by-grade",
  support_forms_by_grade:    "support-forms-by-grade",
  voip_calls_weekly:         "voip-calls-weekly",
  voip_calls_by_disposition: "voip-by-disposition",
  import_logs_by_status:     "import-logs-by-status",
  // Super Adviser charts
  sa_calls_weekly:            "sa-calls-weekly",
  sa_adviser_activity:        "sa-adviser-activity",
  sa_calls_by_disposition:    "sa-calls-by-disposition",
};

const RECENT_KEY_TO_TYPE = {
  recent_students:          "students",
  recent_voip_calls:        "voip-calls",
  recent_support_forms:     "support-forms",
  import_logs_recent:       "import-logs",
  advisers_top_by_students: "advisers-by-students",
  // Super Adviser
  sa_top_advisers:          "sa-top-advisers",
};

const CHART_KEYS = new Set([...Object.keys(CHART_KEY_TO_TYPE), "support_forms_by_status"]);
const TABLE_KEYS = new Set(Object.keys(RECENT_KEY_TO_TYPE));

// ─────────────────────────────────────────────
// Smart initial placement
// ─────────────────────────────────────────────
const computePlacement = (existingWidgets, widgetW, widgetH) => {
  if (existingWidgets.length === 0) return { posX: 0, posY: 0 };
  const colsPerRow = Math.max(1, Math.floor(12 / widgetW));
  const idx = existingWidgets.length;
  return {
    posX: (idx % colsPerRow) * widgetW,
    posY: Math.floor(idx / colsPerRow) * widgetH,
  };
};

// ─────────────────────────────────────────────
// Widget renderer
// ─────────────────────────────────────────────
const WidgetRenderer = ({
  userWidget,
  isEditMode,
  onDelete,
  onToggleVisible,
  onOpenConfig,
  statsData,
  chartDataMap,
  recentDataMap,
}) => {
  const { widget, userConfig, isVisible, id } = userWidget;
  const key = widget?.key;

  const renderContent = () => {
    if (STATS_KEYS.has(key))
      return <StatsWidget widgetKey={key} widgetName={widget?.name} stats={statsData} />;

    if (TABLE_KEYS.has(key))
      return (
        <RecentTableWidget
          widgetKey={key}
          widgetName={widget?.name}
          userConfig={userConfig}
          data={recentDataMap[key]}
        />
      );

    if (CHART_KEYS.has(key))
      return (
        <ChartWidget
          widgetKey={key}
          widgetName={widget?.name}
          chartData={chartDataMap[key]}
          stats={statsData}
        />
      );

    if (key === "quick_links")
      return <QuickLinksWidget widgetName={widget?.name} />;

    return (
      <Card className="h-100 mb-0">
        <CardBody className="d-flex align-items-center justify-content-center text-muted">
          <div className="text-center">
            <i className="bx bx-widget font-size-32 d-block mb-2" />
            <p className="mb-0 font-size-13">{widget?.name || "ویجت ناشناخته"}</p>
          </div>
        </CardBody>
      </Card>
    );
  };

  return (
    <div style={{ height: "100%", opacity: !isVisible && isEditMode ? 0.42 : 1, transition: "opacity 0.2s" }}>
      {/* Toolbar — must have className="widget-toolbar" to be excluded from drag */}
      {isEditMode && (
        <div
          className="widget-toolbar"
          style={{
            position: "absolute",
            top: 6,
            right: 8,
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            gap: 2,
            background: "rgba(255,255,255,0.97)",
            borderRadius: 8,
            padding: "3px 5px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
            pointerEvents: "all",
          }}
        >
          {/* Drag handle — ONLY this starts a drag */}
          <div
            className="drag-handle"
            title="جابجایی"
            style={{
              cursor: "grab",
              color: "#6c757d",
              display: "flex",
              alignItems: "center",
              padding: "0 2px",
            }}
          >
            <i className="bx bx-grid-vertical font-size-16" />
          </div>

          {widget?.configSchema?.length > 0 && (
            <button
              type="button"
              title="تنظیمات"
              style={{ border: 0, background: "transparent", cursor: "pointer", color: "#6c757d", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center" }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onOpenConfig(userWidget); }}
            >
              <i className="bx bx-cog font-size-15" />
            </button>
          )}

          <button
            type="button"
            title={isVisible ? "مخفی کردن" : "نمایش دادن"}
            style={{ border: 0, background: "transparent", cursor: "pointer", color: isVisible ? "#6c757d" : "#f1b44c", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onToggleVisible(id, isVisible); }}
          >
            <i className={`bx ${isVisible ? "bx-show" : "bx-hide"} font-size-15`} />
          </button>

          <button
            type="button"
            title="حذف از داشبورد"
            style={{ border: 0, background: "transparent", cursor: "pointer", color: "#f46a6a", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onDelete(id); }}
          >
            <i className="bx bx-trash font-size-15" />
          </button>
        </div>
      )}
      <div style={{ height: "100%" }}>{renderContent()}</div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────
const SkeletonWidget = () => (
  <Card className="mb-0 h-100">
    <CardBody>
      <div className="placeholder-glow">
        <span className="placeholder col-6 bg-secondary rounded mb-3 d-block" style={{ height: 14 }} />
        <span className="placeholder col-4 bg-secondary rounded d-block" style={{ height: 28 }} />
      </div>
    </CardBody>
  </Card>
);

const SKELETONS = [
  { i: "s1", x: 0, y: 0, w: 3, h: 2 },
  { i: "s2", x: 3, y: 0, w: 3, h: 2 },
  { i: "s3", x: 6, y: 0, w: 3, h: 2 },
  { i: "s4", x: 9, y: 0, w: 3, h: 2 },
];

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
const DashboardPage = () => {
  document.title = "داشبورد | آیسوق";

  const { user } = useAuth();
  const isAdmin = user?.roles?.some((r) => r.name === "admin" || r.slug === "admin");

  const { ref: gridRef, width: gridWidth } = useGridWidth();

  // Ref so auto-refresh intervals always see current widget list without closure staleness
  const myWidgetsRef = useRef([]);

  const [myWidgets, setMyWidgets] = useState([]);
  const [statsData, setStatsData] = useState(undefined);
  const [chartDataMap, setChartDataMap] = useState({});
  const [recentDataMap, setRecentDataMap] = useState({});
  const [isDefaultView, setIsDefaultView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [configWidget, setConfigWidget] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [initializingPersonal, setInitializingPersonal] = useState(false);
  const patchQueue = useRef({});

  // ── Load dashboard ────────────────────────
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const myData = await getMyDashboard();
      let widgets;
      let defaultView = false;

      if (Array.isArray(myData) && myData.length > 0) {
        widgets = myData;
      } else {
        const def = await getDefaultDashboard();
        const rawWidgets = def?.widgets ?? [];
        widgets = rawWidgets.map((w, idx) => {
          const ww = w.defaultW || 3;
          const wh = w.defaultH || 2;
          const colsPerRow = Math.max(1, Math.floor(12 / ww));
          return {
            id: `default-${w.id}`,
            widgetId: w.id,
            posX: (idx % colsPerRow) * ww,
            posY: Math.floor(idx / colsPerRow) * wh,
            w: ww,
            h: wh,
            sortOrder: idx,
            isVisible: true,
            userConfig: null,
            widget: w,
          };
        });
        defaultView = true;
      }

      // Only fetch data for visible widgets
      const visibleOnly = (w) => w.isVisible !== false;

      const hasStats = widgets.some((w) => STATS_KEYS.has(w.widget?.key) && visibleOnly(w));
      let newStats = null;
      if (hasStats) {
        try { newStats = await getDashboardStats(); } catch { newStats = null; }
      }

      const chartWidgets = widgets.filter((w) => CHART_KEY_TO_TYPE[w.widget?.key] && visibleOnly(w));
      const tableWidgets = widgets.filter((w) => RECENT_KEY_TO_TYPE[w.widget?.key] && visibleOnly(w));

      const [chartResults, recentResults] = await Promise.all([
        Promise.all(chartWidgets.map((w) => getDashboardChart(CHART_KEY_TO_TYPE[w.widget.key]).catch(() => null))),
        Promise.all(tableWidgets.map((w) => {
          const limit = w.userConfig?.limit ?? w.widget?.configSchema?.find((f) => f.key === "limit")?.default ?? 5;
          return getDashboardRecent(RECENT_KEY_TO_TYPE[w.widget.key], limit).catch(() => null);
        })),
      ]);

      const newChartMap = {};
      chartWidgets.forEach((w, i) => { newChartMap[w.widget.key] = chartResults[i]; });
      const newRecentMap = {};
      tableWidgets.forEach((w, i) => { newRecentMap[w.widget.key] = recentResults[i]; });

      setMyWidgets(widgets);
      setIsDefaultView(defaultView);
      setStatsData(newStats);
      setChartDataMap(newChartMap);
      setRecentDataMap(newRecentMap);
    } catch {
      toast.error("خطا در بارگذاری داشبورد");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { myWidgetsRef.current = myWidgets; }, [myWidgets]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  // Auto-refresh stats every 2 minutes (SA widgets read from the same stats endpoint)
  useEffect(() => {
    if (loading) return;
    const id = setInterval(() => {
      const widgets = myWidgetsRef.current;
      const hasStats = widgets.some((w) => w.isVisible !== false && STATS_KEYS.has(w.widget?.key));
      if (!hasStats) return;
      getDashboardStats().then(setStatsData).catch(() => {});
    }, 2 * 60 * 1000);
    return () => clearInterval(id);
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh charts every 5 minutes
  useEffect(() => {
    if (loading) return;
    const id = setInterval(() => {
      const widgets = myWidgetsRef.current;
      const chartWidgets = widgets.filter(
        (w) => w.isVisible !== false && CHART_KEY_TO_TYPE[w.widget?.key]
      );
      if (chartWidgets.length === 0) return;
      Promise.all(
        chartWidgets.map((w) => getDashboardChart(CHART_KEY_TO_TYPE[w.widget.key]).catch(() => null))
      ).then((results) => {
        const updates = {};
        chartWidgets.forEach((w, i) => {
          if (results[i] !== null) updates[w.widget.key] = results[i];
        });
        if (Object.keys(updates).length > 0) {
          setChartDataMap((prev) => ({ ...prev, ...updates }));
        }
      });
    }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Build grid layouts ────────────────────
  const buildLayouts = (widgets) => {
    const items = widgets.map((w) => ({
      i: String(w.id),
      x: w.posX ?? 0,
      y: w.posY ?? 0,
      w: w.w ?? 3,
      h: w.h ?? 2,
      minW: 2,
      minH: 1,
    }));
    return {
      lg: items,
      md: items.map((i) => ({ ...i, w: Math.min(i.w, 6), x: i.x > 5 ? i.x - 6 : i.x })),
      sm: items.map((i) => ({ ...i, w: Math.min(i.w, 4), x: 0 })),
      xs: items.map((i) => ({ ...i, w: 4, x: 0 })),
    };
  };

  // ── Handlers ─────────────────────────────
  const handleLayoutChange = useCallback(
    (currentLayout) => {
      if (!isEditMode || isDefaultView) return;
      currentLayout.forEach((item) => {
        const widget = myWidgets.find((w) => String(w.id) === item.i);
        if (!widget || String(widget.id).startsWith("default-")) return;
        if (widget.posX !== item.x || widget.posY !== item.y || widget.w !== item.w || widget.h !== item.h) {
          if (patchQueue.current[item.i]) clearTimeout(patchQueue.current[item.i]);
          patchQueue.current[item.i] = setTimeout(() => {
            updateDashboardWidget(widget.id, { posX: item.x, posY: item.y, w: item.w, h: item.h })
              .catch(() => toast.error("خطا در ذخیره موقعیت ویجت"));
          }, 600);
          setMyWidgets((prev) =>
            prev.map((w) =>
              String(w.id) === item.i ? { ...w, posX: item.x, posY: item.y, w: item.w, h: item.h } : w
            )
          );
        }
      });
    },
    [isEditMode, isDefaultView, myWidgets]
  );

  // Called by toolbar delete button — just opens confirmation modal
  const handleDeleteWidget = useCallback((id) => {
    setDeleteTargetId(id);
  }, []);

  // Called by DeleteModal confirm button
  const confirmDelete = useCallback(async () => {
    const id = deleteTargetId;
    if (!id) return;

    // Reset confirmation — handled inline to avoid forward-reference
    if (id === "__reset__") {
      setDeleteLoading(true);
      try {
        await resetDashboard();
        toast.success("داشبورد به حالت پیش‌فرض بازگشت");
        setIsEditMode(false);
        setDeleteTargetId(null);
        await loadDashboard();
      } catch {
        toast.error("خطا در بازگشت به پیش‌فرض");
      } finally {
        setDeleteLoading(false);
      }
      return;
    }

    setDeleteLoading(true);
    // Default view or local-only IDs: remove from state without API call
    if (isDefaultView || String(id).startsWith("default-")) {
      setMyWidgets((prev) => prev.filter((w) => w.id !== id));
      setDeleteTargetId(null);
      setDeleteLoading(false);
      toast.success("ویجت از داشبورد حذف شد");
      return;
    }

    try {
      await removeDashboardWidget(id);
      setMyWidgets((prev) => prev.filter((w) => w.id !== id));
      toast.success("ویجت حذف شد");
    } catch (e) {
      if (e?.response?.status === 404) {
        setMyWidgets((prev) => prev.filter((w) => w.id !== id));
      }
    } finally {
      setDeleteTargetId(null);
      setDeleteLoading(false);
    }
  }, [deleteTargetId, isDefaultView, loadDashboard]);

  const handleToggleVisible = useCallback(
    async (id, currentVisible) => {
      const newVal = !currentVisible;
      setMyWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, isVisible: newVal } : w)));

      // If widget is being shown and has no data yet, fetch it now
      if (newVal) {
        const target = myWidgets.find((w) => w.id === id);
        const key = target?.widget?.key;
        if (key && CHART_KEY_TO_TYPE[key] && !(key in chartDataMap)) {
          getDashboardChart(CHART_KEY_TO_TYPE[key])
            .then((d) => setChartDataMap((prev) => ({ ...prev, [key]: d })))
            .catch(() => {});
        } else if (key && RECENT_KEY_TO_TYPE[key] && !(key in recentDataMap)) {
          const limit = target?.userConfig?.limit ?? target?.widget?.configSchema?.find((f) => f.key === "limit")?.default ?? 5;
          getDashboardRecent(RECENT_KEY_TO_TYPE[key], limit)
            .then((d) => setRecentDataMap((prev) => ({ ...prev, [key]: d })))
            .catch(() => {});
        }
      }

      // Default view: no DB call needed
      if (isDefaultView || String(id).startsWith("default-")) return;
      try {
        await updateDashboardWidget(id, { isVisible: newVal });
      } catch {
        setMyWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, isVisible: currentVisible } : w)));
        toast.error("خطا در تغییر نمایش ویجت");
      }
    },
    [isDefaultView, myWidgets, chartDataMap, recentDataMap]
  );

  const handleSaveConfig = useCallback(
    async (id, newConfig) => {
      await updateDashboardWidget(id, { userConfig: newConfig });
      const widget = myWidgets.find((w) => w.id === id);
      setMyWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, userConfig: newConfig } : w)));
      toast.success("تنظیمات ذخیره شد");
      const key = widget?.widget?.key;
      if (key && RECENT_KEY_TO_TYPE[key]) {
        const limit = newConfig?.limit ?? 5;
        getDashboardRecent(RECENT_KEY_TO_TYPE[key], limit)
          .then((data) => setRecentDataMap((prev) => ({ ...prev, [key]: data })))
          .catch(() => {});
      }
    },
    [myWidgets]
  );

  const handleAddWidget = useCallback(
    async (widget) => {
      const widgetW = widget.defaultW || 3;
      const widgetH = widget.defaultH || 2;
      const { posX, posY } = computePlacement(myWidgets, widgetW, widgetH);
      const body = {
        widgetId: widget.id,
        posX,
        posY,
        w: widgetW,
        h: widgetH,
        sortOrder: myWidgets.length,
      };
      try {
        const newWidget = await addWidgetToDashboard(body);
        setMyWidgets((prev) => [...prev, newWidget]);
        setIsDefaultView(false);
        toast.success(`ویجت "${widget.name}" به داشبورد اضافه شد`);
        setPickerOpen(false);

        // Fetch data for new widget
        const key = widget.key;
        if (CHART_KEY_TO_TYPE[key]) {
          getDashboardChart(CHART_KEY_TO_TYPE[key])
            .then((d) => setChartDataMap((prev) => ({ ...prev, [key]: d })))
            .catch(() => {});
        } else if (RECENT_KEY_TO_TYPE[key]) {
          const limit = widget.configSchema?.find((f) => f.key === "limit")?.default ?? 5;
          getDashboardRecent(RECENT_KEY_TO_TYPE[key], limit)
            .then((d) => setRecentDataMap((prev) => ({ ...prev, [key]: d })))
            .catch(() => {});
        } else if (STATS_KEYS.has(key) && statsData === null) {
          getDashboardStats().then(setStatsData).catch(() => {});
        }
      } catch (e) {
        const status = e?.response?.status;
        if (status === 409) toast.warning("این ویجت قبلاً به داشبورد شما اضافه شده است");
        else if (status === 403) toast.error("شما دسترسی لازم برای این ویجت را ندارید");
      }
    },
    [myWidgets, statsData]
  );

  const handleReset = useCallback(() => {
    setDeleteTargetId("__reset__");
  }, []);

  // ── Enter edit mode ───────────────────────
  // If in default view, first POST all default widgets to create real entry.id values,
  // then reload so PATCH/DELETE calls have valid IDs.
  const handleEnterEditMode = useCallback(async () => {
    if (!isDefaultView) {
      setIsEditMode(true);
      return;
    }

    setInitializingPersonal(true);
    try {
      await Promise.all(
        myWidgets.map((w, idx) =>
          addWidgetToDashboard({
            widgetId: w.widgetId ?? w.widget?.id,
            posX: w.posX ?? 0,
            posY: w.posY ?? 0,
            w: w.w ?? 3,
            h: w.h ?? 2,
            sortOrder: idx,
          }).catch((err) => {
            // 409 means widget already has an entry — ignore
            if (err?.response?.status !== 409) throw err;
          })
        )
      );
      // Reload to get real entry.id for every widget
      await loadDashboard();
      setIsEditMode(true);
    } catch {
      toast.error("خطا در راه‌اندازی داشبورد شخصی");
    } finally {
      setInitializingPersonal(false);
    }
  }, [isDefaultView, myWidgets, loadDashboard]);

  const existingWidgetIds = myWidgets.map((w) => w.widgetId).filter(Boolean);
  const visibleWidgets = isEditMode ? myWidgets : myWidgets.filter((w) => w.isVisible !== false);
  const layouts = buildLayouts(visibleWidgets);

  // ── Common grid props ─────────────────────
  const gridProps = {
    breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480 },
    cols: { lg: 12, md: 12, sm: 6, xs: 4 },
    rowHeight: 72,
    margin: [14, 14],
    containerPadding: [0, 0],
    // CRITICAL: prevents grid from intercepting clicks on toolbar buttons
    draggableCancel: ".widget-toolbar, .widget-toolbar *",
    draggableHandle: ".drag-handle",
  };

  // ── Render ───────────────────────────────
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="داشبورد" breadcrumbItem="داشبورد شخصی" />

          {isDefaultView && !isEditMode && (
            <Alert color="info" className="d-flex align-items-center gap-3 mb-4">
              <i className="bx bx-info-circle font-size-20" />
              <div className="flex-grow-1">
                <strong>این داشبورد پیش‌فرض است</strong> — برای شخصی‌سازی کلیک کنید.
              </div>
              <Button size="sm" color="info" className="text-white" onClick={handleEnterEditMode} disabled={initializingPersonal}>
                {initializingPersonal ? <Spinner size="sm" className="me-1" /> : <i className="bx bx-slider-alt me-1" />}
                شروع شخصی‌سازی
              </Button>
            </Alert>
          )}

          {/* Page toolbar */}
          <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <h4 className="mb-0 fw-semibold">
                <i className="bx bxs-dashboard text-primary me-2 font-size-20" />داشبورد
              </h4>
              {isEditMode && (
                <span className="badge bg-warning text-dark font-size-11 rounded-pill px-2">
                  <i className="bx bx-pencil me-1" />حالت ویرایش
                </span>
              )}
              {isAdmin && (
                <a href="/admin/dashboard-widgets" className="badge bg-danger text-white font-size-11 rounded-pill px-2 text-decoration-none">
                  <i className="bx bx-shield me-1" />مدیریت ویجت‌ها
                </a>
              )}
            </div>
            <div className="d-flex gap-2 flex-wrap">
              {isEditMode ? (
                <>
                  <Button size="sm" color="primary" onClick={() => setPickerOpen(true)} className="d-flex align-items-center gap-1">
                    <i className="bx bx-plus font-size-16" />افزودن ویجت
                  </Button>
                  <Button size="sm" color="danger" outline onClick={handleReset} className="d-flex align-items-center gap-1">
                    <i className="bx bx-reset font-size-16" />بازگشت به پیش‌فرض
                  </Button>
                  <Button size="sm" color="secondary" onClick={() => setIsEditMode(false)} className="d-flex align-items-center gap-1">
                    <i className="bx bx-check font-size-16" />اتمام ویرایش
                  </Button>
                </>
              ) : (
                <Button size="sm" color="primary" outline onClick={handleEnterEditMode} disabled={initializingPersonal} className="d-flex align-items-center gap-1">
                  {initializingPersonal
                    ? <Spinner size="sm" />
                    : <i className="bx bx-slider-alt font-size-16" />
                  }
                  شخصی‌سازی
                </Button>
              )}
            </div>
          </div>

          {/* ── Grid wrapper: direction:ltr fixes RTL+transforms conflict ── */}
          <div
            ref={gridRef}
            style={{ direction: "ltr", width: "100%", minHeight: 200 }}
          >
            {loading ? (
              <ResponsiveGridLayout
                {...gridProps}
                width={gridWidth}
                layouts={{ lg: SKELETONS, md: SKELETONS, sm: SKELETONS, xs: SKELETONS }}
                isDraggable={false}
                isResizable={false}
              >
                {SKELETONS.map((s) => (
                  <div key={s.i} style={{ direction: "rtl" }}>
                    <SkeletonWidget />
                  </div>
                ))}
              </ResponsiveGridLayout>

            ) : visibleWidgets.length === 0 ? (
              <div style={{ direction: "rtl" }}>
                <Row className="justify-content-center">
                  <Col lg={6} md={8}>
                    <div className="text-center py-5">
                      <div className="mx-auto mb-4 bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center" style={{ width: 80, height: 80 }}>
                        <i className="bx bxs-dashboard text-primary font-size-36" />
                      </div>
                      <h5 className="fw-semibold mb-2">داشبورد شما خالی است</h5>
                      <p className="text-muted mb-4">هنوز هیچ ویجتی اضافه نکرده‌اید.</p>
                      <Button color="primary" onClick={async () => { await handleEnterEditMode(); setPickerOpen(true); }} className="d-inline-flex align-items-center gap-2">
                        <i className="bx bx-plus font-size-18" />شروع شخصی‌سازی
                      </Button>
                    </div>
                  </Col>
                </Row>
              </div>

            ) : (
              <div
                style={{
                  background: isEditMode
                    ? "repeating-linear-gradient(90deg, rgba(85,110,230,0.05) 0, rgba(85,110,230,0.05) 1px, transparent 1px, transparent calc(8.33% - 1px))"
                    : "none",
                  borderRadius: 8,
                  transition: "background 0.3s",
                }}
              >
                <ResponsiveGridLayout
                  {...gridProps}
                  width={gridWidth}
                  layouts={layouts}
                  isDraggable={isEditMode && !isDefaultView}
                  isResizable={isEditMode && !isDefaultView}
                  onLayoutChange={handleLayoutChange}
                >
                  {visibleWidgets.map((userWidget) => (
                    <div
                      key={String(userWidget.id)}
                      style={{
                        direction: "rtl",
                        borderRadius: 8,
                        overflow: "visible",
                        position: "relative",
                        outline: isEditMode ? "2px dashed rgba(85,110,230,0.25)" : "none",
                        outlineOffset: -1,
                      }}
                    >
                      <WidgetRenderer
                        userWidget={userWidget}
                        isEditMode={isEditMode}
                        onDelete={handleDeleteWidget}
                        onToggleVisible={handleToggleVisible}
                        onOpenConfig={setConfigWidget}
                        statsData={statsData}
                        chartDataMap={chartDataMap}
                        recentDataMap={recentDataMap}
                      />
                    </div>
                  ))}
                </ResponsiveGridLayout>
              </div>
            )}
          </div>
        </Container>
      </div>

      <WidgetPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        existingWidgetIds={existingWidgetIds}
        onAdd={handleAddWidget}
      />

      <WidgetConfigModal
        isOpen={!!configWidget}
        onClose={() => setConfigWidget(null)}
        widget={configWidget}
        onSave={handleSaveConfig}
      />

      {/* Delete / Reset confirmation modal */}
      <DeleteModal
        show={!!deleteTargetId}
        loading={deleteLoading}
        onDeleteClick={confirmDelete}
        onCloseClick={() => { if (!deleteLoading) setDeleteTargetId(null); }}
      />
    </React.Fragment>
  );
};

export default DashboardPage;
