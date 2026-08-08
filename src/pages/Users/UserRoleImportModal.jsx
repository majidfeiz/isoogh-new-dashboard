import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Col,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Progress,
  Row,
  Spinner,
  Table,
} from "reactstrap";
import { toast } from "react-toastify";
import { getRoles } from "../../services/roleService.jsx";
import {
  downloadUserRoleImportTemplate,
  importUserRoles,
} from "../../services/userService.jsx";
import {
  buildUserRoleIssuesCsv,
  formatFileSize,
  getUserRoleImportErrorMessage,
  getUserRoleIssueIdentifier,
  USER_ROLE_IMPORT_ACCEPT,
  USER_ROLE_ISSUE_HELP,
  USER_ROLE_ISSUE_LABELS,
  validateUserRoleImportFile,
} from "./userRoleImportUtils.js";

const ISSUE_PAGE_SIZE = 10;

const UserRoleImportModal = ({ isOpen, toggle, onImported }) => {
  const fileInputRef = useRef(null);
  const titleRef = useRef(null);
  const resultRef = useRef(null);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");
  const [roleId, setRoleId] = useState("");
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [formError, setFormError] = useState("");
  const [forbidden, setForbidden] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [issueSearch, setIssueSearch] = useState("");
  const [issuePage, setIssuePage] = useState(1);

  const loadRoles = async () => {
    setRolesLoading(true);
    setRolesError(false);
    try {
      const response = await getRoles({ page: 1, limit: 100, search: "" });
      setRoles((response.items || []).filter((role) => role?.isActive === true));
    } catch (error) {
      setRoles([]);
      setRolesError(true);
      if (error?.response?.status === 403) setForbidden(true);
    } finally {
      setRolesLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setRoleSearch("");
    setRoleId("");
    setFile(null);
    setFileError("");
    setFormError("");
    setForbidden(false);
    setSubmitting(false);
    setUploadProgress(0);
    setResult(null);
    setIssueSearch("");
    setIssuePage(1);
    loadRoles();
    window.setTimeout(() => titleRef.current?.focus(), 100);
  }, [isOpen]);

  useEffect(() => {
    if (result) {
      window.setTimeout(() => resultRef.current?.focus(), 50);
    }
  }, [result]);

  const filteredRoles = useMemo(() => {
    const term = roleSearch.trim().toLowerCase();
    if (!term) return roles;
    return roles.filter((role) =>
      `${role?.label || ""} ${role?.name || ""}`.toLowerCase().includes(term)
    );
  }, [roles, roleSearch]);

  const filteredIssues = useMemo(() => {
    const issues = Array.isArray(result?.issues) ? result.issues : [];
    const term = issueSearch.trim().toLowerCase();
    if (!term) return issues;
    return issues.filter((issue) =>
      `${issue?.rowNumber || ""} ${getUserRoleIssueIdentifier(issue)} ${
        issue?.code || ""
      } ${issue?.message || ""}`
        .toLowerCase()
        .includes(term)
    );
  }, [result, issueSearch]);

  const issueLastPage = Math.max(
    1,
    Math.ceil(filteredIssues.length / ISSUE_PAGE_SIZE)
  );
  const visibleIssues = filteredIssues.slice(
    (issuePage - 1) * ISSUE_PAGE_SIZE,
    issuePage * ISSUE_PAGE_SIZE
  );

  const selectFile = (selectedFile) => {
    const validationMessage = validateUserRoleImportFile(selectedFile);
    setFile(selectedFile || null);
    setFileError(validationMessage);
    setFormError("");
    setResult(null);
  };

  const handleFileChange = (event) => {
    selectFile(event.target.files?.[0] || null);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (submitting) return;
    selectFile(event.dataTransfer?.files?.[0] || null);
  };

  const removeFile = () => {
    setFile(null);
    setFileError("");
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTemplateDownload = async () => {
    setTemplateLoading(true);
    setForbidden(false);
    try {
      const blob = await downloadUserRoleImportTemplate();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "user-role-import-template.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      if (error?.response?.status === 403) setForbidden(true);
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const nextFileError = validateUserRoleImportFile(file);
    setFileError(nextFileError);
    if (!roleId || nextFileError) {
      setFormError(
        !roleId ? "انتخاب نقش الزامی است." : "لطفاً خطای فایل را برطرف کنید."
      );
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);
    setFormError("");
    setForbidden(false);
    try {
      const response = await importUserRoles({
        file,
        roleId: Number(roleId),
        onUploadProgress: (event) => {
          if (!event.total) return;
          setUploadProgress(
            Math.min(99, Math.round((event.loaded / event.total) * 100))
          );
        },
      });
      setUploadProgress(100);
      setResult({ ...response, issues: response?.issues || [] });
      if (Number(response?.assignedUsers || 0) > 0) {
        toast.success(
          `نقش برای ${response.assignedUsers} کاربر با موفقیت اضافه شد.`
        );
      } else {
        toast.warning("درخواست انجام شد، اما نقش جدیدی به کاربران اضافه نشد.");
      }
      await onImported?.();
      await loadRoles();
    } catch (error) {
      const status = error?.response?.status;
      if (status === 403) {
        setForbidden(true);
        setFormError("شما مجوز تخصیص گروهی نقش کاربران را ندارید.");
      } else if (status === 413) {
        setFormError("حجم فایل از محدودیت ۵ مگابایت بیشتر است.");
      } else if (status === 400) {
        setFormError(getUserRoleImportErrorMessage(error));
      } else if (!error?.response) {
        setFormError(
          "ارتباط با سرور برقرار نشد. فایل و نقش حفظ شده‌اند؛ دوباره تلاش کنید."
        );
      } else {
        setFormError("ارسال فایل انجام نشد. اطلاعات را بررسی و دوباره تلاش کنید.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const downloadIssues = () => {
    const csv = buildUserRoleIssuesCsv(result?.issues || []);
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, csv], { type: "text/csv;charset=utf-8;" });
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = "user-role-import-issues.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
  };

  const closeModal = () => {
    if (!submitting) toggle();
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={closeModal}
      size="xl"
      centered
      scrollable
      backdrop={submitting ? "static" : true}
    >
      <ModalHeader toggle={submitting ? undefined : closeModal}>
        <span ref={titleRef} tabIndex="-1">
          تخصیص گروهی نقش کاربران با اکسل
        </span>
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <Alert color="info">
            فایل نمونه را دانلود کنید و نام کاربری یا شماره موبایل را از سطر
            دوم در ستون <code>identifier</code> وارد کنید. فایل‌های قدیمی با
            ستون‌های <code>username</code> یا <code>phone</code> نیز معتبرند.
          </Alert>
          <Alert color="warning" className="d-flex align-items-center gap-2">
            <i className="bx bx-info-circle fs-4" />
            نقش انتخاب‌شده به نقش‌های فعلی کاربران اضافه می‌شود و هیچ نقش قبلی
            حذف نخواهد شد.
          </Alert>

          {forbidden ? (
            <Alert color="danger" role="alert">
              شما مجوز <code>users.roles.import</code> را ندارید.
            </Alert>
          ) : null}

          <Row className="g-3">
            <Col lg="5">
              <div className="border rounded p-3 h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">۱. انتخاب نقش</h5>
                  <Button
                    type="button"
                    color="success"
                    outline
                    size="sm"
                    onClick={handleTemplateDownload}
                    disabled={templateLoading || submitting}
                  >
                    {templateLoading ? (
                      <Spinner size="sm" className="ms-1" />
                    ) : (
                      <i className="bx bx-download ms-1" />
                    )}
                    دانلود فایل نمونه
                  </Button>
                </div>

                <Label htmlFor="user-role-search">جستجوی نقش</Label>
                <Input
                  id="user-role-search"
                  value={roleSearch}
                  onChange={(event) => setRoleSearch(event.target.value)}
                  placeholder="نام فارسی یا انگلیسی نقش"
                  disabled={rolesLoading || submitting}
                  className="mb-2"
                />

                <Label htmlFor="user-role-select">
                  نقش فعال <span className="text-danger">*</span>
                </Label>
                <Input
                  id="user-role-select"
                  type="select"
                  value={roleId}
                  onChange={(event) => {
                    setRoleId(event.target.value);
                    setFormError("");
                    setResult(null);
                  }}
                  disabled={rolesLoading || submitting}
                  aria-required="true"
                >
                  <option value="">
                    {rolesLoading ? "در حال دریافت نقش‌ها..." : "انتخاب کنید"}
                  </option>
                  {filteredRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.label || role.name} ({role.name})
                    </option>
                  ))}
                </Input>
                {rolesError ? (
                  <div className="text-danger small mt-2">
                    دریافت نقش‌ها ناموفق بود.{" "}
                    <Button
                      type="button"
                      color="link"
                      size="sm"
                      className="p-0"
                      onClick={loadRoles}
                    >
                      تلاش مجدد
                    </Button>
                  </div>
                ) : null}
              </div>
            </Col>

            <Col lg="7">
              <div className="border rounded p-3 h-100">
                <h5>۲. انتخاب فایل Excel</h5>
                <div
                  className={`border border-2 border-dashed rounded p-4 text-center ${
                    fileError ? "border-danger" : "border-primary"
                  }`}
                  style={{ borderStyle: "dashed", cursor: "pointer" }}
                  role="button"
                  tabIndex={submitting ? -1 : 0}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => !submitting && fileInputRef.current?.click()}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      if (!submitting) fileInputRef.current?.click();
                    }
                  }}
                  aria-label="انتخاب یا رها کردن فایل اکسل"
                >
                  <i className="bx bx-spreadsheet display-5 text-success" />
                  <div className="fw-semibold">
                    فایل را اینجا رها کنید یا برای انتخاب کلیک کنید
                  </div>
                  <div className="text-muted small mt-1">
                    فقط xlsx، حداکثر ۵ مگابایت و ۱۰٬۰۰۰ سطر
                  </div>
                </div>
                <Input
                  innerRef={fileInputRef}
                  id="user-role-import-file"
                  type="file"
                  accept={USER_ROLE_IMPORT_ACCEPT}
                  onChange={handleFileChange}
                  className="visually-hidden"
                  disabled={submitting}
                  aria-label="فایل اکسل نام کاربری یا شماره موبایل"
                />

                {file ? (
                  <div className="d-flex justify-content-between align-items-center bg-light rounded p-2 mt-3">
                    <div className="text-truncate">
                      <i className="bx bx-file ms-1" />
                      <span className="fw-semibold">{file.name}</span>
                      <span className="text-muted small me-2">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                    <Button
                      type="button"
                      color="danger"
                      outline
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeFile();
                      }}
                      disabled={submitting}
                    >
                      حذف / تعویض
                    </Button>
                  </div>
                ) : null}
                {fileError ? (
                  <div className="text-danger small mt-2">{fileError}</div>
                ) : null}
              </div>
            </Col>
          </Row>

          {formError ? (
            <Alert color="danger" className="mt-3 mb-0">
              {formError}
            </Alert>
          ) : null}

          <div aria-live="polite" className="mt-3">
            {submitting || uploadProgress > 0 ? (
              <>
                <div className="d-flex justify-content-between mb-1">
                  <span>{submitting ? "در حال تخصیص نقش..." : "ارسال کامل شد"}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress
                  animated={submitting}
                  striped={submitting}
                  value={uploadProgress}
                />
              </>
            ) : null}
          </div>

          {result ? (
            <section
              ref={resultRef}
              tabIndex="-1"
              className="border-top mt-4 pt-4"
              aria-label="نتیجه تخصیص گروهی نقش"
            >
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h5 className="mb-0">
                  نتیجه برای نقش {result?.role?.label || result?.role?.name}{" "}
                  <Badge color="light" className="text-dark">
                    {result?.role?.name}
                  </Badge>
                </h5>
                {result.issues?.length ? (
                  <Button
                    type="button"
                    color="success"
                    outline
                    size="sm"
                    onClick={downloadIssues}
                  >
                    خروجی CSV خطاها
                  </Button>
                ) : null}
              </div>

              <Row className="g-2 mb-3">
                {[
                  ["کل سطرها", result.totalRows, "primary"],
                  [
                    "شناسه‌های یکتا",
                    result.uniqueIdentifiers ?? result.uniqueUsernames,
                    "info",
                  ],
                  ["نقش اضافه‌شده", result.assignedUsers, "success"],
                  ["از قبل دارای نقش", result.alreadyAssignedUsers, "warning"],
                  ["خطاها", result.issues?.length || 0, "danger"],
                ].map(([label, value, color]) => (
                  <Col key={label} xs="6" md>
                    <div className={`border rounded p-3 text-center border-${color}`}>
                      <div className={`fs-4 fw-bold text-${color}`}>{value ?? 0}</div>
                      <div className="text-muted small">{label}</div>
                    </div>
                  </Col>
                ))}
              </Row>

              {result.issues?.length ? (
                <>
                  <Input
                    value={issueSearch}
                    onChange={(event) => {
                      setIssueSearch(event.target.value);
                      setIssuePage(1);
                    }}
                    placeholder="جستجو در شماره سطر، نام کاربری، موبایل، کد یا پیام"
                    aria-label="جستجو در خطاهای import"
                    className="mb-2"
                  />
                  <div className="table-responsive">
                    <Table bordered hover className="mb-2 align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>شماره سطر</th>
                          <th>نام کاربری/موبایل</th>
                          <th>کد خطا</th>
                          <th>پیام</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleIssues.map((issue, index) => (
                          <tr key={`${issue.rowNumber}-${getUserRoleIssueIdentifier(issue)}-${index}`}>
                            <td>{issue.rowNumber}</td>
                            <td dir="ltr" className="text-end">
                              {getUserRoleIssueIdentifier(issue) || "-"}
                            </td>
                            <td>
                              <Badge color="light" className="text-dark">
                                {USER_ROLE_ISSUE_LABELS[issue.code] || issue.code || "-"}
                              </Badge>
                            </td>
                            <td>
                              <div>{issue.message}</div>
                              {USER_ROLE_ISSUE_HELP[issue.code] ? (
                                <small className="text-muted">
                                  {USER_ROLE_ISSUE_HELP[issue.code]}
                                </small>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                        {!visibleIssues.length ? (
                          <tr>
                            <td colSpan="4" className="text-center text-muted">
                              موردی یافت نشد.
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </Table>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      صفحه {issuePage} از {issueLastPage}
                    </small>
                    <div className="d-flex gap-1">
                      <Button
                        type="button"
                        color="light"
                        size="sm"
                        disabled={issuePage <= 1}
                        onClick={() => setIssuePage((page) => page - 1)}
                      >
                        قبلی
                      </Button>
                      <Button
                        type="button"
                        color="light"
                        size="sm"
                        disabled={issuePage >= issueLastPage}
                        onClick={() => setIssuePage((page) => page + 1)}
                      >
                        بعدی
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <Alert color="success" className="mb-0">
                  تمام سطرهای معتبر بدون خطای ردیفی پردازش شدند.
                </Alert>
              )}
            </section>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button
            type="submit"
            color="primary"
            disabled={submitting || forbidden}
          >
            {submitting ? (
              <>
                <Spinner size="sm" className="ms-1" />
                در حال ارسال
              </>
            ) : (
              "شروع تخصیص"
            )}
          </Button>
          <Button
            type="button"
            color="light"
            onClick={closeModal}
            disabled={submitting}
          >
            بستن
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default UserRoleImportModal;
