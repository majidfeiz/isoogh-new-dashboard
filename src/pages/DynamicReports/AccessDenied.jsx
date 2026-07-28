import React from "react";
import { Alert, Button, Card, CardBody } from "reactstrap";
import { useNavigate } from "react-router-dom";
const AccessDenied = () => {
  const navigate = useNavigate();
  return <div className="page-content"><div className="container-fluid"><Card><CardBody className="text-center py-5"><i className="bx bx-lock-alt display-4 text-warning" aria-hidden="true" /><h1 className="h3 mt-3">دسترسی غیرمجاز</h1><Alert color="warning">شما مجوز لازم برای مشاهده این صفحه را ندارید. اگر این دسترسی باید فعال باشد، با مدیر سامانه تماس بگیرید.</Alert><Button color="primary" onClick={() => navigate(-1)}>بازگشت</Button></CardBody></Card></div></div>;
};
export default AccessDenied;
