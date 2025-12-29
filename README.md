# isoogh-new-dashboard

React 18 + Vite dashboard (purchased template) wired with Redux + redux-saga, React Router v6, and a permissions-aware sidebar.

## Prerequisites
- Node.js 18+ (recommended)
- npm or yarn

## Setup
1) Install dependencies:
```bash
npm install
# یا
yarn install
```

2) Configure environment variables (Vite format):
- Create `.env` (or `.env.local`) with:
```
VITE_API_BASE_URL=http://127.0.0.1:8040
```
- The API base URL is read in `src/helpers/apiRoutes.jsx`.

## Scripts
- Dev server: `npm run dev` (or `yarn dev`)
- Build: `npm run build`
- Preview built app: `npm run preview`
- Lint: `npm run lint` | Fix: `npm run lint:fix`
- Format: `npm run format`
- Tests (CRA legacy): `npm run test` (may need CRA setup)

## Project structure (key paths)
- Entry: `src/main.jsx`
- Routing: `src/routes/index.jsx` + `src/routes/route.jsx` (auth guard)
- Layouts: `src/components/VerticalLayout/*`, `src/components/HorizontalLayout/*`
- Sidebar config: `src/components/VerticalLayout/SidebarContent.jsx` (only items defined here render)
- Auth/permissions: `src/context/AuthContext.jsx`, `src/helpers/authStorage.jsx`
- API helpers: `src/helpers/apiRoutes.jsx`, `src/helpers/httpClient.jsx`
- Services: `src/services/*` (add new API modules here)
- i18n: `src/i18n.jsx`, translations in `src/locales/*/translation.json`
- Styles: `src/assets/scss/theme.scss`

## Notes
- `/auth/me` response includes `roles`, `permissions` (objects), and `effectivePermissions` (string[]); permission guards normalize names.
- Many template pages exist; only items registered in the sidebar are currently visible. Add new screens/routes and then add them to `SidebarContent.jsx`.
