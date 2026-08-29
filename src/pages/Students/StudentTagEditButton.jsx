import React from "react";
import { Button } from "reactstrap";

const StudentTagEditButton = ({ canView, onClick }) => {
  if (!canView) return null;
  return <Button color="info" outline size="sm" onClick={onClick} title="ویرایش تگ‌های دانش‌آموز">
    <i className="bx bx-purchase-tag ms-1" aria-hidden="true" />
    ویرایش تگ‌ها
  </Button>;
};

export default StudentTagEditButton;
