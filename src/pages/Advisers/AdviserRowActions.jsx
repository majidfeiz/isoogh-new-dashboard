import React from "react";
import { Button } from "reactstrap";
import { adviserAccountActive } from "./adviserAccountStatusUtils.js";

const isSuperAdviser = (value) => value === true || value === 1 || value === "1" || value === "true";

const AdviserRowActions = ({ adviser, canShow, canUpdate, schoolId, busy, accountBusy, onStudents, onGrades, onSuperStatus, onSubordinates, onAccountStatus }) => {
  const isSuper = isSuperAdviser(adviser?.is_super ?? adviser?.isSuper);
  const isActive = adviserAccountActive(adviser, schoolId);
  return <div className="d-flex flex-column gap-1">
    {canShow && <Button color="primary" size="sm" onClick={() => onStudents(adviser)} disabled={!adviser?.id}>دانش‌آموزان</Button>}
    {canUpdate && <Button color="warning" size="sm" onClick={() => onGrades(adviser)} disabled={!adviser?.id}><i className="bx bx-book me-1" />پایه‌ها</Button>}
    {canUpdate && <Button color={isSuper ? "danger" : "success"} outline size="sm" onClick={() => onSuperStatus(adviser, !isSuper)} disabled={!adviser?.id || !schoolId || busy}>{busy ? "در حال ثبت..." : isSuper ? "لغو سرمشاوری" : "تبدیل به سرمشاور"}</Button>}
    {canUpdate && isActive != null && <Button color={isActive ? "danger" : "success"} outline size="sm" onClick={() => onAccountStatus(adviser, !isActive)} disabled={!adviser?.id || !schoolId || accountBusy}>{accountBusy ? "در حال ثبت..." : isActive ? "غیرفعال‌سازی حساب" : "فعال‌سازی حساب"}</Button>}
    {canShow && isSuper && <Button color="info" outline size="sm" onClick={() => onSubordinates(adviser)} disabled={!adviser?.id || !schoolId}>زیرمجموعه‌ها</Button>}
  </div>;
};

export { isSuperAdviser };
export default AdviserRowActions;
