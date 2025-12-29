import React from "react";

import { Link } from "react-router-dom"
import {
  Card,
  CardBody,
  Col,
  Container,
  Form,
  Label,
  Input,
  Row,
} from "reactstrap"

// import images
import logodark from "../../assets/images/logo-dark.png"
import logolight from "../../assets/images/logo-light.png"

const TwostepVerification = () => {

  //meta title
  document.title = "Two Step Verification | Skote - قالب مدیریتی و داشبورد Vite React ";

  return (
    <React.Fragment>
      <div className="account-pages my-5 pt-sm-5">
        <Container>
          <Row>
            <Col lg={12}>
              <div className="text-center mb-5 text-muted">
                <Link to="/" className="d-block auth-logo">
                  <img
                    src={logodark}
                    alt=""
                    height="20"
                    className="auth-logo-dark mx-auto"
                  />
                  <img
                    src={logolight}
                    alt=""
                    height="20"
                    className="auth-logo-light mx-auto"
                  />
                </Link>
                <p className="mt-3">React ادمین و قالب داشبورد</p>
              </div>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <Card>
                <CardBody>
                  <div className="p-2">
                    <div className="text-center">
                      <div className="avatar-md mx-auto">
                        <div className="avatar-title rounded-circle bg-light">
                          <i className="bx bxs-envelope h1 mb-0 text-primary"></i>
                        </div>
                      </div>
                      <div className="p-2 mt-4">
                        <h4>ایمیل خود را تایید کنید</h4>
                        <p className="mb-5">
                        لطفا کد 4 رقمی ارسال شده به را وارد کنید{" "}
                          <span className="fw-semibold">example@abc.com</span>
                        </p>

                        <Form>
                          <Row>
                            <Col className="col-3">
                              <div className="mb-3">
                                <Label
                                  htmlFor="digit1-input"
                                  className="visually-hidden"
                                >
                                  Dight 1
                                </Label>
                                <Input
                                  type="text"
                                  className="form-control form-control-lg text-center two-step"
                                  maxLength="1"
                                  data-value="1"
                                  id="digit1-input"
                                />
                              </div>
                            </Col>

                            <Col>
                              <div className="mb-3">
                                <Label
                                  htmlFor="digit2-input"
                                  className="visually-hidden"
                                >
                                  Dight 2
                                </Label>
                                <Input
                                  type="text"
                                  className="form-control form-control-lg text-center two-step"
                                  maxLength="1"
                                  data-value="2"
                                  id="digit2-input"
                                />
                              </div>
                            </Col>

                            <Col>
                              <div className="mb-3">
                                <Label
                                  htmlFor="digit3-input"
                                  className="visually-hidden"
                                >
                                  Dight 3
                                </Label>
                                <Input
                                  type="text"
                                  className="form-control form-control-lg text-center two-step"
                                  maxLength="1"
                                  data-value="3"
                                  id="digit3-input"
                                />
                              </div>
                            </Col>

                            <Col>
                              <div className="mb-3">
                                <Label
                                  htmlFor="digit4-input"
                                  className="visually-hidden"
                                >
                                  Dight 4
                                </Label>
                                <Input
                                  type="text"
                                  className="form-control form-control-lg text-center two-step"
                                  maxLength="1"
                                  data-value="4"
                                  id="digit4-input"
                                />
                              </div>
                            </Col>
                          </Row>
                        </Form>

                        <div className="mt-4">
                          <Link
                            to="/dashboard"
                            className="btn btn-success w-md"
                          >
                            تایید
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
              <div className="mt-5 text-center">
                <p>
                 دریافت نکردید ?{" "}
                  <a href="#" className="fw-medium text-primary">
                    {" "}
                    ارسال مجدد{" "}
                  </a>{" "}
                </p>
                <p>
                  © {new Date().getFullYear()} Skote. ساخته شده توسط{" "}
                  <i className="mdi mdi-heart text-danger"></i>  فاطمه کاظمی زاده
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}
export default TwostepVerification;
