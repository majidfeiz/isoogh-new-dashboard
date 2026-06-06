# AGENTS.md

Project guide for agents and developers working in this repo.

---

## Stack

- **Vite + React 18**, React Router v6, Redux (`createStore`) + redux-saga
- **Reactstrap** (Bootstrap 5) for all UI components
- **Persian (Farsi) RTL** interface — default i18n language `fa`
- **axios** via `src/helpers/httpClient.jsx` for standard requests; native **streaming `fetch`** for CSV exports
- Entry: `src/main.jsx` mounts `<App>` wrapped in Redux `Provider`, `AuthProvider`, and `BrowserRouter`
- Routes: `src/routes/index.jsx` → `authProtectedRoutes` + `publicRoutes`; guarded by `src/routes/route.jsx`
- Layout: `VerticalLayout` (default) or `HorizontalLayout` based on Redux `Layout.layoutType`

---

## Project structure (key paths)

```
src/
├── main.jsx                        # app entry
├── App.jsx                         # route rendering + layout selection
├── routes/
│   ├── index.jsx                   # all route definitions
│   └── route.jsx                   # auth guard (checks isoogh_access_token)
├── context/
│   └── AuthContext.jsx             # user, permissions, refreshMe
├── helpers/
│   ├── apiRoutes.jsx               # API_BASE_URL + API_ROUTES + getApiUrl
│   ├── httpClient.jsx              # axios instance, interceptors, apiGet/Post/Put/Patch/Delete
│   └── authStorage.jsx             # localStorage helpers (token, user, permissions)
├── services/                       # one file per domain (thin API wrappers)
├── components/
│   ├── VerticalLayout/
│   │   └── SidebarContent.jsx      # sidebar menu config + permission filtering
│   ├── Common/
│   │   ├── TableContainer.jsx      # shared table (TanStack Table v8)
│   │   ├── Paginations.jsx         # shared pagination bar
│   │   └── Breadcrumb.jsx          # page breadcrumb
│   └── Access/
│       └── Can.jsx                 # permission guard component
├── pages/                          # one folder per domain
├── locales/fa/translation.json     # Persian translations
└── assets/scss/theme.scss          # global styles entry
```

---

## Existing pages & routes

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
| Support Forms | `/support-forms`, `/support-forms/create`, `/support-forms/:id/edit`, `/support-forms/:id/advisers`, `/support-forms/:id/advisers/:adviserId/students` |
| Files | `/files`, `/files/create`, `/files/:id/edit` |
| VoIP | `/voip/outbound-call-histories`, `/voip/outbound-call-histories/online` |

---

## Auth and permissions

- Token stored in `localStorage.isoogh_access_token`; `route.jsx` redirects to `/login` if missing.
- `AuthContext` calls `GET /auth/me` on mount, window focus, and visibility change to keep permissions fresh.
- `/auth/me` returns `{ roles, permissions: object[], effectivePermissions: string[] }`.
- Permission strings are normalized to `string[]` by `AuthContext` (`toPermStrings`).
- In components use `useAuth()` → `hasPermission(perm)`, `hasAnyPermission(perms[])`, `hasAllPermissions(perms[])`.
- In JSX use `<Can permission="perm.name">…</Can>` to conditionally render UI.
- Permission naming convention follows the pattern `resource.action` (e.g. `users.index`, `students.create`).

---

## API and services

### Step 1 — add endpoint to `src/helpers/apiRoutes.jsx`

```js
myResource: {
  list:   "/my-resource",
  create: "/my-resource",
  detail: (id) => `/my-resource/${id}`,
  update: (id) => `/my-resource/${id}`,
  delete: (id) => `/my-resource/${id}`,
  // additional endpoints as needed
},
```

### Step 2 — create `src/services/myResourceService.jsx`

Follow the exact shape used in existing services:

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

export async function getMyResource(id) {
  const res = await apiGet(getApiUrl(API_ROUTES.myResource.detail(id)));
  return res?.data?.data || res?.data;
}

export async function createMyResource(payload) {
  const res = await apiPost(getApiUrl(API_ROUTES.myResource.create), payload);
  return res.data;
}

export async function updateMyResource(id, payload) {
  const res = await apiPatch(getApiUrl(API_ROUTES.myResource.update(id)), payload);
  return res.data;
}

export async function deleteMyResource(id) {
  const res = await apiDelete(getApiUrl(API_ROUTES.myResource.delete(id)));
  return res.data;
}
```

- Use `apiPatch` for partial updates (not `apiPut`) — consistent with all existing services.
- Always use `getApiUrl(API_ROUTES.x.y)` — never hardcode URLs.
- Error handling: `httpClient` auto-shows a `toast.error` for every failed request; don't re-show in components.

---

## Adding a new page (checklist)

1. **API routes** → add to `API_ROUTES` in `src/helpers/apiRoutes.jsx`
2. **Service** → create `src/services/myResourceService.jsx`
3. **Pages** → create `src/pages/MyResource/MyResourceList.jsx` and `MyResourceForm.jsx`
4. **Routes** → import and register in `src/routes/index.jsx` under `authProtectedRoutes`
5. **Sidebar** → add entry to `menuItems` array in `src/components/VerticalLayout/SidebarContent.jsx`

### List page pattern

```jsx
const MyResourceList = () => {
  document.title = "عنوان صفحه | داشبورد آیسوق";

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, lastPage: 1 });
  const [filters, setFilters] = useState({ search: "" });
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [sort, setSort] = useState({ by: "id", order: "DESC" });
  const navigate = useNavigate();

  const fetchData = useCallback(async (page = 1, currentFilters = {}, currentSort = sort) => {
    setLoading(true);
    try {
      const res = await getMyResources({ page, limit: meta.limit, ...currentFilters, sortBy: currentSort?.by, sortOrder: currentSort?.order });
      setData(res.items || []);
      setMeta(res.pagination || { page, limit: meta.limit, total: 0, lastPage: 1 });
    } catch (e) {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [meta.limit, sort]);

  useEffect(() => { fetchData(1, filters, sort); }, [fetchData, sort]);

  // columns, handleDelete, handleEdit, handleSortingChange…

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="بخش" breadcrumbItem="عنوان" />
        <Row><Col lg={12}>
          <Card>
            <CardHeader>…</CardHeader>
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
- Use controlled form state; submit calls `createMyResource` or `updateMyResource`.
- On success `navigate(-1)` or to the list route.
- Show validation errors inline (from response `data.message` array — `httpClient` auto-toasts them).

---

## Sidebar menu entry

Add to `menuItems` array in `SidebarContent.jsx`:

```js
{
  type: "group",
  label: "عنوان منو",
  icon: "bx bx-icon-name",           // boxicons class
  permissionAny: ["resource.index", "resource.create"],
  children: [
    { label: "لیست", to: "/my-resource", permission: "resource.index" },
    { label: "ایجاد جدید", to: "/my-resource/create", permission: "resource.create" },
  ],
},
```

- Single-page items use `type: "item"` with `permission: null` or a single permission string.
- `permissionAny` on a group hides the entire group if none of the listed permissions are present.
- Boxicons classes: https://boxicons.com — prefix `bx bx-*` or `bx bxs-*`.

---

## CSV export pattern

Use streaming `fetch` (not axios) — axios buffers the full response and causes empty/broken CSVs.

```js
const handleExport = async () => {
  const params = new URLSearchParams({ page: "1", limit: String(meta.total || meta.limit) });
  // add filters…

  const url = `${getApiUrl(API_ROUTES.myResource.export)}?${params}`;
  const token = getAccessToken();
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });

  if (!res.ok || !res.body) throw new Error(await res.text());

  const approxTotal = Number(res.headers.get("X-Approx-Content-Length") || res.headers.get("Content-Length")) || 0;
  // set progress to 1 if approxTotal > 0

  const reader = res.body.getReader();
  const chunks = [];
  let loaded = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.byteLength;
    // update progress: Math.min(99, Math.round((loaded / approxTotal) * 100))
  }

  const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
  const blob = new Blob([bom, ...chunks], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `resource-${new Date().toISOString().replace(/[-:]/g,"").slice(0,15)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  URL.revokeObjectURL(link.href);
  // set progress to 100, then clear after timeout
};
```

Canonical references: `src/pages/Users/Users.jsx` and `src/pages/Voip/OutboundCallHistories.jsx`.

---

## Excel import pattern

Used in `src/pages/Students/StudentList.jsx` — mirror this for any bulk import.

- Lazy-import `xlsx`: `const XLSX = await import("xlsx")`.
- Parse file → `XLSX.utils.sheet_to_json(sheet, { defval: "" })` → store rows in state.
- Render preview table with virtual scrolling (keep `visibleStart/visibleEnd` based on scroll position and `ROW_HEIGHT`).
- Support pagination over large imports (`importPreviewPage`, `importPreviewPageSize`).
- On submit: convert rows back to xlsx blob → `FormData` → `apiPost` with `multipart/form-data`.
- Progress via `onUploadProgress` option on the axios call.

---

## TableContainer usage

Props used across all list pages:

| Prop | Value |
|------|-------|
| `columns` | TanStack column definitions (with `id`, `header`, `accessorKey`, `cell`, `enableSorting`, `enableColumnFilter`, `meta.sortKey`) |
| `data` | current page items array |
| `isGlobalFilter` | `false` (we handle search manually) |
| `isPagination` | `false` (use `<Paginations>` separately) |
| `isLoading` | boolean loading state |
| `manualSorting` | `true` |
| `sortingState` | `sorting` state array |
| `onSortingChange` | handler that maps column id → API `sortBy`/`sortOrder` |
| `tableClass` | `"table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"` |

---

## Confirmation and delete

Always confirm before delete:

```js
const confirmed = window.confirm("آیا از حذف مطمئن هستید؟");
if (!confirmed) return;
```

After delete, re-fetch the current page: `await fetchData(meta.page, filters, sort)`.

---

## i18n

- Config in `src/i18n.jsx`; default language: `fa` from `localStorage.I18N_LANGUAGE`.
- Translation files: `src/locales/fa/translation.json` (Persian), `src/locales/en/translation.json`.
- In components: `import { withTranslation } from "react-i18next"` → `props.t("key")` or `useTranslation()` hook.
- SidebarContent uses `props.t(label)` — add new labels to the translation file if they need to appear there.

---

## Styling

- Global SCSS entry: `src/assets/scss/theme.scss`.
- Use existing Bootstrap utility classes first; add component-specific SCSS under `src/assets/scss/` when needed.
- RTL layout is handled by the template — don't add `dir` or `text-align` manually unless isolated.

---

## Backend API docs (Swagger)

- Local dev: `http://localhost:8040/api-docs#/`
- Remote: `https://napi.isoogh.ir/api-docs#/`

Check these before adding new endpoints; the backend may have changed.

---

## Conventions

- Double quotes, JSX, semicolons — match existing file style.
- No comments unless the *why* is non-obvious (hidden constraint, workaround, subtle invariant).
- No unnecessary abstractions; copy-paste patterns across list pages is intentional and preferred.
- Keep page state local — no Redux for page-level data.
- Never edit `node_modules` or generated template assets.

---

## Common commands

```bash
npm run dev       # dev server (or yarn dev)
npm run build     # production build
npm run lint      # ESLint check
npm run lint:fix  # auto-fix lint errors
npm run format    # Prettier
```
