import React from "react"

import { Row, Col, Card, CardBody } from "reactstrap"
import { Link } from "react-router-dom"

import avatar1 from "../../assets/images/users/avatar-1.jpg"
import profileImg from "../../assets/images/profile-img.png"
import { getAuthUser } from "../../helpers/authStorage.jsx";


const authData = getAuthUser();


const WelcomeComp = () => {


  return (
    <React.Fragment>
      <Card className="overflow-hidden">
        <div className="bg-primary-subtle">
          <Row>
            <Col xs="7">
              <div className="text-primary p-3">
                <h5 className="text-primary">خوش برگشتی !</h5>
                <p>داشبورد آیسوق </p>
              </div>
            </Col>
            <Col xs="5" className="align-self-end">
              <img src={profileImg} alt="" className="img-fluid" />
            </Col>
          </Row>
        </div>
        <CardBody className="pt-0">
          <Row>
            <Col sm="4">
              <div className="avatar-md profile-user-wid mb-4">
                <img
                  src={avatar1}
                  alt=""
                  className="img-thumbnail rounded-circle"
                />
              </div>
              <h5 className="font-size-15 text-truncate">{authData?.name || "بدون نام"}</h5>
              <p className="text-muted mb-0 text-truncate"> </p>
            </Col>

            <Col sm="8">
              <div className="pt-4">
                <Row>
                  <Col xs="6">
                    <h5 className="font-size-15">125</h5>
                    <p className="text-muted mb-0">پروژه ها</p>
                  </Col>
                  <Col xs="6">
                    <h5 className="font-size-15"> تومان 123.400.000</h5>
                    <p className="text-muted mb-0">درآمد</p>
                  </Col>
                </Row>
                <div className="mt-4">
                  <Link to="" className="btn btn-primary  btn-sm">
                    مشاهده پروفایل{" "}
                    <i className="mdi mdi-arrow-left ms-1"></i>
                  </Link>
                </div>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </React.Fragment>
  );
}
export default WelcomeComp
