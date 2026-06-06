import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  FormGroup,
  Label,
  Input,
  Button,
  Modal,
  ModalBody,
  Alert,
  Spinner,
} from "reactstrap";
import classnames from "classnames";
import { toast } from "react-toastify";
import Breadcrumb from "../../components/Common/Breadcrumb";
import { useAuth } from "../../context/AuthContext";
import { getSchools } from "../../services/schoolService.jsx";
import { getUsers } from "../../services/userService.jsx";
import {
  sendNotificationToUser,
  sendNotificationToSchoolAdvisers,
  sendNotificationToSuperAdviser,
  sendBroadcastNotification,
} from "../../services/notificationService.jsx";

// ─── constants ───────────────────────────────────────────────────────────────

const ICON_OPTIONS = [
  { label: "پیام", value: "mail" },
  { label: "ناقوس", value: "bell" },
  { label: "مدرسه", value: "school" },
  { label: "هشدار", value: "alert" },
  { label: "اطلاعیه", value: "bullhorn" },
  { label: "اطلاعات", value: "information" },
  { label: "تأیید", value: "check-circle" },
  { label: "خطا", value: "close-circle" },
  { label: "ستاره", value: "star" },
  { label: "تنظیمات", value: "cog" },
];

const COLOR_PRESETS = [
  { label: "آبی", value: "#2196F3" },
  { label: "سبز", value: "#4CAF50" },
  { label: "نارنجی", value: "#FF9800" },
  { label: "قرمز", value: "#F44336" },
  { label: "بنفش", value: "#9C27B0" },
  { label: "آبی‌تیره", value: "#556ee6" },
];

const ROLES = [
  { label: "همه کاربران", value: "" },
  { label: "مشاوران", value: "adviser" },
  { label: "مدیران", value: "manager" },
  { label: "دانش‌آموزان", value: "student" },
  { label: "ادمین‌ها", value: "admin" },
];

const SEND_TYPES = [
  { key: "user", label: "پیام تکی", icon: "bx bx-user", permission: "notifications.send" },
  { key: "school-advisers", label: "مشاوران مدرسه", icon: "bx bx-group", permission: "notifications.send" },
  { key: "super-adviser", label: "سرمشاور", icon: "bx bx-user-check", permission: "notifications.send" },
  { key: "broadcast", label: "همگانی", icon: "bx bx-broadcast", permission: "notifications.broadcast" },
];

const TYPE_LABELS = {
  "user": "DirectMessage",
  "school-advisers": "SchoolAlert",
  "super-adviser": "SchoolAlert",
  "broadcast": "SystemBroadcast",
};

// ─── preview card ─────────────────────────────────────────────────────────────

function PreviewCard({ title, body, icon, color }) {
  const bg = color || "#556ee6";
  const iconClass = icon ? `mdi mdi-${icon}` : "bx bx-bell";
  return (
    <div
      className="d-flex align-items-start p-3 rounded"
      style={{ border: "1px solid #e8e8e8", backgroundColor: "rgba(85,110,230,0.04)" }}
    >
      <div className="avatar-sm flex-shrink-0 me-3">
        <span
          className="avatar-title rounded-circle font-size-20"
          style={{ backgroundColor: bg, color: "#fff" }}
        >
          <i className={iconClass} />
        </span>
      </div>
      <div className="flex-grow-1 overflow-hidden">
        <h6 className="mb-1">{title || "عنوان پیام"}</h6>
        <p className="text-muted font-size-13 mb-1">{body || "متن پیام اینجا نمایش داده می‌شود"}</p>
        <p className="text-muted font-size-12 mb-0">
          <i className="mdi mdi-clock-outline me-1" />
          همین الان
        </p>
      </div>
    </div>
  );
}

// ─── user search ──────────────────────────────────────────────────────────────

function UserSearchField({ value, onChange }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  const search = useCallback(async (q) => {
    if (!q || q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await getUsers({ search: q, limit: 10 });
      setResults(res.items || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e) => {
    const q = e.target.value;
    setQuery(q);
    setShowDropdown(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 400);
  };

  const handleSelect = (user) => {
    onChange(user);
    setQuery(user.name || user.username || user.email || `کاربر ${user.id}`);
    setShowDropdown(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery("");
    setResults([]);
  };

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <div className="input-group">
        <Input
          type="text"
          placeholder="نام، ایمیل یا نام کاربری را تایپ کنید..."
          value={query}
          onChange={handleInput}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          autoComplete="off"
        />
        {value && (
          <Button color="outline-secondary" onClick={handleClear} title="پاک کردن">
            <i className="mdi mdi-close" />
          </Button>
        )}
        {loading && (
          <span className="input-group-text">
            <Spinner size="sm" />
          </span>
        )}
      </div>
      {value && (
        <div className="mt-1">
          <span className="badge bg-primary">
            <i className="bx bx-user me-1" />
            {query}
          </span>
        </div>
      )}
      {showDropdown && results.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            left: 0,
            zIndex: 1050,
            backgroundColor: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: 4,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          {results.map((u) => (
            <div
              key={u.id}
              onClick={() => handleSelect(u)}
              style={{ padding: "8px 12px", cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f8f8")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <div className="d-flex align-items-center gap-2">
                <div className="avatar-xs flex-shrink-0">
                  <span className="avatar-title rounded-circle bg-primary bg-opacity-10 text-primary font-size-12">
                    {(u.name || u.username || "؟")[0]}
                  </span>
                </div>
                <div>
                  <div className="font-size-13 fw-medium">{u.name || u.username}</div>
                  {u.email && <div className="font-size-12 text-muted">{u.email}</div>}
                </div>
                <span className="ms-auto text-muted font-size-12">#{u.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {showDropdown && !loading && results.length === 0 && query.length >= 2 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            left: 0,
            zIndex: 1050,
            backgroundColor: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: 4,
            padding: "10px 12px",
            color: "#999",
            fontSize: 13,
          }}
        >
          نتیجه‌ای یافت نشد
        </div>
      )}
    </div>
  );
}

// ─── school select ────────────────────────────────────────────────────────────

function SchoolSelect({ value, onChange }) {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getSchools({ limit: 200 })
      .then((res) => setSchools(res.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Input type="select" value={value || ""} onChange={(e) => onChange(e.target.value || null)} disabled={loading}>
      <option value="">{loading ? "در حال بارگذاری..." : "انتخاب مدرسه..."}</option>
      {schools.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </Input>
  );
}

// ─── confirm modal ────────────────────────────────────────────────────────────

function ConfirmModal({ isOpen, onConfirm, onCancel, sendType, schoolName, targetRole, loading }) {
  let description = "";
  if (sendType === "broadcast") {
    description = targetRole
      ? `پیام برای همه کاربران با نقش «${ROLES.find((r) => r.value === targetRole)?.label || targetRole}» ارسال خواهد شد.`
      : "پیام برای همه کاربران سیستم ارسال خواهد شد.";
  } else if (sendType === "school-advisers") {
    description = `پیام برای همه مشاوران مدرسه «${schoolName || "انتخابی"}» ارسال خواهد شد.`;
  } else if (sendType === "super-adviser") {
    description = `پیام برای سرمشاور مدرسه «${schoolName || "انتخابی"}» ارسال خواهد شد.`;
  }

  return (
    <Modal isOpen={isOpen} toggle={onCancel} centered size="md">
      <ModalBody className="px-4 py-5 text-center">
        <button
          type="button"
          className="btn-close position-absolute end-0 top-0 m-3"
          onClick={onCancel}
          disabled={loading}
        />
        <div className="avatar-sm mb-4 mx-auto">
          <div className="avatar-title bg-warning text-warning bg-opacity-10 font-size-20 rounded-3">
            <i className="bx bx-send" />
          </div>
        </div>
        <h5 className="mb-2">تأیید ارسال</h5>
        <p className="text-muted mb-4">{description}</p>
        <div className="hstack gap-2 justify-content-center">
          <Button color="primary" onClick={onConfirm} disabled={loading}>
            {loading ? <Spinner size="sm" className="me-1" /> : <i className="bx bx-send me-1" />}
            بله، ارسال کن
          </Button>
          <Button color="secondary" onClick={onCancel} disabled={loading}>
            انصراف
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: "",
  body: "",
  icon: "bell",
  color: "#556ee6",
  actionUrl: "",
  selectedUser: null,
  schoolId: null,
  targetRole: "",
};

const NotificationComposePage = () => {
  const { hasPermission } = useAuth();
  const canSend = hasPermission("notifications.send");
  const canBroadcast = hasPermission("notifications.broadcast");

  const availableTypes = SEND_TYPES.filter((t) => hasPermission(t.permission));

  const [activeType, setActiveType] = useState(availableTypes[0]?.key || "user");
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState(null); // { sentCount, message }
  const [schools, setSchools] = useState([]); // for confirm modal school name

  useEffect(() => {
    getSchools({ limit: 200 })
      .then((res) => setSchools(res.items || []))
      .catch(() => {});
  }, []);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const selectedSchoolName = schools.find((s) => String(s.id) === String(form.schoolId))?.name || "";

  // ─── validation ───────────────────────────────────────────────────────────

  const validate = () => {
    if (!form.title.trim()) { toast.error("عنوان پیام الزامی است"); return false; }
    if (!form.body.trim()) { toast.error("متن پیام الزامی است"); return false; }
    if (activeType === "user" && !form.selectedUser) { toast.error("لطفاً یک کاربر انتخاب کنید"); return false; }
    if ((activeType === "school-advisers" || activeType === "super-adviser") && !form.schoolId) {
      toast.error("لطفاً یک مدرسه انتخاب کنید");
      return false;
    }
    return true;
  };

  // ─── submit flow ──────────────────────────────────────────────────────────

  const handleSubmit = () => {
    if (!validate()) return;
    if (activeType === "broadcast" || activeType === "school-advisers" || activeType === "super-adviser") {
      setShowConfirm(true);
    } else {
      doSend();
    }
  };

  const doSend = async () => {
    setShowConfirm(false);
    setLoading(true);
    setResult(null);

    const data = {
      title: form.title.trim(),
      body: form.body.trim(),
      icon: form.icon || undefined,
      color: form.color || undefined,
      action_url: form.actionUrl.trim() || undefined,
    };

    const type = TYPE_LABELS[activeType] || "DirectMessage";

    try {
      let res;
      switch (activeType) {
        case "user":
          res = await sendNotificationToUser({ userId: form.selectedUser.id, type, data });
          break;
        case "school-advisers":
          res = await sendNotificationToSchoolAdvisers(form.schoolId, { type, data });
          break;
        case "super-adviser":
          res = await sendNotificationToSuperAdviser(form.schoolId, { type, data });
          break;
        case "broadcast":
          res = await sendBroadcastNotification({ type, targetRole: form.targetRole || undefined, data });
          break;
        default:
          break;
      }
      setResult(res);
      setForm(EMPTY_FORM);
    } catch {
      // httpClient shows toast
    } finally {
      setLoading(false);
    }
  };

  // ─── render ───────────────────────────────────────────────────────────────

  if (!canSend && !canBroadcast) {
    return (
      <div className="page-content">
        <Container fluid>
          <Alert color="danger">شما دسترسی به ارسال نوتیفیکیشن ندارید.</Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumb title="نوتیفیکیشن" breadcrumbItem="ارسال پیام" />

        <Row>
          {/* ── form column ── */}
          <Col xl={7} lg={8}>
            <Card>
              <CardBody>
                <h5 className="card-title mb-4">ارسال نوتیفیکیشن</h5>

                {/* send type tabs */}
                <Nav tabs className="nav-tabs-custom mb-4">
                  {availableTypes.map((t) => (
                    <NavItem key={t.key}>
                      <NavLink
                        className={classnames({ active: activeType === t.key })}
                        onClick={() => { setActiveType(t.key); setResult(null); }}
                        style={{ cursor: "pointer" }}
                      >
                        <i className={`${t.icon} me-1`} />
                        {t.label}
                      </NavLink>
                    </NavItem>
                  ))}
                </Nav>

                {/* result banner */}
                {result && (
                  <Alert color="success" className="d-flex align-items-center gap-2">
                    <i className="bx bx-check-circle font-size-18" />
                    <div>
                      <strong>{result.message || "ارسال شد"}</strong>
                      {result.sentCount !== undefined && (
                        <span className="ms-2 badge bg-success">
                          {result.sentCount} گیرنده
                        </span>
                      )}
                    </div>
                  </Alert>
                )}

                {/* type-specific fields */}
                {activeType === "user" && (
                  <FormGroup>
                    <Label>کاربر گیرنده <span className="text-danger">*</span></Label>
                    <UserSearchField
                      value={form.selectedUser}
                      onChange={(u) => set("selectedUser", u)}
                    />
                  </FormGroup>
                )}

                {(activeType === "school-advisers" || activeType === "super-adviser") && (
                  <FormGroup>
                    <Label>
                      مدرسه <span className="text-danger">*</span>
                      {activeType === "school-advisers"
                        ? " — پیام به همه مشاوران ارسال می‌شود"
                        : " — پیام به سرمشاور ارسال می‌شود"}
                    </Label>
                    <SchoolSelect
                      value={form.schoolId}
                      onChange={(v) => set("schoolId", v)}
                    />
                  </FormGroup>
                )}

                {activeType === "broadcast" && (
                  <FormGroup>
                    <Label>گروه هدف (اختیاری)</Label>
                    <Input
                      type="select"
                      value={form.targetRole}
                      onChange={(e) => set("targetRole", e.target.value)}
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </Input>
                    <small className="text-muted">اگر خالی بماند برای همه کاربران ارسال می‌شود</small>
                  </FormGroup>
                )}

                <hr className="my-3" />

                {/* common fields */}
                <FormGroup>
                  <Label>عنوان <span className="text-danger">*</span></Label>
                  <Input
                    type="text"
                    placeholder="عنوان نوتیفیکیشن"
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                    maxLength={100}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>متن پیام <span className="text-danger">*</span></Label>
                  <Input
                    type="textarea"
                    rows={3}
                    placeholder="متن کامل پیام..."
                    value={form.body}
                    onChange={(e) => set("body", e.target.value)}
                    maxLength={500}
                  />
                </FormGroup>

                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label>آیکون</Label>
                      <Input
                        type="select"
                        value={form.icon}
                        onChange={(e) => set("icon", e.target.value)}
                      >
                        {ICON_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label} ({o.value})
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label>رنگ</Label>
                      <div className="d-flex gap-2 align-items-center flex-wrap">
                        {COLOR_PRESETS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => set("color", c.value)}
                            title={c.label}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              backgroundColor: c.value,
                              border: form.color === c.value ? "3px solid #333" : "2px solid transparent",
                              cursor: "pointer",
                              flexShrink: 0,
                            }}
                          />
                        ))}
                        <input
                          type="color"
                          value={form.color}
                          onChange={(e) => set("color", e.target.value)}
                          title="رنگ دلخواه"
                          style={{ width: 28, height: 28, padding: 0, border: "none", borderRadius: "50%", cursor: "pointer" }}
                        />
                      </div>
                    </FormGroup>
                  </Col>
                </Row>

                <FormGroup>
                  <Label>لینک هدایت (اختیاری)</Label>
                  <Input
                    type="text"
                    placeholder="مثال: /dashboard"
                    value={form.actionUrl}
                    onChange={(e) => set("actionUrl", e.target.value)}
                  />
                  <small className="text-muted">پس از کلیک روی نوتیف، کاربر به این آدرس هدایت می‌شود</small>
                </FormGroup>

                <div className="mt-4">
                  <Button
                    color="primary"
                    onClick={handleSubmit}
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <><Spinner size="sm" className="me-2" />در حال ارسال...</>
                    ) : (
                      <><i className="bx bx-send me-2" />ارسال نوتیفیکیشن</>
                    )}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* ── preview column ── */}
          <Col xl={5} lg={4}>
            <Card>
              <CardBody>
                <h5 className="card-title mb-3">پیش‌نمایش</h5>
                <p className="text-muted font-size-13 mb-3">
                  نوتیفیکیشن برای گیرنده اینطور نمایش داده می‌شود:
                </p>
                <PreviewCard
                  title={form.title}
                  body={form.body}
                  icon={form.icon}
                  color={form.color}
                />

                {/* info box */}
                <div className="mt-4 p-3 rounded" style={{ backgroundColor: "#f8f9fa" }}>
                  <h6 className="font-size-13 mb-2">
                    <i className="bx bx-info-circle text-primary me-1" />
                    اطلاعات ارسال
                  </h6>
                  <ul className="list-unstyled font-size-13 text-muted mb-0">
                    <li className="mb-1">
                      <i className="mdi mdi-arrow-left me-1" />
                      <strong>نوع:</strong>{" "}
                      {SEND_TYPES.find((t) => t.key === activeType)?.label}
                    </li>
                    {activeType === "user" && form.selectedUser && (
                      <li className="mb-1">
                        <i className="mdi mdi-arrow-left me-1" />
                        <strong>گیرنده:</strong>{" "}
                        {form.selectedUser.name || form.selectedUser.username}
                      </li>
                    )}
                    {(activeType === "school-advisers" || activeType === "super-adviser") && selectedSchoolName && (
                      <li className="mb-1">
                        <i className="mdi mdi-arrow-left me-1" />
                        <strong>مدرسه:</strong> {selectedSchoolName}
                      </li>
                    )}
                    {activeType === "broadcast" && (
                      <li className="mb-1">
                        <i className="mdi mdi-arrow-left me-1" />
                        <strong>مخاطب:</strong>{" "}
                        {ROLES.find((r) => r.value === form.targetRole)?.label || "همه کاربران"}
                      </li>
                    )}
                  </ul>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <ConfirmModal
        isOpen={showConfirm}
        onConfirm={doSend}
        onCancel={() => setShowConfirm(false)}
        sendType={activeType}
        schoolName={selectedSchoolName}
        targetRole={form.targetRole}
        loading={loading}
      />
    </div>
  );
};

export default NotificationComposePage;
