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
