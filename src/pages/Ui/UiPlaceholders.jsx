import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

//import images
import smallImage from "../../assets/images/small/img-1.jpg";

const UiPlaceholders = () => {

    //meta title
    document.title = "Placeholders | Skote - قالب مدیریتی و داشبورد Vite React ";

    return (
      <React.Fragment>
        <div className="page-content">
          <Container fluid={true}>
            <Breadcrumbs title="المنت های UI" breadcrumbItem="متن های جایگزین" />
            <Row>
              <Col xl={6}>
                <Card>
                  <CardBody>
                    <h4 className="card-title">انواع Placeholders</h4>
                    <p className="card-title-desc">
                      در مثال زیر، ما یک جزء کارت معمولی و آن را با متغیرهایی که
                      برای ایجاد «بارگیری» اعمال می‌شوند، دوباره ایجاد کنید
                      کارت». اندازه و نسبت بین این دو یکسان است
                    </p>

                    <Row className="gap-4">
                      <Col lg={5}>
                        <Card className="shadow-none border mb-0">
                          <img
                            src={smallImage}
                            className="card-img-top"
                            alt="..."
                          />

                          <CardBody>
                            <h5 className="card-title">عنوان کارت</h5>
                            <p className="card-text">
                              چند نمونه متن کوتاه برای ساخت بر روی عنوان کارت و
                              بخش عمده ای از کارت را تشکیل می دهند
                            </p>
                            <Link to="#" className="btn btn-primary">
                              برو یه جایی
                            </Link>
                          </CardBody>
                        </Card>
                      </Col>

                      <Col lg={5}>
                        <Card
                          className="card shadow-none border mb-0"
                          aria-hidden="true"
                        >
                          <img
                            src={smallImage}
                            className="card-img-top"
                            alt="..."
                          />
                          <CardBody>
                            <h5 className="card-title placeholder-glow">
                              <span className="placeholder col-6"></span>
                            </h5>
                            <p className="card-text placeholder-glow">
                              <span className="placeholder col-7"></span>
                              <span className="placeholder col-4"></span>
                              <span className="placeholder col-4"></span>
                              <span className="placeholder col-6"></span>
                              <span className="placeholder col-8"></span>
                            </p>
                            <Link
                              to="#"
                              className="btn btn-primary disabled placeholder col-6"
                            ></Link>
                          </CardBody>
                        </Card>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>

              <Col xl={6}>
                <Card>
                  <CardBody>
                    <h4 className="card-title">متغیرهایی با ستون Grid</h4>
                    <p className="card-title-desc">
                      ایجاد متغیرهایی با <code>.placeholder</code> کلاس و یک
                      کلاس ستون شبکه (به عنوان مثال، <code>.col-6</code>) برای
                      تنظیم <code>عرض</code>. آنها می توانند متن را جایگزین کنند
                      داخل یک عنصر یا به عنوان یک کلاس اصلاح کننده به یک اضافه
                      شود جزء موجود
                    </p>

                    <div>
                      <p aria-hidden="true">
                        <span className="placeholder col-6"></span>
                      </p>

                      <Link
                        to="#"
                        className="btn btn-primary disabled placeholder col-4"
                        aria-hidden="true"
                      ></Link>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <h4 className="card-title">عرض مکان‌ها</h4>
                    <p className="card-title-desc">
                      می توانید <code>عرض</code> را از طریق ستون شبکه تغییر دهید
                      کلاس ها، ابزارهای عرض، یا سبک های درون خطی
                    </p>

                    <div>
                      <span className="placeholder col-6"></span>
                      <span className="placeholder w-75"></span>
                      <br />
                      <span
                        className="placeholder"
                        style={{ width: "25%" }}
                      ></span>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col xl={6}>
                <Card>
                  <CardBody>
                    <h4 className="card-title">Placeholders رنگ</h4>
                    <p className="card-title-desc">
                      به طور پیش فرض، <code>placeholder</code> از استفاده می کند
                      <code>currentColor</code>. این را می توان با a لغو کرد رنگ
                      سفارشی یا کلاس کاربردی
                    </p>

                    <div>
                      <span className="placeholder col-12"></span>
                      <span className="placeholder col-12 bg-primary"></span>
                      <span className="placeholder col-12 bg-secondary"></span>
                      <span className="placeholder col-12 bg-success"></span>
                      <span className="placeholder col-12 bg-danger"></span>
                      <span className="placeholder col-12 bg-warning"></span>
                      <span className="placeholder col-12 bg-info"></span>
                      <span className="placeholder col-12 bg-light"></span>
                      <span className="placeholder col-12 bg-dark"></span>
                    </div>
                  </CardBody>
                </Card>
              </Col>

              <Col xl={6}>
                <Card>
                  <CardBody>
                    <h4 className="card-title">Placeholders اندازه ی</h4>
                    <p className="card-title-desc">
                      اندازه <code>.placeholder</code>ها بر اساس سبک تایپوگرافی
                      عنصر والد آنها را سفارشی کنید با اصلاح کننده های اندازه:{" "}
                      <code>.placeholder-lg</code>، <code>.placeholder-sm</code>
                      ، یا <code>.placeholder-xs</code>
                    </p>

                    <div>
                      <span className="placeholder col-12 placeholder-lg"></span>
                      <span className="placeholder col-12"></span>
                      <span className="placeholder col-12 placeholder-sm"></span>
                      <span className="placeholder col-12 placeholder-xs"></span>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col xl={6}>
                <Card>
                  <CardBody>
                    <h4 className="card-title">انیمیشن در Placeholders</h4>
                    <p className="card-title-desc">
                      متغیرهایی را با <code>.placeholder-glow</code> متحرک کنید
                      یا <code>.placeholder-wave</code> برای انتقال بهتر درک
                      چیزی که <em>فعال</em> بارگذاری می شود
                    </p>

                    <div>
                      <p className="placeholder-glow">
                        <span className="placeholder col-12"></span>
                      </p>

                      <p className="placeholder-wave mb-0">
                        <span className="placeholder col-12"></span>
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
    );
};

export default UiPlaceholders;