import React from "react"
import CarouselPage from "./CarouselPage"

// import images
import logoDark from "../../assets/images/logo-dark.png"
import logoLight from "../../assets/images/logo-light.png"
import { Col, Container, Row } from "reactstrap"
import { Link } from "react-router-dom"

const ConfirmMail2 = () => {

  //meta title
  document.title = "Confirm Mail 2 | Skote - قالب مدیریتی و داشبورد Vite React ";

  return (
    <React.Fragment>
      <div>
        <Container fluid className="p-0">
          <Row className="row g-0">
            <CarouselPage />

            <Col xl={3}>
              <div className="auth-full-page-content p-md-5 p-4">
                <div className="w-100">
                  <div className="d-flex flex-column h-100">
                    <div className="mb-4 mb-md-5">
                      <Link to="/" className="d-block auth-logo">
                        <img
                          src={logoDark}
                          alt=""
                          height="18"
                          className="auth-logo-dark"
                        />
                        <img
                          src={logoLight}
                          alt=""
                          height="18"
                          className="auth-logo-light"
                        />
                      </Link>
                    </div>
                    <div className="my-auto">
                      <div className="text-center">
                        <div className="avatar-md mx-auto">
                          <div className="avatar-title rounded-circle bg-light">
                            <i className="bx bx-mail-send h1 mb-0 text-primary"></i>
                          </div>
                        </div>
                        <div className="p-2 mt-4">
                          <h4>موفقیت !</h4>
                          <p className="text-muted">
                            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از
                            صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها
                            و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که
                            لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و
                            کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می
                            باشد.
                          </p>
                          <div className="mt-4">
                            <Link to="/dashboard" className="btn btn-success">
                             بازگشت به صفحه ی اصلی
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 mt-md-5 text-center">
                      <p className="mb-0">
                        © {new Date().getFullYear()} Skote. ساخته شده توسط{" "}
                        <i className="mdi mdi-heart text-danger"></i> 
                        فاطمه کاظمی زاده
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}

export default ConfirmMail2
