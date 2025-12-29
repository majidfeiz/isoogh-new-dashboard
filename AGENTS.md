# AGENTS.md

Project guide for Codex agents working in this repo.

## Stack and structure
- Vite + React 18 app, React Router v6, Redux (createStore) + redux-saga.
- Entry: `src/main.jsx` mounts `App` with Redux `Provider`, `AuthProvider`, and `BrowserRouter`.
- Routes live in `src/routes/index.jsx` and are split into `authProtectedRoutes` and `publicRoutes`.
- Layout selection is based on `Layout.layoutType` in Redux: `VerticalLayout` or `HorizontalLayout`.

## Template and menu
- UI template is from a purchased theme; many generated files/layouts exist but not all are wired up yet.
- Sidebar menu is defined statically in `src/components/VerticalLayout/SidebarContent.jsx`; only entries present there render. Unused files/features from the template may not be functional until wired up.
- New screens/features should be added to the sidebar config before they appear in navigation.

## Auth and permissions
- Auth middleware: `src/routes/route.jsx` checks `localStorage.isoogh_access_token` and redirects to `/login`.
- Auth state + permissions are centralized in `src/context/AuthContext.jsx` and `src/helpers/authStorage.jsx`.
- Permission checks: use `useAuth()` helpers (`hasPermission`, `hasAnyPermission`, `hasAllPermissions`).
- `/auth/me` returns user info with `roles`, `permissions` (object[]), and `effectivePermissions` (string[]); sidebar and feature guards normalize these to string names.

## API and services
- Base URL is set in `src/helpers/apiRoutes.jsx` (`API_BASE_URL`).
- Use `src/helpers/httpClient.jsx` (axios with auth interceptor) for API calls.
- Domain services are in `src/services/*.jsx` (auth, users, roles, permissions, voip).
- When adding endpoints, update `API_ROUTES` in `src/helpers/apiRoutes.jsx` first.
- Prefer creating new service modules under `src/services/` to encapsulate API calls and keep components thin.

## i18n
- i18n setup in `src/i18n.jsx`; default language stored in `localStorage.I18N_LANGUAGE` (default `fa`).
- Translation files are in `src/locales/*/translation.json`.

## Styling
- Global SCSS is loaded from `src/assets/scss/theme.scss`.
- Prefer existing SCSS structure under `src/assets/scss` for new styles.

## Conventions
- Match existing file style (mostly double quotes, JSX, and semicolons in many files).
- Keep changes localized; avoid editing `node_modules` and generated assets.

## Common commands
- Dev server: `npm run dev` or `yarn dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Tests (legacy CRA): `npm run test` (may require setup)
