import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Row, Spinner } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { getAdviserSchoolDetail } from "../../services/adviserPortalService.jsx";

const SchoolTasks = () => {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  document.title = "وظایف مشاور | داشبورد آیسوق";

  useEffect(() => {
    if (!schoolId || !Number.isInteger(Number(schoolId)) || Number(schoolId) <= 0) {
      navigate("/adviser-calls", { replace: true });
      return;
    }
    setLoading(true);
    getAdviserSchoolDetail(schoolId)
      .then(setSchool)
      .catch(() => setSchool(null))
      .finally(() => setLoading(false));
  }, [navigate, schoolId]);

  const options = [
    {
      title: "تماس‌های برنامه‌ریزی‌شده",
      description: "مشاهده فرم‌های تماس و دانش‌آموزان برنامه‌ریزی‌شده",
      icon: "bx-calendar-check",
      color: "primary",
      path: `/adviser-calls/schools/${schoolId}/planned-calls`,
    },
    {
      title: "تماس‌های ناقص",
      description: "مشاهده دانش‌آموزانی که نتیجه تماس آن‌ها ناقص ثبت شده است",
      icon: "bx-phone-off",
      color: "warning",
      path: `/adviser-calls/schools/${schoolId}/incomplete-calls`,
    },
  ];

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="تماس مشاوران" breadcrumbItem={school?.name || "وظایف مشاور"} titleLink="/adviser-calls" />
        <div className="mb-4">
          <h4 className="mb-1">{school?.name || "وظایف مشاور"}</h4>
          <p className="text-muted mb-0">نوع تماس مورد نظر را انتخاب کنید.</p>
        </div>
        {loading ? (
          <div className="text-center py-5"><Spinner color="primary" /></div>
        ) : (
          <Row>
            {options.map((option) => (
              <Col key={option.path} lg={6} className="mb-4">
                <Card
                  className="h-100 border-0 shadow-sm"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(option.path)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") navigate(option.path);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <CardBody className="d-flex align-items-center gap-3 p-4">
                    <div className={`bg-${option.color} bg-opacity-10 rounded p-3`}>
                      <i className={`bx ${option.icon} text-${option.color} font-size-24`} />
                    </div>
                    <div>
                      <h5 className="mb-1">{option.title}</h5>
                      <p className="text-muted mb-0">{option.description}</p>
                    </div>
                    <i className="bx bx-chevron-left font-size-24 ms-auto text-muted" />
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default SchoolTasks;
