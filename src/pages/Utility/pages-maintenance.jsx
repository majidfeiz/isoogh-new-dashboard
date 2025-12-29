import React from "react"
import { Link } from "react-router-dom"
import { Container, Row, Col } from "reactstrap"

//Import Cards
import CardMaintenance from "./card-maintenance"

//Import Images
import maintenance from "../../assets/images/maintenance.svg"
import logodark from "../../assets/images/logo-dark.png";
import logolight from "../../assets/images/logo-light.png";

const PagesMaintenance = () => {

    //meta title
    document.title = "Maintenance | Skote - قالب مدیریتی و داشبورد Vite React ";

  return (
    <React.Fragment>
      <div className="home-btn d-none d-sm-block">
        <Link to="/" className="text-dark">
          <i className="fas fa-home h2"></i>
        </Link>
      </div>
      <section className="my-5 pt-sm-5">
        <Container>
          <Row>
            <Col xs="12" className="text-center">
              <div className="home-wrapper">
                <div className="mb-5">
                  <Link to="/" className="d-block auth-logo">
                    <img
                      src={logodark}
                      alt=""
                      height="18"
                      className="auth-logo-dark mx-auto"
                    />
                    <img
                      src={logolight}
                      alt=""
                      height="18"
                      className="auth-logo-light mx-auto"
                    />
                  </Link>
                </div>

                <Row className="justify-content-center">
                  <Col sm={4}>
                    <div className="maintenance-img">
                      <img
                        src={maintenance}
                        alt=""
                        className="img-fluid mx-auto d-block"
                      />
                    </div>
                  </Col>
                </Row>
                <h3 className="mt-5">سایت تحت تعمیر است</h3>
                <p>لطفا در زمانی دیگر بررسی کنید</p>

                <Row>
                  <CardMaintenance>
                    <i className="bx bx-broadcast mb-4 h1 text-primary" />
                    <h5 className="font-size-15 text-uppercase">
                      چرا سایت از کار افتاده است؟
                    </h5>
                    <p className="text-muted mb-0">
                      انواع مختلفی از معابر Lorem Ipsum وجود دارد در دسترس است،
                      اما اکثریت دچار تغییر شده اند
                    </p>
                  </CardMaintenance>

                  <CardMaintenance>
                    <i className="bx bx-time-five mb-4 h1 text-primary" />
                    <h5 className="font-size-15 text-uppercase">
                      زمان توقف چیست؟
                    </h5>
                    <p className="text-muted mb-0">
                      برخلاف تصور رایج، لورم ایپسوم ساده نیست متن تصادفی ریشه در
                      قطعه ای از classNameical دارد
                    </p>
                  </CardMaintenance>

                  <CardMaintenance>
                    <i className="bx bx-envelope mb-4 h1 text-primary" />
                    <h5 className="font-size-15 text-uppercase">
                      آیا به پشتیبانی نیاز دارید؟
                    </h5>
                    <p className="text-muted mb-0">
                      اگر می خواهید از یک پاساژ Lorem Ipsum استفاده کنید، نیاز
                      دارید مطمئن شوید که وجود ندارد
                      <Link
                        to="mailto:no-reply@domain.com"
                        className="text-decoration-underline"
                      >
                        no-reply@domain.com
                      </Link>
                    </p>
                  </CardMaintenance>
                </Row>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </React.Fragment>
  );
}

export default PagesMaintenance
