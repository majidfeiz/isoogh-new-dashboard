export const BALE_MIN_CLIENT_VERSION = 3;

export function createBaleAdapter(globalObject = typeof window !== "undefined" ? window : {}) {
  const webApp = globalObject?.Bale?.WebApp;
  return {
    initData: typeof webApp?.initData === "string" ? webApp.initData : "",
    isSupported: Boolean(webApp && typeof webApp.ready === "function"),
    colorScheme: webApp?.colorScheme === "dark" ? "dark" : "light",
    themeParams: webApp?.themeParams || {},
    version: Number(webApp?.version || 0),
    ready: () => webApp?.ready?.(),
    expand: () => webApp?.expand?.(),
    close: () => webApp?.close?.(),
    enableClosingConfirmation: () => webApp?.enableClosingConfirmation?.(),
    disableClosingConfirmation: () => webApp?.disableClosingConfirmation?.(),
    onBack(handler) {
      const button = webApp?.BackButton;
      if (!button) return () => {};
      button.onClick?.(handler);
      button.show?.();
      return () => { button.offClick?.(handler); button.hide?.(); };
    },
  };
}

const THEME_KEYS = {
  bg_color: "--bale-bg", text_color: "--bale-text", hint_color: "--bale-hint",
  link_color: "--bale-link", button_color: "--bale-button", button_text_color: "--bale-button-text",
  secondary_bg_color: "--bale-surface",
};
export function applyBaleTheme(params = {}, root = document.documentElement) {
  Object.entries(THEME_KEYS).forEach(([key, variable]) => {
    if (typeof params[key] === "string" && params[key]) root.style.setProperty(variable, params[key]);
  });
}

export const createIdempotencyKey = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const BALE_AUTH_STATES = Object.freeze({
  BOOTING: "booting",
  UNSUPPORTED: "unsupported",
  EXCHANGING: "exchanging",
  UNLINKED: "unlinked",
  AUTHENTICATED: "authenticated",
  ROLE_SELECTION: "role-selection",
  SCHOOL_SELECTION: "school-selection",
  READY: "ready",
  FORBIDDEN: "forbidden",
  RECOVERABLE_ERROR: "recoverable-error",
});

export const baleQueryKey = ({ role = "", schoolId = "", resource = "", params = {} } = {}) => [
  "bale-mini",
  String(role),
  String(schoolId),
  String(resource),
  JSON.stringify(Object.fromEntries(Object.entries(params).sort(([a], [b]) => a.localeCompare(b)))),
];

export const normalizeBootstrap = (value = {}) => {
  const schoolsSource = value.schools?.items ?? value.schools?.data ?? value.schools ?? [];
  const schools = (Array.isArray(schoolsSource) ? schoolsSource : []).map((school) => ({
    ...school,
    id: school.id ?? school.schoolId,
    name: school.name ?? school.schoolName ?? school.title ?? `مجموعه ${school.id ?? school.schoolId}`,
  }));
  return {
    ...value,
    schools,
    activeSchoolId: value.activeSchoolId ?? value.schoolId ?? (schools.length === 1 ? schools[0].id : null),
    navigation: Array.isArray(value.navigation) ? value.navigation.filter((item) => item?.path && item.enabled !== false) : [],
    capabilities: value.capabilities && typeof value.capabilities === "object" && !Array.isArray(value.capabilities) ? value.capabilities : {},
  };
};

const SENSITIVE_TELEMETRY_KEYS = /initData|token|authorization|cookie|phone|response|body|stack|secret|answer/i;
export const sanitizeBaleTelemetry = (context = {}) => Object.fromEntries(
  Object.entries(context)
    .filter(([key, value]) => !SENSITIVE_TELEMETRY_KEYS.test(key) && ["string", "number", "boolean"].includes(typeof value))
    .slice(0, 12)
);

export const visibleBaleNavigation = (navigation = []) => navigation.filter((item) => item.visible !== false);

export const buildBaleResourceParams = ({ activeRole, resource, activeSchoolId, context = {}, page = 1 }) => {
  const paginated = () => ({ page, limit: 20 });
  let params = {};
  if (activeRole === "adviser") {
    if (["schools", "forms", "support-forms", "students", "form-students"].includes(resource)) params = paginated();
    if (["forms", "support-forms"].includes(resource)) params = { ...params, search: context.search, sortBy: context.sortBy, sortOrder: context.sortOrder };
    if (["call-history", "calls"].includes(resource)) params = { ...paginated(), schoolId: context.schoolId || activeSchoolId, supportFormId: context.formId };
  }
  if (activeRole === "manager" && ["home", "dashboard"].includes(resource)) params = { ...paginated(), schoolId: context.schoolId || activeSchoolId };
  if (["super-adviser", "super_adviser"].includes(activeRole)) {
    if (resource === "schools") params = { ...paginated(), search: context.search };
    if (resource === "advisers") params = { ...paginated(), search: context.search, schoolId: context.schoolId || activeSchoolId };
    if (["forms", "support-forms"].includes(resource)) params = { ...paginated(), search: context.search, schoolId: context.schoolId || activeSchoolId, adviserId: context.adviserId, gradeId: context.gradeId };
    if (resource === "students") params = { ...paginated(), search: context.search, adviserId: context.adviserId };
    if (resource === "monitoring") params = { date: context.date, schoolId: context.schoolId || activeSchoolId, supportFormId: context.formId };
    if (resource === "performance") params = { ...paginated(), search: context.search, supportFormId: context.formId, adviserId: context.adviserId };
    if (resource === "salary") params = { year: context.year, month: context.month, adviserId: context.adviserId, supportFormId: context.formId };
  }
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value != null && value !== ""));
};
