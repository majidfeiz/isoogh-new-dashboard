# Project Memory

Last verified against the repository: 2026-07-04 (app version `1.2.4`).

This is the short, code-derived context to read before changing the project. `AGENTS.md` remains the detailed conventions guide; `docs/DOMAIN_MAP.md` is the feature locator.

## Fast start

```bash
source "$HOME/.nvm/nvm.sh"
nvm use 18
npm run dev
```

- Verified runtime: Node `18.20.8`, npm `10.8.2`.
- Dev server: Vite 5, normally `http://localhost:5173`.
- Build: `npm run build` (verified passing on 2026-07-04).
- Lint baseline: `npm run lint` currently cannot start because `eslint-plugin-react` is referenced in `package.json` but is not installed.
- Tests use the old `react-scripts test` command; do not assume the test setup is aligned with Vite.

## Runtime shape

```text
main.jsx
  Redux Provider
  AuthProvider
  BrowserRouter
    App.jsx
      AuthProvider (second/nested instance)
      public route -> NonAuthLayout
      protected route -> token guard -> selected layout -> page
```

- `src/routes/index.jsx` eagerly imports both active business pages and many unused template/demo pages. This is why the production bundle is large.
- Layout selection is Redux-backed (`Layout.layoutType`); vertical is the default.
- Business page data should remain local component state. Redux/sagas are mostly inherited template infrastructure plus layout/auth.
- The UI is Persian RTL. Prefer Reactstrap/Bootstrap utilities and existing shared components.

## Configuration and authentication

- API base precedence in `src/helpers/apiRoutes.jsx`: `window.__ENV__.VITE_API_BASE_URL` -> build-time `VITE_API_BASE_URL` -> `https://napi.isoogh.ir`.
- Local backend commonly uses `VITE_API_BASE_URL=http://127.0.0.1:8040`.
- Swagger: local `http://localhost:8040/api-docs#/`; remote `https://napi.isoogh.ir/api-docs#/`.
- Access token key: `localStorage.isoogh_access_token`. The protected-route guard only checks token presence.
- `AuthContext` loads `/auth/me`, normalizes permission names, and refreshes on mount, focus, and visibility changes.
- Important existing caveat: `AuthProvider` is mounted in both `src/main.jsx` and `src/App.jsx`; the inner provider is what routed components consume and this can duplicate `/auth/me` work.
- HTTP requests go through `src/helpers/httpClient.jsx`. It injects the bearer token, clears auth data on 401, parses blob errors, and displays Persian error toasts unless `config.silent` is true.
- Do not show the same API error toast again in page components.

## Change path

For a normal CRUD feature, inspect and change in this order:

1. `src/helpers/apiRoutes.jsx`
2. matching file in `src/services/`
3. matching folder in `src/pages/`
4. `src/routes/index.jsx`
5. `src/components/VerticalLayout/SidebarContent.jsx`
6. locale files only when the label actually uses i18n

Use `apiPatch` for partial updates and `getApiUrl(API_ROUTES...)` for every endpoint. Use `TableContainer` with external `Paginations`; server sorting is mapped through each column's `meta.sortKey`. Confirm before destructive operations and refresh the current page afterward.

## Special workflows

- CSV downloads: native streaming `fetch`, bearer token from `authStorage`, UTF-8 BOM, progress from content-length headers. References: `Users.jsx`, `OutboundCallHistories.jsx`.
- Excel import: lazy `import("xlsx")`, virtualized preview, multipart upload with `onUploadProgress`. Reference: `StudentList.jsx`.
- Back-navigation list restoration: `src/hooks/useListState.js`, which persists under `sessionStorage` keys prefixed with `list:` and restores only on POP navigation.
- User impersonation: `userSwitchService.jsx` plus `ImpersonationBanner`/`SwitchUserButton`; treat token switching as auth-sensitive work.
- Realtime VoIP view uses socket.io; inspect `OutboundCallHistoriesLive.jsx` and socket docs service before changing event handling.

## Known baseline and risks

- Production build passes, with a Vite CJS API deprecation warning.
- Main JS is about 10.2 MB minified (about 2.59 MB gzip); main CSS is about 1.05 MB. Routes are not lazy-loaded.
- `react-toastify` is both statically and dynamically imported, so the dynamic import in `voipAnalyticsService.jsx` does not create a separate chunk.
- The repository contains extensive Skote/template demo routes, pages, stores, and assets. Do not treat all registered routes as product features and do not refactor/remove template code incidentally.
- Code style is inconsistent between inherited and business code. Match the file being edited; avoid repo-wide formatting.
- `src/config.jsx` contains empty legacy Google/Facebook settings and is not the API environment source.

## Source-of-truth files

| Question | Read first |
|---|---|
| Route/component mapping | `src/routes/index.jsx` |
| API URL or endpoint | `src/helpers/apiRoutes.jsx` |
| Request/error behavior | `src/helpers/httpClient.jsx` |
| Token/user persistence | `src/helpers/authStorage.jsx` |
| Current user/permissions | `src/context/AuthContext.jsx` |
| Visible navigation/permission gates | `src/components/VerticalLayout/SidebarContent.jsx` |
| Domain response normalization | matching `src/services/*Service.jsx` |
| Shared table behavior | `src/components/Common/TableContainer.jsx` and `Paginations.jsx` |
| Build aliases/CKEditor shim | `vite.config.js` and `src/shims/ckeditor5-watchdog.js` |

## Before handing off a change

- Preserve unrelated user changes and inspect `git diff`.
- Run the smallest relevant check, then `npm run build` for routing/dependency/build changes.
- Do not claim lint passed until the missing lint dependency/configuration is fixed.
- For endpoint changes, compare Swagger with `apiRoutes.jsx` and the service response normalization.
- Update this memory only when architecture, commands, conventions, domain ownership, or a durable baseline changes.
