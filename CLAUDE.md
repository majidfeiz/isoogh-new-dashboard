# CLAUDE.md — isoogh-new-dashboard

Admin dashboard for the Isoogh educational platform. Persian (Farsi) RTL UI.
Built on a Vite + React template; custom business pages live alongside the unused template pages.

---

## Stack

| Layer | Tech |
|-------|------|
| Build | Vite 5, React 18 |
| Routing | React Router v6 |
| State | Redux (`createStore`) + redux-saga (layout/auth only; page state stays local) |
| UI | Reactstrap 9 (Bootstrap 5) |
| Tables | TanStack Table v8 via `TableContainer` |
| HTTP | axios via `src/helpers/httpClient.jsx`; streaming `fetch` for CSV exports |
| i18n | i18next, default language `fa` (Persian) |
| Charts | ApexCharts, Chart.js, ECharts, Recharts |
| Forms | Formik + Yup |
| Realtime | socket.io-client |
| Dates | moment + moment-jalaali |

---

## Project structure

```
src/
├── main.jsx                        # entry: Redux Provider + AuthProvider + BrowserRouter
├── App.jsx                         # route rendering + layout selection
├── routes/
│   ├── index.jsx                   # all route definitions (authProtectedRoutes + publicRoutes)
│   └── route.jsx                   # auth guard (checks isoogh_access_token)
├── context/
│   └── AuthContext.jsx             # user, permissions, refreshMe (calls GET /auth/me)
├── helpers/
│   ├── apiRoutes.jsx               # API_BASE_URL, API_ROUTES, getApiUrl
│   ├── httpClient.jsx              # axios instance, interceptors, apiGet/Post/Put/Patch/Delete
│   └── authStorage.jsx             # localStorage helpers (token, user, permissions)
├── services/                       # one file per domain (thin API wrappers)
├── components/
│   ├── VerticalLayout/
│   │   └── SidebarContent.jsx      # sidebar menu config + permission filtering
│   ├── Common/
│   │   ├── TableContainer.jsx      # shared table (TanStack Table v8)
│   │   ├── Paginations.jsx         # shared pagination bar
│   │   └── Breadcrumb.jsx
│   └── Access/
│       └── Can.jsx                 # <Can permission="perm.name"> guard
├── pages/                          # one folder per domain
├── locales/fa/translation.json     # Persian translations
└── assets/scss/theme.scss          # global SCSS entry
```

---

## Active business pages & routes

| Domain | Routes |
|--------|--------|
| Dashboard | `/dashboard` |
| Permissions | `/permissions`, `/permissions/create`, `/permissions/:id/edit` |
| Roles | `/roles`, `/roles/create`, `/roles/:id/edit`, `/roles/:id/permissions` |
| Users | `/users`, `/users/create`, `/users/:id/edit`, `/users/:id/permissions` |
| Managers | `/managers`, `/managers/create`, `/managers/:id/edit` |
| Advisers | `/advisers`, `/advisers/:adviserId/students` |
| Students | `/students`, `/students/create`, `/students/:id/edit` |
| Schools | `/schools`, `/schools/create`, `/schools/:id/edit` |
| Grades | `/grades`, `/grades/create`, `/grades/:id/edit` |
| Parent Tags | `/parent-tags`, `/parent-tags/create`, `/parent-tags/:id/edit`, `/parent-tags/:id/users` |
| Support Forms | `/support-forms`, `/support-forms/create`, `/support-forms/:id/edit`, `/support-forms/:id`, `/support-forms/:id/advisers`, `/support-forms/:id/advisers/:adviserId/students` |
| Files | `/files`, `/files/create`, `/files/:id/edit` |
| VoIP | `/voip/outbound-call-histories`, `/voip/outbound-call-histories/online` |
| VoIP Webhooks | `/voip-webhooks`, `/voip-webhooks/create`, `/voip-webhooks/logs`, `/voip-webhooks/:id/edit` |
| External API | `/external-api-clients`, `/external-api-clients/:id`, `/external-api-clients/logs`, `/external-api-clients/docs` |
| Notifications | `/notifications`, `/notifications/compose` |
| Reports | `/reports` |
| Sessions (Admin) | `/admin/users/:userId/sessions` |
| Dashboard Widgets (Admin) | `/admin/dashboard-widgets` |
| Super Adviser Portal | `/super-adviser-portal/schools`, `/advisers`, `/support-forms`, `/students`, `/performance-report`, `/monitoring`, `/salary`, `/answer-sheet/:formId` |
| Adviser Portal | `/adviser-calls`, `/adviser-calls/schools/:schoolId`, `/adviser-calls/forms/:formId`, `/adviser-calls/forms/:formId/students/:studentId`, `/adviser-calls/logs`, `/adviser-calls/stats`, `/adviser-calls/interrupted-calls` |

---

## Auth & permissions

- Token: `localStorage.isoogh_access_token`. `route.jsx` redirects to `/login` if missing.
- `AuthContext` calls `GET /auth/me` on mount, window focus, and visibility change.
- `/auth/me` returns `{ roles, permissions: object[], effectivePermissions: string[] }`.
- Hook: `useAuth()` → `hasPermission(perm)`, `hasAnyPermission(perms[])`, `hasAllPermissions(perms[])`.
- JSX guard: `<Can permission="perm.name">…</Can>`.
- Naming convention: `resource.action` (e.g. `users.index`, `students.create`).

---

## API and services

### Add an endpoint

```js
// src/helpers/apiRoutes.jsx
myResource: {
  list:   "/my-resource",
  create: "/my-resource",
  detail: (id) => `/my-resource/${id}`,
  update: (id) => `/my-resource/${id}`,
  delete: (id) => `/my-resource/${id}`,
},
```

### Create a service (`src/services/myResourceService.jsx`)

```js
import { apiGet, apiPost, apiPatch, apiDelete } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

export async function getMyResources({ page = 1, limit = 10, search = "", sortBy, sortOrder } = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.myResource.list), {
    params: { page, limit, search: search || undefined, sortBy: sortBy || undefined, sortOrder: sortOrder || undefined },
  });
  const payload = res?.data;
  const data = payload?.data || {};
  const items = data.items || data.data || [];
  const meta = data.meta || data.pagination || {};
  return {
    items,
    pagination: {
      page: meta.page ?? page,
      limit: meta.limit ?? limit,
      total: meta.total ?? items.length,
      lastPage: meta.lastPage ?? Math.ceil((meta.total || 0) / (meta.limit || limit)) || 1,
    },
  };
}
```

- Use `apiPatch` for partial updates (never `apiPut`).
- Always use `getApiUrl(API_ROUTES.x.y)` — never hardcode URLs.
- `httpClient` auto-shows a `toast.error` for every failed request; don't re-show in components.

---

## Adding a new page (checklist)

1. **API routes** → `src/helpers/apiRoutes.jsx`
2. **Service** → `src/services/myResourceService.jsx`
3. **Pages** → `src/pages/MyResource/MyResourceList.jsx` and `MyResourceForm.jsx`
4. **Routes** → register in `src/routes/index.jsx` under `authProtectedRoutes`
5. **Sidebar** → add entry to `menuItems` in `src/components/VerticalLayout/SidebarContent.jsx`

### List page skeleton

```jsx
const MyResourceList = () => {
  document.title = "عنوان صفحه | داشبورد آیسوق";
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, lastPage: 1 });
  const [filters, setFilters] = useState({ search: "" });
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [sort, setSort] = useState({ by: "id", order: "DESC" });

  const fetchData = useCallback(async (page = 1, currentFilters = {}, currentSort = sort) => {
    setLoading(true);
    try {
      const res = await getMyResources({ page, limit: meta.limit, ...currentFilters, sortBy: currentSort?.by, sortOrder: currentSort?.order });
      setData(res.items || []);
      setMeta(res.pagination || { page, limit: meta.limit, total: 0, lastPage: 1 });
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [meta.limit, sort]);

  useEffect(() => { fetchData(1, filters, sort); }, [fetchData, sort]);

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="بخش" breadcrumbItem="عنوان" />
        <Row><Col lg={12}>
          <Card>
            <CardBody>
              <TableContainer columns={columns} data={data} isGlobalFilter={false} isPagination={false}
                isLoading={loading} manualSorting sortingState={sorting} onSortingChange={handleSortingChange}
                tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
              />
              <Paginations perPageData={meta.limit} data={data} totalRecords={meta.total}
                currentPage={meta.page} setCurrentPage={handlePageChange}
                isShowingPageLength={true} paginationDiv="col-sm-auto" paginationClass="pagination pagination-sm mb-0"
              />
            </CardBody>
          </Card>
        </Col></Row>
      </div>
    </div>
  );
};
```

### Form page pattern

- Use `useParams()` to detect create vs edit (`id` present → edit, fetch detail on mount).
- On success `navigate(-1)` or to the list route.
- Validation errors come from response `data.message` — `httpClient` auto-toasts them.

---

## Sidebar menu entry

```js
// src/components/VerticalLayout/SidebarContent.jsx
{
  type: "group",
  label: "عنوان منو",
  icon: "bx bx-icon-name",
  permissionAny: ["resource.index", "resource.create"],
  children: [
    { label: "لیست", to: "/my-resource", permission: "resource.index" },
    { label: "ایجاد جدید", to: "/my-resource/create", permission: "resource.create" },
  ],
},
```

- Single-page items: `type: "item"`, `permission: null` or a single permission string.
- `permissionAny` on a group hides the entire group if none of the listed permissions are present.
- Icons from Boxicons: prefix `bx bx-*` or `bx bxs-*`.

---

## CSV export pattern

Use streaming `fetch` — axios buffers the full response and breaks CSV exports.

```js
const handleExport = async () => {
  const url = `${getApiUrl(API_ROUTES.myResource.export)}?${params}`;
  const token = getAccessToken();
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok || !res.body) throw new Error(await res.text());
  const reader = res.body.getReader();
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
  const blob = new Blob([bom, ...chunks], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `resource-${new Date().toISOString().replace(/[-:]/g,"").slice(0,15)}.csv`;
  document.body.appendChild(link); link.click(); link.parentNode.removeChild(link);
  URL.revokeObjectURL(link.href);
};
```

Reference: `src/pages/Users/Users.jsx`, `src/pages/Voip/OutboundCallHistories.jsx`.

---

## Excel import pattern

Reference: `src/pages/Students/StudentList.jsx`.

- Lazy-import xlsx: `const XLSX = await import("xlsx")`.
- Parse → `XLSX.utils.sheet_to_json(sheet, { defval: "" })` → preview table with virtual scrolling.
- Submit: rows → xlsx blob → `FormData` → `apiPost` with `multipart/form-data`.
- Progress via `onUploadProgress` on the axios call.

---

## TableContainer props reference

| Prop | Value |
|------|-------|
| `columns` | TanStack column defs (`id`, `header`, `accessorKey`, `cell`, `enableSorting`, `meta.sortKey`) |
| `data` | current page items |
| `isGlobalFilter` | `false` |
| `isPagination` | `false` (use `<Paginations>` separately) |
| `isLoading` | boolean |
| `manualSorting` | `true` |
| `sortingState` | sorting state array |
| `onSortingChange` | maps column id → API `sortBy`/`sortOrder` |
| `tableClass` | `"table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"` |

---

## Delete confirmation

```js
const confirmed = window.confirm("آیا از حذف مطمئن هستید؟");
if (!confirmed) return;
// after delete:
await fetchData(meta.page, filters, sort);
```

---

## i18n

- Config: `src/i18n.jsx`; default language `fa` from `localStorage.I18N_LANGUAGE`.
- Files: `src/locales/fa/translation.json` (Persian), `src/locales/en/translation.json`.
- Components: `useTranslation()` hook or `withTranslation` HOC.
- Add new sidebar labels to translation files (SidebarContent calls `props.t(label)`).

---

## Styling

- Global SCSS: `src/assets/scss/theme.scss`.
- Use Bootstrap utility classes first; add component SCSS under `src/assets/scss/` when needed.
- RTL is handled by the template — don't add `dir` or `text-align` manually unless truly isolated.

---

## Backend API

- Local dev: `http://localhost:8040/api-docs#/`
- Remote: `https://napi.isoogh.ir/api-docs#/`
- `VITE_API_BASE_URL` in `.env` (default: `http://127.0.0.1:8040`); can be overridden at runtime via `window.__ENV__.VITE_API_BASE_URL`.

---

## Common commands

```bash
npm run dev        # dev server
npm run build      # production build
npm run lint       # ESLint check
npm run lint:fix   # auto-fix lint errors
npm run format     # Prettier
```

---

## Conventions

- Double quotes, JSX, semicolons — match existing file style.
- ESLint enforces `"semi": ["error", "never"]` — no semicolons.
- No comments unless the *why* is non-obvious.
- No unnecessary abstractions; copy-paste across list pages is intentional.
- Keep page state local — no Redux for page-level data.
- Never edit `node_modules` or generated template assets.
- The `src/pages/` folder contains many unused template pages (Ecommerce, Blog, Job, etc.) — ignore them unless specifically asked about.
