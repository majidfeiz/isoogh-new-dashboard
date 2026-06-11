import React, { useState } from "react";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Col,
  Nav,
  NavItem,
  NavLink,
  Row,
  Table,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";
import { API_BASE_URL } from "../../helpers/apiRoutes.jsx";
import Breadcrumbs from "../../components/Common/Breadcrumb";

const swaggerExternalUrl = `${API_BASE_URL}/external-api-docs`;
const swaggerInternalUrl = `${API_BASE_URL}/api-docs`;

const MethodBadge = ({ method }) => {
  const colors = { GET: "primary", POST: "success", PATCH: "warning", DELETE: "danger" };
  return (
    <Badge color={colors[method] || "secondary"} className="me-1" style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
      {method}
    </Badge>
  );
};

const CodeBlock = ({ children }) => (
  <pre
    className="bg-light border rounded p-3 mt-2"
    style={{ fontSize: "0.78rem", maxHeight: 320, overflow: "auto", direction: "ltr", textAlign: "left" }}
  >
    {children}
  </pre>
);

const Section = ({ title, children }) => (
  <div className="mb-5">
    <h5 className="border-bottom pb-2 mb-3 text-primary">{title}</h5>
    {children}
  </div>
);

const EndpointRow = ({ method, path, permission, description }) => (
  <tr>
    <td><MethodBadge method={method} /></td>
    <td><code style={{ fontSize: "0.8rem" }}>{path}</code></td>
    <td><code className="text-muted" style={{ fontSize: "0.75rem" }}>{permission}</code></td>
    <td>{description}</td>
  </tr>
);

const ExternalApiDocs = () => {
  document.title = "مستندات API خارجی | داشبورد آیسوق";
  const [activeTab, setActiveTab] = useState("management");

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="API خارجی" breadcrumbItem="مستندات" />

        <Row className="mb-3">
          <Col>
            <div className="d-flex flex-wrap gap-3 align-items-center">
              <div className="alert alert-info mb-0 py-2 px-3 flex-grow-1">
                <i className="bx bx-info-circle me-1" />
                <strong>Base URL:</strong>{" "}
                <code>{API_BASE_URL}</code>
                {" | "}
                <strong>Auth مدیریتی:</strong>{" "}
                <code>Authorization: Bearer {"<JWT_TOKEN>"}</code>
              </div>
              <a
                href={swaggerExternalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary btn-sm text-nowrap"
              >
                <i className="bx bx-link-external me-1" />
                Swagger خارجی
              </a>
              <a
                href={swaggerInternalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-secondary btn-sm text-nowrap"
              >
                <i className="bx bx-link-external me-1" />
                Swagger داخلی
              </a>
            </div>
          </Col>
        </Row>

        <Card>
          <CardHeader>
            <Nav tabs className="card-header-tabs">
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "management" })}
                  onClick={() => setActiveTab("management")}
                  style={{ cursor: "pointer" }}
                >
                  مدیریت کلاینت‌های API
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "webhooks" })}
                  onClick={() => setActiveTab("webhooks")}
                  style={{ cursor: "pointer" }}
                >
                  وب‌هوک‌های VoIP
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "external" })}
                  onClick={() => setActiveTab("external")}
                  style={{ cursor: "pointer" }}
                >
                  API خارجی (ارگان‌ها)
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "errors" })}
                  onClick={() => setActiveTab("errors")}
                  style={{ cursor: "pointer" }}
                >
                  خطاها و نکات
                </NavLink>
              </NavItem>
            </Nav>
          </CardHeader>

          <CardBody>
            <TabContent activeTab={activeTab}>

              {/* ===== تب مدیریت کلاینت‌ها ===== */}
              <TabPane tabId="management">
                <Section title="توضیح کلی">
                  <p>
                    ادمین می‌تواند برای هر ارگان یا مدرسه یک <strong>کلاینت API</strong> تعریف کند. هر کلاینت شامل:
                  </p>
                  <ul>
                    <li>یک <code>api_key</code> یکتا ۶۴ کاراکتری (خودکار تولید می‌شود)</li>
                    <li>لیست <strong>IP های مجاز</strong> (فقط از این IPها اجازه دسترسی)</li>
                    <li><code>school_id</code> — اگر تنظیم شود، کلاینت فقط داده‌های همان مدرسه را می‌بیند؛ اگر <code>null</code> باشد همه داده‌ها</li>
                  </ul>
                </Section>

                <Section title="Endpoint های مدیریتی">
                  <div className="table-responsive">
                    <Table bordered size="sm">
                      <thead className="table-light">
                        <tr>
                          <th>Method</th>
                          <th>Endpoint</th>
                          <th>Permission</th>
                          <th>توضیح</th>
                        </tr>
                      </thead>
                      <tbody>
                        <EndpointRow method="GET"    path="/external-api-clients"                    permission="external-api.index"  description="لیست همه کلاینت‌ها + IPها" />
                        <EndpointRow method="POST"   path="/external-api-clients"                    permission="external-api.create" description="ایجاد کلاینت جدید" />
                        <EndpointRow method="GET"    path="/external-api-clients/:id"                permission="external-api.show"   description="نمایش یک کلاینت" />
                        <EndpointRow method="PATCH"  path="/external-api-clients/:id"                permission="external-api.update" description="ویرایش نام/توضیح/وضعیت/school_id" />
                        <EndpointRow method="DELETE" path="/external-api-clients/:id"                permission="external-api.delete" description="حذف کلاینت" />
                        <EndpointRow method="POST"   path="/external-api-clients/:id/regenerate-key" permission="external-api.update" description="تولید مجدد API Key" />
                        <EndpointRow method="POST"   path="/external-api-clients/:id/ips"            permission="external-api.update" description="افزودن IP مجاز" />
                        <EndpointRow method="DELETE" path="/external-api-clients/:id/ips/:ipId"      permission="external-api.update" description="حذف IP" />
                        <EndpointRow method="GET"    path="/external-api-clients/logs"               permission="external-api.logs"   description="لاگ درخواست‌ها" />
                      </tbody>
                    </Table>
                  </div>
                </Section>

                <Section title="Body ایجاد کلاینت (POST)">
                  <CodeBlock>{`{
  "name": "مدرسه شهید بهشتی",
  "description": "توضیحات اختیاری",
  "is_active": true,
  "school_id": 3
}`}</CodeBlock>
                  <div className="alert alert-warning mt-2">
                    <i className="bx bx-error-circle me-1" />
                    <code>api_key</code> خودکار تولید می‌شود. آن را فقط یک بار به کاربر نشان بده — بعداً قابل بازیابی نیست.
                  </div>
                </Section>

                <Section title="پاسخ لیست کلاینت‌ها">
                  <CodeBlock>{`{
  "data": [
    {
      "id": 1,
      "name": "مدرسه شهید بهشتی",
      "api_key": "a3f8c2e1d4b7...(64 chars)",
      "is_active": true,
      "description": "دسترسی سامانه مرکزی",
      "school_id": 3,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "ips": [
        { "id": 1, "ip": "185.105.100.50", "created_at": "..." }
      ]
    }
  ]
}`}</CodeBlock>
                </Section>

                <Section title="پاسخ regenerate-key (POST)">
                  <CodeBlock>{`{ "api_key": "newkey....(64 chars)" }`}</CodeBlock>
                  <div className="alert alert-danger mt-2">
                    <i className="bx bx-error-circle me-1" />
                    کلید قدیمی فوری باطل می‌شود. کلید جدید را به ارگان ابلاغ کنید.
                  </div>
                </Section>

                <Section title="پاسخ لاگ درخواست‌ها (GET /external-api-clients/logs)">
                  <p className="text-muted small">Query params: <code>page=1&per_page=30&client_id=1</code></p>
                  <CodeBlock>{`{
  "data": [
    {
      "id": 1,
      "client_id": 1,
      "ip": "185.105.100.50",
      "method": "GET",
      "path": "/external-api/v1/students",
      "query_params": { "page": "1" },
      "response_status": 200,
      "response_time_ms": 45,
      "created_at": "2024-06-01T10:30:00.000Z"
    }
  ],
  "meta": { "page": 1, "per_page": 30, "total": 150 }
}`}</CodeBlock>
                </Section>
              </TabPane>

              {/* ===== تب وب‌هوک‌ها ===== */}
              <TabPane tabId="webhooks">
                <Section title="توضیح کلی">
                  <p>
                    ادمین می‌تواند تنظیم کند که هر بار تماسی با <code>src</code> مشخص در <code>voip_call_histories</code> ثبت شود،
                    اطلاعات آن تماس به یک URL ارسال شود.
                  </p>
                  <ul>
                    <li><code>src</code> همان شماره خطی است که در جدول تماس‌ها ذخیره می‌شود</li>
                    <li><code>secret</code> اختیاری است — اگر تنظیم شود، هدر <code>X-Webhook-Signature: sha256={"<hash>"}</code> به درخواست اضافه می‌شود</li>
                  </ul>
                </Section>

                <Section title="Endpoint های مدیریتی">
                  <div className="table-responsive">
                    <Table bordered size="sm">
                      <thead className="table-light">
                        <tr>
                          <th>Method</th>
                          <th>Endpoint</th>
                          <th>Permission</th>
                          <th>توضیح</th>
                        </tr>
                      </thead>
                      <tbody>
                        <EndpointRow method="GET"    path="/voip-webhooks"                      permission="voip-webhooks.index"  description="لیست وب‌هوک‌ها" />
                        <EndpointRow method="POST"   path="/voip-webhooks"                      permission="voip-webhooks.create" description="ایجاد وب‌هوک" />
                        <EndpointRow method="GET"    path="/voip-webhooks/:id"                  permission="voip-webhooks.show"   description="نمایش وب‌هوک" />
                        <EndpointRow method="PATCH"  path="/voip-webhooks/:id"                  permission="voip-webhooks.update" description="ویرایش وب‌هوک" />
                        <EndpointRow method="DELETE" path="/voip-webhooks/:id"                  permission="voip-webhooks.delete" description="حذف وب‌هوک" />
                        <EndpointRow method="POST"   path="/voip-webhooks/:id/test"             permission="voip-webhooks.update" description="تست با آخرین تماس مرتبط" />
                        <EndpointRow method="POST"   path="/voip-webhooks/dispatch/:callId"     permission="voip-webhooks.update" description="ارسال دستی برای یک تماس" />
                        <EndpointRow method="GET"    path="/voip-webhooks/logs"                 permission="voip-webhooks.logs"   description="لاگ ارسال‌ها" />
                      </tbody>
                    </Table>
                  </div>
                </Section>

                <Section title="Body ایجاد وب‌هوک (POST)">
                  <CodeBlock>{`{
  "name": "وب‌هوک سازمان مرکزی",
  "src": "09121234567",
  "webhook_url": "https://org.example.com/webhook/calls",
  "secret": "my-hmac-secret",
  "is_active": true
}`}</CodeBlock>
                </Section>

                <Section title="پاسخ تست وب‌هوک (POST /voip-webhooks/:id/test)">
                  <CodeBlock>{`{ "message": "Dispatch triggered", "call_history_id": 42 }`}</CodeBlock>
                </Section>

                <Section title="پاسخ لاگ ارسال‌ها (GET /voip-webhooks/logs)">
                  <p className="text-muted small">Query params: <code>webhook_id=1&page=1&per_page=30</code></p>
                  <CodeBlock>{`{
  "data": [
    {
      "id": 1,
      "webhook_id": 1,
      "voip_call_history_id": 42,
      "payload": {
        "event": "call_history_created",
        "src": "09121234567",
        "disposition": "ANSWERED",
        "..."
      },
      "response_status": 200,
      "response_body": "ok",
      "success": true,
      "sent_at": "2024-06-01T10:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "per_page": 30, "total": 5 }
}`}</CodeBlock>
                </Section>

                <Section title="ساختار Payload ارسال‌شده به URL وب‌هوک">
                  <CodeBlock>{`{
  "event": "call_history_created",
  "call_history_id": 42,
  "src": "09121234567",
  "type": "outbound",
  "disposition": "ANSWERED",
  "duration": "120",
  "wait": "5",
  "playtime_seconds": 115,
  "playtime_string": "1:55",
  "starttime_unix": 1700000000,
  "endtime_unix": 1700000120,
  "originated_call_id": "call-group-abc",
  "timestamp": "2024-06-01T10:00:00.000Z"
}`}</CodeBlock>
                  <p className="text-muted small mt-2">
                    امضای HMAC: اگر <code>secret</code> تنظیم شده باشد، هدر <code>X-Webhook-Signature: sha256={"<hash>"}</code> ارسال می‌شود.
                  </p>
                </Section>
              </TabPane>

              {/* ===== تب API خارجی ===== */}
              <TabPane tabId="external">
                <div className="alert alert-primary mb-4">
                  <strong>احراز هویت:</strong> هدر <code>X-API-Key: {"<کلید دریافتی>"}</code>
                  {" | "}
                  <strong>محدودیت IP:</strong> فقط از IPهای ثبت‌شده قبول می‌شود
                  {" | "}
                  <strong>Base URL:</strong> <code>{API_BASE_URL}/external-api/v1/</code>
                </div>

                <div className="alert alert-info mb-4">
                  <i className="bx bx-info-circle me-1" />
                  <strong>Scope مدرسه:</strong> اگر <code>school_id</code> روی کلاینت تنظیم شده باشد، تمام پاسخ‌ها فقط داده‌های آن مدرسه را برمی‌گردانند.
                </div>

                <Section title="Endpoint های خارجی">
                  <div className="table-responsive">
                    <Table bordered size="sm">
                      <thead className="table-light">
                        <tr>
                          <th>Method</th>
                          <th>Endpoint</th>
                          <th>Query Params</th>
                          <th>توضیح</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><MethodBadge method="GET" /></td>
                          <td><code>/external-api/v1/students</code></td>
                          <td><code>page, per_page, search</code></td>
                          <td>لیست دانش‌آموزان</td>
                        </tr>
                        <tr>
                          <td><MethodBadge method="GET" /></td>
                          <td><code>/external-api/v1/advisers</code></td>
                          <td><code>page, per_page, search</code></td>
                          <td>لیست مشاوران</td>
                        </tr>
                        <tr>
                          <td><MethodBadge method="GET" /></td>
                          <td><code>/external-api/v1/calls</code></td>
                          <td><code>page, per_page, adviser_id, disposition, start_date, end_date</code></td>
                          <td>لیست تماس‌ها</td>
                        </tr>
                        <tr>
                          <td><MethodBadge method="GET" /></td>
                          <td><code>/external-api/v1/advisers/:adviserId/students</code></td>
                          <td><code>page, per_page</code></td>
                          <td>دانش‌آموزان یک مشاور</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </Section>

                <Section title="GET /external-api/v1/students — پاسخ">
                  <CodeBlock>{`{
  "data": [
    {
      "id": 10,
      "code": "STU001",
      "user_id": 50,
      "name": "علی محمدی",
      "phone": "09121111111",
      "ssn": "1234567890",
      "city": "تهران",
      "province": "تهران",
      "shift": "صبح",
      "schools": [{ "id": 3, "name": "مدرسه شهید بهشتی" }],
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "per_page": 15, "total": 250, "last_page": 17 }
}`}</CodeBlock>
                </Section>

                <Section title="GET /external-api/v1/advisers — پاسخ">
                  <CodeBlock>{`{
  "data": [
    {
      "id": 5,
      "code": "ADV001",
      "user_id": 20,
      "name": "مریم احمدی",
      "phone": "09129999999",
      "is_super": false,
      "parent_id": null,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "per_page": 15, "total": 30, "last_page": 2 }
}`}</CodeBlock>
                </Section>

                <Section title="GET /external-api/v1/calls — پاسخ">
                  <p className="text-muted small">
                    مقادیر مجاز برای <code>disposition</code>: <code>ANSWERED</code> | <code>NO ANSWER</code> | <code>BUSY</code>
                    {" | "}max <code>per_page</code>: 100
                  </p>
                  <CodeBlock>{`{
  "data": [
    {
      "id": 100,
      "src": "09121234567",
      "type": "outbound",
      "disposition": "ANSWERED",
      "duration": "90",
      "wait": "3",
      "playtime_seconds": 87,
      "playtime_string": "1:27",
      "starttime_unix": 1700000000,
      "endtime_unix": 1700000090,
      "to_phone": "09131111111",
      "adviser_id": 5,
      "adviser_name": "مریم احمدی",
      "student_id": 10,
      "student_name": "علی محمدی"
    }
  ],
  "meta": { "page": 1, "per_page": 15, "total": 500, "last_page": 34 }
}`}</CodeBlock>
                </Section>

                <Section title="GET /external-api/v1/advisers/:adviserId/students — پاسخ">
                  <p className="text-muted small">
                    اگر مشاور به مدرسه کلاینت تعلق نداشته باشد، لیست خالی برمی‌گردد.
                  </p>
                  <CodeBlock>{`{
  "data": [
    {
      "adviser_student_id": 7,
      "student_id": 10,
      "student_code": "STU001",
      "student_name": "علی محمدی",
      "student_phone": "09121111111",
      "student_ssn": "1234567890",
      "student_city": "تهران",
      "student_province": "تهران",
      "linked_at": "2024-01-15T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "per_page": 15, "total": 12, "last_page": 1 }
}`}</CodeBlock>
                </Section>
              </TabPane>

              {/* ===== تب خطاها ===== */}
              <TabPane tabId="errors">
                <Section title="خطاهای رایج API خارجی">
                  <div className="table-responsive">
                    <Table bordered size="sm">
                      <thead className="table-light">
                        <tr>
                          <th>Status</th>
                          <th>پیام</th>
                          <th>علت</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><Badge color="danger">401</Badge></td>
                          <td><code>X-API-Key header is required</code></td>
                          <td>هدر ارسال نشده</td>
                        </tr>
                        <tr>
                          <td><Badge color="danger">401</Badge></td>
                          <td><code>Invalid or inactive API key</code></td>
                          <td>کلید اشتباه یا غیرفعال است</td>
                        </tr>
                        <tr>
                          <td><Badge color="danger">401</Badge></td>
                          <td><code>IP x.x.x.x is not authorized</code></td>
                          <td>IP سرور در لیست مجاز نیست</td>
                        </tr>
                        <tr>
                          <td><Badge color="success">200</Badge></td>
                          <td><code>data: []</code></td>
                          <td>داده‌ای در محدوده این مدرسه وجود ندارد</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </Section>

                <Section title="نکات UI">
                  <ul className="list-unstyled">
                    {[
                      { icon: "bx-key", text: "API Key: بعد از ایجاد یا regenerate فقط یک بار نمایش بده (modal با copy button)" },
                      { icon: "bx-buildings", text: "school_id: یک dropdown از لیست مدارس — اگر خالی باشد، کلاینت همه داده‌ها را می‌بیند" },
                      { icon: "bx-chip", text: "IPها: به صورت chip/tag نمایش بده با دکمه حذف کنار هر کدام" },
                      { icon: "bx-list-ul", text: "لاگ‌ها: در یک table با ستون‌های: تاریخ، IP، متد، path، status، زمان پاسخ" },
                      { icon: "bx-test-tube", text: "وب‌هوک تست: دکمه «تست» در کنار هر ردیف — نتیجه را در toast نشان بده" },
                      { icon: "bx-circle", text: "badge موفقیت/شکست روی لاگ‌های وب‌هوک: success: true → سبز، false → قرمز" },
                      { icon: "bx-refresh", text: "لاگ‌ها Real-time نیستند — باید refresh کرد" },
                    ].map((item, i) => (
                      <li key={i} className="d-flex gap-2 mb-2">
                        <i className={`bx ${item.icon} text-primary mt-1`} />
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </Section>

                <Section title="لینک‌های مرتبط">
                  <div className="d-flex flex-wrap gap-3">
                    <a href={swaggerExternalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary">
                      <i className="bx bx-link-external me-1" />
                      Swagger API خارجی (برای ارگان‌ها)
                    </a>
                    <a href={swaggerInternalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary">
                      <i className="bx bx-link-external me-1" />
                      Swagger داخلی (مدیریتی)
                    </a>
                  </div>
                </Section>
              </TabPane>

            </TabContent>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ExternalApiDocs;
