import React, { useState } from 'react';

import {
    Row,
    Col,
    Card,
    CardBody,
    Container,
    Button,
    Toast,
    ToastHeader,
    ToastBody,
    CardTitle,
} from "reactstrap";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

//import images
import logo from "../../assets/images/logo.svg";

const CustomToastHeader = ({ children }) => {
    return <React.Fragment>{children}</React.Fragment>;
};

const UiToast = () => {

    //meta title
    document.title = "Toast | Skote - قالب مدیریتی و داشبورد Vite React ";

    const [toast, setToast] = useState(false);
    const [toast2, setToast2] = useState(true);
    const [toast3, setToast3] = useState(true);
    const [toast4, setToast4] = useState(true);
    const [toast5, setToast5] = useState(true);
    const [toast6, setToast6] = useState(true);
    const [toast7, setToast7] = useState(true);

    const toggleToast = () => {
        setToast(!toast);
    };
    return (
      <React.Fragment>
        <div className="page-content">
          <Container fluid={true}>
            <Breadcrumbs title="المنت های UI" breadcrumbItem="پیغام توست" />

            <Row>
              <Col xl={12}>
                <Card>
                  <CardBody>
                    <h5 className="card-title">مثال زنده</h5>
                    <p className="card-title-des">
                      روی دکمه زیر کلیک کنید تا توست را نشان دهید (موقعیت ما آب
                      و برق در گوشه سمت راست پایین) که به طور پیش فرض پنهان شده
                      است
                    </p>

                    <div className="d-flex flex-wrap gap-2">
                      <div>
                        <Button
                          type="button"
                          color="primary"
                          id="liveToastBtn"
                          onClick={toggleToast}
                        >
                          مشاهده توست زنده
                        </Button>

                        <div
                          className="position-fixed top-0 end-0 p-3"
                          style={{ zIndex: "1005" }}
                        >
                          <Toast isOpen={toast}>
                            <ToastHeader toggle={toggleToast}>
                              <img
                                src={logo}
                                alt=""
                                className="me-2"
                                height="18"
                              />
                              Reactstrap
                            </ToastHeader>
                            <ToastBody>
                              سلام دنیا! این یک پیام توست است
                            </ToastBody>
                          </Toast>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col xl={6}>
                <Card>
                  <CardBody>
                    <CardTitle className="h5">توست ساده</CardTitle>
                    <p className="card-title-desc">
                      توست به اندازه نیاز شما انعطاف پذیر است و بسیار کم است
                      نشانه گذاری مورد نیاز حداقل به یک عنصر واحد نیاز داریم
                      حاوی محتوای «برشته شده» شما باشد و قویاً الف دکمه رد کردن
                    </p>

                    <div style={{ minHeight: "110px" }}>
                      <Toast isOpen={toast2} role="alert">
                        <ToastHeader
                          tag={CustomToastHeader}
                          tagClassName=""
                          toggle={() => setToast2(!toast2)}
                        >
                          <img src={logo} alt="" className="me-2" height="18" />
                          <strong className="me-auto">Skote</strong>
                          <small className="text-muted">11 دقیقه قبل</small>
                        </ToastHeader>
                        <ToastBody>سلام دنیا! این یک پیام توست است</ToastBody>
                      </Toast>
                    </div>
                  </CardBody>
                </Card>
              </Col>

              <Col xl={6}>
                <Card>
                  <CardBody>
                    <CardTitle className="h5">Translucent</CardTitle>
                    <p className="card-title-desc">
                      توست  ها نیز کمی شفاف هستند، بنابراین با هم مخلوط می
                      شوند هر چه ممکن است در آن ظاهر شوند. برای مرورگرهایی که
                      پشتیبانی می کنند ویژگی <code>فیلتر پس زمینه</code> CSS را
                      نیز انجام خواهیم داد سعی کنید عناصر زیر نان تست را محو
                      کنید
                    </p>

                    <div style={{ minHeight: "110px" }}>
                      <Toast isOpen={toast3} role="alert">
                        <ToastHeader
                          tag={CustomToastHeader}
                          tagClassName=""
                          toggle={() => setToast3(!toast3)}
                        >
                          <img src={logo} alt="" className="me-2" height="18" />
                          <strong className="me-auto">Skote</strong>
                          <small className="text-muted">11 دقیقه قبل</small>
                        </ToastHeader>
                        <ToastBody>سلام دنیا! این یک پیام توست است</ToastBody>
                      </Toast>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col xl={6}>
                <Card>
                  <CardBody>
                    <CardTitle className="h5">پشته سازی</CardTitle>
                    <p className="card-title-desc">
                      برای سیستم هایی که اعلان های بیشتری تولید می کنند، در نظر
                      بگیرید با استفاده از یک عنصر بسته بندی به طوری که آنها
                      بتوانند به راحتی روی هم چیده شوند
                    </p>

                    <div style={{ minHeight: "230px" }}>
                      <div
                        aria-live="polite"
                        aria-atomic="true"
                        className="position-relative"
                      >
                        <div className="toast-container position-absolute top-0 end-0 p-2 p-lg-3">
                          <Toast isOpen={toast4} role="alert">
                            <ToastHeader
                              tag={CustomToastHeader}
                              tagClassName=""
                              toggle={() => setToast4(!toast4)}
                            >
                              <img
                                src={logo}
                                alt=""
                                className="me-2"
                                height="18"
                              />
                              <strong className="me-auto">Skote</strong>
                              <small className="text-muted">همین حالا</small>
                            </ToastHeader>
                            <ToastBody>دیدن؟ درست مثل این</ToastBody>
                          </Toast>

                          <Toast isOpen={toast5} role="alert">
                            <ToastHeader
                              tag={CustomToastHeader}
                              tagClassName=""
                              toggle={() => setToast5(!toast5)}
                            >
                              <img
                                src={logo}
                                alt=""
                                className="me-2"
                                height="18"
                              />
                              <strong className="me-auto">Skote</strong>
                              <small className="text-muted">2 ثانیه قبل</small>
                            </ToastHeader>
                            <ToastBody>
                              مراقب باشید، توست ها به طور خودکار روی هم چیده
                              می شوند
                            </ToastBody>
                          </Toast>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>

              <Col xl={6}>
                <Card>
                  <CardBody>
                    <CardTitle className="h5">محتوای دلخواه</CardTitle>
                    <p className="card-title-desc">
                      توست های خود را با حذف اجزای فرعی، بهینه سازی سفارشی کنید
                      آنها را با ابزارهای کمکی یا با اضافه کردن نشانه گذاری خود
                    </p>

                    <div className="d-flex flex-column gap-3">
                      <div
                        aria-live="polite"
                        aria-atomic="true"
                        className="position-relative"
                      >
                        <Toast isOpen={toast6} role="alert">
                          <ToastBody>
                            سلام دنیا! این یک پیام توست است
                            <div className="mt-2 pt-2 border-top">
                              <button
                                type="button"
                                className="btn btn-primary btn-sm me-1"
                              >
                                اقدام به
                              </button>
                              <button
                                onClick={() => setToast6(false)}
                                type="button"
                                className="btn btn-secondary btn-sm"
                              >
                                بستن
                              </button>
                            </div>
                          </ToastBody>
                        </Toast>
                      </div>

                      <Toast
                        isOpen={toast7}
                        className="align-items-center fade show"
                        role="alert"
                      >
                        <div className="d-flex">
                          <ToastBody>سلام دنیا! این یک پیام توست است</ToastBody>
                          <button
                            onClick={() => setToast7(false)}
                            type="button"
                            className="btn-close me-2 m-auto"
                          ></button>
                        </div>
                      </Toast>
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

export default UiToast;