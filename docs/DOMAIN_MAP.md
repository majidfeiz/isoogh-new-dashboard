# Domain Map

Compact locator for active product features. Routes not listed here are mostly inherited template/demo routes even if still registered in `src/routes/index.jsx`.

| Domain | Pages | Service | API route key | Main routes |
|---|---|---|---|---|
| Dashboard | `pages/Dashboard`, `pages/Admin/DashboardWidgets` | `dashboardService` | `dashboard` | `/dashboard`, `/admin/dashboard-widgets` |
| Auth/profile/sessions | `pages/Authentication`, `pages/Sessions` | `authService`, `profileService`, `sessionService` | `auth`, `profile` | `/login`, `/profile`, `/admin/users/:userId/sessions` |
| Authorization | `pages/Permissions`, `pages/Roles` | `permissionService`, `roleService` | `permissions`, `roles` | `/permissions*`, `/roles*` |
| Users/impersonation/role import | `pages/Users` | `userService`, `userSwitchService` | `users`, `userSwitch` | `/users*` |
| Managers | `pages/Managers` | `managerService` | `managers` | `/managers*` |
| Advisers | `pages/Advisers` | `adviserService` | `advisers` | `/advisers*` |
| Students | `pages/Students` | `studentService` | `students` | `/students*` |
| Schools | `pages/Schools` | `schoolService` | `schools` | `/schools*` |
| Grades | `pages/Grades` | `gradeService` | `grades` | `/grades*` |
| Parent tags | `pages/ParentTags` | `parentTagService` | `parentTags` | `/parent-tags*` |
| Support forms | `pages/SupportForms` | `supportFormService` | `supportForms` | `/support-forms*` |
| Answer sheets | `pages/AnswerSheets` | `answerSheetService` | `answerSheets` | `/answer-sheets` |
| Files | `pages/Files` | `fileService` | `files` | `/files*` |
| School chat | `pages/Chat` | `chatService` | `chat` | `/chat` |
| Notifications | `pages/Notifications` | `notificationService` | `notifications` | `/notifications*` |
| VoIP history/live/traces | `pages/Voip` | `voipService` | `voip` | `/voip/outbound-call-histories*`, `/voip/call-traces` |
| VoIP analytics | `pages/Voip/Analytics` | `voipAnalyticsService` | `voipAnalytics` | `/voip/analytics` |
| VoIP webhooks | `pages/VoipWebhooks` | `voipWebhookService` | `voipWebhooks` | `/voip-webhooks*` |
| External API clients | `pages/ExternalApi` | `externalApiService` | `externalApiClients` | `/external-api-clients*` |
| Reports | `pages/Reports` | `reportService`, `studentContactRecordService` | `reports` | `/reports`, `/reports/adviser-call-performance`, `/reports/adviser-performance`, `/reports/contact-forms-comprehensive`, `/reports/contact-forms-online`, `/reports/student-voip-comprehensive`, `/reports/student-contact-records*`, `/reports/inactive-advisers`, `/reports/support-form-answers` |
| Dynamic reports | `pages/DynamicReports` | `dynamicReportService` | `dynamicReports` | `/dynamic-reports*` |
| Adviser portal | `pages/AdviserPortal` | `adviserPortalService` | `adviserPortal` | `/adviser-calls*` |
| Super-adviser portal | `pages/SuperAdviserPortal` | `superAdviserPortalService` | `superAdviserPortal` | `/super-adviser-portal*` |

## Cross-cutting ownership

- Route registration is centralized in `src/routes/index.jsx`; routes do not currently carry permission metadata.
- Sidebar visibility is separately controlled in `SidebarContent.jsx`. Adding a route does not add navigation or authorization automatically.
- `<Can>` and `useAuth()` hide/guard actions in the UI. Backend authorization remains authoritative.
- Shared notifications are rendered in the topbar and use the notification service.
- Dashboard widgets have both user customization endpoints and admin role/status management endpoints.
- Support forms are the most connected aggregate: questions, advisers, adviser students, bulk assignment, status changes, interrupted calls, and portal answer flows.
- School, adviser, student, support-form, call-history, and report filters often share IDs but do not share global state; check payload naming in the specific service.

## High-value references by task

| Task | Canonical reference |
|---|---|
| Standard server-paginated CRUD list | `pages/Users/Users.jsx` or `pages/Schools/SchoolList.jsx` |
| Create/edit controlled form | `pages/Schools/SchoolForm.jsx` |
| Complex dynamic form/questions | `pages/SupportForms/SupportFormForm.jsx` |
| CSV streaming/export progress | `pages/Voip/OutboundCallHistories.jsx` |
| XLSX bulk import/preview | `pages/Students/StudentList.jsx` |
| Live socket updates | `pages/Voip/OutboundCallHistoriesLive.jsx` |
| Role/permission assignment | `pages/Roles/RolePermissions.jsx`, `pages/Users/UserPermissions.jsx` |
| Multi-step portal workflow | `pages/AdviserPortal/FormDetail.jsx`, `StudentProfile.jsx` |
| Analytics filters/charts | `pages/Reports/ReportsDashboard.jsx`, `pages/Voip/Analytics/VoipAnalytics.jsx` |
| Runtime dashboard composition | `pages/Dashboard/index.jsx`, `WidgetConfigModal.jsx`, `WidgetPicker.jsx` |
