// src/pages/Dashboard/index.jsx
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ResponsiveGridLayout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./dashboard.scss";
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
  saveDashboardLayout,
  addWidgetToDashboard,
  removeDashboardWidget,
  resetDashboard,
  getDashboardStats,
  getDashboardChart,
  getDashboardRecent,
} from "../../services/dashboardService.jsx";

import { useAuth } from "../../context/AuthContext.jsx";
import {
  getDateRangeKey,
  getWidgetDateRange,
  getWidgetRequestKey,
} from "./dashboardDateRange.js";
import { DASHBOARD_CHART_TYPES, DASHBOARD_RECENT_TYPES } from "./dashboardChartAdapter.js";
import { selectDashboardLayout, toDashboardLayoutPayload } from "./dashboardLayout.js";

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
  ...DASHBOARD_CHART_TYPES,
};

const RECENT_KEY_TO_TYPE = DASHBOARD_RECENT_TYPES;

const CHART_KEYS = new Set([...Object.keys(CHART_KEY_TO_TYPE), "support_forms_by_status"]);
const TABLE_KEYS = new Set(Object.keys(RECENT_KEY_TO_TYPE));
const STATS_ENDPOINT_KEYS = new Set([...STATS_KEYS, "support_forms_by_status"]);

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
  onRetry,
  userIdentity,
}) => {
  const { widget, userConfig, isVisible, id } = userWidget;
  const key = widget?.key;
  const statsRequestKey = getWidgetRequestKey("stats", "", userConfig, userIdentity);
  const chartRequestKey = getWidgetRequestKey("chart", CHART_KEY_TO_TYPE[key], userConfig, userIdentity);
  const recentLimit = userConfig?.limit ?? widget?.configSchema?.find((field) => field.key === "limit")?.default ?? 5;
  const recentRequestKey = getWidgetRequestKey("recent", RECENT_KEY_TO_TYPE[key], userConfig, userIdentity, recentLimit);
  const requestValue = STATS_ENDPOINT_KEYS.has(key)
    ? statsData[statsRequestKey]
    : CHART_KEY_TO_TYPE[key]
      ? chartDataMap[chartRequestKey]
      : RECENT_KEY_TO_TYPE[key]
        ? recentDataMap[recentRequestKey]
        : null;

  const renderContent = () => {
    if (requestValue?.__dashboardError) {
      return (
        <Card className="h-100 mb-0">
          <CardBody className="d-flex flex-column align-items-center justify-content-center text-center">
            <i className="bx bx-error-circle text-danger font-size-24 mb-2" />
            <span className="text-muted font-size-12 mb-2">دریافت اطلاعات این کارت ناموفق بود</span>
            <Button color="primary" outline size="sm" onClick={onRetry}>تلاش دوباره</Button>
          </CardBody>
        </Card>
      );
    }
    if (STATS_KEYS.has(key))
      return <StatsWidget widgetKey={key} widgetName={widget?.name} stats={statsData[statsRequestKey]} />;

    if (TABLE_KEYS.has(key))
      return (
        <RecentTableWidget
          widgetKey={key}
          widgetName={widget?.name}
          userConfig={userConfig}
          data={recentDataMap[recentRequestKey]}
        />
      );

    if (CHART_KEYS.has(key))
      return (
        <ChartWidget
          widgetKey={key}
          widgetName={widget?.name}
          chartData={chartDataMap[chartRequestKey]}
          stats={statsData[statsRequestKey]}
          onRetry={onRetry}
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
  const [statsData, setStatsData] = useState({});
  const [chartDataMap, setChartDataMap] = useState({});
  const [recentDataMap, setRecentDataMap] = useState({});
  const [isDefaultView, setIsDefaultView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [configWidget, setConfigWidget] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [initializingPersonal, setInitializingPersonal] = useState(false);
  const activeBreakpointRef = useRef("lg");
  const loadGenerationRef = useRef(0);
  const saveInFlightRef = useRef(false);
  const pendingSnapshotRef = useRef(null);
  const saveGenerationRef = useRef(0);

  const userIdentity = String(user?.id ?? user?.userId ?? "anonymous");

  // ── Load dashboard ────────────────────────
  const loadDashboard = useCallback(async () => {
    const generation = ++loadGenerationRef.current;
    setLoading(true);
    setDashboardError(null);
    try {
      const myData = await getMyDashboard();
      if (generation !== loadGenerationRef.current) return;
      let defaultDashboard;
      if (myData.length === 0) {
        defaultDashboard = await getDefaultDashboard();
        if (generation !== loadGenerationRef.current) return;
      }
      const { widgets, isDefaultView: defaultView } = selectDashboardLayout({
        personalWidgets: myData,
        defaultDashboard,
      });

      setMyWidgets(widgets);
      setIsDefaultView(defaultView);
      setStatsData({});
      setChartDataMap({});
      setRecentDataMap({});
      setLoading(false);

      // Only fetch data for visible widgets
      const visibleOnly = (w) => w.isVisible !== false;

      const statsWidgets = widgets.filter((w) => STATS_ENDPOINT_KEYS.has(w.widget?.key) && visibleOnly(w));
      const chartWidgets = widgets.filter((w) => CHART_KEY_TO_TYPE[w.widget?.key] && visibleOnly(w));
      const tableWidgets = widgets.filter((w) => RECENT_KEY_TO_TYPE[w.widget?.key] && visibleOnly(w));

      const statsRangeGroups = [...new Map(statsWidgets.map((w) => [
        getDateRangeKey(w.userConfig),
        getWidgetDateRange(w.userConfig),
      ])).values()];

      statsRangeGroups.forEach((range) => {
        const key = getWidgetRequestKey("stats", "", { dateRangeFrom: range.from, dateRangeTo: range.to }, userIdentity);
        getDashboardStats(range)
          .then((data) => { if (generation === loadGenerationRef.current) setStatsData((prev) => ({ ...prev, [key]: data })); })
          .catch(() => { if (generation === loadGenerationRef.current) setStatsData((prev) => ({ ...prev, [key]: { __dashboardError: true } })); });
      });
      chartWidgets.forEach((widget) => {
        const key = getWidgetRequestKey("chart", CHART_KEY_TO_TYPE[widget.widget.key], widget.userConfig, userIdentity);
        getDashboardChart(CHART_KEY_TO_TYPE[widget.widget.key], getWidgetDateRange(widget.userConfig))
          .then((data) => { if (generation === loadGenerationRef.current) setChartDataMap((prev) => ({ ...prev, [key]: data })); })
          .catch(() => { if (generation === loadGenerationRef.current) setChartDataMap((prev) => ({ ...prev, [key]: { __dashboardError: true } })); });
      });
      tableWidgets.forEach((widget) => {
        const limit = widget.userConfig?.limit ?? widget.widget?.configSchema?.find((field) => field.key === "limit")?.default ?? 5;
        const key = getWidgetRequestKey("recent", RECENT_KEY_TO_TYPE[widget.widget.key], widget.userConfig, userIdentity, limit);
        getDashboardRecent(RECENT_KEY_TO_TYPE[widget.widget.key], limit, getWidgetDateRange(widget.userConfig))
          .then((data) => { if (generation === loadGenerationRef.current) setRecentDataMap((prev) => ({ ...prev, [key]: data })); })
          .catch(() => { if (generation === loadGenerationRef.current) setRecentDataMap((prev) => ({ ...prev, [key]: { __dashboardError: true } })); });
      });
    } catch (error) {
      setDashboardError(error);
    } finally {
      if (generation === loadGenerationRef.current) setLoading(false);
    }
  }, [userIdentity]);

  useEffect(() => { myWidgetsRef.current = myWidgets; }, [myWidgets]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  useEffect(() => () => {
    loadGenerationRef.current += 1;
    saveGenerationRef.current += 1;
    pendingSnapshotRef.current = null;
  }, [userIdentity]);

  useEffect(() => {
    setMyWidgets([]);
    setStatsData({});
    setChartDataMap({});
    setRecentDataMap({});
  }, [userIdentity]);

  // Auto-refresh stats every 2 minutes (SA widgets read from the same stats endpoint)
  useEffect(() => {
    if (loading) return;
    const id = setInterval(() => {
      const widgets = myWidgetsRef.current;
      const statsWidgets = widgets.filter((w) => w.isVisible !== false && STATS_ENDPOINT_KEYS.has(w.widget?.key));
      const rangeGroups = [...new Map(statsWidgets.map((w) => [getDateRangeKey(w.userConfig), getWidgetDateRange(w.userConfig)])).values()];
      rangeGroups.forEach((range) => {
        getDashboardStats(range).then((data) => {
          const requestKey = getWidgetRequestKey("stats", "", { dateRangeFrom: range.from, dateRangeTo: range.to }, userIdentity);
          setStatsData((prev) => ({ ...prev, [requestKey]: data }));
        }).catch(() => {});
      });
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
        chartWidgets.map((w) => getDashboardChart(CHART_KEY_TO_TYPE[w.widget.key], getWidgetDateRange(w.userConfig)).catch(() => null))
      ).then((results) => {
        const updates = {};
        chartWidgets.forEach((w, i) => {
          if (results[i] !== null) {
            updates[getWidgetRequestKey("chart", CHART_KEY_TO_TYPE[w.widget.key], w.userConfig, userIdentity)] = results[i];
          }
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
    const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };
    const forBreakpoint = (breakpoint) => {
      let nextY = 0;
      return widgets.map((widget) => {
        const saved = widget.userConfig?.responsiveLayouts?.[breakpoint];
        const width = Math.min(saved?.w ?? widget.w ?? 3, cols[breakpoint]);
        const height = saved?.h ?? widget.h ?? 2;
        const item = saved
          ? { x: Math.min(saved.posX ?? 0, cols[breakpoint] - width), y: saved.posY ?? 0, w: width, h: height }
          : breakpoint === "lg"
            ? { x: Math.min(widget.posX ?? 0, cols.lg - width), y: widget.posY ?? 0, w: width, h: height }
            : { x: 0, y: nextY, w: width, h: height };
        nextY = Math.max(nextY, item.y + item.h);
        return { i: String(widget.widgetId ?? widget.widget?.id), ...item, minW: 1, minH: 1 };
      });
    };
    return {
      lg: forBreakpoint("lg"), md: forBreakpoint("md"), sm: forBreakpoint("sm"),
      xs: forBreakpoint("xs"), xxs: forBreakpoint("xxs"),
    };
  };

  const toLayoutPayload = useCallback(toDashboardLayoutPayload, []);

  const flushLayoutSave = useCallback(async () => {
    if (saveInFlightRef.current) return;
    saveInFlightRef.current = true;
    const saveGeneration = saveGenerationRef.current;
    while (pendingSnapshotRef.current) {
      const snapshot = pendingSnapshotRef.current;
      pendingSnapshotRef.current = null;
      try {
        let saved;
        try {
          saved = await saveDashboardLayout(snapshot);
        } catch (error) {
          if (error?.response?.status !== 409) throw error;
          await getMyDashboard();
          saved = await saveDashboardLayout(pendingSnapshotRef.current ?? snapshot);
          pendingSnapshotRef.current = null;
        }
        if (saveGeneration !== saveGenerationRef.current) break;
        if (Array.isArray(saved) && saved.length > 0) {
          setMyWidgets((current) => current.map((local) => {
            const server = saved.find((item) => Number(item.widgetId ?? item.widget?.id) === Number(local.widgetId ?? local.widget?.id));
            return server ? {
              ...local,
              id: server.id ?? local.id,
              widget: server.widget ?? local.widget,
            } : local;
          }));
        }
        toast.success("چیدمان ذخیره شد", { toastId: "dashboard-layout-saved" });
      } catch (error) {
        if (saveGeneration !== saveGenerationRef.current) break;
        toast.error("ذخیره چیدمان انجام نشد؛ موقعیت قبلی بازیابی شد", { toastId: "dashboard-layout-error" });
        void loadDashboard();
      }
    }
    saveInFlightRef.current = false;
    if (pendingSnapshotRef.current) {
      queueMicrotask(() => { void flushLayoutSave(); });
    }
  }, [loadDashboard]);

  const queueLayoutSave = useCallback((widgets) => {
    pendingSnapshotRef.current = toLayoutPayload(widgets);
    void flushLayoutSave();
  }, [flushLayoutSave, toLayoutPayload]);

  // ── Handlers ─────────────────────────────
  const handleLayoutChange = useCallback(
    (currentLayout) => {
      if (!isEditMode || isDefaultView) return;
      const breakpoint = activeBreakpointRef.current;
      const byWidgetId = new Map(currentLayout.map((item, index) => [item.i, { ...item, sortOrder: index }]));
      const next = myWidgetsRef.current.map((widget) => {
        const item = byWidgetId.get(String(widget.widgetId ?? widget.widget?.id));
        if (!item) return widget;
        const responsiveLayouts = { ...(widget.userConfig?.responsiveLayouts ?? {}), [breakpoint]: {
          posX: item.x, posY: item.y, w: item.w, h: item.h,
        } };
        return {
          ...widget,
          ...(breakpoint === "lg" ? { posX: item.x, posY: item.y, w: item.w, h: item.h, sortOrder: item.sortOrder } : {}),
          userConfig: { ...(widget.userConfig ?? {}), responsiveLayouts },
        };
      });
      myWidgetsRef.current = next;
      setMyWidgets(next);
      queueLayoutSave(next);
    },
    [isEditMode, isDefaultView, queueLayoutSave]
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
      const nextWidgets = myWidgets.map((w) => (w.id === id ? { ...w, isVisible: newVal } : w));
      setMyWidgets(nextWidgets);

      // If widget is being shown and has no data yet, fetch it now
      if (newVal) {
        const target = myWidgets.find((w) => w.id === id);
        const key = target?.widget?.key;
        const range = getWidgetDateRange(target?.userConfig);
        const chartRequestKey = getWidgetRequestKey("chart", CHART_KEY_TO_TYPE[key], target?.userConfig, userIdentity);
        const recentLimit = target?.userConfig?.limit ?? target?.widget?.configSchema?.find((field) => field.key === "limit")?.default ?? 5;
        const recentRequestKey = getWidgetRequestKey("recent", RECENT_KEY_TO_TYPE[key], target?.userConfig, userIdentity, recentLimit);
        if (key && CHART_KEY_TO_TYPE[key] && !(chartRequestKey in chartDataMap)) {
          getDashboardChart(CHART_KEY_TO_TYPE[key], range)
            .then((d) => setChartDataMap((prev) => ({ ...prev, [chartRequestKey]: d })))
            .catch(() => setChartDataMap((prev) => ({ ...prev, [chartRequestKey]: { __dashboardError: true } })));
        } else if (key && RECENT_KEY_TO_TYPE[key] && !(recentRequestKey in recentDataMap)) {
          getDashboardRecent(RECENT_KEY_TO_TYPE[key], recentLimit, range)
            .then((d) => setRecentDataMap((prev) => ({ ...prev, [recentRequestKey]: d })))
            .catch(() => setRecentDataMap((prev) => ({ ...prev, [recentRequestKey]: { __dashboardError: true } })));
        } else if (key && STATS_ENDPOINT_KEYS.has(key)) {
          const statsRequestKey = getWidgetRequestKey("stats", "", target?.userConfig, userIdentity);
          if (!(statsRequestKey in statsData)) {
            getDashboardStats(range)
              .then((d) => setStatsData((prev) => ({ ...prev, [statsRequestKey]: d })))
              .catch(() => setStatsData((prev) => ({ ...prev, [statsRequestKey]: { __dashboardError: true } })));
          }
        }
      }

      if (!isDefaultView) queueLayoutSave(nextWidgets);
    },
    [isDefaultView, myWidgets, chartDataMap, recentDataMap, statsData, queueLayoutSave]
  );

  const handleSaveConfig = useCallback(
    async (id, newConfig) => {
      const widget = myWidgets.find((w) => w.id === id);
      const nextWidgets = myWidgets.map((w) => (w.id === id ? { ...w, userConfig: { ...(w.userConfig ?? {}), ...newConfig } } : w));
      setMyWidgets(nextWidgets);
      queueLayoutSave(nextWidgets);
      const key = widget?.widget?.key;
      const range = getWidgetDateRange(newConfig);
      if (key && RECENT_KEY_TO_TYPE[key]) {
        const limit = newConfig?.limit ?? 5;
        const requestKey = getWidgetRequestKey("recent", RECENT_KEY_TO_TYPE[key], newConfig, userIdentity, limit);
        getDashboardRecent(RECENT_KEY_TO_TYPE[key], limit, range)
          .then((data) => setRecentDataMap((prev) => ({ ...prev, [requestKey]: data })))
          .catch(() => setRecentDataMap((prev) => ({ ...prev, [requestKey]: { __dashboardError: true } })));
      } else if (key && CHART_KEY_TO_TYPE[key]) {
        const requestKey = getWidgetRequestKey("chart", CHART_KEY_TO_TYPE[key], newConfig, userIdentity);
        getDashboardChart(CHART_KEY_TO_TYPE[key], range)
          .then((data) => setChartDataMap((prev) => ({ ...prev, [requestKey]: data })))
          .catch(() => setChartDataMap((prev) => ({ ...prev, [requestKey]: { __dashboardError: true } })));
      } else if (key && STATS_ENDPOINT_KEYS.has(key)) {
        const requestKey = getWidgetRequestKey("stats", "", newConfig, userIdentity);
        getDashboardStats(range)
          .then((data) => setStatsData((prev) => ({ ...prev, [requestKey]: data })))
          .catch(() => setStatsData((prev) => ({ ...prev, [requestKey]: { __dashboardError: true } })));
      }
    },
    [myWidgets, queueLayoutSave]
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
        if (widget.configSchema?.some((field) => field.key === "dateRangeFrom") && widget.configSchema?.some((field) => field.key === "dateRangeTo")) {
          setConfigWidget(newWidget?.widget ? newWidget : { ...newWidget, widget });
        }

        // Fetch data for new widget
        const key = widget.key;
        if (CHART_KEY_TO_TYPE[key]) {
          const requestKey = getWidgetRequestKey("chart", CHART_KEY_TO_TYPE[key], {}, userIdentity);
          getDashboardChart(CHART_KEY_TO_TYPE[key])
            .then((d) => setChartDataMap((prev) => ({ ...prev, [requestKey]: d })))
            .catch(() => setChartDataMap((prev) => ({ ...prev, [requestKey]: { __dashboardError: true } })));
        } else if (RECENT_KEY_TO_TYPE[key]) {
          const limit = widget.configSchema?.find((f) => f.key === "limit")?.default ?? 5;
          const requestKey = getWidgetRequestKey("recent", RECENT_KEY_TO_TYPE[key], {}, userIdentity, limit);
          getDashboardRecent(RECENT_KEY_TO_TYPE[key], limit)
            .then((d) => setRecentDataMap((prev) => ({ ...prev, [requestKey]: d })))
            .catch(() => setRecentDataMap((prev) => ({ ...prev, [requestKey]: { __dashboardError: true } })));
        } else if (STATS_ENDPOINT_KEYS.has(key)) {
          const requestKey = getWidgetRequestKey("stats", "", {}, userIdentity);
          if (!(requestKey in statsData)) {
            getDashboardStats()
              .then((d) => setStatsData((prev) => ({ ...prev, [requestKey]: d })))
              .catch(() => setStatsData((prev) => ({ ...prev, [requestKey]: { __dashboardError: true } })));
          }
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

  const handleRetryWidget = useCallback((userWidget) => {
    const key = userWidget?.widget?.key;
    const range = getWidgetDateRange(userWidget?.userConfig);
    if (CHART_KEY_TO_TYPE[key]) {
      const requestKey = getWidgetRequestKey("chart", CHART_KEY_TO_TYPE[key], userWidget.userConfig, userIdentity);
      setChartDataMap((prev) => { const next = { ...prev }; delete next[requestKey]; return next; });
      getDashboardChart(CHART_KEY_TO_TYPE[key], range)
        .then((data) => setChartDataMap((prev) => ({ ...prev, [requestKey]: data })))
        .catch(() => setChartDataMap((prev) => ({ ...prev, [requestKey]: { __dashboardError: true } })));
      return;
    }
    if (RECENT_KEY_TO_TYPE[key]) {
      const limit = userWidget.userConfig?.limit ?? userWidget.widget?.configSchema?.find((field) => field.key === "limit")?.default ?? 5;
      const requestKey = getWidgetRequestKey("recent", RECENT_KEY_TO_TYPE[key], userWidget.userConfig, userIdentity, limit);
      setRecentDataMap((prev) => { const next = { ...prev }; delete next[requestKey]; return next; });
      getDashboardRecent(RECENT_KEY_TO_TYPE[key], limit, range)
        .then((data) => setRecentDataMap((prev) => ({ ...prev, [requestKey]: data })))
        .catch(() => setRecentDataMap((prev) => ({ ...prev, [requestKey]: { __dashboardError: true } })));
      return;
    }
    if (STATS_ENDPOINT_KEYS.has(key)) {
      const requestKey = getWidgetRequestKey("stats", "", userWidget.userConfig, userIdentity);
      setStatsData((prev) => { const next = { ...prev }; delete next[requestKey]; return next; });
      getDashboardStats(range)
        .then((data) => setStatsData((prev) => ({ ...prev, [requestKey]: data })))
        .catch(() => setStatsData((prev) => ({ ...prev, [requestKey]: { __dashboardError: true } })));
    }
  }, [userIdentity]);

  // ── Enter edit mode ───────────────────────
  // The first customization is one atomic snapshot, including every default widget.
  const handleEnterEditMode = useCallback(async () => {
    if (!isDefaultView) {
      setIsEditMode(true);
      return;
    }

    setInitializingPersonal(true);
    try {
      await saveDashboardLayout(toLayoutPayload(myWidgets));
      // Reload to get real entry.id for every widget
      await loadDashboard();
      setIsEditMode(true);
    } catch {
      toast.error("خطا در راه‌اندازی داشبورد شخصی");
    } finally {
      setInitializingPersonal(false);
    }
  }, [isDefaultView, myWidgets, loadDashboard, toLayoutPayload]);

  const existingWidgetIds = myWidgets.map((w) => w.widgetId).filter(Boolean);
  const visibleWidgets = isEditMode ? myWidgets : myWidgets.filter((w) => w.isVisible !== false);
  const layouts = buildLayouts(visibleWidgets);

  // ── Common grid props ─────────────────────
  const gridProps = {
    breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
    rowHeight: 72,
    margin: [14, 14],
    containerPadding: [0, 0],
    // Preserve intentional gaps instead of moving widgets upward after drop.
    compactType: null,
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

          {dashboardError && (
            <Alert color="danger" className="d-flex align-items-center justify-content-between gap-3">
              <span>بارگذاری چیدمان داشبورد ناموفق بود.</span>
              <Button color="danger" outline size="sm" onClick={loadDashboard}>تلاش دوباره</Button>
            </Alert>
          )}

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
            {dashboardError ? null : loading ? (
              <ResponsiveGridLayout
                {...gridProps}
                width={gridWidth}
                layouts={{ lg: SKELETONS, md: SKELETONS, sm: SKELETONS, xs: SKELETONS, xxs: SKELETONS }}
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
                className="dashboard-grid"
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
                  onBreakpointChange={(breakpoint) => { activeBreakpointRef.current = breakpoint; }}
                  onDragStop={handleLayoutChange}
                  onResizeStop={handleLayoutChange}
                >
                  {visibleWidgets.map((userWidget) => (
                    <div
                      key={String(userWidget.widgetId ?? userWidget.widget?.id)}
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
                        onRetry={() => handleRetryWidget(userWidget)}
                        userIdentity={userIdentity}
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
