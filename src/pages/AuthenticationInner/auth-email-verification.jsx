import React from "react"
import { Link } from "react-router-dom"
import { Card, CardBody, Col, Container, Row } from "reactstrap"

// import images
import logodark from "../../assets/images/logo-dark.png"
import logolight from "../../assets/images/logo-light.png"

const EmailVerification = () => {

  //meta title
  document.title="Email Verification | Skote - قالب مدیریتی و داشبورد Vite React ";

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
                <p className="mt-3">React Admin & Dashboard قالب</p>
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
                        <p>
                          ما ایمیل تأیید را برای شما ارسال کرده ایم{" "}
                          <span className="fw-semibold">example@abc.com</span>,
                          لطفا آن را چک کنید
                        </p>
                        <div className="mt-4">
                          <a href="/" className="btn btn-success w-md">
                            تایید ایمیل
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
              <div className="mt-5 text-center">
                <p>
                 ایمیلی دریافت نکردید ?{" "}
                  <a href="#" className="fw-medium text-primary">
                    {" "}
                    ارسال مجدد{" "}
                  </a>{" "}
                </p>
                <p>
                  © {new Date().getFullYear()} Skote. ساخته شده توسط{" "}
                  <i className="mdi mdi-heart text-danger"></i> توسط فاطمه کاظمی زاده
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}
export default EmailVerification
