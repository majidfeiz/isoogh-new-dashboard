import React from "react";
import PropTypes from "prop-types";
import { map, get } from "lodash";
import { Card, CardBody, Col, Row } from "reactstrap";
import img1 from "../../../assets/images/companies/img-1.png";

const ProjectDetail = ({ project }) => {
  return (
    <Card>
      <CardBody>
        <div className="d-flex">
          <img src={img1} alt="" className="avatar-sm me-4" />

          <div className="flex-grow-1 overflow-hidden">
            <h5 className="text-truncate font-size-15">
              رابط کاربری داشبورد Skote
            </h5>
            <p className="text-muted">
              وجود مجزا یک افسانه است. برای علم، موسیقی، ورزش و غیره
            </p>
          </div>
        </div>

        <h5 className="font-size-15 mt-4">جزئیات پروژه:</h5>

        <p className="text-muted">
          {get(project, "projectDetails.description")}
        </p>

        <div className="text-muted mt-4">
          {project.projectDetails &&
            map(project.projectDetails.points, (point, index) => (
              <p key={index}>
                <i className="mdi mdi-chevron-left text-primary me-1" />{" "}
                {point}
              </p>
            ))}
        </div>

        <Row className="task-dates">
          <Col sm="4" xs="6">
            <div className="mt-4">
              <h5 className="font-size-14">
                <i className="bx bx-calendar me-1 text-primary" /> تاریخ شروع
              </h5>
              <p className="text-muted mb-0">08 فروردین, 1402</p>
            </div>
          </Col>

          <Col sm="4" xs="6">
            <div className="mt-4">
              <h5 className="font-size-14">
                <i className="bx bx-calendar-check me-1 text-primary" /> تاریخ پایان
              </h5>
              <p className="text-muted mb-0">12 دی, 1402</p>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

ProjectDetail.propTypes = {
  project: PropTypes.object,
};

export default ProjectDetail;
